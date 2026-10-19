# 🌧️ Al piöf — Previsioni Meteo ad Alta Risoluzione

Web App mobile-first e applicazione nativa Android (`.apk` tramite Ionic Capacitor) per previsioni meteorologiche ad alta precisione, senza pubblicità, ottimizzata per il **Nord Italia e l'arco alpino**.

Basata sull'integrazione parallela dei modelli ad altissima risoluzione **MeteoSwiss (ICON-CH1/CH2 a 1-2 km)**, **ICON-D2 (DWD a 2.2 km)** e **ECMWF IFS 0.25 (Centro Europeo)**.

---

## 🚀 Caratteristiche Principali

1. **Confronto Modelli Trasparente & Affidabilità Calibrata:**
   - Visualizzazione trasparente dei valori grezzi dei 3 modelli indipendenti (MeteoSwiss, ECMWF, ICON-D2) per temperatura massima, minima, oraria e precipitazioni.
   - Algoritmo di concordanza calibrato realisticamente con decadimento temporale (lead-time penalty):
     - `Oggi`: brevissimo termine (0-24h) &rarr; massima precisione strumentale e radar.
     - `Giorni 1-4`: breve e medio termine (modelli ad alta risoluzione attivi).
     - `Giorni 5-6`: tendenza a lungo termine &rarr; indicazione onesta dell'incertezza naturale fisiologica dell'atmosfera.
2. **Ricerca Ibrida Comunale & Indirizzo (Vie e Quartieri):**
   - Doppia integrazione: **Open-Meteo Geocoding** (per comuni con quota m s.l.m. e popolazione) + **OpenStreetMap Nominatim** (per vie, corsi, piazze e quartieri come *Milano Bicocca*, *Corso Buenos Aires*, *Navigli*, *San Siro*).
   - Consente ai modelli a 1-2 km di campionare la cella atmosferica esatta del quartiere invece del baricentro generico.
3. **Radar Precipitazioni Dual-Engine (con Anti Scroll-Trap su Mobile):**
   - **Windy Nowcast (+1h):** iframe interattivo con barra temporale e nowcasting predittivo sui 60 minuti successivi.
   - **Mappa Nativa DPC (MapLibre GL JS):** basemap scura *CartoDB Dark Matter* + overlay WMS ad alta risoluzione del *Dipartimento della Protezione Civile* (`it:VMI`) con slider di opacità e ricentramento.
   - **Anti Scroll-Trap:** la mini-anteprima in fondo alla home disabilita il pan involontario col pollice e offre un pulsante per espandere la mappa a schermo intero.
4. **Hero Dinamica & Bento Grid:**
   - Sintesi testuale smart deterministica del giorno.
   - Pressione barica con freccia di tendenza & Punto di Rugiada con classificazione del comfort (*Secco, Gradevole, Umido, Afoso*).
   - Effemeridi **Sole & Luna** ([SunCalc](https://github.com/mourner/suncalc)): alba, tramonto, fase lunare in italiano, % illuminazione e orari luna.
   - Indice UV su scala ufficiale OMS `/11` con progress bar colorata.
   - Qualità dell'aria **EAQI** con dettagli PM10, PM2.5 e concentrazione pollini (*Betulla, Graminacee, Ambrosia, Olivo...*).
5. **Grafico Orario & Tabella 24 Ore:**
   - Lista verticale densa (00:00 - 23:00) con indicatori semantici di concordanza e accordion espandibile.
   - Grafico orario SVG a due corsie separate (temperatura in alto, pioggia in basso) senza sovrapposizioni.
6. **Almanacco Storico ("Questo giorno negli anni passati"):**
   - Confronto retrospettivo con lo stesso giorno degli ultimi 5 anni e calcolo dell'anomalia termica rispetto alla media recente.
7. **Barra di Sincronizzazione & Supporto Offline:**
   - Timestamp dell'ultimo aggiornamento e rilevamento automatico dello stato offline con dati in cache locale.

---

## 📱 Applicazione Android (.apk)

Il pacchetto Android nativo è configurato e compilato con **Ionic Capacitor 6** e **Gradle 8.8**:
- **Percorso file APK compilato in locale:**
  ```text
  android/app/build/outputs/apk/debug/app-debug.apk
  ```
- **Compilazione automatica su GitHub Actions:**
  Basta eseguire `git push` su `master`: il workflow `.github/workflows/build-apk.yml` compilerà automaticamente l'APK rendendolo scaricabile dalla sezione Actions.

### Comandi Utili per lo Sviluppo

```bash
# Avvio del server di sviluppo Vite
npm run dev

# Controllo tipi e build web di produzione
npm run build

# Sincronizzazione asset web con la piattaforma Android
npx cap sync android

# Apertura del progetto nativo in Android Studio
npx cap open android
```

---

## 🛠️ Stack Tecnologico

- **Frontend:** React 18, Vite, TypeScript (`strict: true`), Tailwind CSS
- **Mobile Engine:** Ionic Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/geolocation`)
- **Stato & Cache:** Zustand (persistenza `localStorage`), TanStack React Query
- **Mappe & GIS:** MapLibre GL JS, OpenStreetMap Nominatim, Open-Meteo APIs, DPC Geowebcache WMS, Windy API
- **Calcolo Astronomico & Date:** SunCalc, Date-fns (locale `it`)
- **Icone:** Lucide React
