import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Cloud, Download, Filter, Search, Calendar, AlertCircle, CheckCircle, Info, Activity } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface CloudLogsProps {
  onNavigateBack: () => void;
  connectionMode: "internet" | "intranet";
}

export function CloudLogs({ onNavigateBack, connectionMode }: CloudLogsProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "info" | "warning" | "critical" | "success">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadLogs();
    const subscription = supabase
      .channel("logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "logs" }, (payload) => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const loadLogs = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("log_timestamp", { ascending: false });
    if (!error && data) setLogs(data);
    setLoading(false);
  };

  const getTypeIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "success": return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 border-red-500/30";
      case "warning": return "bg-yellow-500/10 border-yellow-500/30";
      case "success": return "bg-emerald-500/10 border-emerald-500/30";
      default: return "bg-blue-500/10 border-blue-500/30";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };
  };

  const handleExport = () => {
    const csv = filteredLogs.map(log =>
      `${log.log_timestamp},${log.severity},${log.event_type},${log.source_type}`
    ).join("\n");
    const blob = new Blob([`Timestamp,Severity,Event,Source\n${csv}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cloud-logs.csv";
    a.click();
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = selectedFilter === "all" || log.severity === selectedFilter;
    const matchesSearch = searchQuery === "" ||
      (log.event_type && log.event_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.source_type && log.source_type.toLowerCase().includes(searchQuery.toLowerCase()));
    const logDate = new Date(log.log_timestamp);
    const matchesFrom = dateFrom === "" || logDate >= new Date(dateFrom);
    const matchesTo = dateTo === "" || logDate <= new Date(dateTo + "T23:59:59");
    return matchesFilter && matchesSearch && matchesFrom && matchesTo;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onNavigateBack}
            className="text-blue-200 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-white mb-1">Cloud Logs</h1>
            <p className="text-blue-200/70 text-sm">View synced activity logs</p>
          </div>
          <Button variant="outline" size="sm"
            className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white"
            onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {connectionMode === "internet" ? (
          <Card className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-emerald-500/30 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cloud Sync Active
                </p>
                <p className="text-emerald-200/70 text-xs mt-1">All logs are being synced to cloud storage</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-100">Intranet Mode Active</p>
                <p className="text-yellow-200/70 text-xs mt-1">Cloud sync unavailable. Switch to internet mode to sync logs.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center gap-3 mb-4">
          <Button variant="outline" size="sm"
            onClick={() => { setShowFilterModal(!showFilterModal); setShowDatePicker(false); }}
            className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => { setShowDatePicker(!showDatePicker); setShowFilterModal(false); }}
            className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/50" />
            <input type="text" placeholder="Search logs..."
              className="w-full bg-white/5 border border-blue-400/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {showFilterModal && (
          <Card className="bg-white/10 border-blue-400/30 p-4 mb-4">
            <p className="text-white mb-3">Filter by Type</p>
            <div className="grid grid-cols-5 gap-2">
              {["all", "info", "success", "warning", "critical"].map((f) => (
                <button key={f}
                  onClick={() => setSelectedFilter(f as any)}
                  className={`p-2 rounded-lg border transition-all text-sm capitalize ${
                    selectedFilter === f
                      ? "bg-blue-600/30 border-blue-400/50 text-blue-100"
                      : "bg-white/5 border-blue-400/20 text-blue-200/70"
                  } hover:bg-white/10`}>
                  {f}
                </button>
              ))}
            </div>
          </Card>
        )}

        {showDatePicker && (
          <Card className="bg-white/10 border-blue-400/30 p-4 mb-4">
            <p className="text-white mb-3">Select Date Range</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-blue-200/70 text-sm mb-1 block">From</label>
                <input type="date"
                  className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-blue-200/70 text-sm mb-1 block">To</label>
                <input type="date"
                  className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={() => setShowDatePicker(false)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white">
                Apply
              </Button>
              <Button onClick={() => { setDateFrom(""); setDateTo(""); setShowDatePicker(false); }}
                variant="outline"
                className="flex-1 bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10">
                Clear
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="bg-white/5 border-blue-400/20 p-3 text-center">
            <p className="text-white text-2xl mb-1">{filteredLogs.length}</p>
            <p className="text-blue-200/70 text-xs">Total</p>
          </Card>
          <Card className="bg-white/5 border-emerald-400/20 p-3 text-center">
            <p className="text-emerald-400 text-2xl mb-1">{filteredLogs.filter(l => l.severity === "success").length}</p>
            <p className="text-blue-200/70 text-xs">Success</p>
          </Card>
          <Card className="bg-white/5 border-yellow-400/20 p-3 text-center">
            <p className="text-yellow-400 text-2xl mb-1">{filteredLogs.filter(l => l.severity === "warning").length}</p>
            <p className="text-blue-200/70 text-xs">Warnings</p>
          </Card>
          <Card className="bg-white/5 border-red-400/20 p-3 text-center">
            <p className="text-red-400 text-2xl mb-1">{filteredLogs.filter(l => l.severity === "critical").length}</p>
            <p className="text-blue-200/70 text-xs">Critical</p>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-200/70">Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="bg-white/5 border-blue-400/20 p-12 text-center">
            <Activity className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
            <p className="text-white mb-2">No logs yet</p>
            <p className="text-blue-200/70 text-sm">Logs will appear here as your devices send data.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const timestamp = formatTimestamp(log.log_timestamp);
              return (
                <Card key={log.log_id}
                  className={`border backdrop-blur-sm p-4 ${getTypeColor(log.severity)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getTypeIcon(log.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-white">{log.event_type}</p>
                          {log.source_type && <p className="text-blue-200/70 text-sm">{log.source_type}</p>}
                        </div>
                        {connectionMode === "internet" && (
                          <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded">
                            <Cloud className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400">Synced</span>
                          </div>
                        )}
                      </div>
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
        )}
      </div>
    </div>
  );
}