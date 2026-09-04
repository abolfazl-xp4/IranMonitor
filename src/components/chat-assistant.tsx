"use client";

import * as React from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toPersianDigits } from "@/lib/iran-data";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "قیمت دلار چقدره؟",
  "آخرین زلزله‌ها کجا بود؟",
  "بیت‌کوین چقدر شد؟",
  "هوای تهران چطوره؟",
];

export function ChatAssistant() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "assistant", content: "سلام! من دستیار ایران‌مانیتور هستم. درباره قیمت ارز، زلزله، آب‌وهوا یا اخبار سوال بپرسید." },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer || "پاسخی دریافت نشد." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "خطا در ارتباط. دوباره تلاش کنید." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 left-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-110 md:bottom-6"
        title="دستیار هوشمند"
        aria-label="دستیار هوشمند"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fade-up fixed bottom-36 left-4 z-40 flex h-[440px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl md:bottom-24">
          {/* header */}
          <div className="flex items-center gap-2 border-b border-border/60 bg-gradient-to-l from-primary/15 to-transparent px-4 py-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold">دستیار ایران‌مانیتور</p>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                آنلاین • داده‌های زنده
              </p>
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto scroll-thin p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  در حال فکر کردن...
                </div>
              </div>
            )}
          </div>

          {/* suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border/60 px-3 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <div className="flex items-center gap-2 border-t border-border/60 p-2.5">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="سوال خود را بنویسید..."
              className="h-9 text-xs"
              disabled={loading}
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => send()} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
