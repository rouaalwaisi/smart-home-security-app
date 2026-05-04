import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ArrowLeft, Thermometer, Activity, Lightbulb,
  DoorOpen, Flame, Home, Bell, Check, Plus
} from "lucide-react";

interface AddDeviceProps {
  onNavigateBack: () => void;
  onAddDevice: (deviceType: string, deviceName: string, hardwareId: string) => void;
}

const deviceTypes = [
  { type: "temperature", name: "Temperature Sensor", icon: Thermometer, color: "orange" },
  { type: "motion", name: "Motion Detector", icon: Activity, color: "blue" },
  { type: "light", name: "Smart Light", icon: Lightbulb, color: "yellow" },
  { type: "door", name: "Smart Door", icon: DoorOpen, color: "purple" },
  { type: "garage", name: "Smart Garage Door", icon: Home, color: "indigo" },
  { type: "smoke", name: "Smoke Detector", icon: Flame, color: "red" },
  { type: "siren", name: "Siren Actuator", icon: Bell, color: "red" }
];

export function AddDevice({ onNavigateBack, onAddDevice }: AddDeviceProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [hardwareId, setHardwareId] = useState("");
  const [customDeviceType, setCustomDeviceType] = useState("");
  const [step, setStep] = useState<"select" | "configure">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    if (type === "custom") {
      setDeviceName("");
      setCustomDeviceType("");
    } else {
      const defaultName = deviceTypes.find(d => d.type === type)?.name || "";
      setDeviceName(defaultName);
    }
    setStep("configure");
  };

  const handleAddDevice = async () => {
    setError("");
    if (!selectedType || !deviceName.trim()) {
      setError("Please enter a device name");
      return;
    }
    if (!hardwareId.trim()) {
      setError("Please enter the hardware device ID (e.g., esp01)");
      return;
    }
    if (selectedType === "custom" && !customDeviceType.trim()) {
      setError("Please enter the device type");
      return;
    }
    setLoading(true);
    if (selectedType === "custom") {
      await onAddDevice(customDeviceType.trim(), deviceName, hardwareId.trim());
    } else {
      await onAddDevice(selectedType, deviceName, hardwareId.trim());
    }
    setLoading(false);
  };

  const colorMap: Record<string, string> = {
    orange: "bg-orange-500/20 text-orange-400",
    blue: "bg-blue-500/20 text-blue-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400",
    indigo: "bg-indigo-500/20 text-indigo-400",
    red: "bg-red-500/20 text-red-400",
  };

  const colorHoverMap: Record<string, string> = {
    orange: "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
    blue: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
    purple: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
    indigo: "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30",
    red: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost"
          onClick={() => { if (step === "configure") { setStep("select"); setSelectedType(null); } else { onNavigateBack(); } }}
          className="text-blue-200 hover:text-white hover:bg-white/10 gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-white mb-2">{step === "select" ? "Add New Device" : "Configure Device"}</h1>
          <p className="text-blue-200/70">{step === "select" ? "Select the type of device you want to add" : "Enter device details and configuration"}</p>
        </div>

        {step === "select" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deviceTypes.map((device) => {
              const Icon = device.icon;
              return (
                <Card key={device.type}
                  className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => handleSelectType(device.type)}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${colorHoverMap[device.color]}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <p className="text-white">{device.name}</p>
                  </div>
                </Card>
              );
            })}
            <Card key="custom"
              className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => handleSelectType("custom")}>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">
                  <Plus className="w-8 h-8" />
                </div>
                <p className="text-white">Custom Device</p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedType !== "custom" && (() => {
              const device = deviceTypes.find(d => d.type === selectedType);
              if (!device) return null;
              const Icon = device.icon;
              return (
                <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorMap[device.color]}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200/70">Adding</p>
                      <p className="text-white">{device.name}</p>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {selectedType === "custom" && (
              <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-500/20 text-gray-400">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Adding</p>
                    <p className="text-white">Custom Device</p>
                  </div>
                </div>
              </Card>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
              <div className="space-y-4">
                {selectedType === "custom" && (
                  <div>
                    <Label htmlFor="customDeviceType" className="text-blue-100">Device Type</Label>
                    <Input id="customDeviceType" type="text"
                      placeholder="e.g., Smart Fan, Water Sensor"
                      value={customDeviceType}
                      onChange={(e) => setCustomDeviceType(e.target.value)}
                      className="mt-2 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50" />
                  </div>
                )}
                <div>
                  <Label htmlFor="deviceName" className="text-blue-100">Device Name</Label>
                  <Input id="deviceName" type="text" placeholder="Enter device name"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="mt-2 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50" />
                  <p className="text-xs text-blue-200/50 mt-1">Give your device a unique name for easy identification</p>
                </div>
                <div>
                  <Label htmlFor="hardwareId" className="text-blue-100">Hardware Device ID</Label>
                  <Input id="hardwareId" type="text" placeholder="e.g., esp01, esp02, sensor01"
                    value={hardwareId}
                    onChange={(e) => setHardwareId(e.target.value)}
                    className="mt-2 bg-white/5 border-blue-400/20 text-white placeholder:text-blue-300/30 focus:border-blue-400/50" />
                  <p className="text-xs text-blue-200/50 mt-1">The unique ID of your physical IoT device (e.g., esp01, sensor01)</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
              <div className="space-y-3">
                <p className="text-white">Security Configuration</p>
                <div className="space-y-2 text-sm text-blue-200/70">
                  {["Local gateway encrypted with AES-128", "Automatic key rotation on intranet network", "Direct device-to-gateway communication", "No internet required for operation"].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Button onClick={handleAddDevice}
              disabled={loading || !deviceName.trim() || !hardwareId.trim() || (selectedType === "custom" && !customDeviceType.trim())}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
              <Check className="w-5 h-5 mr-2" />
              {loading ? "Adding..." : "Add Device"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}