import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { 
  ArrowLeft, 
  Thermometer, 
  Activity,
  Lightbulb,
  DoorOpen,
  Flame,
  Home,
  Bell,
  Battery,
  BatteryMedium,
  Shield, 
  Trash2, 
  Info,
  AlertTriangle
} from "lucide-react";
import { Device } from "./device-list";

interface DeviceConfigProps {
  device: Device;
  onNavigateBack: () => void;
  onUpdateDevice: (device: Device) => void;
  onRemoveDevice: (deviceId: string) => void;
}

const deviceIcons = {
  temperature: { icon: Thermometer, color: "orange" },
  motion: { icon: Activity, color: "blue" },
  light: { icon: Lightbulb, color: "yellow" },
  door: { icon: DoorOpen, color: "purple" },
  garage: { icon: Home, color: "indigo" },
  smoke: { icon: Flame, color: "red" },
  siren: { icon: Bell, color: "red" }
};

export function DeviceConfig({ device, onNavigateBack, onUpdateDevice, onRemoveDevice }: DeviceConfigProps) {
  const [deviceEnabled, setDeviceEnabled] = useState(device.enabled);
  const [brightness, setBrightness] = useState(75);
  const [volume, setVolume] = useState(80);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getDeviceIcon = (type: string) => {
    return deviceIcons[type as keyof typeof deviceIcons] || { icon: Shield, color: "blue" };
  };

  const { icon: Icon, color } = getDeviceIcon(device.type);
  const colorClasses = {
    orange: "bg-orange-500/20 text-orange-400",
    blue: "bg-blue-500/20 text-blue-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400",
    indigo: "bg-indigo-500/20 text-indigo-400",
    red: "bg-red-500/20 text-red-400",
  }[color];

  const handleRemoveDevice = () => {
    onRemoveDevice(device.id);
    onNavigateBack();
  };

  const handleToggleDevice = (enabled: boolean) => {
    setDeviceEnabled(enabled);
    onUpdateDevice({ ...device, enabled });
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClasses}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white mb-1">{device.name}</h1>
              <p className="text-blue-200/70">Device Settings & Configuration</p>
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
                    <p className="text-white">{device.id}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-blue-400/20" />

              {/* Battery Level (if applicable) */}
              {device.batteryLevel !== undefined && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <BatteryMedium className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-200/70">Battery Level</p>
                        <p className="text-white">{device.batteryLevel}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                          style={{ width: `${device.batteryLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-blue-400/20" />
                </>
              )}

              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    device.status === "online" ? "bg-emerald-500/20" : "bg-red-500/20"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      device.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                    }`}></div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Gateway Connection</p>
                    <p className="text-white">{device.status === "online" ? "Connected to Local Gateway" : "Disconnected"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  device.status === "online" 
                    ? "text-emerald-400 bg-emerald-500/10" 
                    : "text-red-400 bg-red-500/10"
                }`}>
                  {device.status === "online" ? "Online" : "Offline"}
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

        {/* Device-Specific Controls */}
        <div className="mb-6">
          <h2 className="text-white mb-4">Device Controls</h2>
          
          {/* Enable/Disable Control */}
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white mb-1">Enable Device</p>
                <p className="text-sm text-blue-200/70">
                  {deviceEnabled ? "Device is currently active" : "Device is currently disabled"}
                </p>
              </div>
              <Switch
                checked={deviceEnabled}
                onCheckedChange={handleToggleDevice}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </Card>

          {/* Light-specific controls */}
          {device.type === "light" && (
            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6 mb-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white">Brightness</p>
                    <span className="text-blue-200/70">{brightness}%</span>
                  </div>
                  <Slider
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Siren-specific controls */}
          {device.type === "siren" && (
            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6 mb-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white">Volume</p>
                    <span className="text-blue-200/70">{volume}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Door/Garage controls */}
          {(device.type === "door" || device.type === "garage") && (
            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6 mb-4">
              <div className="space-y-3">
                <p className="text-white">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10">
                    Open
                  </Button>
                  <Button variant="outline" className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10">
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          )}
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
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Device
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-[#1a2f4f] border-2 border-red-400/40 shadow-2xl shadow-red-500/20 max-w-md">
            <AlertDialogHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center ring-4 ring-red-500/10">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <AlertDialogTitle className="text-white text-center text-xl">
                Remove Device?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-blue-200/70 text-center">
                Are you sure you want to remove{" "}
                <span className="text-white font-semibold">{device.name}</span>?
                <br />
                <br />
                This action cannot be undone and will permanently delete all associated data and disconnect the device from your local network.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-6">
              <AlertDialogAction
                onClick={handleRemoveDevice}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-0 shadow-lg shadow-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Remove Device
              </AlertDialogAction>
              <AlertDialogCancel className="w-full bg-white/5 border-blue-400/30 text-blue-100 hover:bg-white/10 hover:text-white">
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}