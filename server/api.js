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
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

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

// --- Download / license verification ---
//
// Until Stripe webhooks are wired up, license keys are stored in
// LICENSE_KEYS (env var, comma-separated `email:KEY` pairs) plus a hard-coded
// founder/test key. Replace with a database lookup once purchases go live.

const FOUNDER_KEYS = new Set(["DTRN-FOUND-ER01-ADMN"]);

function loadLicensesFromEnv() {
  const raw = process.env.LICENSE_KEYS || "";
  const map = new Map(); // email -> Set<key>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [email, key] = pair.split(":");
      if (!email || !key) return;
      const e = email.toLowerCase();
      if (!map.has(e)) map.set(e, new Set());
      map.get(e).add(key.trim().toUpperCase());
    });
  return map;
}

const RELEASE_TAG = process.env.DATRENA_RELEASE_TAG || "v0.1.0";
const RELEASE_REPO = process.env.DATRENA_RELEASE_REPO || "datrena/datrena-app";

function downloadUrls() {
  const base = `https://github.com/${RELEASE_REPO}/releases/download/${RELEASE_TAG}`;
  return {
    mac: `${base}/Datrena-${RELEASE_TAG.replace(/^v/, "")}-arm64.dmg`,
    win: `${base}/Datrena-Setup-${RELEASE_TAG.replace(/^v/, "")}.exe`,
  };
}

app.post("/api/download/verify", (req, res) => {
  const { email, licenseKey } = req.body || {};
  if (!email || !licenseKey) {
    return res.status(400).json({ valid: false, error: "Email and license key required" });
  }
  const e = String(email).toLowerCase().trim();
  const k = String(licenseKey).toUpperCase().trim();

  // Founder/admin keys work with any email
  if (FOUNDER_KEYS.has(k)) {
    return res.json({ valid: true, downloads: downloadUrls() });
  }

  const licenses = loadLicensesFromEnv();
  const userKeys = licenses.get(e);
  if (userKeys && userKeys.has(k)) {
    return res.json({ valid: true, downloads: downloadUrls() });
  }

  return res.status(403).json({
    valid: false,
    error: "License key not found for this email. Check your purchase confirmation.",
  });
});

app.listen(PORT, () => {
  console.log(`Datrena API running on http://localhost:${PORT}`);
});
