import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Shield, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface TwoFactorScreenProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
  rememberMe: boolean;
}

export function TwoFactorScreen({ email, onVerified, onBack, rememberMe }: TwoFactorScreenProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otp) { setError("Please enter the OTP code"); return; }
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email"
    });

    setLoading(false);

    if (error) {
      setError("Invalid or expired code. Please try again.");
    } else {
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedEmail", email);
      }
      onVerified();
    }
  };

  const handleResend = async () => {
    setError("");
    setResent(false);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Button variant="ghost" onClick={onBack}
          className="text-blue-200 hover:text-white hover:bg-white/10 mb-6 -ml-2">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </Button>

        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-white mb-2">Two-Factor Authentication</h1>
          <p className="text-blue-200/70">We sent a verification code to</p>
          <p className="text-blue-300 font-medium mt-1">{email}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {resent && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm text-center">
            New code sent! Check your email.
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-blue-100">Verification Code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input id="otp" type="text" placeholder="Enter verification code"
                value={otp} onChange={(e) => setOtp(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 text-center tracking-widest"
                maxLength={8} required />
            </div>
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-4">
            {loading ? "Verifying..." : "Verify & Login"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={handleResend}
            className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
            Resend code
          </button>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-blue-200/70 text-xs">
              Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}