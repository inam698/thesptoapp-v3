"use client";

import { useState } from "react";
import {
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "@/hooks/useAuth";
import toast from "react-hot-toast";

function SaveIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

export default function SettingsPage() {
  const { user } = useAuthState();

  // Profile state
  const [displayName, setDisplayName] = useState(
    user?.displayName || user?.email?.split("@")[0] || ""
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      // Also update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? "";
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AD";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2E2E2E" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#B8A9D1" }}>
          Manage your admin profile and security settings
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #E8D5F0", backgroundColor: "#fff" }}>
        <div className="px-6 py-4" style={{ backgroundColor: "#F5EEF8", borderBottom: "1px solid #E8D5F0" }}>
          <div className="flex items-center gap-2" style={{ color: "#9B6DAE" }}>
            <UserIcon />
            <h2 className="text-sm font-bold uppercase tracking-wider">Profile</h2>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #C69FD5, #9B6DAE)" }}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#2E2E2E" }}>
                {user?.email ?? ""}
              </p>
              <span
                className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1"
                style={{ backgroundColor: "#FFF0F3", color: "#E8879C" }}
              >
                Admin
              </span>
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A4A4A" }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
              style={{ backgroundColor: "#F5EEF8", border: "1.5px solid #E8D5F0", color: "#2E2E2E" }}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A4A4A" }}>
              Email Address
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="w-full px-4 py-2.5 text-sm rounded-xl"
              style={{
                backgroundColor: "#FDFDC9",
                border: "1.5px solid #E8D5F0",
                color: "#B8A9D1",
                cursor: "not-allowed",
              }}
            />
            <p className="text-xs mt-1" style={{ color: "#B8A9D1" }}>
              Email cannot be changed here. Contact your Firebase project owner.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #9B6DAE, #C69FD5)" }}
            >
              {savingProfile ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <SaveIcon />
              )}
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* Password card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #E8D5F0", backgroundColor: "#fff" }}>
        <div className="px-6 py-4" style={{ backgroundColor: "#F5EEF8", borderBottom: "1px solid #E8D5F0" }}>
          <div className="flex items-center gap-2" style={{ color: "#9B6DAE" }}>
            <LockIcon />
            <h2 className="text-sm font-bold uppercase tracking-wider">Change Password</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
            { label: "New Password", value: newPassword, setter: setNewPassword },
            { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A4A4A" }}>
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
                style={{ backgroundColor: "#F5EEF8", border: "1.5px solid #E8D5F0", color: "#2E2E2E" }}
              />
            </div>
          ))}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #E8879C, #C06080)" }}
            >
              {savingPassword ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LockIcon />
              )}
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
