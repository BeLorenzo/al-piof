import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, X, Sparkles } from 'lucide-react';
import { checkForAppUpdates, UpdateInfo } from '../../utils/updateChecker';

export const UpdateNotificationBanner: React.FC = () => {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkForAppUpdates().then((res) => {
      if (mounted && res && res.hasUpdate) {
        setUpdate(res);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!update || !update.hasUpdate || isDismissed) {
    return null;
  }

  const handleDownload = () => {
    const targetUrl = update.apkDownloadUrl || update.releaseUrl;
    window.open(targetUrl, '_system');
  };

  return (
    <div className="px-4 py-1.5 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-2xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-sky-500/20 border border-sky-400/40 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-xl bg-sky-500/30 text-sky-300 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5 truncate">
              <span>Nuova versione v{update.latestVersion}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/30 text-sky-200">
                Disponibile
              </span>
            </div>
            <div className="text-[10px] text-slate-300 truncate">
              Tocca per scaricare l'aggiornamento
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDownload}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Aggiorna</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            type="button"
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Chiudi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
