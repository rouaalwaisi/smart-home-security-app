import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Mail, Lock, Shield, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  startAtPassword?: boolean;
}

type Step = "email" | "password" | "success";

export function ForgotPasswordScreen({ onBackToLogin, startAtPassword = false }: ForgotPasswordScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>(startAtPassword ? "password" : "email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address"); return; }
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173"
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setEmailSent(true);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setCurrentStep("success");
      setTimeout(() => { onBackToLogin(); }, 2000);
    }
  };

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-white mb-4">Password Reset Successful</h1>
          <p className="text-blue-200/70">Your password has been updated. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button onClick={onBackToLogin}
          className="flex items-center text-blue-300 hover:text-blue-200 transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </button>

        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Step 1: Enter Email */}
        {currentStep === "email" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white mb-2">Reset Password</h1>
              <p className="text-blue-200/70">Enter your email to receive a reset link</p>
            </div>

            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>}

            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-300 font-medium">Reset link sent!</p>
                  <p className="text-emerald-200/70 text-sm mt-1">Check your email at <span className="text-emerald-300">{email}</span> and click the reset link.</p>
                </div>
                <p className="text-blue-200/50 text-sm">After clicking the link, you'll be brought back here to set your new password.</p>
                <button onClick={() => { setEmailSent(false); setError(""); }}
                  className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendResetEmail} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-100">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                    <Input id="email" type="email" placeholder="your.email@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50"
                      required />
                  </div>
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white mt-4">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </>
        )}

        {/* Step 2: Enter New Password (after clicking link) */}
        {currentStep === "password" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white mb-2">Create New Password</h1>
              <p className="text-blue-200/70">Enter your new password below</p>
            </div>

            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-blue-100">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                  <Input id="newPassword" type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-11 pr-10 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50"
                    required />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-200">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-100">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-10 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50"
                    required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-200">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white mt-4">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}