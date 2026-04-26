import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Info, Shield, CheckCircle, XCircle, User, Home, LogOut, ArrowLeft } from "lucide-react";

interface LogEntry {
  id: string;
  type: "critical" | "status";
  message: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface SecurityAlertsProps {
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export function SecurityAlerts({ onNavigateToDashboard, onLogout }: SecurityAlertsProps) {
  const logs: LogEntry[] = [
    {
      id: "1",
      type: "critical",
      message: "Anomaly Detected, Device Blocked",
      timestamp: "2:34 PM",
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />
    },
    {
      id: "2",
      type: "status",
      message: "User logged in",
      timestamp: "2:15 PM",
      icon: <User className="w-5 h-5 text-blue-400" />
    },
    {
      id: "3",
      type: "critical",
      message: "Unauthorized Access Attempt Blocked",
      timestamp: "1:47 PM",
      icon: <XCircle className="w-5 h-5 text-red-400" />
    },
    {
      id: "4",
      type: "status",
      message: "System backup completed successfully",
      timestamp: "12:30 PM",
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />
    },
    {
      id: "5",
      type: "status",
      message: "Temperature sensor calibrated",
      timestamp: "11:22 AM",
      icon: <Info className="w-5 h-5 text-blue-400" />
    },
    {
      id: "6",
      type: "critical",
      message: "Multiple Failed Login Attempts Detected",
      timestamp: "10:58 AM",
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />
    },
    {
      id: "7",
      type: "status",
      message: "Smart light turned on",
      timestamp: "10:15 AM",
      icon: <Info className="w-5 h-5 text-blue-400" />
    },
    {
      id: "8",
      type: "status",
      message: "Motion sensor connected",
      timestamp: "9:30 AM",
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />
    },
    {
      id: "9",
      type: "critical",
      message: "Suspicious Network Activity Blocked",
      timestamp: "8:42 AM",
      icon: <Shield className="w-5 h-5 text-red-400" />
    },
    {
      id: "10",
      type: "status",
      message: "Daily security scan completed",
      timestamp: "8:00 AM",
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onNavigateToDashboard}
            className="text-blue-200 hover:text-white hover:bg-white/10 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white mb-2">System Activity and Alerts</h1>
          <p className="text-blue-200/70">Monitor all system events and security notifications</p>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-blue-200/70">Critical Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-blue-200/70">Status Updates</span>
          </div>
        </div>

        {/* Activity Log List */}
        <div className="space-y-3">
          {logs.map((log, index) => (
            <Card
              key={log.id}
              className={`bg-white/5 backdrop-blur-sm p-4 transition-all hover:bg-white/10 ${
                log.type === "critical"
                  ? "border-l-4 border-l-red-500/50 border-t border-r border-b border-blue-400/20"
                  : "border-blue-400/20"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    log.type === "critical"
                      ? "bg-red-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {log.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p
                        className={`${
                          log.type === "critical"
                            ? "text-red-100"
                            : "text-blue-100"
                        }`}
                      >
                        {log.message}
                      </p>
                      {log.type === "critical" && (
                        <span className="inline-block mt-1 text-xs text-red-400/70 bg-red-500/10 px-2 py-0.5 rounded">
                          Critical
                        </span>
                      )}
                    </div>
                    <time className="text-sm text-blue-200/50 whitespace-nowrap">
                      {log.timestamp}
                    </time>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-blue-200/50 text-sm">
            All activities are monitored locally and encrypted via the gateway.
          </p>
        </div>
      </div>
    </div>
  );
}