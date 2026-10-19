# Playbook Operativo per Antigravity (Gemini 3.8 Flash & Gemini 4 Argon)

Questo documento contiene la strategia di selezione del modello dentro Antigravity e i prompt passo-passo da incollare nella chat dell'agente.

---

## 1. Strategia Modelli: Quando usare 3.8 Flash vs 4 Argon

Poiché tutte le scelte architetturali e gli endpoint sono già codificati in `@[GEMINI.md](GEMINI.md)`, **non sprecare la quota di Gemini 4 Argon** per il boilerplate o i componenti grafici. Segui questa divisione:

| Fase | Modello Consigliato | Perché |
| :--- | :--- | :--- |
| **Fase 1: Setup & Data Layer (Step 1-3)** | **Gemini 4 Argon** *(con `/plan`)* | Eccellente per strutturare senza errori la normalizzazione parallela delle API (`forecast` + `air-quality` + raggruppamento orario per giorno) e i tipi TypeScript. |
| **Fase 2: UI Hero, Sticky Bar & Lista Oraria (Step 4-5)** | **Gemini 3.8 Flash** | Velocissimo nello scrivere componenti React + Tailwind, cablare lo store Zustand e verificare il layout nel browser integrato di Antigravity. |
| **Fase 3: Mappa Radar Dual-Engine (Step 6)** | **Gemini 4 Argon** *(o 3.8 Flash)* | Utile Argon per configurare al primo colpo la proiezione EPSG:3857 del layer WMS della Protezione Civile su MapLibre GL. |
| **Fase 4: Rifinitura, Browser Check & APK (Step 7)** | **Gemini 3.8 Flash** | Perfetto per lanciare il dev server, ispezionare il rendering mobile nel browser di Antigravity e lanciare la skill `/build-apk`. |

---

## 2. Prompt da Copiare e Incollare in Antigravity

### FASE 1 — Setup, Tipi, API e Store (Seleziona: Gemini 4 Argon)
Incolla questo prompt nella chat di Antigravity:

```text
/plan Leggi @[GEMINI.md](GEMINI.md). Dobbiamo eseguire la Fase 1 del progetto (fondamenta, layer API e stato):
1. Inizializza nella root il progetto React + Vite + TypeScript + Tailwind CSS e installa tutte le dipendenze necessarie (@tanstack/react-query, zustand, lucide-react, date-fns, clsx, tailwind-merge, maplibre-gl, @capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/geolocation).
2. Configura un .gitignore pulito per Git (node_modules, dist, .env*, android/app/build, android/.gradle, *.apk) e crea capacitor.config.ts.
3. Crea src/types/weather.types.ts, src/utils/wmoCodes.ts, src/utils/aqiScale.ts e src/utils/windUtils.ts.
4. Implementa src/api/weatherApi.ts, src/api/airQualityApi.ts, src/api/geocodingApi.ts e l'hook src/hooks/useWeatherData.ts che esegue il fetch combinato e raggruppa i dati orari per ciascuno dei 7 giorni.
5. Crea lo store persistito src/store/useAppStore.ts (con Milano, Lugano e Roma come preferiti iniziali di default).
Verifica alla fine che `tsc --noEmit` passi senza alcun errore.
```

---

### FASE 2 — Header, Hero con Qualità dell'Aria e Lista Oraria Verticale (Seleziona: Gemini 3.8 Flash)
Apri una **nuova conversazione** (per mantenere il contesto pulito e veloce) e incolla:

```text
/plan Seguendo le specifiche di @[GEMINI.md](GEMINI.md), implementa i componenti UI della schermata principale:
1. Header.tsx, FavoritesBar.tsx e LocationSearchModal.tsx (con ricerca Open-Meteo debounced a 300ms, stellina preferiti, pulsante GPS con reverse geocoding e selettore del modello matematico Auto / MeteoSwiss / ECMWF / ICON-D2).
2. HeroSummary.tsx, AirQualityCard.tsx e NowcastBanner.tsx: mostra il riepilogo dinamico (meteo attuale + max/min se Oggi, oppure riepilogo del giorno futuro selezionato) e la Bento Grid con Qualità dell'Aria (EAQI, PM10, PM2.5, pollini), Zero Termico, Vento/UV e Alba/Tramonto.
3. StickyDayBar.tsx e QuickHourScrubber.tsx: barra sticky allo scroll con carosello dei 7 giorni, toggle vista [Lista Oraria | Grafico | Mappa Radar] e barra rapida per saltare alle ore (00, 06, 12, 18 + slider orario).
4. HourlyVerticalList.tsx, HourlyRow.tsx (24 righe verticali espandibili al tap con barra pioggia in mm e freccia vento ruotata) e HourlyChart.tsx.
Verifica con `npm run build` che non ci siano errori.
```

---

### FASE 3 — Radar Interattivo, Controllo Visivo Browser e Preparazione APK (Seleziona: Gemini 3.8 Flash o 4 Argon)
Incolla nella chat:

```text
Seguendo @[GEMINI.md](GEMINI.md):
1. Implementa src/components/radar/RadarSection.tsx con NativeMapLibreRadar.tsx (mappa scura MapLibre + layer WMS Protezione Civile it:VMI con slider opacità) e WindyRadarEmbed.tsx (iframe centrato sulle coordinate attive con barra temporale Play/Pausa e previsione +1h).
2. Collega RadarSection.tsx in App.tsx in modo che sia visibile sia cliccando sul toggle "Mappa Radar" nella StickyDayBar, sia scrollando in fondo sotto la lista delle 24 ore.
3. Avvia il server di sviluppo, apri l'app nel browser integrato con viewport mobile (390x844), verifica visivamente che la Hero, lo scroll delle righe orarie, il cambio giorno e il radar funzionino perfettamente.
4. Esegui la skill `/build-apk` per sincronizzare la piattaforma Android con Capacitor e generare il README.md con le istruzioni Git e APK.
```