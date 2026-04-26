import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { ArrowLeft, Thermometer, Battery, BatteryMedium, Shield, Trash2, Info } from "lucide-react";

interface DeviceSettingsProps {
  onNavigateBack: () => void;
}

export function DeviceSettings({ onNavigateBack }: DeviceSettingsProps) {
  const [deviceEnabled, setDeviceEnabled] = useState(true);
  const [batteryLevel] = useState(87);

  const handleRemoveDevice = () => {
    if (window.confirm("Are you sure you want to remove this device? This action cannot be undone.")) {
      console.log("Device removed");
      onNavigateBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={onNavigateBack}
          className="text-blue-200 hover:text-white hover:bg-white/10 gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Thermometer className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-white mb-1">Temperature Sensor</h1>
              <p className="text-blue-200/70">Device Settings & Information</p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mb-6">
          <h2 className="text-white mb-4">Device Status</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
            <div className="space-y-4">
              {/* Device ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Device ID</p>
                    <p className="text-white">ID: 001</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-blue-400/20" />

              {/* Battery Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <BatteryMedium className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Battery Level</p>
                    <p className="text-white">{batteryLevel}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                      style={{ width: `${batteryLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <Separator className="bg-blue-400/20" />

              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Gateway Connection</p>
                    <p className="text-white">Connected to Local Gateway</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  Online
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Section */}
        <div className="mb-6">
          <h2 className="text-white mb-4">Security</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
            <div className="space-y-4">
              {/* Last Key Rotation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Last Key Rotation</p>
                    <p className="text-white">November 20, 2025</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-blue-400/20" />

              {/* Encryption Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Encryption</p>
                    <p className="text-white">AES-128 Enabled</p>
                  </div>
                </div>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                  Active
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Control Section */}
        <div className="mb-8">
          <h2 className="text-white mb-4">Device Controls</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white mb-1">Enable Sensor</p>
                <p className="text-sm text-blue-200/70">
                  {deviceEnabled ? "Sensor is currently active and collecting data" : "Sensor is currently disabled"}
                </p>
              </div>
              <Switch
                checked={deviceEnabled}
                onCheckedChange={setDeviceEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </Card>
        </div>

        {/* Remove Device Button */}
        <Card className="bg-white/5 border-red-400/20 backdrop-blur-sm p-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-white mb-1">Danger Zone</p>
                <p className="text-sm text-blue-200/70 mb-4">
                  Removing this device will permanently delete all associated data and disconnect it from your system.
                </p>
                <Button
                  onClick={handleRemoveDevice}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Device
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}