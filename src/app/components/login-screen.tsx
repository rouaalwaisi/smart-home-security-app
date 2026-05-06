import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Mail, Lock, Shield, Fingerprint } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { validateEmail, checkRateLimit, recordLoginAttempt, sanitizeInput } from "../../lib/security";

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToVerify: (email: string) => void;
  biometricEnabled: boolean;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
}

export function LoginScreen({ onLogin, onNavigateToSignup, onNavigateToForgotPassword, onNavigateToVerify, biometricEnabled, rememberMe, onRememberMeChange }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Sanitize inputs
    const cleanEmail = sanitizeInput(email.toLowerCase());

    // Validate email
    const emailError = validateEmail(cleanEmail);
    if (emailError) { setError(emailError); return; }

    // Check rate limit
    const rateLimitError = checkRateLimit(cleanEmail);
    if (rateLimitError) { setError(rateLimitError); return; }

    if (!password) { setError("Password is required"); return; }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (error) {
      recordLoginAttempt(cleanEmail, false);
      if (error.message.toLowerCase().includes("email not confirmed")) {
        await supabase.auth.resend({ type: "signup", email: cleanEmail });
        onNavigateToVerify(cleanEmail);
      } else if (error.message.toLowerCase().includes("invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(error.message);
      }
    } else {
      recordLoginAttempt(cleanEmail, true);
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedEmail", cleanEmail);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedEmail");
      }
      onLogin();
    }
  };

  const handleBiometricAuth = () => {
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-white mb-2">Welcome Back</h1>
          <p className="text-blue-200/70">Sign in to access your smart home</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-100">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input id="email" type="email" placeholder="your.email@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                required maxLength={254} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-100">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input id="password" type="password" placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                required maxLength={128} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" checked={rememberMe}
              onCheckedChange={(checked) => onRememberMeChange(checked as boolean)}
              className="border-blue-400/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
            <label htmlFor="remember" className="text-sm text-blue-200/70 cursor-pointer">
              Remember Me
            </label>
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-8">
            {loading ? "Signing in..." : "Login Securely"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
            onClick={(e) => { e.preventDefault(); onNavigateToForgotPassword(); }}>
            Forgot Password?
          </a>
        </div>
        {biometricEnabled && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-400/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#1a2f4f] text-blue-200/50">Or continue with</span>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={handleBiometricAuth}
              className="w-full bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white hover:border-blue-400/40">
              <Fingerprint className="w-5 h-5 mr-2" />
              Use Biometric Authentication
            </Button>
          </>
        )}
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
            onClick={(e) => { e.preventDefault(); onNavigateToSignup(); }}>
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
}