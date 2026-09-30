"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/ui/magic-card";
import { Spotlight } from "@/components/ui/spotlight";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-bg relative overflow-hidden">
      <Spotlight className="-top-24 right-0 left-auto md:-top-20 md:left-60 md:right-auto" fill="#A78BFA" />
      {/* Decorative glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 h-[300px] w-[300px] translate-y-1/2 rounded-full bg-secondary/10 blur-[100px]"
      />
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <Card className="w-full max-w-sm border-none p-0 shadow-none z-10 bg-transparent">
        <MagicCard
          gradientColor="#262626"
          className="p-0 border-white/10 shadow-2xl bg-bg/60 backdrop-blur-xl"
        >
          <CardHeader className="border-border border-b border-white/10 p-6 pb-4">
            <CardTitle className="text-2xl font-display text-text-primary">Admin Login</CardTitle>
            <CardDescription className="text-text-secondary">
              Sign in to access the AWS SBG Admin Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form id="login-form" onSubmit={handleLogin}>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-text-primary">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@tulas.edu.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    autoComplete="email"
                    className="bg-black/20 border-white/10 text-text-primary focus:border-primary/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-text-primary">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    autoComplete="current-password"
                    className="bg-black/20 border-white/10 text-text-primary focus:border-primary/50"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="border-border border-t border-white/10 p-6 pt-4">
            <Button
              type="submit"
              form="login-form"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </MagicCard>
      </Card>
    </div>
  );
}
