import React, { useState, useEffect } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface RefreshStatusBarProps {
  updatedAt?: string;
  isFetching: boolean;
  onRefresh: () => void;
}

export const RefreshStatusBar: React.FC<RefreshStatusBarProps> = ({
  updatedAt,
  isFetching,
  onRefresh,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  let formattedTime = '--:--';
  if (updatedAt) {
    try {
      formattedTime = format(parseISO(updatedAt), 'HH:mm');
    } catch {
      formattedTime = updatedAt;
    }
  }

  return (
    <div className="w-full">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-center gap-2 animate-fade-in">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Dispositivo offline &bull; Dati meteo salvati in cache locale</span>
        </div>
      )}

      {/* Timestamp & Refresh Controls */}
      <div className="px-4 py-1.5 bg-slate-950/70 border-b border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dati sincronizzati alle {formattedTime}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 disabled:opacity-50 transition-colors font-medium px-2 py-0.5 rounded-md hover:bg-slate-900"
          type="button"
          title="Aggiorna previsioni"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? 'Aggiornamento...' : 'Aggiorna'}</span>
        </button>
      </div>
    </div>
  );
};
