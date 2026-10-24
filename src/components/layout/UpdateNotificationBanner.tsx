import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, X, Sparkles } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { checkForAppUpdates, UpdateInfo } from '../../utils/updateChecker';

export const UpdateNotificationBanner: React.FC = () => {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Esegui il check degli aggiornamenti APK solo su app nativa Android
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let mounted = true;
    const runCheck = (force = false) => {
      checkForAppUpdates(force).then((res) => {
        if (mounted && res && res.hasUpdate) {
          setUpdate(res);
          setIsDismissed(false);
        }
      });
    };

    runCheck(false);

    const handleForceCheck = () => runCheck(true);
    window.addEventListener('alpiof:check-update', handleForceCheck);

    return () => {
      mounted = false;
      window.removeEventListener('alpiof:check-update', handleForceCheck);
    };
  }, []);

  if (!Capacitor.isNativePlatform() || !update || !update.hasUpdate || isDismissed) {
    return null;
  }

  const handleDownload = () => {
    const targetUrl = update.apkDownloadUrl || update.releaseUrl;
    window.open(targetUrl, '_system');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/95 border border-sky-500/40 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Bottone Chiudi in alto a destra */}
        <button
          onClick={() => setIsDismissed(true)}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icona in evidenza */}
        <div className="relative mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/30 to-indigo-500/30 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/20">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        {/* Titolo & Versione */}
        <div className="inline-block px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold mb-2">
          Nuova Versione Disponibile
        </div>

        <h3 className="text-xl font-bold text-slate-50 mb-1">
          Al piöf v{update.latestVersion}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-6 px-2">
          {update.releaseNotes
            ? update.releaseNotes.slice(0, 140) + (update.releaseNotes.length > 140 ? '...' : '')
            : "È pronto un nuovo aggiornamento con correzioni e miglioramenti per la tua app meteorologica."}
        </p>

        {/* Pulsanti Azione */}
        <div className="space-y-2.5">
          <button
            onClick={handleDownload}
            type="button"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
            <span>Scarica Aggiornamento (.apk)</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            type="button"
            className="w-full py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Continua senza aggiornare
          </button>
        </div>
      </div>
    </div>
  );
};
