import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft,
  Wifi,
  Shield,
  Lock,
  Server,
  Check,
  Activity,
  Globe,
  Cloud
} from "lucide-react";

interface NetworkInfoProps {
  onNavigateBack: () => void;
  connectionMode: "internet" | "intranet";
}

export function NetworkInfo({ onNavigateBack, connectionMode }: NetworkInfoProps) {
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
          <h1 className="text-white mb-2">Network Information</h1>
          <p className="text-blue-200/70 text-sm">
            {connectionMode === "internet" 
              ? "Internet connectivity and cloud sync status" 
              : "Intranet network configuration and status"}
          </p>
        </div>

        {/* Network Status */}
        <div className="mb-6">
          <h2 className="text-white mb-4">Network Status</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
            <div className="space-y-4">
              {/* Network Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${
                    connectionMode === "internet" ? "bg-blue-500/20" : "bg-yellow-500/20"
                  } flex items-center justify-center`}>
                    {connectionMode === "internet" ? (
                      <Globe className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Wifi className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Network Type</p>
                    <p className="text-white">
                      {connectionMode === "internet" ? "Internet Connection" : "Intranet Local Network"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Active
                </Badge>
              </div>

              <div className="h-px bg-blue-400/20"></div>

              {/* Gateway/Server Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    {connectionMode === "internet" ? (
                      <Cloud className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Server className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">
                      {connectionMode === "internet" ? "Cloud Server" : "Local Gateway"}
                    </p>
                    <p className="text-white">
                      {connectionMode === "internet" ? "cloud.smarthome.io" : "192.168.4.1"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs text-emerald-400">Connected</span>
                </div>
              </div>

              <div className="h-px bg-blue-400/20"></div>

              {/* Signal Strength / Connection Quality */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">
                      {connectionMode === "internet" ? "Connection Quality" : "Signal Strength"}
                    </p>
                    <p className="text-white">
                      {connectionMode === "internet" ? "Excellent (25ms latency)" : "Excellent (-45 dBm)"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-5 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-6 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Configuration */}
        <div className="mb-6">
          <h2 className="text-white mb-4">Security Configuration</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
            <div className="space-y-4">
              {/* Encryption */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Encryption Protocol</p>
                    <p className="text-white">AES-128-GCM</p>
                  </div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Enabled
                </Badge>
              </div>

              <div className="h-px bg-blue-400/20"></div>

              {/* Authentication */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70">Authentication</p>
                    <p className="text-white">Token-based (JWT)</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Active
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Architecture Overview */}
        <div className="mb-6">
          <h2 className="text-white mb-4">Network Architecture</h2>
          <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
            <div className="space-y-4">
              <p className="text-blue-200/70 text-sm">
                This mobile application operates on a local ad-hoc network, communicating directly with IoT devices through a secure local gateway.
              </p>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-400">1</span>
                  </div>
                  <div>
                    <p className="text-white">IoT Devices</p>
                    <p className="text-blue-200/50 text-xs">Sensors encrypt data locally</p>
                  </div>
                </div>
                
                <div className="ml-4 w-px h-6 bg-blue-400/20"></div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400">2</span>
                  </div>
                  <div>
                    <p className="text-white">Local Gateway</p>
                    <p className="text-blue-200/50 text-xs">Validates and routes encrypted data</p>
                  </div>
                </div>
                
                <div className="ml-4 w-px h-6 bg-blue-400/20"></div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="text-white">Mobile Application</p>
                    <p className="text-blue-200/50 text-xs">Secure monitoring and control interface</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Features */}
        <Card className="bg-white/5 border-blue-400/20 backdrop-blur-sm p-6">
          <h3 className="text-white mb-4">Key Features</h3>
          <div className="space-y-3 text-sm">
            {connectionMode === "intranet" ? (
              <>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">No Internet Required</span>
                    <p className="text-blue-200/50 text-xs">Operates entirely on local intranet network</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">End-to-End Encryption</span>
                    <p className="text-blue-200/50 text-xs">Data encrypted from device to application</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">Low Latency</span>
                    <p className="text-blue-200/50 text-xs">Direct communication reduces response time</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">Defense-in-Depth Security</span>
                    <p className="text-blue-200/50 text-xs">Multiple security layers at device, gateway, and app</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">Cloud Synchronization</span>
                    <p className="text-blue-200/50 text-xs">Real-time data sync across all devices</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">Remote Access</span>
                    <p className="text-blue-200/50 text-xs">Control your devices from anywhere in the world</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">TLS/SSL Encryption</span>
                    <p className="text-blue-200/50 text-xs">Secure communication with cloud infrastructure</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-blue-100">Cloud Backup</span>
                    <p className="text-blue-200/50 text-xs">Automatic backup of logs and device configurations</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}