import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Mail, Lock, Shield, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

type Step = "email" | "otp" | "password";

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Generate random 6-digit OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);

    // Simulate sending OTP
    console.log("OTP sent to:", email, "OTP:", randomOtp);
    setCurrentStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate OTP
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    // OTP verified, move to password reset
    console.log("OTP verified successfully");
    setCurrentStep("password");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Simulate password reset
    console.log("Password reset for:", email);
    setResetSuccess(true);

    // Auto-redirect after 2 seconds
    setTimeout(() => {
      onBackToLogin();
    }, 2000);
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-white mb-4">Password Reset Successful</h1>
          <p className="text-blue-200/70 mb-8">
            Your password has been updated successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          onClick={onBackToLogin}
          className="flex items-center text-blue-300 hover:text-blue-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </button>

        {/* Logo/Icon Area */}
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
              <p className="text-blue-200/70">Enter your email to receive an OTP</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-100">
                  Email or Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-8"
              >
                Send OTP
              </Button>
            </form>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {currentStep === "otp" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white mb-2">Verify OTP</h1>
              <p className="text-blue-200/70">Enter the 6-digit code sent to {email}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-blue-100">
                  OTP Code
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20 text-center tracking-widest"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-8"
              >
                Verify OTP
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
                  setGeneratedOtp(randomOtp);
                  console.log("OTP resent:", randomOtp);
                  setError("");
                }}
                className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
              >
                Resend OTP
              </button>
            </div>

            {/* Show OTP for demo purposes */}
            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
              <p className="text-sm text-blue-200/70 mb-2">Demo Mode - Your OTP is:</p>
              <p className="text-center text-2xl font-mono text-blue-100 tracking-widest">{generatedOtp}</p>
            </div>
          </>
        )}

        {/* Step 3: Reset Password */}
        {currentStep === "password" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white mb-2">Create New Password</h1>
              <p className="text-blue-200/70">Enter your new password</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-blue-100">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-100">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-8"
              >
                Reset Password
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
              <p className="text-sm text-blue-200/70">
                Password must be at least 6 characters long
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
