'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Android Chrome: show install button
  if (deferredPrompt) {
    return (
      <div className="mx-4 mb-4 p-4 bg-card border border-border rounded-xl flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-[#0091EA] flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Install 2C2P Wave</p>
          <p className="text-xs text-muted-foreground">Add to your home screen for quick access</p>
        </div>
        <Button size="sm" onClick={handleInstall} className="bg-[#0091EA] hover:bg-[#0091EA]/90 text-white">
          Install
        </Button>
        <button onClick={() => setDismissed(true)} className="p-1 text-muted-foreground" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // iOS Safari: show manual instructions
  if (isIOS) {
    return (
      <div className="mx-4 mb-4 p-4 bg-card border border-border rounded-xl flex items-start gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-[#0091EA] flex items-center justify-center flex-shrink-0">
          <Share className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Install 2C2P Wave</p>
          <p className="text-xs text-muted-foreground">
            Tap the share button <Share className="w-3 h-3 inline" /> then &quot;Add to Home Screen&quot;
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 text-muted-foreground" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}
