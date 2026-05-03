import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Info, Shield, CheckCircle, XCircle, User, LogOut, ArrowLeft, Trash2 } from "lucide-react";
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

interface SecurityAlertsProps {
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export function SecurityAlerts({ onNavigateToDashboard, onLogout }: SecurityAlertsProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<any | null>(null);

  useEffect(() => {
    loadAlerts();
    const subscription = supabase
      .channel("alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload) => {
        setAlerts(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const loadAlerts = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("creation_date", { ascending: false });
    if (!error && data) setAlerts(data);
    setLoading(false);
  };

  const handleDeleteClick = (alert: any) => {
    if (isCritical(alert.alert_status, alert.alert_message)) {
      setAlertToDelete(alert);
      setShowDeleteDialog(true);
    } else {
      deleteAlert(alert.alert_id);
    }
  };

  const deleteAlert = async (alertId: number) => {
    await supabase.from("alerts").delete().eq("alert_id", alertId);
    setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
    setShowDeleteDialog(false);
    setAlertToDelete(null);
  };

  const getAlertIcon = (message: string) => {
    if (message.toLowerCase().includes("anomaly") || message.toLowerCase().includes("attack"))
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (message.toLowerCase().includes("login"))
      return <User className="w-5 h-5 text-blue-400" />;
    if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("blocked"))
      return <XCircle className="w-5 h-5 text-red-400" />;
    if (message.toLowerCase().includes("suspicious"))
      return <Shield className="w-5 h-5 text-red-400" />;
    if (message.toLowerCase().includes("completed") || message.toLowerCase().includes("success"))
      return <CheckCircle className="w-5 h-5 text-blue-400" />;
    return <Info className="w-5 h-5 text-blue-400" />;
  };

  const isCritical = (status: string, message: string) => {
    return status === "critical" ||
      message.toLowerCase().includes("anomaly") ||
      message.toLowerCase().includes("attack") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("suspicious");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
          <Button variant="ghost" size="icon" onClick={onLogout}
            className="text-blue-200 hover:text-white hover:bg-white/10">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-white mb-2">System Activity and Alerts</h1>
          <p className="text-blue-200/70">Monitor all system events and security notifications</p>
        </div>

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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-200/70">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="bg-white/5 border-blue-400/20 p-12 text-center">
            <Shield className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
            <p className="text-white mb-2">No alerts yet</p>
            <p className="text-blue-200/70 text-sm">Your system is secure. Alerts will appear here when detected.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const critical = isCritical(alert.alert_status, alert.alert_message);
              return (
                <Card key={alert.alert_id}
                  className={`bg-white/5 backdrop-blur-sm p-4 transition-all hover:bg-white/10 ${
                    critical ? "border-l-4 border-l-red-500/50 border-t border-r border-b border-blue-400/20" : "border-blue-400/20"
                  }`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${critical ? "bg-red-500/20" : "bg-blue-500/20"}`}>
                      {getAlertIcon(alert.alert_message)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={critical ? "text-red-100" : "text-blue-100"}>
                            {alert.alert_message}
                          </p>
                          {critical && (
                            <span className="inline-block mt-1 text-xs text-red-400/70 bg-red-500/10 px-2 py-0.5 rounded">
                              Critical
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <time className="text-sm text-blue-200/50 whitespace-nowrap">
                            {formatTime(alert.creation_date)}
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
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-blue-200/50 text-sm">
            All activities are monitored locally and encrypted via the gateway.
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
              Delete Critical Alert?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200/70 text-center">
              This is a critical security alert. Are you sure you want to delete it? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-6 px-6 pb-6">
            <AlertDialogAction
              onClick={() => alertToDelete && deleteAlert(alertToDelete.alert_id)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-0">
              <Trash2 className="w-4 h-4 mr-2" />
              Yes, Delete Alert
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