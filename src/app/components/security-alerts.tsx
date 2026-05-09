import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Shield, LogOut, ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
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

interface AIAlert {
  device_id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: string;
  advice: string;
  category: string;
  subcategory: string;
}

interface SecurityAlertsProps {
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export function SecurityAlerts({ onNavigateToDashboard, onLogout }: SecurityAlertsProps) {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<AIAlert | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-ai-alerts");
      if (!error && data?.alerts) {
        setAlerts(data.alerts);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
  };

  const handleDeleteClick = (alert: AIAlert) => {
    setAlertToDelete(alert);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (alertToDelete) {
      setAlerts(prev => prev.filter(a =>
        !(a.device_id === alertToDelete.device_id && a.timestamp === alertToDelete.timestamp)
      ));
    }
    setShowDeleteDialog(false);
    setAlertToDelete(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "border-l-red-500/50 bg-red-500/5";
      case "medium": return "border-l-yellow-500/50 bg-yellow-500/5";
      case "low": return "border-l-blue-500/50 bg-blue-500/5";
      default: return "border-l-red-500/50 bg-red-500/5";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "text-red-400 bg-red-500/10";
      case "medium": return "text-yellow-400 bg-yellow-500/10";
      case "low": return "text-blue-400 bg-blue-500/10";
      default: return "text-red-400 bg-red-500/10";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onNavigateToDashboard}
            className="text-blue-200 hover:text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh}
              className={`text-blue-200 hover:text-white hover:bg-white/10 ${refreshing ? "animate-spin" : ""}`}>
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}
              className="text-blue-200 hover:text-white hover:bg-white/10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-white mb-2">Security Alerts</h1>
          <p className="text-blue-200/70">AI-powered threat detection for your smart home</p>
          {lastUpdated && (
            <p className="text-blue-200/40 text-xs mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 10 seconds
            </p>
          )}
        </div>

        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-blue-200/70">High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-blue-200/70">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-blue-200/70">Low Severity</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-200/70">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="bg-white/5 border-blue-400/20 p-12 text-center">
            <Shield className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
            <p className="text-white mb-2">No threats detected</p>
            <p className="text-blue-200/70 text-sm">Your smart home network appears secure. Alerts will appear here when the AI model detects an attack.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Card key={`${alert.device_id}-${alert.timestamp}-${index}`}
                className={`backdrop-blur-sm p-5 border-l-4 border-t border-r border-b border-blue-400/20 transition-all hover:bg-white/10 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.severity.toLowerCase() === "high" ? "bg-red-500/20" :
                    alert.severity.toLowerCase() === "medium" ? "bg-yellow-500/20" :
                    "bg-blue-500/20"
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity.toLowerCase() === "high" ? "text-red-400" :
                      alert.severity.toLowerCase() === "medium" ? "text-yellow-400" :
                      "text-blue-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{alert.title}</p>
                        <p className="text-blue-200/70 text-sm mb-2">{alert.message}</p>
                        <div className="p-3 rounded-lg bg-white/5 border border-blue-400/10 mb-2">
                          <p className="text-xs text-blue-200/50 mb-1">💡 Recommended Action:</p>
                          <p className="text-sm text-blue-100">{alert.advice}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity} Severity
                          </span>
                          <span className="text-xs text-blue-200/40 bg-blue-500/10 px-2 py-0.5 rounded">
                            {alert.category}
                          </span>
                          {alert.subcategory && (
                            <span className="text-xs text-blue-200/40 bg-blue-500/10 px-2 py-0.5 rounded">
                              {alert.subcategory}
                            </span>
                          )}
                          <span className="text-xs text-blue-200/40">
                            Device: {alert.device_id}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <time className="text-xs text-blue-200/50 whitespace-nowrap">
                          {formatTime(alert.timestamp)}
                        </time>
                        <Button variant="ghost" size="icon"
                          onClick={() => handleDeleteClick(alert)}
                          className="text-blue-200/50 hover:text-red-400 hover:bg-red-500/10 w-8 h-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-blue-200/50 text-sm">
            Powered by AI threat detection • All network traffic is monitored for anomalies
          </p>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#1a2f4f] border-2 border-red-400/40 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center ring-4 ring-red-500/10">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <AlertDialogTitle className="text-white text-center text-xl">
              Dismiss Alert?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200/70 text-center">
              Are you sure you want to dismiss this security alert? This will only hide it from your view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-6 px-6 pb-6">
            <AlertDialogAction onClick={handleDeleteConfirm}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-0">
              <Trash2 className="w-4 h-4 mr-2" />
              Yes, Dismiss Alert
            </AlertDialogAction>
            <AlertDialogCancel className="w-full bg-white/5 border-blue-400/30 text-blue-100 hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}