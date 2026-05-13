import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Mail, Lock, Shield, ArrowLeft, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { validateEmail, validatePassword, validateName, sanitizeInput, getPasswordStrength } from "../../lib/security";

interface SignupScreenProps {
  onSignup: () => void;
  onBackToLogin: () => void;
  onNavigateToVerify: (email: string) => void;
}

export function SignupScreen({ onSignup, onBackToLogin, onNavigateToVerify }: SignupScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email.toLowerCase());

    const nameError = validateName(cleanName);
    if (nameError) { setError(nameError); return; }

    const emailError = validateEmail(cleanEmail);
    if (emailError) { setError(emailError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName }
      }
    });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        setError("An account with this email already exists. Please login instead.");
      } else {
        setError(error.message);
      }
    } else {
      onNavigateToVerify(cleanEmail);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Button variant="ghost" onClick={onBackToLogin}
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
          <h1 className="text-white mb-2">Create Account</h1>
          <p className="text-blue-200/70">Join Smart Home Security</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-blue-100">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input id="name" type="text" placeholder="Your full name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50"
                required maxLength={100} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-100">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input id="email" type="email" placeholder="your.email@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50"
                required maxLength={254} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-100">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input id="password" type={showPassword ? "text" : "password"}
                placeholder="Create a strong password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-10 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50"
                required maxLength={128} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-200">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength.score >= level ? passwordStrength.color : "bg-white/10"
                      }`} />
                  ))}
                </div>
                <p className={`text-xs ${
                  passwordStrength.score <= 1 ? "text-red-400" :
                  passwordStrength.score === 2 ? "text-orange-400" :
                  passwordStrength.score === 3 ? "text-yellow-400" :
                  passwordStrength.score === 4 ? "text-blue-400" :
                  "text-emerald-400"
                }`}>
                  Password strength: {passwordStrength.label}
                </p>
                <div className="text-xs text-blue-200/50 space-y-0.5">
                  <p className={password.length >= 8 ? "text-emerald-400" : ""}>
                    {password.length >= 8 ? "✓" : "✗"} At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>
                    {/[A-Z]/.test(password) ? "✓" : "✗"} One uppercase letter
                  </p>
                  <p className={/[a-z]/.test(password) ? "text-emerald-400" : ""}>
                    {/[a-z]/.test(password) ? "✓" : "✗"} One lowercase letter
                  </p>
                  <p className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>
                    {/[0-9]/.test(password) ? "✓" : "✗"} One number
                  </p>
                  <p className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-emerald-400" : ""}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "✗"} One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-blue-100">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/50" />
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-11 pr-10 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50"
                required maxLength={128} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-200">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-emerald-400">✓ Passwords match</p>
            )}
          </div>

          <Button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mt-4">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
            onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
            Already have an account? Login
          </a>
        </div>
      </div>
    </div>
  );
}