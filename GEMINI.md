# GEMINI.md - Regole di Progetto Always-On (SwissWeather IT)

Questo file definisce l'architettura, i contratti dati e gli standard di codice per **SwissWeather IT**. Deve essere rispettato rigorosamente in ogni modifica al codice.

---

## 1. Obiettivo e Stack Tecnologico
Web App mobile-first e applicazione Android nativa (`.apk` tramite Ionic Capacitor) per previsioni meteo ad alta precisione, priva di pubblicità, basata sui modelli **MeteoSwiss (ICON-CH1/CH2)** ed **ECMWF**.

- **Framework:** React 18+ con Vite e TypeScript (`strict: true`, zero `any`).
- **Mobile Runtime:** Ionic Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/geolocation`).
- **Styling:** Tailwind CSS + `clsx` + `tailwind-merge` (tema Dark `slate-950`, superfici `bg-slate-900/75 backdrop-blur-md border border-slate-800/80`).
- **Data Fetching:** `@tanstack/react-query` (`staleTime: 600000` ms = $10\text{ min}$, `gcTime: 3600000` ms = $60\text{ min}$).
- **State Management:** `zustand` con middleware `persist` su `localStorage`.
- **Mappe & Radar:** `maplibre-gl` (layer WMS/WMTS nativi) + Iframe API Windy per il nowcasting predittivo.
- **Icone & Date:** `lucide-react` + componenti SVG meteo mappati su codici WMO + `date-fns` (locale `it`).

---

## 2. Struttura Modulare Obbligatoria
Ogni file componente deve avere una singola responsabilità e non superare le $180\text{--}200$ righe.

```text
├── .agents/
│   └── skills/
│       └── build-apk/
│           └── SKILL.md           # Skill Antigravity per build e sync Android
├── .github/
│   └── workflows/
│       └── build-apk.yml          # Compilazione automatica APK su GitHub Actions
├── src/
│   ├── api/
│   │   ├── weatherApi.ts          # Chiamate Open-Meteo Forecast
│   │   ├── airQualityApi.ts       # Chiamate Open-Meteo CAMS Air Quality
│   │   └── geocodingApi.ts        # Ricerca località e Reverse Geocoding GPS
│   ├── components/
│   │   ├── layout/                # Header.tsx, FavoritesBar.tsx
│   │   ├── hero/                  # HeroSummary.tsx, AirQualityCard.tsx, NowcastBanner.tsx
│   │   ├── forecast/              # StickyDayBar.tsx, QuickHourScrubber.tsx, HourlyVerticalList.tsx, HourlyRow.tsx, HourlyChart.tsx
│   │   ├── radar/                 # RadarSection.tsx, NativeMapLibreRadar.tsx, WindyRadarEmbed.tsx
│   │   └── search/                # LocationSearchModal.tsx
│   ├── hooks/
│   │   ├── useWeatherData.ts      # Hook combinato Meteo + Aria normalizzato per giorno
│   │   └── useGeolocation.ts      # Gestione permessi e coordinate GPS
│   ├── store/
│   │   └── useAppStore.ts         # Stato persistito (preferiti, modello, vista, giorno attivo)
│   ├── types/
│   │   └── weather.types.ts       # Interfacce TypeScript API e dominio
│   └── utils/
│       ├── wmoCodes.ts            # Mappa codici WMO -> Label IT, Icona, Colori
│       ├── aqiScale.ts            # Mappa EAQI -> Livelli qualità aria e colori
│       └── windUtils.ts           # Conversione gradi -> Rosa dei venti (N, NE, NW...)
```

---

## 3. Contratti API (Gratuiti, No API Key)

### 3.1 Meteo & Modelli (`weatherApi.ts`)
- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Modelli selezionabili (`models`):**
  - `best_match` (Default: usa ICON-CH1/CH2 a $1\text{--}2\text{ km}$ sul Nord Italia/Alpi e fa blend con ECMWF)
  - `meteoswiss_icon_ch2` (MeteoSvizzera puro)
  - `ecmwf_ifs025` (Centro Europeo ECMWF)
  - `icon_d2` (DWD Alta Risoluzione)
- **Query Params:**
  - `latitude`, `longitude`, `models`, `timezone=auto`, `forecast_days=7`
  - `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m`
  - `minutely_15=precipitation`
  - `hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,freezing_level_height,relative_humidity_2m,visibility`
  - `daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max`

### 3.2 Qualità dell'Aria (`airQualityApi.ts`)
- **URL:** `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Query Params:**
  - `latitude`, `longitude`, `timezone=auto`, `forecast_days=5`
  - `current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`
  - `hourly=european_aqi,pm10,pm2_5`
- **Soglie `european_aqi`:** $0\text{--}20$ Buona (Verde), $20\text{--}40$ Discreta (Lime), $40\text{--}60$ Moderata (Giallo), $60\text{--}80$ Scarsa (Arancione), $80\text{--}100$ Molto Scarsa (Rosso), $>100$ Estrema (Viola).

### 3.3 Geocoding (`geocodingApi.ts`)
- **Search:** `https://geocoding-api.open-meteo.com/v1/search?name={q}&count=10&language=it&format=json`
- **Reverse GPS:** `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=it`

### 3.4 Regola Radar (`RadarSection.tsx`)
- **VIETATO usare RainViewer API** (piano gratuito deprecato/limitato).
- Implementare sempre il doppio tab:
  1. **Radar + Nowcast $+1\text{h}$ (Windy Embed):** `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=9&overlay=radar&product=radar&level=surface&lat=${lat}&lon=${lon}`
  2. **Mappa Nativa DPC (MapLibre GL):** Base map `CartoDB Dark Matter` + layer WMS `https://radar-geowebcache.protezionecivile.it/service/wms` (`layers=it:VMI`, `format=image/png`, `transparent=true`, `version=1.1.1`, `srs=EPSG:3857`).

---

## 4. Specifiche Layout Mobile-First (Flusso Verticale)
1. **Top Bar & Preferiti:** Nome località + quota ($\text{m s.l.m.}$), stella preferiti, bottone GPS, lente ricerca, selettore rapido Modello (`Auto` | `MeteoSwiss` | `ECMWF` | `ICON-D2`), seguito dalla barra scorrevole orizzontale dei preferiti.
2. **Hero Riassuntiva Dinamica:**
   - Mostra stato attuale (se selezionato "Oggi") o il riassunto del giorno selezionato (se selezionato un giorno futuro: $\text{Max}^\circ/\text{Min}^\circ$, condizione prevalente, somma $\text{mm}$ pioggia, raffica max).
   - **Bento Grid Località:** Card Qualità dell'Aria (`EAQI`, $\text{PM}_{10}$, $\text{PM}_{2.5}$ in $\mu\text{g/m}^3$, pollini), Card Zero Termico ($\text{m}$) e Pressione ($\text{hPa}$), Card Vento/UV, Card Alba/Tramonto.
   - **Nowcast 15-min:** Visibile se piove nelle prossime $2\text{h}$.
3. **Sticky Control Bar (Fissata in alto allo scroll):**
   - **Selettore 7 Giorni:** Card giornaliere con icona, $\text{Max}^\circ/\text{Min}^\circ$ e $\text{mm}$ pioggia.
   - **Toggle Vista & Radar:** `[ ☰ Lista Oraria | 📈 Grafico | 📡 Mappa Radar ]`.
   - **Barra Rapida Ore (Time Scrubber):** Pulsanti fascia (`00`, `06`, `12`, `18`) + slider continuo `00:00 -> 23:00` che scorre fino alla riga oraria corrispondente.
4. **Lista Oraria Verticale (`00:00 - 23:00`):**
   - 24 righe compatte con 5 colonne: `Ora` | `Icona + Meteo` | `Temp (Percepita)` | `Pioggia (% + mm con barra visiva)` | `Vento (km/h + freccia orientata in gradi)`.
   - Tap sulla riga: apre accordion con Zero Termico, Umidità, Raffiche, Copertura Nuvolosa, UV e AQI orario.
5. **Sezione Mappa Radar:**
   - Visibile sia attivando il toggle `📡 Mappa Radar` in alto, sia scrollando in fondo sotto le 24 ore.