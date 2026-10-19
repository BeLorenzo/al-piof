import { useAppStore } from './store/useAppStore';
import { useWeatherData } from './hooks/useWeatherData';
import { getWmoInfo } from './utils/wmoCodes';
import { CloudRain, Wind, MapPin, Sparkles } from 'lucide-react';

export default function App() {
  const { selectedLocation, selectedModel } = useAppStore();
  const { data, isLoading, isError, error } = useWeatherData(
    selectedLocation,
    selectedModel
  );

  const curWmo = data ? getWmoInfo(data.current.weatherCode, data.current.isDay) : null;
  const WmoIcon = curWmo?.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <CloudRain className="w-7 h-7 text-sky-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Al piöf</h1>
              <p className="text-xs text-slate-400">Previsioni ad Alta Risoluzione · Nord Italia & Alpi</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-sky-950/70 border border-sky-800/60 text-sky-300 rounded-full font-medium">
            {selectedModel}
          </span>
        </header>

        <div className="flex items-center gap-2 text-slate-300 text-sm mb-4">
          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-100">{selectedLocation.name}</span>
          {selectedLocation.elevation && (
            <span className="text-xs text-slate-500">({selectedLocation.elevation} m)</span>
          )}
        </div>

        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Caricamento modelli ICON/ECMWF...</span>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300">
            Errore caricamento dati: {(error as Error)?.message || 'Errore di rete'}
          </div>
        )}

        {data && curWmo && WmoIcon && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-3">
                <WmoIcon className={`w-10 h-10 ${curWmo.colorClass}`} />
                <div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {data.current.temperature}°
                  </div>
                  <div className="text-xs text-slate-400">{curWmo.label}</div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 space-y-1">
                <div>Percepita: <span className="text-slate-200">{data.current.apparentTemperature}°</span></div>
                <div className="flex items-center gap-1 justify-end">
                  <Wind className="w-3.5 h-3.5 text-slate-400" />
                  <span>{data.current.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {data.airQuality && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/40 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">Qualità Aria (EAQI):</span>
                </div>
                <span className={`font-semibold ${data.airQuality.colorClass}`}>
                  {data.airQuality.europeanAqi} - {data.airQuality.label}
                </span>
              </div>
            )}

            <div className="text-center text-[11px] text-slate-500 pt-2">
              Setup Fase 1 completato con successo (7 giorni, 24h normalizzate).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
