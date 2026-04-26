import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Fingerprint,
  Bell,
  Volume2,
  VolumeX,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";

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
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  });

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Mock active sessions data
  const activeSessions = [
    {
      id: "1",
      device: "iPhone 14 Pro",
      type: "mobile" as const,
      location: "New York, USA",
      lastActive: "Active now",
      current: true
    },
    {
      id: "2",
      device: "MacBook Pro",
      type: "desktop" as const,
      location: "New York, USA",
      lastActive: "2 hours ago",
      current: false
    },
    {
      id: "3",
      device: "iPad Air",
      type: "tablet" as const,
      location: "New York, USA",
      lastActive: "Yesterday",
      current: false
    }
  ];

  const getDeviceIcon = (type: "mobile" | "desktop" | "tablet") => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case "desktop":
        return <Monitor className="w-5 h-5 text-blue-400" />;
      case "tablet":
        return <Tablet className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleEditProfile = () => {
    if (editName.trim()) {
      setUserProfile({ ...userProfile, name: editName });
      setShowEditProfileModal(false);
      setEditName("");
      alert("Profile updated successfully!");
    } else {
      alert("Please enter a valid name");
    }
  };

  const handleChangeEmail = () => {
    if (editEmail.trim() && editEmail.includes("@")) {
      setUserProfile({ ...userProfile, email: editEmail });
      setShowChangeEmailModal(false);
      setEditEmail("");
      alert("Email updated successfully!");
    } else {
      alert("Please enter a valid email address");
    }
  };

  const handleChangePhone = () => {
    if (editPhone.trim()) {
      setUserProfile({ ...userProfile, phone: editPhone });
      setShowChangePhoneModal(false);
      setEditPhone("");
      alert("Phone number updated successfully!");
    } else {
      alert("Please enter a valid phone number");
    }
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    setShowChangePasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("Password changed successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateBack}
            className="text-blue-200 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-white">Settings</h1>
            <p className="text-blue-200/70 text-sm">Manage your app and account preferences</p>
          </div>
        </div>

        {/* User Profile Section */}
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
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white"
                onClick={() => setShowEditProfileModal(true)}
              >
                Edit Profile
              </Button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowChangeEmailModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-blue-400/10"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Email Address</span>
                </div>
                <span className="text-blue-200/50 text-sm">{userProfile.email}</span>
              </button>

              <button
                onClick={() => setShowChangePhoneModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-blue-400/10"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Phone Number</span>
                </div>
                <span className="text-blue-200/50 text-sm">{userProfile.phone}</span>
              </button>

              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-blue-400/10"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Change Password</span>
                </div>
                <span className="text-blue-200/50 text-sm">••••••••</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Security Settings */}
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
                <button
                  onClick={() => {
                    onBiometricChange(!biometricEnabled);
                    setTimeout(() => {
                      alert(`Biometric authentication ${!biometricEnabled ? 'enabled' : 'disabled'} successfully!`);
                    }, 100);
                  }}
                  className={`w-12 h-6 rounded-full transition-all ${
                    biometricEnabled ? "bg-blue-600" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all ${
                      biometricEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Two-Factor Authentication</p>
                    <p className="text-blue-200/50 text-xs">Add extra security layer</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    setTimeout(() => {
                      alert(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully!`);
                    }, 100);
                  }}
                  className={`w-12 h-6 rounded-full transition-all ${
                    twoFactorEnabled ? "bg-blue-600" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all ${
                      twoFactorEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Sessions List */}
        <div className="mb-6">
          <h2 className="text-white mb-3">Active Sessions</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4">
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-blue-400/10"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      {getDeviceIcon(session.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white">{session.device}</p>
                        {session.current && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-blue-200/50 text-xs">{session.location}</p>
                      <p className="text-blue-200/40 text-xs mt-0.5">{session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`End session on ${session.device}?`)) {
                          alert(`Session on ${session.device} has been terminated.`);
                        }
                      }}
                      className="bg-red-500/10 border-red-400/20 text-red-400 hover:bg-red-500/20 text-xs"
                    >
                      End Session
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Notification Settings */}
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
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    notificationsEnabled ? "bg-blue-600" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-blue-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-blue-400" />
                  )}
                  <div>
                    <p className="text-white">Sound Alerts</p>
                    <p className="text-blue-200/50 text-xs">Play sound for security events</p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    soundEnabled ? "bg-blue-600" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all ${
                      soundEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  ></div>
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
              <button
                onClick={() => alert("Exporting data...")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-white">Export Data</p>
                    <p className="text-blue-200/50 text-xs">Download all your data</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => alert("Import data functionality...")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-white">Import Data</p>
                    <p className="text-blue-200/50 text-xs">Restore from backup</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm("Clear all local cache? This action cannot be undone.")) {
                    alert("Cache cleared successfully!");
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-white">Clear Cache</p>
                    <p className="text-blue-200/50 text-xs">Free up storage space</p>
                  </div>
                </div>
                <span className="text-blue-200/50 text-sm">245 MB</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <h2 className="text-red-400 mb-3">Danger Zone</h2>
          <Card className="bg-red-500/5 border-red-400/20 backdrop-blur-sm p-4">
            <button
              onClick={() => {
                if (confirm("Delete account? This action is permanent and cannot be undone!")) {
                  alert("Account deletion process initiated...");
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-400/20"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <p className="text-red-100">Delete Account</p>
                  <p className="text-red-200/50 text-xs">Permanently delete your account and data</p>
                </div>
              </div>
            </button>
          </Card>
        </div>

        {/* App Info */}
        <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4">
          <div className="text-center space-y-2">
            <p className="text-blue-200/70 text-sm">Smart Home Security App</p>
            <p className="text-blue-200/50 text-xs">Version 1.0.0</p>
            <p className="text-blue-200/50 text-xs">Graduation Project © 2026</p>
          </div>
        </Card>

        {/* Edit Profile Modal */}
        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowEditProfileModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 backdrop-blur-md p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200/70 text-sm block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={userProfile.name}
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowEditProfileModal(false)}
                    variant="outline"
                    className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditProfile}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Change Email Modal */}
        {showChangeEmailModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowChangeEmailModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 backdrop-blur-md p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white mb-4">Change Email Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200/70 text-sm block mb-2">New Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder={userProfile.email}
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowChangeEmailModal(false)}
                    variant="outline"
                    className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangeEmail}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Email
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Change Phone Modal */}
        {showChangePhoneModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowChangePhoneModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 backdrop-blur-md p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white mb-4">Change Phone Number</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200/70 text-sm block mb-2">New Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder={userProfile.phone}
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowChangePhoneModal(false)}
                    variant="outline"
                    className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePhone}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Phone
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowChangePasswordModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 backdrop-blur-md p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200/70 text-sm block mb-2">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200/70 text-sm block mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200/70 text-sm block mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowChangePasswordModal(false)}
                    variant="outline"
                    className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
