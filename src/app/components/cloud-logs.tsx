import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Cloud, Download, Filter, Search, Calendar, AlertCircle, CheckCircle, Info, Activity } from "lucide-react";

interface CloudLogsProps {
  onNavigateBack: () => void;
  connectionMode: "internet" | "intranet";
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "critical" | "success";
  event: string;
  device?: string;
  details: string;
  synced: boolean;
}

export function CloudLogs({ onNavigateBack, connectionMode }: CloudLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      timestamp: "2026-01-01T10:45:23Z",
      type: "success",
      event: "Device Sync",
      device: "Temperature Sensor",
      details: "Successfully synced device data to cloud storage",
      synced: true
    },
    {
      id: "2",
      timestamp: "2026-01-01T10:30:15Z",
      type: "info",
      event: "Configuration Update",
      device: "Motion Detector",
      details: "Device configuration backed up to cloud",
      synced: true
    },
    {
      id: "3",
      timestamp: "2026-01-01T10:15:08Z",
      type: "warning",
      event: "Battery Alert",
      device: "Smart Door Lock",
      details: "Low battery warning logged and synced",
      synced: true
    },
    {
      id: "4",
      timestamp: "2026-01-01T09:55:42Z",
      type: "critical",
      event: "Security Event",
      device: "Motion Detector",
      details: "Unauthorized motion detected, event logged to cloud",
      synced: true
    },
    {
      id: "5",
      timestamp: "2026-01-01T09:30:01Z",
      type: "info",
      event: "System Backup",
      details: "Complete system configuration backed up to cloud",
      synced: true
    },
    {
      id: "6",
      timestamp: "2026-01-01T09:15:33Z",
      type: "success",
      event: "User Login",
      details: "Successful authentication logged to cloud",
      synced: true
    },
    {
      id: "7",
      timestamp: "2026-01-01T08:45:19Z",
      type: "info",
      event: "Device Added",
      device: "Smoke Detector",
      details: "New device registration synced to cloud",
      synced: true
    },
    {
      id: "8",
      timestamp: "2026-01-01T08:20:55Z",
      type: "warning",
      event: "Connection Mode Change",
      details: "Network mode switched from adhoc to internet",
      synced: true
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "info" | "warning" | "critical" | "success">("all");
  const [showExportModal, setShowExportModal] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-500/10 border-red-500/30";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30";
      default:
        return "bg-blue-500/10 border-blue-500/30";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const handleExport = () => {
    setShowExportModal(true);
    // Simulate export
    setTimeout(() => {
      alert(`Exporting ${filteredLogs.length} log entries to CSV file...`);
      setShowExportModal(false);
    }, 1000);
  };

  const handleLoadMore = () => {
    // Simulate loading more logs
    const newLogs: LogEntry[] = [
      {
        id: `${Date.now()}-1`,
        timestamp: "2026-01-01T08:00:00Z",
        type: "info",
        event: "System Start",
        details: "Smart home system initialized successfully",
        synced: true
      },
      {
        id: `${Date.now()}-2`,
        timestamp: "2026-01-01T07:45:00Z",
        type: "success",
        event: "Network Connected",
        details: "Successfully connected to local gateway",
        synced: true
      }
    ];
    setLogs([...logs, ...newLogs]);
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = selectedFilter === "all" || log.type === selectedFilter;
    const matchesSearch = searchQuery === "" || 
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.device && log.device.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

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
          <div className="flex-1">
            <h1 className="text-white mb-1">Cloud Logs</h1>
            <p className="text-blue-200/70 text-sm">View synced activity logs</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Connection Status Banner */}
        {connectionMode === "internet" ? (
          <Card className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-emerald-500/30 p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-emerald-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cloud Sync Active
                </p>
                <p className="text-emerald-200/70 text-xs mt-1">
                  All logs are being synced to cloud storage
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30 p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-yellow-100 flex items-center gap-2">
                  Intranet Mode Active
                </p>
                <p className="text-yellow-200/70 text-xs mt-1">
                  Cloud sync unavailable. Switch to internet mode to sync logs.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterModal(!showFilterModal)}
            className={`border ${
              showFilterModal 
                ? "bg-blue-600/20 border-blue-400/50 text-blue-100" 
                : "bg-white/5 border-blue-400/20 text-blue-100"
            } hover:bg-white/10 hover:text-white`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`border ${
              showDatePicker 
                ? "bg-blue-600/20 border-blue-400/50 text-blue-100" 
                : "bg-white/5 border-blue-400/20 text-blue-100"
            } hover:bg-white/10 hover:text-white`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/50" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full bg-white/5 border border-blue-400/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <Card className="bg-white/10 border-blue-400/30 backdrop-blur-md p-4 mb-6">
            <p className="text-white mb-3">Filter by Type</p>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`p-2 rounded-lg border transition-all ${
                  selectedFilter === "all"
                    ? "bg-blue-600/30 border-blue-400/50 text-blue-100"
                    : "bg-white/5 border-blue-400/20 text-blue-200/70"
                } hover:bg-white/10`}
              >
                <span className="text-sm">All</span>
              </button>
              <button
                onClick={() => setSelectedFilter("info")}
                className={`p-2 rounded-lg border transition-all ${
                  selectedFilter === "info"
                    ? "bg-blue-600/30 border-blue-400/50 text-blue-100"
                    : "bg-white/5 border-blue-400/20 text-blue-200/70"
                } hover:bg-white/10`}
              >
                <span className="text-sm">Info</span>
              </button>
              <button
                onClick={() => setSelectedFilter("success")}
                className={`p-2 rounded-lg border transition-all ${
                  selectedFilter === "success"
                    ? "bg-emerald-600/30 border-emerald-400/50 text-emerald-100"
                    : "bg-white/5 border-blue-400/20 text-blue-200/70"
                } hover:bg-white/10`}
              >
                <span className="text-sm">Success</span>
              </button>
              <button
                onClick={() => setSelectedFilter("warning")}
                className={`p-2 rounded-lg border transition-all ${
                  selectedFilter === "warning"
                    ? "bg-yellow-600/30 border-yellow-400/50 text-yellow-100"
                    : "bg-white/5 border-blue-400/20 text-blue-200/70"
                } hover:bg-white/10`}
              >
                <span className="text-sm">Warning</span>
              </button>
              <button
                onClick={() => setSelectedFilter("critical")}
                className={`p-2 rounded-lg border transition-all ${
                  selectedFilter === "critical"
                    ? "bg-red-600/30 border-red-400/50 text-red-100"
                    : "bg-white/5 border-blue-400/20 text-blue-200/70"
                } hover:bg-white/10`}
              >
                <span className="text-sm">Critical</span>
              </button>
            </div>
          </Card>
        )}

        {/* Date Picker Modal */}
        {showDatePicker && (
          <Card className="bg-white/10 border-blue-400/30 backdrop-blur-md p-4 mb-6">
            <p className="text-white mb-3">Select Date Range</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-blue-200/70 text-sm mb-1 block">From</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  defaultValue="2026-01-01"
                />
              </div>
              <div>
                <label className="text-blue-200/70 text-sm mb-1 block">To</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  defaultValue="2026-01-01"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                alert("Date range filter applied!");
                setShowDatePicker(false);
              }}
              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
            >
              Apply Date Filter
            </Button>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="bg-white/5 border-blue-400/20 p-3">
            <div className="text-center">
              <p className="text-white text-2xl mb-1">{filteredLogs.length}</p>
              <p className="text-blue-200/70 text-xs">Total Logs</p>
            </div>
          </Card>
          <Card className="bg-white/5 border-emerald-400/20 p-3">
            <div className="text-center">
              <p className="text-emerald-400 text-2xl mb-1">{filteredLogs.filter(l => l.type === "success").length}</p>
              <p className="text-blue-200/70 text-xs">Success</p>
            </div>
          </Card>
          <Card className="bg-white/5 border-yellow-400/20 p-3">
            <div className="text-center">
              <p className="text-yellow-400 text-2xl mb-1">{filteredLogs.filter(l => l.type === "warning").length}</p>
              <p className="text-blue-200/70 text-xs">Warnings</p>
            </div>
          </Card>
          <Card className="bg-white/5 border-red-400/20 p-3">
            <div className="text-center">
              <p className="text-red-400 text-2xl mb-1">{filteredLogs.filter(l => l.type === "critical").length}</p>
              <p className="text-blue-200/70 text-xs">Critical</p>
            </div>
          </Card>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const timestamp = formatTimestamp(log.timestamp);
            return (
              <Card
                key={log.id}
                className={`border backdrop-blur-sm p-4 ${getTypeColor(log.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-white">{log.event}</p>
                        {log.device && (
                          <p className="text-blue-200/70 text-sm">{log.device}</p>
                        )}
                      </div>
                      {log.synced && connectionMode === "internet" && (
                        <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded">
                          <Cloud className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">Synced</span>
                        </div>
                      )}
                    </div>
                    <p className="text-blue-200/60 text-sm mb-2">{log.details}</p>
                    <div className="flex items-center gap-3 text-xs text-blue-200/40">
                      <span>{timestamp.date}</span>
                      <span>•</span>
                      <span>{timestamp.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white"
            onClick={handleLoadMore}
          >
            <Activity className="w-4 h-4 mr-2" />
            Load More Logs
          </Button>
        </div>
      </div>
    </div>
  );
}