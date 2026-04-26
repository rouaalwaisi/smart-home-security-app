import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Mail, Lock, Shield, User, ArrowLeft } from "lucide-react";

interface SignupScreenProps {
  onSignup: () => void;
  onBackToLogin: () => void;
}

export function SignupScreen({ onSignup, onBackToLogin }: SignupScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    
    // Handle signup logic here
    console.log("Signup attempted with:", name, email, password);
    onSignup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBackToLogin}
          className="text-blue-200 hover:text-white hover:bg-white/10 mb-6 -ml-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </Button>

        {/* Logo/Icon Area */}
        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-white mb-2">Create Account</h1>
          <p className="text-blue-200/70">Set up your smart home security system</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-blue-100">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-100">
              Email
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

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-100">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-blue-100">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              className="border-blue-400/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-0.5"
            />
            <label
              htmlFor="terms"
              className="text-sm text-blue-200/70 cursor-pointer leading-tight"
            >
              I agree to use this system on a secure local network and understand that all data is stored locally
            </label>
          </div>

          {/* Signup Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-8"
          >
            Create Account
          </Button>
        </form>

        {/* Security Confirmation */}
        <div className="mt-8 text-center">
          <p className="text-blue-200/50 text-sm">
            Your credentials are secured via AES-128 encryption on the local intranet network.
          </p>
        </div>
      </div>
    </div>
  );
}