import React, { useState, useEffect } from 'react';
import {
  Mic,
  Video,
  Bell,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Sparkles,
  Info,
} from 'lucide-react';

interface PermissionOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface PermissionState {
  mic: 'prompt' | 'granted' | 'denied';
  camera: 'prompt' | 'granted' | 'denied';
  notifications: 'prompt' | 'granted' | 'denied';
  storage: 'granted';
}

export const PermissionOnboardingModal: React.FC<PermissionOnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    mic: 'prompt',
    camera: 'prompt',
    notifications: 'prompt',
    storage: 'granted', // HTML5 local storage is default
  });

  const [requesting, setRequesting] = useState<string | null>(null);

  // Check initial permissions if query API is available
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissions((p) => ({ ...p, notifications: 'granted' }));
      } else if (Notification.permission === 'denied') {
        setPermissions((p) => ({ ...p, notifications: 'denied' }));
      }
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((status) => {
          if (status.state === 'granted') {
            setPermissions((p) => ({ ...p, mic: 'granted' }));
          } else if (status.state === 'denied') {
            setPermissions((p) => ({ ...p, mic: 'denied' }));
          }
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: 'camera' as any })
        .then((status) => {
          if (status.state === 'granted') {
            setPermissions((p) => ({ ...p, camera: 'granted' }));
          } else if (status.state === 'denied') {
            setPermissions((p) => ({ ...p, camera: 'denied' }));
          }
        })
        .catch(() => {});
    }
  }, []);

  if (!isOpen) return null;

  // Request Microphone via getUserMedia
  const handleRequestMic = async () => {
    setRequesting('mic');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream immediately after permission acquisition
      stream.getTracks().forEach((t) => t.stop());
      setPermissions((p) => ({ ...p, mic: 'granted' }));
    } catch {
      setPermissions((p) => ({ ...p, mic: 'denied' }));
    } finally {
      setRequesting(null);
    }
  };

  // Request Camera via getUserMedia
  const handleRequestCamera = async () => {
    setRequesting('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissions((p) => ({ ...p, camera: 'granted' }));
    } catch {
      setPermissions((p) => ({ ...p, camera: 'denied' }));
    } finally {
      setRequesting(null);
    }
  };

  // Request Notifications
  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) return;
    setRequesting('notifications');
    try {
      const res = await Notification.requestPermission();
      setPermissions((p) => ({
        ...p,
        notifications: res === 'granted' ? 'granted' : 'denied',
      }));
    } catch {
      setPermissions((p) => ({ ...p, notifications: 'denied' }));
    } finally {
      setRequesting(null);
    }
  };

  // Request All Recommended
  const handleRequestAllRecommended = async () => {
    if (permissions.mic !== 'granted') {
      await handleRequestMic();
    }
    if (permissions.notifications !== 'granted' && 'Notification' in window) {
      await handleRequestNotifications();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-900 bg-gradient-to-b from-indigo-950/20 to-slate-950 text-center space-y-1.5">
          <div className="inline-flex p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-1">
            <Shield size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            App Permissions & Device Setup
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            WHO AM I? uses native web APIs for your AI companion LYRA and personal data storage. Review the permissions below before creating your account.
          </p>
        </div>

        {/* Permissions List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5">
          {/* 1. Microphone */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <Mic size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Microphone Access</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Powers low-latency, real-time voice conversations with LYRA using the Web Audio API and voice activity detection.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {permissions.mic === 'granted' ? (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Allowed
                </span>
              ) : (
                <button
                  onClick={handleRequestMic}
                  disabled={requesting === 'mic'}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {requesting === 'mic' ? 'Requesting...' : 'Allow Mic'}
                </button>
              )}
            </div>
          </div>

          {/* 2. Camera */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                <Video size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Camera Access</span>
                  <span className="text-[10px] font-mono text-slate-400 font-medium bg-slate-800 px-1.5 py-0.2 rounded">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Used exclusively during full-screen Video Calls to render your Picture-in-Picture feed alongside the animated LYRA fairy.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {permissions.camera === 'granted' ? (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Allowed
                </span>
              ) : (
                <button
                  onClick={handleRequestCamera}
                  disabled={requesting === 'camera'}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all"
                >
                  {requesting === 'camera' ? 'Requesting...' : 'Allow Cam'}
                </button>
              )}
            </div>
          </div>

          {/* 3. Browser Notifications */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Bell size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Browser Notifications</span>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Delivers timely notifications for scheduled deep work sessions, recovery block alerts, and streak updates.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {permissions.notifications === 'granted' ? (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Allowed
                </span>
              ) : (
                <button
                  onClick={handleRequestNotifications}
                  disabled={requesting === 'notifications'}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {requesting === 'notifications' ? 'Requesting...' : 'Enable Alerts'}
                </button>
              )}
            </div>
          </div>

          {/* 4. Local Storage & Files */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                <HardDrive size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Local Data & File Access</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  HTML5 local browser storage is used to securely save your independent profile, custom goals, and book chapters locally on this device.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Ready
              </span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-400">
            <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Your choices are respected. Non-essential permissions are completely optional and can be managed anytime. You can proceed without granting optional permissions.
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-slate-900 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onComplete}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Continue with Essential Only / Skip
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRequestAllRecommended}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-indigo-300 hover:text-white transition-all"
            >
              Allow All Recommended
            </button>
            <button
              onClick={onComplete}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Continue to Account Setup</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
