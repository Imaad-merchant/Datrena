import React, { useState, useRef, useEffect } from "react";
import MainNav from "../components/navigation/MainNav";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const QUICK_PROMPTS = [
  "Analyze NQ volatility regimes today",
  "What is the order flow imbalance on ES?",
  "Run a GARCH forecast for CL crude oil",
  "Is NQ mean-reverting or trending right now?",
  "What factors predict ES reversals at session highs?",
  "Compare delta divergence across NQ and ES",
];

export default function AnalysisLayer() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }],
          context: "Datrena Research Terminal — quantitative analysis on Rithmic MBO Level 3 market data. Instruments: ES, NQ, CL, GC, YM, ZB, 6E, SI.",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${e.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black pl-16 flex flex-col text-white overflow-hidden">
      <MainNav />

      {/* Header */}
      <div className="border-b border-gray-800/60 px-6 py-3 shrink-0 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800/60">
          <Bot className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">AI Analysis</h1>
          <p className="text-[11px] text-gray-500">AI-powered quantitative analysis on Rithmic market data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="text-center pt-20 pb-10">
              <div className="w-14 h-14 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-5">
                <Bot className="w-7 h-7 text-gray-500" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Research Terminal</h2>
              <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                Ask anything about market data, volatility, order flow, or quantitative strategies. Powered by Rithmic MBO Level 3 data.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                {QUICK_PROMPTS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300 transition-colors disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-900/60 border border-gray-800/40 text-gray-200"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:leading-relaxed [&_ul]:pl-4 [&_li]:mb-0.5">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-gray-400" />
              </div>
              <div className="bg-gray-900/60 border border-gray-800/40 rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800/60 px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Ask about volatility, order flow, strategies..."
            disabled={loading}
            className="flex-1 bg-gray-900/60 border border-gray-800/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-white text-black hover:bg-gray-200 rounded-lg px-4 h-auto"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
