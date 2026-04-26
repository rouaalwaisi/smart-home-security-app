import React, { useState } from "react";
import { LoginScreen } from "./components/login-screen";
import { SignupScreen } from "./components/signup-screen";
import { ForgotPasswordScreen } from "./components/forgot-password-screen";
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "signup" | "forgotPassword" | "dashboard" | "alerts" | "device" | "deviceList" | "addDevice" | "deviceConfig" | "networkInfo" | "cloudLogs" | "settings" | "automationRules">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"internet" | "intranet">("internet");
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "001",
      name: "Temperature Sensor",
      type: "temperature",
      status: "online",
      enabled: true,
      batteryLevel: 87,
      value: "22°C",
      lastAccessed: Date.now()
    }
  ]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [previousScreen, setPreviousScreen] = useState<"dashboard" | "deviceList">("dashboard");
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  const handleAddRule = (rule: Omit<AutomationRule, "id" | "createdAt">) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAutomationRules([...automationRules, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setAutomationRules(automationRules.filter(r => r.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setAutomationRules(automationRules.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen("dashboard");
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen("login");
  };

  const navigateTo = (screen: "dashboard" | "alerts" | "device" | "deviceList" | "addDevice" | "deviceConfig" | "networkInfo" | "cloudLogs" | "settings" | "automationRules") => {
    if (isAuthenticated) {
      setCurrentScreen(screen);
    }
  };

  const handleAddDevice = (deviceType: string, deviceName: string) => {
    const newDevice: Device = {
      id: `${Date.now()}`,
      name: deviceName,
      type: deviceType as Device["type"],
      status: "online",
      enabled: true,
      batteryLevel: Math.floor(Math.random() * 30) + 70, // Random battery 70-100%
      lastAccessed: Date.now()
    };

    // Add device-specific values
    if (deviceType === "temperature") {
      newDevice.value = `${Math.floor(Math.random() * 10) + 18}°C`;
    } else if (deviceType === "motion") {
      newDevice.value = "Clear";
    } else if (deviceType === "light") {
      newDevice.value = "Off";
    } else if (deviceType === "door" || deviceType === "garage") {
      newDevice.value = "Closed";
    } else if (deviceType === "smoke") {
      newDevice.value = "Normal";
    } else if (deviceType === "siren") {
      newDevice.value = "Silent";
    }

    setDevices([...devices, newDevice]);
    navigateTo("deviceList");
  };

  const handleDeviceClick = (device: Device) => {
    // Update lastAccessed timestamp
    const updatedDevice = { ...device, lastAccessed: Date.now() };
    setDevices(devices.map(d => d.id === device.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
    setPreviousScreen("deviceList");
    navigateTo("deviceConfig");
  };

  const handleDashboardDeviceClick = (device: Device) => {
    // Update lastAccessed timestamp
    const updatedDevice = { ...device, lastAccessed: Date.now() };
    setDevices(devices.map(d => d.id === device.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
    setPreviousScreen("dashboard");
    navigateTo("deviceConfig");
  };

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
  };

  const handleRemoveDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
  };

  if (!isAuthenticated) {
    if (currentScreen === "signup") {
      return (
        <SignupScreen
          onSignup={handleSignup}
          onBackToLogin={() => setCurrentScreen("login")}
        />
      );
    }
    if (currentScreen === "forgotPassword") {
      return (
        <ForgotPasswordScreen
          onBackToLogin={() => setCurrentScreen("login")}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={handleLogin}
        onNavigateToSignup={() => setCurrentScreen("signup")}
        onNavigateToForgotPassword={() => setCurrentScreen("forgotPassword")}
        biometricEnabled={biometricEnabled}
        rememberMe={rememberMe}
        onRememberMeChange={setRememberMe}
      />
    );
  }

  return (
    <>
      {currentScreen === "dashboard" && (
        <HomeDashboard 
          onNavigateToAlerts={() => navigateTo("alerts")}
          onNavigateToDevice={() => navigateTo("device")}
          onNavigateToDeviceList={() => navigateTo("deviceList")}
          onNavigateToNetworkInfo={() => navigateTo("networkInfo")}
          onNavigateToCloudLogs={() => navigateTo("cloudLogs")}
          onNavigateToSettings={() => navigateTo("settings")}
          onNavigateToAutomationRules={() => navigateTo("automationRules")}
          onLogout={handleLogout}
          devices={devices}
          onDeviceClick={handleDashboardDeviceClick}
          connectionMode={connectionMode}
          onConnectionModeChange={setConnectionMode}
        />
      )}
      {currentScreen === "alerts" && (
        <SecurityAlerts 
          onNavigateToDashboard={() => navigateTo("dashboard")}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === "device" && (
        <DeviceSettings 
          onNavigateBack={() => navigateTo("dashboard")}
        />
      )}
      {currentScreen === "deviceList" && (
        <DeviceList
          onNavigateToDashboard={() => navigateTo("dashboard")}
          onAddDevice={() => navigateTo("addDevice")}
          onDeviceClick={handleDeviceClick}
          onLogout={handleLogout}
          devices={devices}
        />
      )}
      {currentScreen === "addDevice" && (
        <AddDevice
          onNavigateBack={() => navigateTo("deviceList")}
          onAddDevice={handleAddDevice}
        />
      )}
      {currentScreen === "deviceConfig" && selectedDevice && (
        <DeviceConfig
          device={selectedDevice}
          onNavigateBack={() => navigateTo(previousScreen)}
          onUpdateDevice={handleUpdateDevice}
          onRemoveDevice={handleRemoveDevice}
        />
      )}
      {currentScreen === "networkInfo" && (
        <NetworkInfo
          onNavigateBack={() => navigateTo("dashboard")}
          connectionMode={connectionMode}
        />
      )}
      {currentScreen === "cloudLogs" && (
        <CloudLogs
          onNavigateBack={() => navigateTo("dashboard")}
          connectionMode={connectionMode}
        />
      )}
      {currentScreen === "settings" && (
        <SettingsScreen
          onNavigateBack={() => navigateTo("dashboard")}
          biometricEnabled={biometricEnabled}
          onBiometricChange={setBiometricEnabled}
        />
      )}
      {currentScreen === "automationRules" && (
        <AutomationRules
          onNavigateBack={() => navigateTo("dashboard")}
          devices={devices}
          rules={automationRules}
          onAddRule={handleAddRule}
          onDeleteRule={handleDeleteRule}
          onToggleRule={handleToggleRule}
        />
      )}
    </>
  );
}