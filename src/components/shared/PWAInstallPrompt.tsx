import React, { useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useRoktodaanStore } from '../../store/useRoktodaanStore';
import { Button } from '../ui/button';

export const PWAInstallButton: React.FC = () => {
  const language = useRoktodaanStore((s) => s.language);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const bn = language === 'bn';

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <Button variant="outline" size="sm" onClick={install}>
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        {bn ? 'অ্যাপ ইনস্টল করুন' : 'Install App'}
      </Button>
    );
  }

  if (isIOS) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setShowIOSGuide(true)}>
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          {bn ? 'iPhone-এ ইনস্টল করুন' : 'Install on iOS'}
        </Button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 id="ios-install-title" className="font-display text-lg font-semibold text-slate-900">
                  {bn ? 'iPhone / iPad-এ রক্তদান ইনস্টল করুন' : 'Install Roktodaan on iPhone / iPad'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                1. Tap the <strong>Share</strong> button in Safari toolbar.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <Button className="mt-5 w-full" onClick={() => setShowIOSGuide(false)}>
                {bn ? 'বন্ধ করুন' : 'Close'}
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const language = useRoktodaanStore((s) => s.language);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-950 shadow-sm md:bottom-4"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
      <span>
        {language === 'bn'
          ? 'অফলাইন মোড — ক্যাশকৃত রক্তদাতা তালিকা সক্রিয়'
          : 'Offline Mode — Cached donor directory active'}
      </span>
    </div>
  );
};
