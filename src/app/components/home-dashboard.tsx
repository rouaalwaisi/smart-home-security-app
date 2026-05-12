import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, Thermometer, Activity, Lightbulb, Lock, Bell, LogOut, Settings, Info, DoorOpen, Flame, Home as HomeIcon, BatteryMedium, Wifi, Globe, Zap } from "lucide-react";
import { Device } from "./device-list";
import { supabase } from "../../lib/supabase";

const deviceIcons = {
  temperature: { icon: Thermometer, color: "orange" },
  motion: { icon: Activity, color: "blue" },
  light: { icon: Lightbulb, color: "yellow" },
  door: { icon: DoorOpen, color: "purple" },
  garage: { icon: HomeIcon, color: "indigo" },
  smoke: { icon: Flame, color: "red" },
  siren: { icon: Bell, color: "orange" },
};

interface HomeDashboardProps {
  onNavigateToAlerts: () => void;
  onNavigateToDevice: () => void;
  onNavigateToDeviceList: () => void;
  onNavigateToNetworkInfo: () => void;
  onNavigateToCloudLogs: () => void;
  onNavigateToSettings: () => void;
  onNavigateToAutomationRules: () => void;
  onLogout: () => void;
  devices: Device[];
  onDeviceClick: (device: Device) => void;
  connectionMode: "internet" | "intranet";
  onConnectionModeChange: (mode: "internet" | "intranet") => void;
}

export function HomeDashboard({
  onNavigateToAlerts,
  onNavigateToDevice,
  onNavigateToDeviceList,
  onNavigateToNetworkInfo,
  onNavigateToCloudLogs,
  onNavigateToSettings,
  onNavigateToAutomationRules,
  onLogout,
  devices,
  onDeviceClick,
  connectionMode,
  onConnectionModeChange
}: HomeDashboardProps) {
  const [showNetworkModal, setShowNetworkModal] = React.useState(false);
  const [liveTemperature, setLiveTemperature] = useState<string | null>(null);
  const [liveHumidity, setLiveHumidity] = useState<string | null>(null);
  const [tempLastUpdated, setTempLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchTemperature();
    const interval = setInterval(fetchTemperature, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTemperature = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-temperature");
      if (!error && data?.temperature) {
        setLiveTemperature(data.temperature);
        setLiveHumidity(data.humidity);
        setTempLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch temperature:", err);
    }
  };

  const recentDevices = [...devices]
    .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
    .slice(0, 2);

  const getDeviceIcon = (type: string) => {
    return deviceIcons[type as keyof typeof deviceIcons] || { icon: Shield, color: "blue" };
  };

  const renderDeviceCard = (device: Device) => {
    const { icon: Icon, color } = getDeviceIcon(device.type);
    const colorClasses = {
      orange: "bg-orange-500/20 text-orange-400",
      blue: "bg-blue-500/20 text-blue-400",
      yellow: "bg-yellow-500/20 text-yellow-400",
      purple: "bg-purple-500/20 text-purple-400",
      indigo: "bg-indigo-500/20 text-indigo-400",
      red: "bg-red-500/20 text-red-400",
    }[color];

    // Use live temperature for temperature devices
    const displayValue = device.type === "temperature" && liveTemperature
      ? liveTemperature
      : device.value?.toString();

    return (
      <Card key={device.id}
        className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6 cursor-pointer hover:bg-white/10 transition-all"
        onClick={() => onDeviceClick(device)}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            {device.status === "online" ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            )}
            <span className="text-xs text-blue-200/50 bg-blue-500/10 px-2 py-1 rounded">
              {device.status === "online" ? "Live" : "Offline"}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-blue-200/70">{device.name}</p>

          {device.type === "temperature" && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-5xl">
                  {liveTemperature || displayValue?.toString().replace('°C', '').replace('C', '') || '--'}
                </span>
                <span className="text-blue-200/50 text-2xl">°C</span>
              </div>
              {liveHumidity && (
                <p className="text-blue-200/50 text-sm">💧 Humidity: {liveHumidity}%</p>
              )}
              <div className="pt-2">
                <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                    style={{ width: `${Math.min((parseFloat(liveTemperature || displayValue || '0') / 50) * 100, 100)}%` }}>
                  </div>
                </div>
              </div>
              {tempLastUpdated && (
                <p className="text-xs text-blue-200/30">
                  Updated: {tempLastUpdated.toLocaleTimeString()}
                </p>
              )}
            </>
          )}

          {device.type === "motion" && (
            <div className="flex items-center gap-3">
              <span className="text-white text-4xl">{displayValue || "Clear"}</span>
              <div className={`w-3 h-3 rounded-full ${displayValue === "Active" ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></div>
            </div>
          )}

          {(device.type === "light" || device.type === "door" || device.type === "garage" || device.type === "smoke" || device.type === "siren") && (
            <div className="space-y-1">
              <span className="text-white text-3xl">{displayValue || "Unknown"}</span>
              {device.batteryLevel !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  <BatteryMedium className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-blue-200/70">{device.batteryLevel}%</span>
                </div>
              )}
            </div>
          )}

          {!["temperature", "motion", "light", "door", "garage", "smoke", "siren"].includes(device.type) && (
            <div className="space-y-1">
              <span className="text-white text-3xl">{displayValue || "Active"}</span>
              {device.batteryLevel !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  <BatteryMedium className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-blue-200/70">{device.batteryLevel}%</span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-blue-300/50 pt-2">Click to view settings</p>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white">Shaheen | شاهين</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"
              onClick={() => setShowNetworkModal(true)}
              className="text-blue-200 hover:text-white hover:bg-white/10 relative">
              {connectionMode === "internet" ? <Globe className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${
                connectionMode === "internet" ? "bg-blue-500" : "bg-emerald-500"
              } border-2 border-[#0a1628]`}></span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onNavigateToSettings}
              className="text-blue-200 hover:text-white hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNavigateToAlerts}
              className="text-blue-200 hover:text-white hover:bg-white/10">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}
              className="text-blue-200 hover:text-white hover:bg-white/10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Network Mode Modal */}
        {showNetworkModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowNetworkModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white">Connection Mode</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowNetworkModal(false)}
                  className="text-blue-200 hover:text-white hover:bg-white/10">
                  <span className="text-xl">×</span>
                </Button>
              </div>
              <div className="space-y-3 mb-6">
                <button onClick={() => { onConnectionModeChange("internet"); setShowNetworkModal(false); }}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    connectionMode === "internet"
                      ? "bg-blue-600/20 border-blue-400/50 shadow-lg shadow-blue-500/20"
                      : "bg-white/5 border-blue-400/20 hover:bg-white/10"
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${connectionMode === "internet" ? "bg-blue-500/20" : "bg-white/5"}`}>
                      <Globe className={`w-6 h-6 ${connectionMode === "internet" ? "text-blue-400" : "text-blue-200/50"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`${connectionMode === "internet" ? "text-blue-100" : "text-blue-200/70"} flex items-center gap-2`}>
                        Internet Mode
                        {connectionMode === "internet" && <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded">Active</span>}
                      </p>
                      <p className="text-blue-200/50 text-sm mt-1">Cloud sync enabled • Remote access available</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => { onConnectionModeChange("intranet"); setShowNetworkModal(false); }}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    connectionMode === "intranet"
                      ? "bg-emerald-600/20 border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 border-blue-400/20 hover:bg-white/10"
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${connectionMode === "intranet" ? "bg-emerald-500/20" : "bg-white/5"}`}>
                      <Wifi className={`w-6 h-6 ${connectionMode === "intranet" ? "text-emerald-400" : "text-blue-200/50"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`${connectionMode === "intranet" ? "text-emerald-100" : "text-blue-200/70"} flex items-center gap-2`}>
                        Intranet Mode
                        {connectionMode === "intranet" && <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>}
                      </p>
                      <p className="text-blue-200/50 text-sm mt-1">Local network only • No internet required</p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                <p className="text-blue-200/70 text-sm">
                  <strong className="text-blue-100">Current Mode:</strong> {connectionMode === "internet" ? "Internet" : "Intranet"}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Security Banner */}
        <div className={`mb-8 bg-gradient-to-r ${
            connectionMode === "internet"
              ? "from-emerald-600/20 to-blue-600/20 border-emerald-500/30"
              : "from-yellow-600/20 to-orange-600/20 border-yellow-500/30"
          } border rounded-lg p-4 backdrop-blur-sm cursor-pointer hover:opacity-90 transition-all`}
          onClick={onNavigateToNetworkInfo}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${connectionMode === "internet" ? "bg-emerald-500/20" : "bg-yellow-500/20"} flex items-center justify-center`}>
              {connectionMode === "internet"
                ? <Globe className="w-5 h-5 text-emerald-400" />
                : <Wifi className="w-5 h-5 text-yellow-400" />}
            </div>
            <div className="flex-1">
              <p className={`${connectionMode === "internet" ? "text-emerald-100" : "text-yellow-100"} flex items-center gap-2`}>
                <Lock className="w-4 h-4" />
                {connectionMode === "internet"
                  ? "Internet Connection: Active (End-to-End Encrypted)"
                  : "Intranet Network: Connected (Local Only - Encrypted)"}
              </p>
              <p className={`${connectionMode === "internet" ? "text-emerald-200/70" : "text-yellow-200/70"} text-xs mt-1`}>
                {connectionMode === "intranet"
                  ? "Local gateway active • No internet required"
                  : "Cloud sync enabled • Remote access available"}
              </p>
            </div>
            <Info className={`w-5 h-5 ${connectionMode === "internet" ? "text-emerald-300/50" : "text-yellow-300/50"}`} />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white mb-2">Home Dashboard</h1>
          <p className="text-blue-200/70">Monitor your smart home in real-time</p>
        </div>

        {/* Recently Accessed Devices */}
        {recentDevices.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white">Recently Accessed</h2>
              <Button variant="ghost" onClick={onNavigateToDeviceList}
                className="text-blue-300 hover:text-white hover:bg-white/10 text-sm">
                View All Devices
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {recentDevices.map(device => renderDeviceCard(device))}
            </div>
          </>
        ) : (
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-12 text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-white mb-2">No devices added yet</p>
            <p className="text-blue-200/70 text-sm mb-4">Start by adding your first smart home device</p>
            <Button onClick={onNavigateToDeviceList} variant="outline"
              className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Manage Devices
            </Button>
          </Card>
        )}

        {/* Quick Stats */}
        {devices.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-blue-200/70 text-sm">Total Devices</p>
                  <p className="text-white text-2xl">{devices.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-200/70 text-sm">Online</p>
                  <p className="text-white text-2xl">{devices.filter(d => d.status === "online").length}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Automation Rules Button */}
        <Button onClick={onNavigateToAutomationRules} variant="outline"
          className="w-full bg-purple-600/10 border border-purple-400/30 text-purple-100 hover:bg-purple-600/20 hover:text-white backdrop-blur-sm">
          <Zap className="w-4 h-4 mr-2" />
          Automation Rules
        </Button>
      </div>
    </div>
  );
}