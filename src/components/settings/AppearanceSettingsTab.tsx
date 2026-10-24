import React from 'react';
import { Check, Pipette } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { THEME_PALETTES } from '../../utils/themePalettes';
import type { AppTheme, AppFont, SurfaceStyle, AccentColor } from '../../types/weather.types';

export const AppearanceSettingsTab: React.FC = () => {
  const { preferences, updatePreferences } = useAppStore();

  // Le anteprime leggono direttamente le palette reali: quello che vedi e' quello che ottieni
  const themeList: { id: Exclude<AppTheme, 'custom' | 'slate' | 'swiss'>; label: string }[] = [
    { id: 'dynamic', label: 'Atmosferico' },
    { id: 'light', label: 'Ghiaccio Light' },
    { id: 'warm_paper', label: 'Carta Calda' },
    { id: 'rose_milk', label: 'Quarzo Rosa' },
    { id: 'cyberpink', label: 'Notte Berry' },
    { id: 'forest', label: 'Abete Alpino' },
    { id: 'ocean', label: 'Blu Abisso' },
    { id: 'oled', label: 'Nero OLED' },
  ];
  const themes = themeList.map((t) => {
    const p = THEME_PALETTES[t.id];
    return {
      ...t,
      bgPreview: p.bgApp,
      cardPreview: p.neutral[900],
      textPreview: p.neutral[100],
      mutedPreview: p.neutral[400],
    };
  });

  const quickCustomBgs = [
    '#fce7f3', '#ede9fe', '#d1fae5', '#ffedd5', '#fef3c7', '#1e1b4b', '#3b0718', '#111827',
  ];

  const accents: { id: AccentColor; label: string; hex: string }[] = [
    { id: 'sky', label: 'Azzurro', hex: '#38bdf8' },
    { id: 'pink', label: 'Rosa Shock', hex: '#f43f5e' },
    { id: 'emerald', label: 'Smeraldo', hex: '#10b981' },
    { id: 'amber', label: 'Ambra', hex: '#f59e0b' },
    { id: 'violet', label: 'Viola', hex: '#a855f7' },
    { id: 'rose', label: 'Rosso', hex: '#e11d48' },
  ];

  const fonts: { id: AppFont; label: string; sample: string; family: string }[] = [
    { id: 'technical', label: 'Strumentale', sample: '18.4°C', family: '"Space Grotesk", sans-serif' },
    { id: 'mono', label: 'Full Mono', sample: '18.4°C', family: '"JetBrains Mono", monospace' },
    { id: 'serif', label: 'Editoriale Serif', sample: '18.4°C', family: '"Playfair Display", serif' },
    { id: 'rounded', label: 'Soft Rounded', sample: '18.4°C', family: '"Quicksand", sans-serif' },
    { id: 'editorial', label: 'Clean Sans', sample: '18.4°C', family: '"Plus Jakarta Sans", sans-serif' },
  ];

  const surfaces: { id: SurfaceStyle; label: string }[] = [
    { id: 'glass', label: 'Vetro Satinato' },
    { id: 'flat', label: 'Piatto' },
    { id: 'contrast', label: 'Bordo Accento' },
  ];

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* 1. Preset Sfondo + Colore Libero */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            1. Sfondo &amp; Tema (Tocca per anteprima live)
          </label>
          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 font-bold text-[11px] cursor-pointer shadow-sm">
            <Pipette className="w-3 h-3" />
            <span>Scegli Colore Sfondo</span>
            <input
              type="color"
              value={preferences.customBgColor || '#fce7f3'}
              onChange={(e) => updatePreferences({ theme: 'custom', customBgColor: e.target.value })}
              className="sr-only"
            />
          </label>
        </div>

        {/* Palette rapida tinte personalizzate */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-slate-400 shrink-0 mr-1">Tinte rapide:</span>
          {quickCustomBgs.map((hex) => {
            const active = preferences.theme === 'custom' && preferences.customBgColor?.toLowerCase() === hex;
            return (
              <button
                key={hex}
                type="button"
                onClick={() => updatePreferences({ theme: 'custom', customBgColor: hex })}
                style={{ backgroundColor: hex }}
                className={`w-6 h-6 rounded-full shrink-0 border transition-transform ${
                  active ? 'scale-110 ring-2 ring-sky-400 border-white' : 'border-slate-600/60'
                }`}
                title={`Sfondo ${hex}`}
              />
            );
          })}
        </div>

        {/* Griglia Preset Curati */}
        <div className="grid grid-cols-4 gap-1.5">
          {themes.map((t) => {
            const isSelected = preferences.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updatePreferences({ theme: t.id })}
                style={{ background: t.bgPreview, color: t.textPreview }}
                className={`p-2 rounded-xl text-left border transition-all relative overflow-hidden ${
                  isSelected ? 'ring-2 ring-sky-400 border-sky-400 scale-[1.02]' : 'border-slate-700/60 opacity-90'
                }`}
                type="button"
              >
                <div
                  style={{ backgroundColor: t.cardPreview, color: t.textPreview }}
                  className="px-1.5 py-1 rounded-md text-[10px] font-bold mb-1 flex items-center justify-between shadow-sm"
                >
                  <span>
                    18° <span style={{ color: t.mutedPreview }} className="font-medium">9°</span>
                  </span>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                <div className="text-[10px] font-bold truncate leading-tight">{t.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Colore di Contrasto / Accento */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            2. Colore di Contrasto (Accento)
          </label>
          <label className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-semibold cursor-pointer">
            <Pipette className="w-3 h-3 text-sky-400" />
            <span>Colore Libero</span>
            <input
              type="color"
              value={preferences.customAccentColor || '#f43f5e'}
              onChange={(e) => updatePreferences({ accentColor: 'custom', customAccentColor: e.target.value })}
              className="sr-only"
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {accents.map((a) => {
            const isSelected = preferences.accentColor === a.id;
            return (
              <button
                key={a.id}
                onClick={() => updatePreferences({ accentColor: a.id })}
                className={`p-2 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected ? 'border-sky-400 ring-1 ring-sky-400/50 bg-slate-800/80' : 'border-slate-800 bg-slate-950/50'
                }`}
                type="button"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span style={{ backgroundColor: a.hex }} className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" />
                  <span className="text-[11px] font-semibold text-white truncate">{a.label}</span>
                </div>
                {isSelected && <Check className="w-3 h-3 text-sky-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Carattere Tipografico */}
      <div>
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
          3. Carattere Tipografico
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {fonts.map((f) => {
            const isSelected = preferences.font === f.id;
            return (
              <button
                key={f.id}
                onClick={() => updatePreferences({ font: f.id })}
                style={{ fontFamily: f.family }}
                className={`p-2 rounded-xl text-center border transition-all ${
                  isSelected ? 'border-sky-400 bg-sky-500/15 ring-1 ring-sky-400/50' : 'border-slate-800 bg-slate-950/50'
                }`}
                type="button"
              >
                <div className="text-sm font-bold text-white leading-tight">{f.sample}</div>
                <div className="text-[10px] text-slate-300 truncate mt-0.5">{f.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Stile Bordi Card */}
      <div>
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
          4. Finitura Card
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {surfaces.map((s) => {
            const isSelected = preferences.surfaceStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => updatePreferences({ surfaceStyle: s.id })}
                className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                  isSelected ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold' : 'bg-slate-950/50 border-slate-800 text-slate-400'
                }`}
                type="button"
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
