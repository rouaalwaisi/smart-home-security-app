import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface VerifyEmailScreenProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function VerifyEmailScreen({ email, onVerified, onBack }: VerifyEmailScreenProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    setLoading(false);

    if (error) {
      setError("Invalid code. Please try again.");
    } else {
      setVerified(true);
      setTimeout(() => {
        onBack(); // Go to login page instead of logging in directly
      }, 2000);
    }
  };

  const handleResend = async () => {
    setError("");
    setResent(false);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setError(error.message);
    } else {
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-white mb-4">Email Verified! 🎉</h1>
          <p className="text-blue-200/70">Your account has been created successfully.</p>
          <p className="text-blue-200/50 text-sm mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Button variant="ghost" onClick={onBack}
          className="text-blue-200 hover:text-white hover:bg-white/10 mb-6 -ml-2">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-white mb-2">Verify Your Email</h1>
          <p className="text-blue-200/70">We sent a verification code to</p>
          <p className="text-blue-300 font-medium mt-1">{email}</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}
        {resent && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm text-center">
            New code sent! Check your email.
          </div>
        )}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-blue-100">Verification Code</Label>
            <Input id="otp" type="text" placeholder="Enter 8-digit code"
              value={otp} onChange={(e) => setOtp(e.target.value)}
              className="bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 text-center text-2xl tracking-widest"
              maxLength={8} required />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-4">
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={handleResend}
            className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}