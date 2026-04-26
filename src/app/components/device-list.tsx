import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Shield, 
  Thermometer, 
  Activity, 
  Lightbulb, 
  Lock, 
  Bell, 
  LogOut, 
  Plus,
  DoorOpen,
  Flame,
  Home,
  ChevronRight,
  ArrowLeft
} from "lucide-react";

export interface Device {
  id: string;
  name: string;
  type: "temperature" | "motion" | "light" | "door" | "garage" | "smoke" | "siren" | string;
  status: "online" | "offline";
  enabled: boolean;
  batteryLevel?: number;
  value?: string | number;
  lastAccessed?: number;
}

interface DeviceListProps {
  onNavigateToDashboard: () => void;
  onAddDevice: () => void;
  onDeviceClick: (device: Device) => void;
  onLogout: () => void;
  devices: Device[];
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

const deviceTypeNames = {
  temperature: "Temperature Sensor",
  motion: "Motion Detector",
  light: "Smart Light",
  door: "Smart Door",
  garage: "Smart Garage Door",
  smoke: "Smoke Detector",
  siren: "Siren Actuator"
};

export function DeviceList({ onNavigateToDashboard, onAddDevice, onDeviceClick, onLogout, devices }: DeviceListProps) {
  const getDeviceIcon = (type: string) => {
    return deviceIcons[type as keyof typeof deviceIcons] || { icon: Shield, color: "blue" };
  };

  const getDeviceTypeName = (type: string) => {
    return deviceTypeNames[type as keyof typeof deviceTypeNames] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white">Smart Home Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNavigateToDashboard}
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              <Home className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onNavigateToDashboard}
            className="text-blue-200 hover:text-white hover:bg-white/10 mb-4 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-white mb-2">Device Management</h1>
          <p className="text-blue-200/70">Manage and configure your smart home devices</p>
        </div>

        {/* Add Device Button */}
        <Button
          onClick={onAddDevice}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 mb-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Device
        </Button>

        {/* Device Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-blue-200/70">{devices.length} device{devices.length !== 1 ? 's' : ''} connected</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              {devices.filter(d => d.status === "online").length} Online
            </Badge>
            {devices.filter(d => d.status === "offline").length > 0 && (
              <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                {devices.filter(d => d.status === "offline").length} Offline
              </Badge>
            )}
          </div>
        </div>

        {/* Device List */}
        <div className="space-y-3">
          {devices.length === 0 ? (
            <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-white mb-2">No devices added yet</p>
              <p className="text-blue-200/70 text-sm mb-4">
                Start by adding your first smart home device
              </p>
              <Button
                onClick={onAddDevice}
                variant="outline"
                className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </Card>
          ) : (
            devices.map((device) => {
              const { icon: Icon, color } = getDeviceIcon(device.type);
              const colorClasses = {
                orange: "bg-orange-500/20 text-orange-400",
                blue: "bg-blue-500/20 text-blue-400",
                yellow: "bg-yellow-500/20 text-yellow-400",
                purple: "bg-purple-500/20 text-purple-400",
                indigo: "bg-indigo-500/20 text-indigo-400",
                red: "bg-red-500/20 text-red-400",
              }[color];

              return (
                <Card
                  key={device.id}
                  className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-4 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => onDeviceClick(device)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white">{device.name}</p>
                        {device.status === "online" ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-blue-200/70">{getDeviceTypeName(device.type)}</p>
                        {device.batteryLevel !== undefined && (
                          <span className="text-xs text-blue-200/50">• {device.batteryLevel}%</span>
                        )}
                      </div>
                      {device.value !== undefined && (
                        <p className="text-sm text-blue-100 mt-1">{device.value}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {!device.enabled && (
                        <Badge variant="outline" className="border-blue-400/30 text-blue-300 bg-blue-500/10">
                          Disabled
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-blue-400/50" />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}