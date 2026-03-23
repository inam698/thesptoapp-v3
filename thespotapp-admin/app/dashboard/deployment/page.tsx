"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "@/hooks/useAuth";
import {
  getAppVersionConfig,
  updateAppVersionConfig,
  addDeploymentLog,
  getDeploymentLogs,
  getRolloutConfig,
  updateRolloutConfig,
  getFeatureFlags,
  updateFeatureFlags,
} from "@/lib/firestore";
import type { AppVersionConfig, DeploymentLog, RolloutConfig, FeatureFlags } from "@/types";
import toast from "react-hot-toast";

/** Simple semver compare: -1 if a<b, 0 if equal, 1 if a>b */
function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

export default function DeploymentPage() {
  const { user } = useAuthState();
  const [versionConfig, setVersionConfig] = useState<AppVersionConfig | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [currentVersion, setCurrentVersion] = useState("");
  const [minimumVersion, setMinimumVersion] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Rollout state
  const [rolloutPercentage, setRolloutPercentage] = useState(100);
  const [disableUpdates, setDisableUpdates] = useState(false);
  const [savingRollout, setSavingRollout] = useState(false);

  // Feature flags state
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});
  const [newFlagKey, setNewFlagKey] = useState("");
  const [savingFlags, setSavingFlags] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [config, deployLogs, rollout, flags] = await Promise.all([
        getAppVersionConfig(),
        getDeploymentLogs(),
        getRolloutConfig(),
        getFeatureFlags(),
      ]);
      if (config) {
        setVersionConfig(config);
        setCurrentVersion(config.currentVersion);
        setMinimumVersion(config.minimumVersion);
        setForceUpdate(config.forceUpdate);
        setUpdateMessage(config.updateMessage);
      }
      setLogs(deployLogs);
      setRolloutPercentage(rollout.rolloutPercentage);
      setDisableUpdates(rollout.disableUpdates);
      setFeatureFlags(flags);
    } catch {
      toast.error("Failed to load deployment data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!user?.email) return;
    if (!/^\d+\.\d+\.\d+$/.test(currentVersion) || !/^\d+\.\d+\.\d+$/.test(minimumVersion)) {
      toast.error("Versions must be in semver format (e.g. 2.1.0)");
      return;
    }

    // Safety: warn if minimum > current AND force-update is on — this would
    // lock out ALL users, including those already on the latest version.
    if (forceUpdate) {
      const cmp = compareSemver(minimumVersion, currentVersion);
      if (cmp > 0) {
        toast.error(
          `Minimum version (${minimumVersion}) is higher than current version (${currentVersion}). This will lock out ALL users. Please fix before saving.`
        );
        return;
      }
    }

    setSaving(true);
    try {
      const prev = versionConfig;
      await updateAppVersionConfig({
        currentVersion,
        minimumVersion,
        forceUpdate,
        updateMessage,
      });

      // Determine what changed for the log
      const changes: string[] = [];
      if (prev?.currentVersion !== currentVersion) changes.push(`version → ${currentVersion}`);
      if (prev?.minimumVersion !== minimumVersion) changes.push(`min version → ${minimumVersion}`);
      if (prev?.forceUpdate !== forceUpdate) changes.push(`force update → ${forceUpdate ? "ON" : "OFF"}`);
      if (prev?.updateMessage !== updateMessage) changes.push("update message changed");

      if (changes.length > 0) {
        await addDeploymentLog({
          type: forceUpdate !== prev?.forceUpdate ? "force_update_toggle" : "version_change",
          version: currentVersion,
          message: changes.join(", "),
          adminEmail: user.email,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success("Version config saved");
      await fetchData();
    } catch {
      toast.error("Failed to save version config");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRollout = async () => {
    if (!user?.email) return;
    setSavingRollout(true);
    try {
      await updateRolloutConfig({ rolloutPercentage, disableUpdates });
      const logType = disableUpdates ? "kill_switch" : "rollout_change";
      await addDeploymentLog({
        type: logType,
        version: currentVersion || "—",
        message: disableUpdates
          ? "Kill switch ENABLED — all OTA updates paused"
          : `Rollout set to ${rolloutPercentage}%`,
        adminEmail: user.email,
        createdAt: new Date().toISOString(),
      });
      toast.success("Rollout config saved");
      await fetchData();
    } catch {
      toast.error("Failed to save rollout config");
    } finally {
      setSavingRollout(false);
    }
  };

  const handleSaveFlags = async () => {
    if (!user?.email) return;
    setSavingFlags(true);
    try {
      await updateFeatureFlags(featureFlags);
      await addDeploymentLog({
        type: "feature_toggle",
        version: currentVersion || "—",
        message: `Feature flags updated: ${Object.entries(featureFlags).map(([k, v]) => `${k}=${v ? "ON" : "OFF"}`).join(", ") || "none"}`,
        adminEmail: user.email,
        createdAt: new Date().toISOString(),
      });
      toast.success("Feature flags saved");
      await fetchData();
    } catch {
      toast.error("Failed to save feature flags");
    } finally {
      setSavingFlags(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const logTypeColors: Record<string, string> = {
    ota: "bg-blue-100 text-blue-800",
    build: "bg-green-100 text-green-800",
    version_change: "bg-purple-100 text-purple-800",
    force_update_toggle: "bg-red-100 text-red-800",
    rollout_change: "bg-amber-100 text-amber-800",
    feature_toggle: "bg-teal-100 text-teal-800",
    kill_switch: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deployment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage app version, force updates, and view deployment history.
        </p>
      </div>

      {/* Version Config Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Version Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current App Version
            </label>
            <input
              type="text"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              placeholder="2.1.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Latest published version (informational).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Required Version
            </label>
            <input
              type="text"
              value={minimumVersion}
              onChange={(e) => setMinimumVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Users below this version will be prompted to update.
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Message
            </label>
            <input
              type="text"
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="A required update is available. Please update to continue."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={forceUpdate}
              onClick={() => setForceUpdate(!forceUpdate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                forceUpdate ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  forceUpdate ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Force Update
              {forceUpdate && (
                <span className="ml-2 text-xs text-red-500 font-normal">
                  Users below minimum version cannot use the app
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving…" : "Save Config"}
          </button>
        </div>
      </div>

      {/* Rollout Control Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rollout Control</h2>

        {/* Kill Switch */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg border border-red-100 bg-red-50">
          <button
            type="button"
            role="switch"
            aria-checked={disableUpdates}
            onClick={() => setDisableUpdates(!disableUpdates)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              disableUpdates ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                disableUpdates ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <div>
            <span className="text-sm font-medium text-gray-900">Kill Switch</span>
            <p className="text-xs text-gray-500">
              {disableUpdates
                ? "OTA updates are PAUSED for all users"
                : "OTA updates are active"}
            </p>
          </div>
        </div>

        {/* Rollout Percentage */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rollout Percentage: <span className="text-purple-600 font-semibold">{rolloutPercentage}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={rolloutPercentage}
            onChange={(e) => setRolloutPercentage(Number(e.target.value))}
            disabled={disableUpdates}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Controls what percentage of users receive OTA updates. Users are assigned a stable bucket so the same users always get updates first.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveRollout}
            disabled={savingRollout}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
          >
            {savingRollout ? "Saving…" : "Save Rollout"}
          </button>
        </div>
      </div>

      {/* Feature Flags Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h2>
        <p className="text-xs text-gray-400 mb-4">
          Toggle features on/off remotely without deploying a new build.
        </p>

        {Object.keys(featureFlags).length === 0 && (
          <p className="text-sm text-gray-400 mb-4">No feature flags configured yet.</p>
        )}

        <div className="space-y-3 mb-4">
          {Object.entries(featureFlags).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700 font-mono">{key}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={value}
                  onClick={() =>
                    setFeatureFlags((prev) => ({ ...prev, [key]: !value }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? "bg-teal-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFeatureFlags((prev) => {
                      const next = { ...prev };
                      delete next[key];
                      return next;
                    })
                  }
                  className="text-gray-400 hover:text-red-500 text-xs ml-1"
                  title="Remove flag"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new flag */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newFlagKey}
            onChange={(e) => setNewFlagKey(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            placeholder="new_flag_name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
          />
          <button
            type="button"
            onClick={() => {
              const key = newFlagKey.trim();
              if (!key) return;
              if (featureFlags[key] !== undefined) {
                toast.error("Flag already exists");
                return;
              }
              setFeatureFlags((prev) => ({ ...prev, [key]: false }));
              setNewFlagKey("");
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Add Flag
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveFlags}
            disabled={savingFlags}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
          >
            {savingFlags ? "Saving…" : "Save Flags"}
          </button>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Reference</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>OTA Update (JS only):</strong>{" "}
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              npx eas update --channel production --message &quot;description&quot;
            </code>
          </p>
          <p>
            <strong>Native Build:</strong>{" "}
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              npx eas build --platform all --profile production
            </code>
          </p>
          <p>
            <strong>Submit to Stores:</strong>{" "}
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              npx eas submit --platform ios --profile production
            </code>
          </p>
          <p>
            <strong>Rollback OTA:</strong>{" "}
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              npx eas update:rollback --channel production
            </code>
          </p>
        </div>
      </div>

      {/* Deployment History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deployment History</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No deployment events yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                    logTypeColors[log.type] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {log.type.replace(/_/g, " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{log.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    v{log.version} · {log.adminEmail} ·{" "}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
