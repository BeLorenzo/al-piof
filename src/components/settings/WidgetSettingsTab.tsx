import React from 'react';
import { Smartphone, Check, CloudRain, Wind, Leaf, Sun, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { WidgetTheme } from '../../types/weather.types';

export const WidgetSettingsTab: React.FC = () => {
  const { preferences, updatePreferences, selectedLocation } = useAppStore();
  const widgetConfig = preferences.widgetConfig || {
    theme: 'slate_dark',
    showRain: true,
    showWind: true,
    showAqi: true,
    showUv: true,
  };

  const handleUpdate = (partial: Partial<typeof widgetConfig>) => {
    updatePreferences({
      widgetConfig: {
        ...widgetConfig,
        ...partial,
      },
    });
  };

  const themes: { id: WidgetTheme; label: string; previewBg: string; border: string; text: string }[] = [
    { id: 'slate_dark', label: 'Scuro Slate', previewBg: 'bg-slate-900', border: 'border-slate-700', text: 'text-slate-100' },
    { id: 'rose_milk', label: 'Quarzo Rosa', previewBg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-950' },
    { id: 'oled', label: 'Nero Oled', previewBg: 'bg-black', border: 'border-zinc-800', text: 'text-white' },
    { id: 'glass', label: 'Vetro Frosted', previewBg: 'bg-slate-800/80 backdrop-blur-md', border: 'border-slate-600', text: 'text-slate-100' },
    { id: 'light', label: 'Chiaro Minimal', previewBg: 'bg-white', border: 'border-slate-300', text: 'text-slate-900' },
  ];

  // Dynamic preview styling based on theme
  const getThemeStyle = () => {
    switch (widgetConfig.theme) {
      case 'rose_milk':
        return {
          container: 'bg-rose-100 border-rose-300 text-rose-950',
          city: 'text-rose-600',
          time: 'text-rose-700',
          temp: 'text-rose-950',
          desc: 'text-rose-900',
          chipBg: 'bg-rose-200/80 border-rose-300/80',
          chipText: 'text-rose-900',
        };
      case 'oled':
        return {
          container: 'bg-black border-zinc-800 text-white',
          city: 'text-sky-400',
          time: 'text-zinc-500',
          temp: 'text-white',
          desc: 'text-zinc-400',
          chipBg: 'bg-zinc-900 border-zinc-800',
          chipText: 'text-zinc-300',
        };
      case 'light':
        return {
          container: 'bg-white border-slate-300 text-slate-900 shadow-md',
          city: 'text-sky-600',
          time: 'text-slate-500',
          temp: 'text-slate-900',
          desc: 'text-slate-600',
          chipBg: 'bg-slate-100 border-slate-200',
          chipText: 'text-slate-700',
        };
      case 'glass':
        return {
          container: 'bg-slate-800/90 border-slate-700 text-slate-100 backdrop-blur-md',
          city: 'text-sky-400',
          time: 'text-slate-400',
          temp: 'text-slate-100',
          desc: 'text-slate-300',
          chipBg: 'bg-slate-700/60 border-slate-600',
          chipText: 'text-slate-200',
        };
      default: // slate_dark
        return {
          container: 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl',
          city: 'text-sky-400',
          time: 'text-slate-400',
          temp: 'text-slate-100',
          desc: 'text-slate-300',
          chipBg: 'bg-slate-800 border-slate-700',
          chipText: 'text-slate-300',
        };
    }
  };

  const currentThemeStyle = getThemeStyle();

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      {/* Live Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            Anteprima Widget Schermata Home
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            Sincronizzato
          </span>
        </div>

        {/* 1:1 Phone Widget Container Preview */}
        <div className={`p-3 rounded-[20px] border transition-all duration-200 ${currentThemeStyle.container}`}>
          {/* Top Row: City & Desc on Left, Icon + Temp on Right */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-bold truncate ${currentThemeStyle.city}`}>
                {selectedLocation.name}
              </div>
              <div className={`text-[10px] truncate ${currentThemeStyle.desc}`}>
                Cielo sereno • Max 16° Min 6° • Perc. 15.5°
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-2xl">☀️</span>
              <div className="text-right">
                <div className={`text-xl font-extrabold tracking-tight num-tabular leading-tight ${currentThemeStyle.temp}`}>
                  15.5°
                </div>
                <div className={`text-[9px] ${currentThemeStyle.time}`}>12:50</div>
              </div>
            </div>
          </div>

          {/* Chips Row */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {widgetConfig.showRain && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9.5px] font-semibold ${currentThemeStyle.chipBg} ${currentThemeStyle.chipText}`}>
                <CloudRain className="w-2.5 h-2.5 text-sky-400" />
                <span>0% • 0mm</span>
              </div>
            )}
            {widgetConfig.showWind && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9.5px] font-medium ${currentThemeStyle.chipBg} ${currentThemeStyle.chipText}`}>
                <Wind className="w-2.5 h-2.5 text-slate-400" />
                <span>17 km/h</span>
              </div>
            )}
            {widgetConfig.showAqi && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9.5px] font-medium ${currentThemeStyle.chipBg} ${currentThemeStyle.chipText}`}>
                <Leaf className="w-2.5 h-2.5 text-emerald-400" />
                <span>AQI 26</span>
              </div>
            )}
            {widgetConfig.showUv && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9.5px] font-medium ${currentThemeStyle.chipBg} ${currentThemeStyle.chipText}`}>
                <Sun className="w-2.5 h-2.5 text-amber-400" />
                <span>UV 3</span>
              </div>
            )}
          </div>

          {/* Hourly strip preview if enabled */}
          {widgetConfig.showHourlyStrip && (
            <div className="mt-2.5 pt-2 border-t border-slate-700/50 grid grid-cols-4 gap-1 text-center">
              <div>
                <div className="text-[9px] text-slate-400">13:00</div>
                <div className="text-xs my-0.5">☀️</div>
                <div className="text-[10px] font-bold text-slate-200">16°</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400">14:00</div>
                <div className="text-xs my-0.5">☀️</div>
                <div className="text-[10px] font-bold text-slate-200">16°</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400">15:00</div>
                <div className="text-xs my-0.5">☀️</div>
                <div className="text-[10px] font-bold text-slate-200">16°</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400">16:00</div>
                <div className="text-xs my-0.5">☀️</div>
                <div className="text-[10px] font-bold text-slate-200">15°</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theme Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Stile &amp; Colore Sfondo
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleUpdate({ theme: t.id })}
              type="button"
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                widgetConfig.theme === t.id
                  ? 'border-sky-400 ring-2 ring-sky-400/30 font-bold bg-slate-800'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full border ${t.previewBg} ${t.border}`} />
                <span>{t.label}</span>
              </div>
              {widgetConfig.theme === t.id && (
                <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Toggles */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Informazioni Extra da Mostrare
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <span>Pioggia (probabilità % e accumulo mm)</span>
            </div>
            <input
              type="checkbox"
              checked={widgetConfig.showRain}
              onChange={(e) => handleUpdate({ showRain: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Wind className="w-4 h-4 text-indigo-400" />
              <span>Vento (velocità km/h)</span>
            </div>
            <input
              type="checkbox"
              checked={widgetConfig.showWind}
              onChange={(e) => handleUpdate({ showWind: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Qualità dell'Aria (EAQI)</span>
            </div>
            <input
              type="checkbox"
              checked={widgetConfig.showAqi}
              onChange={(e) => handleUpdate({ showAqi: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Indice UV (1 - 11)</span>
            </div>
            <input
              type="checkbox"
              checked={widgetConfig.showUv}
              onChange={(e) => handleUpdate({ showUv: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Andamento prossime 4 ore (se allarghi o alzi il widget)</span>
            </div>
            <input
              type="checkbox"
              checked={widgetConfig.showHourlyStrip ?? false}
              onChange={(e) => handleUpdate({ showHourlyStrip: e.target.checked })}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
          </label>
        </div>
      </div>

      {/* Guide Info */}
      <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 space-y-1">
        <div className="font-semibold text-sky-400 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" />
          Come aggiungere il Widget sul tuo Pixel:
        </div>
        <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-0.5 pt-0.5">
          <li>Tieni premuto su uno spazio vuoto della schermata Home.</li>
          <li>Tocca la voce <strong>Widget</strong>.</li>
          <li>Scorri fino a <strong>Al piöf</strong> e trascina il widget sulla schermata!</li>
        </ol>
      </div>
    </div>
  );
};
