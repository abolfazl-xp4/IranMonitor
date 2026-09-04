"use client";

import * as React from "react";
import { LogIn, User, Lock, Mail, UserPlus, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toPersianDigits } from "@/lib/iran-data";

const AUTH_KEY = "iranmonitor:auth";

export function LoginPage() {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState("");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setLoggedIn(true);
        setUserName(data.name || "کاربر");
      }
    } catch {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("ایمیل و رمز عبور الزامی است"); return; }
    if (mode === "register" && !name) { setError("نام الزامی است"); return; }
    // Simple local auth (no real backend)
    const user = { name: mode === "register" ? name : email.split("@")[0], email, loginAt: Date.now() };
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch {}
    setLoggedIn(true);
    setUserName(user.name);
  };

  const logout = () => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setLoggedIn(false);
    setUserName("");
    setEmail("");
    setPassword("");
    setName("");
  };

  if (loggedIn) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Card className="overflow-hidden shadow-lg">
          <div className="border-b border-border/60 bg-gradient-to-l from-primary/15 to-transparent px-6 py-4 text-center">
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary shadow-md">
              <Check className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold">خوش آمدید</h2>
            <p className="text-sm text-muted-foreground">{userName} عزیز، وارد شدید</p>
          </div>
          <div className="space-y-3 p-6 text-center">
            <div className="rounded-lg border border-border/60 bg-card/60 p-3 text-right">
              <p className="text-[11px] text-muted-foreground">ایمیل</p>
              <p className="text-sm font-mono">{email || "—"}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card/60 p-3 text-right">
              <p className="text-[11px] text-muted-foreground">زمان ورود</p>
              <p className="text-sm">{new Date().toLocaleTimeString("fa-IR")}</p>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={logout}>
              خروج از حساب
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="overflow-hidden shadow-lg">
        <div className="border-b border-border/60 bg-gradient-to-l from-primary/15 to-transparent px-6 py-5 text-center">
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
            <LogIn className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold">{mode === "login" ? "ورود به ایران‌مانیتور" : "ثبت‌نام در ایران‌مانیتور"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "login" ? "برای دسترسی کامل وارد شوید" : "حساب کاربری رایگان بسازید"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-6">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">نام</label>
              <div className="relative">
                <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  className="pr-9"
                />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">ایمیل</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="pr-9"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">رمز عبور</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-9"
                dir="ltr"
              />
            </div>
          </div>
          {error && (
            <p className="rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-500">{error}</p>
          )}
          <Button type="submit" className="w-full gap-2">
            {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === "login" ? "ورود" : "ثبت‌نام"}
          </Button>
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="w-full text-center text-xs text-muted-foreground hover:text-primary"
          >
            {mode === "login" ? "حساب ندارید؟ ثبت‌نام کنید" : "حساب دارید؟ وارد شوید"}
          </button>
        </form>
      </Card>
    </div>
  );
}
