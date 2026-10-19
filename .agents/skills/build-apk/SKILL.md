---
name: build-apk
description: Valida TypeScript, esegue la build di produzione Vite, inizializza o sincronizza il progetto Android con Capacitor e compila il file APK se l'SDK Android è presente.
---

# Istruzioni Skill: Build & Sync Android APK

Quando l'utente invoca `/build-apk` o chiede di preparare il pacchetto Android `.apk`, esegui rigorosamente questi passaggi in sequenza:

## 1. Validazione TypeScript e Build Web
1. Esegui il controllo rigoroso dei tipi:
   ```bash
   npx tsc --noEmit
   ```
   Se emergono errori TypeScript, correggili prima di proseguire.
2. Compila il bundle di produzione web nella cartella `dist/`:
   ```bash
   npm run build
   ```

## 2. Configurazione e Sincronizzazione Capacitor Android
1. Controlla se la cartella `android/` esiste nella root del progetto.
   - Se **non esiste**, aggiungila con:
     ```bash
     npx cap add android
     ```
2. Sincronizza gli asset web (`dist/`) e i plugin nativi (`@capacitor/geolocation`) dentro il progetto Android:
   ```bash
   npx cap sync android
   ```

## 3. Verifica Permessi Android (`AndroidManifest.xml`)
Assicurati che il file `android/app/src/main/AndroidManifest.xml` contenga i permessi necessari per il GPS e per il caricamento delle mappe radar via internet:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## 4. Compilazione Locale o Tramite GitHub Actions
1. Verifica se sulla macchina locale sono configurati Java (`java -version`) e `ANDROID_HOME`.
2. Se l'ambiente Android locale è disponibile, compila direttamente l'APK:
   ```bash
   cd android && chmod +x gradlew && ./gradlew assembleDebug
   ```
   E comunica all'utente il percorso del file generato: `android/app/build/outputs/apk/debug/app-debug.apk`.
3. Se l'SDK Android non è installato in locale, informa l'utente che la cartella `android/` è pronta e sincronizzata e che gli basta eseguire `git add . && git commit -m "chore: sync android" && git push` per far compilare automaticamente il file `AlPiof-debug.apk` dalla GitHub Action `.github/workflows/build-apk.yml`.