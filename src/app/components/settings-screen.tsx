import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  ArrowLeft, User, Mail, Lock, Shield, Fingerprint,
  Bell, Volume2, VolumeX, Database, Download, Upload, Trash2, Eye, EyeOff
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface SettingsScreenProps {
  onNavigateBack: () => void;
  biometricEnabled: boolean;
  onBiometricChange: (enabled: boolean) => void;
}

export function SettingsScreen({ onNavigateBack, biometricEnabled, onBiometricChange }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: "", email: "" });
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  const [passwordStep, setPasswordStep] = useState<"verify" | "change">("verify");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserProfile({
        name: data.user.user_metadata?.full_name || "User",
        email: data.user.email || ""
      });
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEditProfile = async () => {
    if (!editName.trim()) { showMessage("Please enter a valid name", "error"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: editName } });
    setLoading(false);
    if (error) {
      showMessage(error.message, "error");
    } else {
      setUserProfile({ ...userProfile, name: editName });
      setShowEditProfileModal(false);
      setEditName("");
      showMessage("Profile updated successfully!", "success");
    }
  };

  const openChangePassword = () => {
    setPasswordStep("verify");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowChangePasswordModal(true);
  };

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) { setPasswordError("Please enter your current password"); return; }
    setLoading(true);
    setPasswordError("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.email) { setPasswordError("Could not get user info"); setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword
    });
    setLoading(false);
    if (error) {
      setPasswordError("Incorrect password. Please try again.");
    } else {
      setPasswordStep("change");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!newPassword || !confirmPassword) { setPasswordError("Please fill in all fields"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match!"); return; }
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }
    if (newPassword === currentPassword) { setPasswordError("New password must be different from current password"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setShowChangePasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("Password changed successfully!", "success");
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      showMessage("No active session found", "error");
      setLoading(false);
      setShowDeleteModal(false);
      return;
    }

    const result = await fetch(
      "https://giryekrfphmmebisivom.supabase.co/functions/v1/delete-user",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionData.session.access_token}`,
          "Content-Type": "application/json"
        }
      }
    ).then(r => r.json());

    setLoading(false);
    setShowDeleteModal(false);

    if (result.error) {
      showMessage(result.error, "error");
    } else {
      await supabase.auth.signOut();
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onNavigateBack}
            className="text-blue-200 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-white">Settings</h1>
            <p className="text-blue-200/70 text-sm">Manage your app and account preferences</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
            message.type === "success"
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/20 border border-red-500/30 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* Account */}
        <div className="mb-6">
          <h2 className="text-white mb-3">Account</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white">{userProfile.name}</p>
                <p className="text-blue-200/70 text-sm">{userProfile.email}</p>
              </div>
              <Button variant="outline" size="sm"
                className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white"
                onClick={() => { setEditName(userProfile.name); setShowEditProfileModal(true); }}>
                Edit Profile
              </Button>
            </div>
            <div className="space-y-3">
              <div className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-blue-400/10">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Email Address</span>
                </div>
                <span className="text-blue-200/50 text-sm">{userProfile.email}</span>
              </div>
              <button onClick={openChangePassword}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-blue-400/10">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Change Password</span>
                </div>
                <span className="text-blue-200/50 text-sm">••••••••</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Security */}
        <div className="mb-6">
          <h2 className="text-white mb-3">Security</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Biometric Authentication</p>
                    <p className="text-blue-200/50 text-xs">Use fingerprint or face ID</p>
                  </div>
                </div>
                <button onClick={() => onBiometricChange(!biometricEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${biometricEnabled ? "bg-blue-600" : "bg-white/20"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${biometricEnabled ? "translate-x-6" : "translate-x-0.5"}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Two-Factor Authentication</p>
                    <p className="text-blue-200/50 text-xs">Send OTP to email on every login</p>
                  </div>
                </div>
                <button onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  showMessage(`Two-factor authentication ${!twoFactorEnabled ? "enabled" : "disabled"} — coming in next update`, "success");
                }}
                  className={`w-12 h-6 rounded-full transition-all ${twoFactorEnabled ? "bg-blue-600" : "bg-white/20"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${twoFactorEnabled ? "translate-x-6" : "translate-x-0.5"}`}></div>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h2 className="text-white mb-3">Notifications</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Push Notifications</p>
                    <p className="text-blue-200/50 text-xs">Receive alerts and updates</p>
                  </div>
                </div>
                <button onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${notificationsEnabled ? "bg-blue-600" : "bg-white/20"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${notificationsEnabled ? "translate-x-6" : "translate-x-0.5"}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-blue-400" /> : <VolumeX className="w-5 h-5 text-blue-400" />}
                  <div>
                    <p className="text-white">Sound Alerts</p>
                    <p className="text-blue-200/50 text-xs">Play sound for security events</p>
                  </div>
                </div>
                <button onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${soundEnabled ? "bg-blue-600" : "bg-white/20"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${soundEnabled ? "translate-x-6" : "translate-x-0.5"}`}></div>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Data & Storage */}
        <div className="mb-6">
          <h2 className="text-white mb-3">Data & Storage</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4">
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                onClick={() => showMessage("Export feature coming soon!", "success")}>
                <Download className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white">Export Data</p>
                  <p className="text-blue-200/50 text-xs">Download all your data</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                onClick={() => showMessage("Import feature coming soon!", "success")}>
                <Upload className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white">Import Data</p>
                  <p className="text-blue-200/50 text-xs">Restore from backup</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                onClick={() => { localStorage.clear(); showMessage("Cache cleared successfully!", "success"); }}>
                <Database className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white">Clear Cache</p>
                  <p className="text-blue-200/50 text-xs">Free up storage space</p>
                </div>
              </button>
            </div>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <h2 className="text-red-400 mb-3">Danger Zone</h2>
          <Card className="bg-red-500/5 border-red-400/20 p-4">
            <button onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-400/20">
              <Trash2 className="w-5 h-5 text-red-400" />
              <div className="text-left">
                <p className="text-red-100">Delete Account</p>
                <p className="text-red-200/50 text-xs">Permanently delete your account and data</p>
              </div>
            </button>
          </Card>
        </div>

        <Card className="bg-white/5 border-blue-400/20 p-4 mb-6">
          <div className="text-center space-y-2">
            <p className="text-blue-200/70 text-sm">Smart Home Security App</p>
            <p className="text-blue-200/50 text-xs">Version 1.0.0</p>
            <p className="text-blue-200/50 text-xs">Graduation Project © 2026</p>
          </div>
        </Card>

        {/* Edit Profile Modal */}
        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowEditProfileModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200/70 text-sm block mb-2">Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setShowEditProfileModal(false)} variant="outline"
                    className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10">Cancel</Button>
                  <Button onClick={handleEditProfile} disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowChangePasswordModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white mb-1">Change Password</h2>
              <p className="text-blue-200/70 text-sm mb-4">
                {passwordStep === "verify" ? "Step 1: Verify your current password" : "Step 2: Enter your new password"}
              </p>
              {passwordError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                  {passwordError}
                </div>
              )}
              {passwordStep === "verify" ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-blue-200/70 text-sm block mb-2">Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 pr-10 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50" />
                      <button onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-200">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowChangePasswordModal(false)} variant="outline"
                      className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10">Cancel</Button>
                    <Button onClick={handleVerifyCurrentPassword} disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      {loading ? "Verifying..." : "Verify Password"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-blue-200/70 text-sm block mb-2">New Password</label>
                    <div className="relative">
                      <input type={showNewPassword ? "text" : "password"}
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 pr-10 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50" />
                      <button onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-200">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-blue-200/70 text-sm block mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 pr-10 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50" />
                      <button onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-200">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setPasswordStep("verify")} variant="outline"
                      className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10">Back</Button>
                    <Button onClick={handleChangePassword} disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      {loading ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowDeleteModal(false)}>
            <Card className="bg-[#0f1e36] border-red-400/30 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-white">Delete Account?</h2>
                <p className="text-blue-200/70 text-sm mt-2">This action is permanent and cannot be undone. All your devices, logs and alerts will be deleted.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowDeleteModal(false)} variant="outline"
                  className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10">Cancel</Button>
                <Button onClick={handleDeleteAccount} disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  {loading ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}