import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

const QUICK_PROMPTS = [
  "What are the key reversal zones?",
  "Is price extended above mean?",
  "What SD level should I target for a short?",
  "Summarize the current market structure",
];

export default function AIChat({ context }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    // TODO: Replace with your own API endpoint
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "AI backend not connected. Connect your own API to enable AI analysis.",
    }]);
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          AI Quant Researcher
        </h2>
        {collapsed ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
      </button>

      {!collapsed && (
        <div className="border-t border-gray-800">
          {/* Quick prompts */}
          <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-gray-800">
            {QUICK_PROMPTS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading || !context}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-400 hover:border-green-600 hover:text-green-400 transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto px-4 py-3 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-600 text-sm mt-8">
                <Bot className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                <p>Run an analysis first, then ask me anything about the data.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-green-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-800 text-gray-100"
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
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-green-400" />
                </div>
                <div className="bg-gray-800 rounded-xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
              placeholder={context ? "Ask about SD reversals, setups, levels..." : "Run analysis first..."}
              disabled={loading || !context}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-green-600 text-sm"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim() || !context}
              size="icon"
              className="bg-green-700 hover:bg-green-600 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}