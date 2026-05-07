import React, { useState, useEffect } from "react";
import { LoginScreen } from "./components/login-screen";
import { SignupScreen } from "./components/signup-screen";
import { ForgotPasswordScreen } from "./components/forgot-password-screen";
import { VerifyEmailScreen } from "./components/verify-email-screen";
import { HomeDashboard } from "./components/home-dashboard";
import { SecurityAlerts } from "./components/security-alerts";
import { DeviceSettings } from "./components/device-settings";
import { DeviceList, Device } from "./components/device-list";
import { AddDevice } from "./components/add-device";
import { DeviceConfig } from "./components/device-config";
import { NetworkInfo } from "./components/network-info";
import { CloudLogs } from "./components/cloud-logs";
import { SettingsScreen } from "./components/settings-screen";
import { AutomationRules, AutomationRule } from "./components/automation-rules";
import { supabase } from "../lib/supabase";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "signup" | "forgotPassword" | "verifyEmail" | "dashboard" | "alerts" | "device" | "deviceList" | "addDevice" | "deviceConfig" | "networkInfo" | "cloudLogs" | "settings" | "automationRules">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"internet" | "intranet">("internet");
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [previousScreen, setPreviousScreen] = useState<"dashboard" | "deviceList">("dashboard");
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const remembered = localStorage.getItem("rememberMe");
        if (remembered === "true") {
          await loadDevices(data.session.user.id);
          await loadRules(data.session.user.id);
          setIsAuthenticated(true);
          setCurrentScreen("dashboard");
        }
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
        setIsAuthenticated(false);
        setCurrentScreen("forgotPassword");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDevices = async (uid: string) => {
    const { data, error } = await supabase
      .from("iot_device")
      .select("*")
      .eq("user_id", uid);
    if (!error && data) {
      const mapped: Device[] = data.map((d: any) => ({
        id: String(d.device_id),
        name: d.device_name,
        type: d.device_type,
        status: d.device_status as "online" | "offline",
        enabled: true,
        batteryLevel: d.battery_level,
        value: d.value,
        lastAccessed: Date.now(),
        hardware_id: d.hardware_id
      }));
      setDevices(mapped);
    }
  };

  const loadRules = async (uid: string) => {
    const { data, error } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (!error && data) {
      const mapped: AutomationRule[] = data.map((r: any) => ({
        id: String(r.rule_id),
        name: r.name,
        enabled: r.enabled,
        trigger: {
          deviceId: r.trigger_device_id,
          deviceName: r.trigger_device_name,
          condition: r.trigger_condition
        },
        action: {
          deviceId: r.action_device_id,
          deviceName: r.action_device_name,
          command: r.action_command
        },
        createdAt: r.created_at
      }));
      setAutomationRules(mapped);
    }
  };

  const handleLogin = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await loadDevices(data.user.id);
      await loadRules(data.user.id);
    }
    setIsAuthenticated(true);
    setCurrentScreen("dashboard");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
    setIsAuthenticated(false);
    setDevices([]);
    setAutomationRules([]);
    setCurrentScreen("login");
  };

  const handleNavigateToVerify = (email: string) => {
    setVerifyEmail(email);
    setCurrentScreen("verifyEmail");
  };

  const navigateTo = (screen: "dashboard" | "alerts" | "device" | "deviceList" | "addDevice" | "deviceConfig" | "networkInfo" | "cloudLogs" | "settings" | "automationRules") => {
    if (isAuthenticated) setCurrentScreen(screen);
  };

  const handleAddDevice = async (deviceType: string, deviceName: string, hardwareId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const uid = userData.user.id;
    let value: string | undefined = undefined;
    if (deviceType === "temperature") value = `${Math.floor(Math.random() * 10) + 18}C`;
    else if (deviceType === "motion") value = "Clear";
    else if (deviceType === "light") value = "Off";
    else if (deviceType === "door" || deviceType === "garage") value = "Closed";
    else if (deviceType === "smoke") value = "Normal";
    else if (deviceType === "siren") value = "Silent";

    const { data, error } = await supabase
      .from("iot_device")
      .insert({
        device_name: deviceName,
        device_type: deviceType,
        device_status: "online",
        protocol_used: "MQTT",
        encryption_type: "AES-128",
        battery_level: Math.floor(Math.random() * 30) + 70,
        value: value,
        user_id: uid,
        hardware_id: hardwareId
      })
      .select()
      .single();

    if (!error && data) {
      const newDevice: Device = {
        id: String(data.device_id),
        name: data.device_name,
        type: data.device_type,
        status: "online",
        enabled: true,
        batteryLevel: data.battery_level,
        value: data.value,
        lastAccessed: Date.now(),
        hardware_id: data.hardware_id
      };
      setDevices(prev => [...prev, newDevice]);
    }
    navigateTo("deviceList");
  };

  const handleDeviceClick = (device: Device) => {
    const updatedDevice = { ...device, lastAccessed: Date.now() };
    setDevices(devices.map(d => d.id === device.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
    setPreviousScreen("deviceList");
    navigateTo("deviceConfig");
  };

  const handleDashboardDeviceClick = (device: Device) => {
    const updatedDevice = { ...device, lastAccessed: Date.now() };
    setDevices(devices.map(d => d.id === device.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
    setPreviousScreen("dashboard");
    navigateTo("deviceConfig");
  };

  const handleUpdateDevice = async (updatedDevice: Device) => {
    await supabase.from("iot_device")
      .update({ device_name: updatedDevice.name, device_status: updatedDevice.status })
      .eq("device_id", updatedDevice.id);
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    await supabase.from("iot_device").delete().eq("device_id", deviceId);
    setDevices(devices.filter(d => d.id !== deviceId));
  };

  const handleAddRule = async (rule: Omit<AutomationRule, "id" | "createdAt">) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("automation_rules")
      .insert({
        user_id: userData.user.id,
        name: rule.name,
        enabled: rule.enabled,
        trigger_device_id: rule.trigger.deviceId,
        trigger_device_name: rule.trigger.deviceName,
        trigger_condition: rule.trigger.condition,
        action_device_id: rule.action.deviceId,
        action_device_name: rule.action.deviceName,
        action_command: rule.action.command,
      })
      .select()
      .single();
    if (!error && data) {
      const newRule: AutomationRule = {
        id: String(data.rule_id),
        name: data.name,
        enabled: data.enabled,
        trigger: {
          deviceId: data.trigger_device_id,
          deviceName: data.trigger_device_name,
          condition: data.trigger_condition
        },
        action: {
          deviceId: data.action_device_id,
          deviceName: data.action_device_name,
          command: data.action_command
        },
        createdAt: data.created_at
      };
      setAutomationRules(prev => [...prev, newRule]);
    }
  };

  const handleDeleteRule = async (id: string) => {
    await supabase.from("automation_rules").delete().eq("rule_id", id);
    setAutomationRules(automationRules.filter(r => r.id !== id));
  };

  const handleToggleRule = async (id: string) => {
    const rule = automationRules.find(r => r.id === id);
    if (!rule) return;
    await supabase.from("automation_rules").update({ enabled: !rule.enabled }).eq("rule_id", id);
    setAutomationRules(automationRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  if (!isAuthenticated) {
    if (currentScreen === "signup") {
      return <SignupScreen
        onSignup={() => {}}
        onBackToLogin={() => setCurrentScreen("login")}
        onNavigateToVerify={handleNavigateToVerify}
      />;
    }
    if (currentScreen === "forgotPassword") {
      return <ForgotPasswordScreen
        onBackToLogin={() => { setIsPasswordRecovery(false); setCurrentScreen("login"); }}
        startAtPassword={isPasswordRecovery}
      />;
    }
    if (currentScreen === "verifyEmail") {
      return <VerifyEmailScreen
        email={verifyEmail}
        onVerified={handleLogin}
        onBack={() => setCurrentScreen("login")}
      />;
    }
    return (
      <LoginScreen
        onLogin={handleLogin}
        onNavigateToSignup={() => setCurrentScreen("signup")}
        onNavigateToForgotPassword={() => setCurrentScreen("forgotPassword")}
        onNavigateToVerify={handleNavigateToVerify}
        biometricEnabled={biometricEnabled}
        rememberMe={rememberMe}
        onRememberMeChange={setRememberMe}
      />
    );
  }

  return (
    <>
      {currentScreen === "dashboard" && <HomeDashboard onNavigateToAlerts={() => navigateTo("alerts")} onNavigateToDevice={() => navigateTo("device")} onNavigateToDeviceList={() => navigateTo("deviceList")} onNavigateToNetworkInfo={() => navigateTo("networkInfo")} onNavigateToCloudLogs={() => navigateTo("cloudLogs")} onNavigateToSettings={() => navigateTo("settings")} onNavigateToAutomationRules={() => navigateTo("automationRules")} onLogout={handleLogout} devices={devices} onDeviceClick={handleDashboardDeviceClick} connectionMode={connectionMode} onConnectionModeChange={setConnectionMode} />}
      {currentScreen === "alerts" && <SecurityAlerts onNavigateToDashboard={() => navigateTo("dashboard")} onLogout={handleLogout} />}
      {currentScreen === "device" && <DeviceSettings onNavigateBack={() => navigateTo("dashboard")} />}
      {currentScreen === "deviceList" && <DeviceList onNavigateToDashboard={() => navigateTo("dashboard")} onAddDevice={() => navigateTo("addDevice")} onDeviceClick={handleDeviceClick} onLogout={handleLogout} devices={devices} />}
      {currentScreen === "addDevice" && <AddDevice onNavigateBack={() => navigateTo("deviceList")} onAddDevice={handleAddDevice} />}
      {currentScreen === "deviceConfig" && selectedDevice && <DeviceConfig device={selectedDevice} onNavigateBack={() => navigateTo(previousScreen)} onUpdateDevice={handleUpdateDevice} onRemoveDevice={handleRemoveDevice} />}
      {currentScreen === "networkInfo" && <NetworkInfo onNavigateBack={() => navigateTo("dashboard")} connectionMode={connectionMode} />}
      {currentScreen === "cloudLogs" && <CloudLogs onNavigateBack={() => navigateTo("dashboard")} connectionMode={connectionMode} />}
      {currentScreen === "settings" && <SettingsScreen onNavigateBack={() => navigateTo("dashboard")} biometricEnabled={biometricEnabled} onBiometricChange={setBiometricEnabled} />}
      {currentScreen === "automationRules" && <AutomationRules onNavigateBack={() => navigateTo("dashboard")} devices={devices} rules={automationRules} onAddRule={handleAddRule} onDeleteRule={handleDeleteRule} onToggleRule={handleToggleRule} />}
    </>
  );
}