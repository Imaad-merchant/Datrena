/**
 * Datrena API Server
 *
 * Endpoints:
 *   POST /api/ai-chat — OpenAI-powered quant analysis chat with live Yahoo Finance data
 *
 * Env:
 *   OPENAI_API_KEY — required
 *   API_PORT — defaults to 3001
 */

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import yahooFinance from "yahoo-finance2";
import { parquetReadObjects } from "hyparquet";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";
import Stripe from "stripe";

config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load local NQ 1m parquet data on startup ---

let LOCAL_NQ_DATA = [];

async function loadLocalData() {
  try {
    const file = readFileSync(join(__dirname, "data/nq_1m.parquet"));
    const rows = await parquetReadObjects({
      file: file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
    });
    LOCAL_NQ_DATA = rows.map((r) => ({
      ts: typeof r.ts_event === "bigint" ? Number(r.ts_event) : new Date(r.ts_event).getTime(),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume),
    }));
    LOCAL_NQ_DATA.sort((a, b) => a.ts - b.ts);
    const first = new Date(LOCAL_NQ_DATA[0].ts).toISOString();
    const last = new Date(LOCAL_NQ_DATA[LOCAL_NQ_DATA.length - 1].ts).toISOString();
    console.log(`Loaded ${LOCAL_NQ_DATA.length} NQ 1m bars (${first} to ${last})`);
  } catch (e) {
    console.error("Failed to load local NQ data:", e.message);
  }
}

loadLocalData();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.API_PORT || "3001", 10);

const SYSTEM_PROMPT = `You are Datrena AI — a quantitative trading research assistant built into the Datrena platform.

You have access to TWO data sources:
1. Local 1-minute NQ futures OHLCV data (Feb 2025 to Feb 2026) — use get_local_nq for any NQ futures analysis. This is the primary data source until Rithmic is live.
2. Yahoo Finance (get_quote, get_historical, etc.) for all other instruments and real-time quotes.

USE THESE TOOLS whenever the user asks about prices, volatility, historical data, or anything that requires real market information. Do not guess — always fetch.

You specialize in:
- Market microstructure analysis (Level 3 MBO order flow, iceberg detection, pull rates)
- Volatility modeling (GARCH, realized vol, implied vol surfaces)
- Statistical analysis (mean reversion, momentum, regime detection)
- Order flow analysis (delta, cumulative delta, absorption, exhaustion)
- Futures market analysis across CME (ES, NQ, 6E), CBOT (YM, ZB, ZN), NYMEX (CL, NG), COMEX (GC, SI)
- Backtesting methodology (walk-forward, Monte Carlo, parameter optimization)
- Risk metrics (Sharpe, Sortino, max drawdown, VaR, expected shortfall)

Common ticker mappings for futures:
- ES (S&P 500 E-mini) → ES=F
- NQ (Nasdaq E-mini) → NQ=F
- CL (Crude Oil) → CL=F
- GC (Gold) → GC=F
- SI (Silver) → SI=F
- YM (Dow E-mini) → YM=F
- ZB (30yr Treasury) → ZB=F
- ZN (10yr Treasury) → ZN=F
- 6E (Euro FX) → 6E=F
- NG (Natural Gas) → NG=F

Guidelines:
- Be concise and quantitative. Use numbers, not vague language.
- When discussing strategies, mention edge cases and risks.
- Format responses with markdown for readability.
- Always fetch real data before answering questions about current market conditions.
- You can suggest code snippets in Python for quantitative analysis.`;

// --- Local NQ data tool ---

function getLocalNQ({ start, end, interval = "1m", limit = 100 }) {
  if (!LOCAL_NQ_DATA.length) return { error: "Local NQ data not loaded" };

  const startMs = start ? new Date(start).getTime() : LOCAL_NQ_DATA[0].ts;
  const endMs = end ? new Date(end).getTime() : LOCAL_NQ_DATA[LOCAL_NQ_DATA.length - 1].ts;

  let filtered = LOCAL_NQ_DATA.filter((b) => b.ts >= startMs && b.ts <= endMs);

  // Aggregate to higher timeframes if needed
  const intervalMinutes = { "1m": 1, "5m": 5, "15m": 15, "30m": 30, "1h": 60, "4h": 240, "1d": 1440 }[interval] || 1;

  if (intervalMinutes > 1) {
    const bucketMs = intervalMinutes * 60000;
    const agg = new Map();
    for (const bar of filtered) {
      const bucket = Math.floor(bar.ts / bucketMs) * bucketMs;
      const existing = agg.get(bucket);
      if (!existing) {
        agg.set(bucket, { ts: bucket, open: bar.open, high: bar.high, low: bar.low, close: bar.close, volume: bar.volume });
      } else {
        existing.high = Math.max(existing.high, bar.high);
        existing.low = Math.min(existing.low, bar.low);
        existing.close = bar.close;
        existing.volume += bar.volume;
      }
    }
    filtered = Array.from(agg.values());
  }

  // Take last N bars
  const bars = filtered.slice(-limit).map((b) => ({
    time: new Date(b.ts).toISOString(),
    open: b.open.toFixed(2),
    high: b.high.toFixed(2),
    low: b.low.toFixed(2),
    close: b.close.toFixed(2),
    volume: b.volume,
  }));

  // Compute summary stats
  const closes = filtered.map((b) => b.close);
  const returns = [];
  for (let i = 1; i < closes.length; i++) returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  const mean = returns.reduce((s, r) => s + r, 0) / (returns.length || 1);
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length || 1);
  const realizedVol = Math.sqrt(variance * 252 * 1440) * 100;

  return {
    symbol: "NQ (continuous futures)",
    interval,
    totalBars: filtered.length,
    returned: bars.length,
    first: bars[0]?.time,
    last: bars[bars.length - 1]?.time,
    priceRange: { min: Math.min(...closes).toFixed(2), max: Math.max(...closes).toFixed(2) },
    annualizedRealizedVolPct: realizedVol.toFixed(2),
    bars,
  };
}

// --- Yahoo Finance tool functions ---

async function getQuote(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);
    return {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose,
      bid: quote.bid,
      ask: quote.ask,
      marketCap: quote.marketCap,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      avgVolume: quote.averageDailyVolume3Month,
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function getHistorical(symbol, period1, period2, interval) {
  try {
    const history = await yahooFinance.chart(symbol, {
      period1: period1 || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
      period2: period2 || new Date().toISOString().split("T")[0],
      interval: interval || "1d",
    });

    const quotes = history.quotes.slice(-50).map((q) => ({
      date: q.date,
      open: q.open?.toFixed(2),
      high: q.high?.toFixed(2),
      low: q.low?.toFixed(2),
      close: q.close?.toFixed(2),
      volume: q.volume,
    }));

    return {
      symbol,
      bars: quotes.length,
      period: `${period1 || "30d ago"} to ${period2 || "today"}`,
      interval,
      data: quotes,
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function getMultipleQuotes(symbols) {
  try {
    const results = {};
    for (const sym of symbols) {
      results[sym] = await getQuote(sym);
    }
    return results;
  } catch (e) {
    return { error: e.message };
  }
}

async function searchTicker(query) {
  try {
    const results = await yahooFinance.search(query);
    return results.quotes.slice(0, 5).map((q) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname,
      type: q.quoteType,
      exchange: q.exchange,
    }));
  } catch (e) {
    return { error: e.message };
  }
}

// --- OpenAI function calling tools ---

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_local_nq",
      description: "Get local historical NQ (Nasdaq 100 E-mini futures) OHLCV data from Feb 2025 to Feb 2026. This is the primary data source for NQ analysis until Rithmic is connected. Supports 1m, 5m, 15m, 30m, 1h, 4h, 1d intervals. Use this for any NQ volatility, trend, or price action question.",
      parameters: {
        type: "object",
        properties: {
          start: { type: "string", description: "Start date/time in ISO format (e.g. '2025-10-01' or '2025-10-01T13:30:00Z'). Defaults to start of data." },
          end: { type: "string", description: "End date/time in ISO format. Defaults to end of data." },
          interval: { type: "string", enum: ["1m", "5m", "15m", "30m", "1h", "4h", "1d"], description: "Bar interval (defaults to 1m)" },
          limit: { type: "number", description: "Max bars to return (defaults to 100, max 500)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_quote",
      description: "Get the current real-time quote for a ticker symbol including price, volume, change, bid/ask, and 52-week range. Use for any question about current prices or market state.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: 'Ticker symbol (e.g. "ES=F" for ES futures, "AAPL" for Apple, "NQ=F" for Nasdaq futures)',
          },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_historical",
      description: "Get historical OHLCV price data for a ticker. Use for volatility analysis, trend analysis, backtesting discussions, or any question about past price action.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol",
          },
          period1: {
            type: "string",
            description: 'Start date in YYYY-MM-DD format (defaults to 30 days ago)',
          },
          period2: {
            type: "string",
            description: 'End date in YYYY-MM-DD format (defaults to today)',
          },
          interval: {
            type: "string",
            enum: ["1m", "5m", "15m", "1h", "1d", "1wk", "1mo"],
            description: "Data interval/timeframe (defaults to 1d)",
          },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_multiple_quotes",
      description: "Get current quotes for multiple tickers at once. Use when comparing instruments or getting a market overview.",
      parameters: {
        type: "object",
        properties: {
          symbols: {
            type: "array",
            items: { type: "string" },
            description: 'Array of ticker symbols (e.g. ["ES=F", "NQ=F", "CL=F"])',
          },
        },
        required: ["symbols"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_ticker",
      description: "Search for a ticker symbol by name or keyword. Use when the user mentions a company or instrument name but not the exact ticker.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: 'Search query (e.g. "crude oil futures", "Tesla")',
          },
        },
        required: ["query"],
      },
    },
  },
];

const TOOL_FUNCTIONS = {
  get_local_nq: (args) => getLocalNQ(args),
  get_quote: (args) => getQuote(args.symbol),
  get_historical: (args) => getHistorical(args.symbol, args.period1, args.period2, args.interval),
  get_multiple_quotes: (args) => getMultipleQuotes(args.symbols),
  search_ticker: (args) => searchTicker(args.query),
};

// --- API endpoint with tool calling loop ---

app.post("/api/ai-chat", async (req, res) => {
  const { messages, context } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY not set in server/.env" });
  }

  try {
    const openai = new OpenAI();

    const systemPrompt = context
      ? `${SYSTEM_PROMPT}\n\nCurrent session context:\n${context}`
      : SYSTEM_PROMPT;

    let chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Tool calling loop — let GPT-4o fetch data as many times as it needs
    let maxRounds = 5;
    while (maxRounds > 0) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 2048,
        messages: chatMessages,
        tools: TOOLS,
      });

      const choice = response.choices[0];

      if (choice.finish_reason === "tool_calls" || choice.message.tool_calls?.length) {
        // GPT-4o wants to call tools — execute them
        chatMessages.push(choice.message);

        for (const toolCall of choice.message.tool_calls) {
          const fn = TOOL_FUNCTIONS[toolCall.function.name];
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`  [tool] ${toolCall.function.name}(${JSON.stringify(args)})`);

          const result = await fn(args);

          chatMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        maxRounds--;
      } else {
        // Final text response
        return res.json({ answer: choice.message.content });
      }
    }

    return res.json({ answer: "Analysis complete but reached tool call limit. Please ask a more specific question." });
  } catch (e) {
    console.error("AI chat error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.OPENAI_API_KEY,
    localNQBars: LOCAL_NQ_DATA.length,
  });
});

// --- License / subscription tier system (Quantower / Sierra-style) ---
//
// Anyone can download Datrena for free. The desktop app calls
// /api/license/status?email=... on startup. Tier is determined by:
//   1. FOUNDER_EMAILS env var (comma-separated) — always elite
//   2. licenses.json file — written by the Stripe webhook on successful payment
//   3. Default: "free" tier
//
// Replace licenses.json with a real DB once volume warrants it.

const LICENSE_FILE = join(__dirname, "data/licenses.json");
const FOUNDER_EMAILS = new Set(
  (process.env.FOUNDER_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

function loadLicenses() {
  try {
    if (!existsSync(LICENSE_FILE)) return {};
    return JSON.parse(readFileSync(LICENSE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveLicenses(map) {
  try {
    const dir = dirname(LICENSE_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(LICENSE_FILE, JSON.stringify(map, null, 2));
  } catch (err) {
    console.error("Failed to save licenses:", err.message);
  }
}

function tierForEmail(email) {
  const e = String(email || "").toLowerCase().trim();
  if (!e) return "free";
  if (FOUNDER_EMAILS.has(e)) return "elite";
  const licenses = loadLicenses();
  const entry = licenses[e];
  if (!entry) return "free";
  // Honor expiresAt if present (cancelled subscriptions still active until period end)
  if (entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now()) {
    return "free";
  }
  return entry.tier || "free";
}

app.get("/api/license/status", (req, res) => {
  const email = req.query.email;
  const tier = tierForEmail(email);
  res.json({ email: email || null, tier });
});

// --- Stripe Checkout + Webhook ---
//
// Pricing page CTAs hit /api/stripe/create-checkout-session with { email, tier }.
// On checkout.session.completed, the webhook records the user's tier in licenses.json.
// On customer.subscription.deleted, the user reverts to free at period end.

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// Map our tier keys to env-configured Stripe Price IDs
const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO || "",
  elite: process.env.STRIPE_PRICE_ELITE || "",
};

app.post("/api/stripe/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(501).json({ error: "Stripe not configured on server" });
  }
  const { email, tier } = req.body || {};
  const priceId = STRIPE_PRICE_IDS[tier];
  if (!priceId) {
    return res.status(400).json({ error: `No Stripe price configured for tier: ${tier}` });
  }
  try {
    const origin = req.headers.origin || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/Pricing?checkout=success&tier=${tier}`,
      cancel_url: `${origin}/Pricing?checkout=cancelled`,
      metadata: { tier, app: "datrena" },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Stripe sends raw bodies for webhook signature verification — mount with raw parser.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    if (!stripe) return res.status(501).send("Stripe not configured");
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      event = webhookSecret
        ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
        : JSON.parse(req.body.toString()); // dev fallback when no secret set
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const licenses = loadLicenses();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = (session.customer_email || session.customer_details?.email || "").toLowerCase();
      const tier = session.metadata?.tier;
      if (email && tier) {
        licenses[email] = {
          tier,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          activatedAt: new Date().toISOString(),
          expiresAt: null,
        };
        saveLicenses(licenses);
        console.log(`License activated: ${email} → ${tier}`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      // Find the email associated with this subscription
      const email = Object.keys(licenses).find(
        (e) => licenses[e]?.stripeSubscriptionId === sub.id
      );
      if (email) {
        licenses[email].expiresAt = new Date(sub.current_period_end * 1000).toISOString();
        saveLicenses(licenses);
        console.log(`Subscription cancelled: ${email}, expires ${licenses[email].expiresAt}`);
      }
    }

    res.json({ received: true });
  }
);

app.listen(PORT, () => {
  console.log(`Datrena API running on http://localhost:${PORT}`);
});
