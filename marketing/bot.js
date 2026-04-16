import Anthropic from "@anthropic-ai/sdk";
import { TwitterApi } from "twitter-api-v2";
import readline from "readline";
import { config } from "dotenv";

config();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const DATRENA_CONTEXT = `Datrena is a quantitative trading research platform for futures traders.

Products:
- Data: Live Level 3 MBO (Market-By-Order) data streamed from Rithmic. Footprint charts, full order book depth. Instruments: ES, NQ, CL, GC, YM, ZB, 6E, SI across CME, CBOT, NYMEX, COMEX.
- AI Analysis: AI-powered quantitative analysis — volatility modeling, order flow imbalance, GARCH forecasts, delta divergence, mean reversion signals. One prompt, institutional-grade output.
- Backtesting: Replay any trading session bar by bar. Test strategies against real historical Level 3 tick data, not synthetic fills or OHLC approximations.
- Research: Cloud compute environment for ML model training, parameter optimization, walk-forward analysis, Monte Carlo simulation, and factor analysis on real market microstructure data.

Value props:
- Same Level 3 order book data that prop desks and institutions use
- One platform replaces 4-5 separate tools (data + charting + backtesting + research + AI)
- Real tick data, not delayed or aggregated feeds
- Built for independent quants, algo traders, and futures traders
- Currently in private beta

Website: datrena.com
`;

const PLATFORM_GUIDELINES = {
  x: {
    name: "X (Twitter)",
    instructions: `Write a tweet for X/Twitter.
- Max 280 characters
- Punchy, direct, no fluff
- Use line breaks for readability
- End with datrena.com
- No hashtags unless highly relevant (max 1-2)
- Trading/quant audience — speak their language
- Can be provocative or contrarian to drive engagement`,
  },
  linkedin: {
    name: "LinkedIn",
    instructions: `Write a LinkedIn post.
- 150-300 words
- Professional but not corporate — founders voice
- Use line breaks between short paragraphs (LinkedIn rewards readability)
- Hook in the first line (this shows before "see more")
- End with a soft CTA and datrena.com
- Can include a brief personal angle (building this, shipping this, etc.)
- Quant finance / fintech / startup audience`,
  },
  reddit: {
    name: "Reddit",
    instructions: `Write a Reddit post for r/algotrading or r/futurestrading.
- Title + body format
- Be genuine, not salesy — Reddit hates ads
- Lead with value: what problem does this solve
- Mention it's your project (transparency matters on Reddit)
- Ask for feedback — Reddit loves being asked for input
- 100-200 words body
- No marketing speak`,
  },
  discord: {
    name: "Discord",
    instructions: `Write a Discord announcement message.
- Short and scannable (100-150 words max)
- Use bold and line breaks for structure
- Casual, community tone
- Can use a few relevant emojis sparingly
- End with link to datrena.com`,
  },
};

const claude = new Anthropic();

async function generatePost(topic, platform) {
  const guidelines = PLATFORM_GUIDELINES[platform];

  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a social media copywriter for Datrena, a quant trading platform.

${DATRENA_CONTEXT}

Platform: ${guidelines.name}
${guidelines.instructions}

Write a post about: ${topic}

Return ONLY the post text, nothing else. No quotes, no labels, no explanation.`,
      },
    ],
  });

  return response.content[0].text.trim();
}

async function postToX(text) {
  const client = new TwitterApi({
    appKey: process.env.X_APP_KEY,
    appSecret: process.env.X_APP_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });

  const tweet = await client.v2.tweet(text);
  return `https://x.com/i/status/${tweet.data.id}`;
}

async function postToLinkedIn(text) {
  const personId = process.env.LINKEDIN_PERSON_ID;
  const token = process.env.LINKEDIN_ACCESS_TOKEN;

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });

  if (!res.ok) throw new Error(`LinkedIn API error: ${res.status}`);
  return "Posted to LinkedIn";
}

const POSTERS = {
  x: postToX,
  linkedin: postToLinkedIn,
};

async function main() {
  console.log("\n  Datrena Marketing Bot\n");

  const topic = await ask("  What do you want to post about?\n  > ");

  console.log("\n  Where do you want to post?");
  console.log("  1. X (Twitter)");
  console.log("  2. LinkedIn");
  console.log("  3. Reddit (generate only)");
  console.log("  4. Discord (generate only)");
  console.log("  5. All platforms\n");

  const choice = await ask("  > ");

  const platformMap = { 1: ["x"], 2: ["linkedin"], 3: ["reddit"], 4: ["discord"], 5: ["x", "linkedin", "reddit", "discord"] };
  const platforms = platformMap[choice.trim()];

  if (!platforms) {
    console.log("  Invalid choice.");
    rl.close();
    return;
  }

  for (const platform of platforms) {
    const label = PLATFORM_GUIDELINES[platform].name;
    console.log(`\n  Generating ${label} post...`);

    const post = await generatePost(topic, platform);

    console.log(`\n  --- ${label} ---`);
    console.log(`  ${post.split("\n").join("\n  ")}`);
    console.log("  ---\n");

    const poster = POSTERS[platform];
    if (poster) {
      const shouldPost = await ask(`  Post to ${label} now? (y/n) > `);
      if (shouldPost.trim().toLowerCase() === "y") {
        try {
          const result = await poster(post);
          console.log(`  Posted! ${result}`);
        } catch (e) {
          console.log(`  Failed to post: ${e.message}`);
          console.log("  (Copy the text above and post manually)");
        }
      } else {
        console.log("  Skipped. Copy the text above to post manually.");
      }
    } else {
      console.log("  (Copy the text above and post manually)");
    }
  }

  rl.close();
}

main();
