import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Plus, Zap, Trash2, ChevronRight, Power } from "lucide-react";
import { Device } from "./device-list";
import { supabase } from "../../lib/supabase";

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    deviceId: string;
    deviceName: string;
    condition: string;
  };
  action: {
    deviceId: string;
    deviceName: string;
    command: string;
  };
  createdAt: string;
}

interface AutomationRulesProps {
  onNavigateBack: () => void;
  devices: Device[];
  rules: AutomationRule[];
  onAddRule: (rule: Omit<AutomationRule, "id" | "createdAt">) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
}

export function AutomationRules({
  onNavigateBack,
  devices,
  rules,
  onAddRule,
  onDeleteRule,
  onToggleRule
}: AutomationRulesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTriggerDevice, setSelectedTriggerDevice] = useState("");
  const [selectedTriggerCondition, setSelectedTriggerCondition] = useState("");
  const [selectedActionDevice, setSelectedActionDevice] = useState("");
  const [selectedActionCommand, setSelectedActionCommand] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [error, setError] = useState("");

  const getTriggerConditions = (device: Device) => {
    switch (device.type) {
      case "motion": return ["detects motion", "clears motion", "battery < 20%", "goes offline", "comes online"];
      case "temperature": return ["temperature > 25°C", "temperature < 20°C", "temperature > 30°C", "temperature < 15°C", "battery < 20%", "goes offline", "comes online"];
      case "door": return ["opens", "closes", "locked", "unlocked", "battery < 20%", "goes offline", "comes online"];
      case "garage": return ["opens", "closes", "locked", "unlocked", "battery < 20%", "goes offline", "comes online"];
      case "smoke": return ["detects smoke", "clears smoke", "battery < 20%", "goes offline", "comes online"];
      case "light": return ["turns on", "turns off", "battery < 20%", "goes offline", "comes online"];
      case "siren": return ["activates", "deactivates", "battery < 20%", "goes offline", "comes online"];
      default: return ["activates", "deactivates", "value changes", "battery < 20%", "goes offline", "comes online"];
    }
  };

  const getActionCommands = (device: Device) => {
    switch (device.type) {
      case "light": return ["turn on", "turn off", "toggle"];
      case "siren": return ["activate", "deactivate", "trigger alarm"];
      case "door": return ["lock", "unlock", "open", "close"];
      case "garage": return ["open", "close", "lock", "unlock"];
      case "motion": return ["enable", "disable", "reset"];
      case "temperature": return ["enable", "disable", "reset", "recalibrate"];
      case "smoke": return ["enable", "disable", "reset", "test"];
      default: return ["turn on", "turn off", "activate", "deactivate", "toggle", "enable", "disable"];
    }
  };

  const handleAddRule = () => {
    setError("");
    if (!selectedTriggerDevice || !selectedTriggerCondition || !selectedActionDevice || !selectedActionCommand || !ruleName) {
      setError("Please fill in all fields");
      return;
    }

    const triggerDevice = devices.find(d => d.id === selectedTriggerDevice);
    const actionDevice = devices.find(d => d.id === selectedActionDevice);
    if (!triggerDevice || !actionDevice) return;

    onAddRule({
      name: ruleName,
      enabled: true,
      trigger: {
        deviceId: triggerDevice.id,
        deviceName: triggerDevice.name,
        condition: selectedTriggerCondition
      },
      action: {
        deviceId: actionDevice.id,
        deviceName: actionDevice.name,
        command: selectedActionCommand
      }
    });

    setRuleName("");
    setSelectedTriggerDevice("");
    setSelectedTriggerCondition("");
    setSelectedActionDevice("");
    setSelectedActionCommand("");
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1a2f4f] to-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onNavigateBack}
            className="text-blue-200 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-white mb-1">Automation Rules</h1>
            <p className="text-blue-200/70 text-sm">Create smart home automation workflows</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-purple-100 mb-1">Smart Automation</p>
              <p className="text-purple-200/70 text-sm">
                Create conditional rules to automate your smart home. Example: "If motion detector detects motion, then turn on light"
              </p>
              <p className="text-purple-200/50 text-xs mt-2">
                ⚠️ Rules are saved and displayed here. Hardware execution requires gateway connection.
              </p>
            </div>
          </div>
        </Card>

        {rules.length === 0 ? (
          <Card className="bg-white/5 border-blue-400/20 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-white mb-2">No automation rules yet</p>
            <p className="text-blue-200/70 text-sm mb-4">Create your first automation rule to make your home smarter</p>
            <Button onClick={() => setShowAddModal(true)} variant="outline"
              className="bg-white/5 border-blue-400/20 text-blue-100 hover:bg-white/10 hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Automation Rule
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <Card key={rule.id}
                className={`border backdrop-blur-sm p-4 transition-all ${
                  rule.enabled ? "bg-white/5 border-blue-400/20" : "bg-white/[0.02] border-blue-400/10 opacity-60"
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${rule.enabled ? "bg-purple-500/20" : "bg-gray-500/20"}`}>
                    <Zap className={`w-5 h-5 ${rule.enabled ? "text-purple-400" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-white mb-1">{rule.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-blue-200/70">IF</span>
                          <span className="text-blue-100">{rule.trigger.deviceName}</span>
                          <ChevronRight className="w-3 h-3 text-blue-200/50" />
                          <span className="text-emerald-300">{rule.trigger.condition}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="text-blue-200/70">THEN</span>
                          <span className="text-blue-100">{rule.action.deviceName}</span>
                          <ChevronRight className="w-3 h-3 text-blue-200/50" />
                          <span className="text-orange-300">{rule.action.command}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onToggleRule(rule.id)}
                          className={rule.enabled ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" : "text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"}>
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteRule(rule.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-blue-200/40 mt-2">
                      <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={rule.enabled ? "text-emerald-400" : "text-gray-400"}>
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowAddModal(false)}>
            <Card className="bg-[#0f1e36] border-blue-400/30 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white">Create Automation Rule</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}
                  className="text-blue-200 hover:text-white hover:bg-white/10">
                  <span className="text-xl">×</span>
                </Button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-blue-200/70 text-sm mb-2 block">Rule Name</label>
                  <input type="text" placeholder="e.g., Motion Light Automation"
                    value={ruleName} onChange={(e) => setRuleName(e.target.value)}
                    className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>

                <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                  <p className="text-blue-100 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">IF</span>
                    Trigger Condition
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-blue-200/70 text-sm mb-2 block">Select Device</label>
                      <select value={selectedTriggerDevice}
                        onChange={(e) => { setSelectedTriggerDevice(e.target.value); setSelectedTriggerCondition(""); }}
                        className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        style={{ colorScheme: "dark" }}>
                        <option value="" className="bg-[#1a2f4f]">Choose a device...</option>
                        {devices.map((device) => (
                          <option key={device.id} value={device.id} className="bg-[#1a2f4f]">{device.name} ({device.type})</option>
                        ))}
                      </select>
                    </div>
                    {selectedTriggerDevice && (
                      <div>
                        <label className="text-blue-200/70 text-sm mb-2 block">Condition</label>
                        <select value={selectedTriggerCondition} onChange={(e) => setSelectedTriggerCondition(e.target.value)}
                          className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          style={{ colorScheme: "dark" }}>
                          <option value="" className="bg-[#1a2f4f]">Choose condition...</option>
                          {getTriggerConditions(devices.find(d => d.id === selectedTriggerDevice)!).map((condition) => (
                            <option key={condition} value={condition} className="bg-[#1a2f4f]">{condition}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-4">
                  <p className="text-orange-100 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">THEN</span>
                    Action to Perform
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-blue-200/70 text-sm mb-2 block">Select Device</label>
                      <select value={selectedActionDevice}
                        onChange={(e) => { setSelectedActionDevice(e.target.value); setSelectedActionCommand(""); }}
                        className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        style={{ colorScheme: "dark" }}>
                        <option value="" className="bg-[#1a2f4f]">Choose a device...</option>
                        {devices.map((device) => (
                          <option key={device.id} value={device.id} className="bg-[#1a2f4f]">{device.name} ({device.type})</option>
                        ))}
                      </select>
                    </div>
                    {selectedActionDevice && (
                      <div>
                        <label className="text-blue-200/70 text-sm mb-2 block">Command</label>
                        <select value={selectedActionCommand} onChange={(e) => setSelectedActionCommand(e.target.value)}
                          className="w-full bg-white/5 border border-blue-400/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          style={{ colorScheme: "dark" }}>
                          <option value="" className="bg-[#1a2f4f]">Choose command...</option>
                          {getActionCommands(devices.find(d => d.id === selectedActionDevice)!).map((command) => (
                            <option key={command} value={command} className="bg-[#1a2f4f]">{command}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={handleAddRule}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Create Automation Rule
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}