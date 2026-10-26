package it.alpiof.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.util.Log;
import androidx.core.content.ContextCompat;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class WeatherWidgetUpdater {

    private static final String TAG = "WeatherWidgetUpdater";
    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();

    public static void fetchAndUpdateAsync(Context context) {
        final Context appContext = context.getApplicationContext();
        EXECUTOR.execute(() -> {
            try {
                fetchAndUpdateSync(appContext);
            } catch (Exception e) {
                Log.e(TAG, "Async widget update failed", e);
            }
        });
    }

    public static synchronized boolean fetchAndUpdateSync(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(
            WeatherWidgetProvider.PREFS_NAME,
            Context.MODE_PRIVATE
        );

        String lat = prefs.getString("lat", "45.4642");
        String lon = prefs.getString("lon", "9.1900");
        String model = prefs.getString("model", "best_match");
        boolean isCurrentLocation = prefs.getBoolean("isCurrentLocation", false);
        String cityName = prefs.getString("city", "Milano");

        // 1. Se modalità GPS attiva, controlla se c'è una fix recente di posizione
        if (isCurrentLocation) {
            boolean hasFine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
            boolean hasCoarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

            if (hasFine || hasCoarse) {
                LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
                if (lm != null) {
                    Location bestLoc = null;
                    List<String> providers = lm.getProviders(true);
                    for (String provider : providers) {
                        try {
                            Location loc = lm.getLastKnownLocation(provider);
                            if (loc != null) {
                                if (bestLoc == null || loc.getTime() > bestLoc.getTime()) {
                                    bestLoc = loc;
                                }
                            }
                        } catch (SecurityException ignored) {}
                    }

                    if (bestLoc != null) {
                        double newLat = bestLoc.getLatitude();
                        double newLon = bestLoc.getLongitude();
                        try {
                            double oldLat = Double.parseDouble(lat);
                            double oldLon = Double.parseDouble(lon);
                            float[] dist = new float[1];
                            Location.distanceBetween(oldLat, oldLon, newLat, newLon, dist);

                            // Se l'utente si è spostato di oltre 500m, aggiorna coordinate e località
                            if (dist[0] > 500) {
                                lat = String.format(Locale.US, "%.4f", newLat);
                                lon = String.format(Locale.US, "%.4f", newLon);
                                String reverseCity = reverseGeocode(newLat, newLon);
                                if (reverseCity != null && !reverseCity.trim().isEmpty()) {
                                    cityName = reverseCity;
                                }
                            }
                        } catch (NumberFormatException e) {
                            lat = String.format(Locale.US, "%.4f", newLat);
                            lon = String.format(Locale.US, "%.4f", newLon);
                        }
                    }
                }
            }
        }

        // 2. Fetch Forecast da Open-Meteo
        String forecastUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + lat
            + "&longitude=" + lon
            + "&models=" + model
            + "&timezone=auto&forecast_days=7"
            + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m"
            + "&hourly=temperature_2m,weather_code,precipitation_probability,precipitation"
            + "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,uv_index_max";

        String aqiUrl = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat
            + "&longitude=" + lon
            + "&timezone=auto&forecast_days=1&current=european_aqi";

        String forecastJsonStr = httpGet(forecastUrl, 10000);
        if (forecastJsonStr == null) {
            Log.w(TAG, "Forecast fetch failed, keeping previous widget state");
            return false;
        }

        String aqiJsonStr = httpGet(aqiUrl, 8000);

        try {
            JSONObject forecastObj = new JSONObject(forecastJsonStr);
            JSONObject current = forecastObj.optJSONObject("current");
            JSONObject daily = forecastObj.optJSONObject("daily");
            JSONObject hourly = forecastObj.optJSONObject("hourly");

            if (current == null || daily == null) {
                return false;
            }

            SharedPreferences.Editor editor = prefs.edit();

            editor.putString("lat", lat);
            editor.putString("lon", lon);
            editor.putString("city", cityName);

            // Temperatura e meteo attuale
            double curTemp = current.optDouble("temperature_2m", 15.0);
            int weatherCode = current.optInt("weather_code", 0);
            boolean isDay = current.optInt("is_day", 1) == 1;
            double apparentTemp = current.optDouble("apparent_temperature", curTemp);

            String iconEmoji = getEmojiForWmoCode(weatherCode, isDay);
            String desc = getLabelForWmoCode(weatherCode, isDay);
            String tempStr = Math.round(curTemp * 10.0) / 10.0 + "°";

            // Min/Max di oggi
            JSONArray tMaxArr = daily.optJSONArray("temperature_2m_max");
            JSONArray tMinArr = daily.optJSONArray("temperature_2m_min");
            long maxTemp = tMaxArr != null && tMaxArr.length() > 0 ? Math.round(tMaxArr.optDouble(0, curTemp)) : Math.round(curTemp);
            long minTemp = tMinArr != null && tMinArr.length() > 0 ? Math.round(tMinArr.optDouble(0, curTemp)) : Math.round(curTemp);

            String subtext = "Max " + maxTemp + "° Min " + minTemp + "° • Perc. " + Math.round(apparentTemp) + "°";

            // Pioggia, Vento, Pressione, Umidità
            JSONArray rainProbArr = daily.optJSONArray("precipitation_probability_max");
            JSONArray rainSumArr = daily.optJSONArray("precipitation_sum");
            int rainProb = rainProbArr != null && rainProbArr.length() > 0 ? rainProbArr.optInt(0, 0) : 0;
            double rainSum = rainSumArr != null && rainSumArr.length() > 0 ? rainSumArr.optDouble(0, 0.0) : 0.0;
            double rainSumRound = Math.round(rainSum * 10.0) / 10.0;
            String rainStr = rainProb + "% • " + rainSumRound + "mm";

            long windSpeed = Math.round(current.optDouble("wind_speed_10m", 0.0));
            String windStr = windSpeed + " km/h";

            long pressure = Math.round(current.optDouble("surface_pressure", 1013.0));
            String pressureStr = pressure + " hPa";

            long humidity = Math.round(current.optDouble("relative_humidity_2m", 60.0));
            String humidityStr = humidity + "%";

            JSONArray uvArr = daily.optJSONArray("uv_index_max");
            long uv = uvArr != null && uvArr.length() > 0 ? Math.round(uvArr.optDouble(0, 0.0)) : 0;
            String uvStr = "UV " + uv;

            // AQI
            String aqiStr = "AQI --";
            if (aqiJsonStr != null) {
                try {
                    JSONObject aqiObj = new JSONObject(aqiJsonStr);
                    JSONObject aqiCurrent = aqiObj.optJSONObject("current");
                    if (aqiCurrent != null && aqiCurrent.has("european_aqi")) {
                        int aqiVal = aqiCurrent.optInt("european_aqi", -1);
                        if (aqiVal >= 0) {
                            aqiStr = "AQI " + aqiVal;
                        }
                    }
                } catch (Exception ignored) {}
            }

            SimpleDateFormat timeFmt = new SimpleDateFormat("HH:mm", Locale.ITALY);
            String updateTime = timeFmt.format(new Date());

            editor.putString("temp", tempStr);
            editor.putString("desc", desc);
            editor.putString("iconEmoji", iconEmoji);
            editor.putString("subtext", subtext);
            editor.putString("updateTime", updateTime);
            editor.putString("rain", rainStr);
            editor.putString("wind", windStr);
            editor.putString("aqi", aqiStr);
            editor.putString("uv", uvStr);
            editor.putString("pressure", pressureStr);
            editor.putString("humidity", humidityStr);

            // 3. Calcolo striscia 4 ore (h1..h4) sull'orario corrente reale
            if (hourly != null) {
                JSONArray hourlyTimes = hourly.optJSONArray("time");
                JSONArray hourlyTemps = hourly.optJSONArray("temperature_2m");
                JSONArray hourlyCodes = hourly.optJSONArray("weather_code");

                if (hourlyTimes != null && hourlyTemps != null && hourlyCodes != null) {
                    SimpleDateFormat hourPrefixFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:00", Locale.US);
                    String nowHourPrefix = hourPrefixFmt.format(new Date()).substring(0, 13);

                    int curHourIdx = -1;
                    for (int i = 0; i < hourlyTimes.length(); i++) {
                        String t = hourlyTimes.optString(i, "");
                        if (t.startsWith(nowHourPrefix)) {
                            curHourIdx = i;
                            break;
                        }
                    }

                    int startIdx = curHourIdx >= 0 ? curHourIdx + 1 : 12;

                    for (int i = 1; i <= 4; i++) {
                        int idx = startIdx + i - 1;
                        if (idx < hourlyTimes.length()) {
                            String timeIso = hourlyTimes.optString(idx, "");
                            double hTemp = hourlyTemps.optDouble(idx, 16.0);
                            int hCode = hourlyCodes.optInt(idx, 0);

                            String hTimeFormatted = timeIso.length() >= 16 ? timeIso.substring(11, 16) : String.format(Locale.US, "%02d:00", (12 + i) % 24);
                            int hHourNum = 12;
                            try {
                                if (hTimeFormatted.length() >= 2) {
                                    hHourNum = Integer.parseInt(hTimeFormatted.substring(0, 2));
                                }
                            } catch (Exception ignored) {}

                            boolean hIsDay = hHourNum >= 7 && hHourNum <= 19;
                            editor.putString("h" + i + "_time", hTimeFormatted);
                            editor.putString("h" + i + "_icon", getEmojiForWmoCode(hCode, hIsDay));
                            editor.putString("h" + i + "_temp", Math.round(hTemp) + "°");
                        }
                    }
                }
            }

            // 4. Calcolo previsioni per 5 giorni successivi (d1..d5)
            JSONArray dailyTimes = daily.optJSONArray("time");
            JSONArray dailyCodes = daily.optJSONArray("weather_code");
            JSONArray dailyRainProb = daily.optJSONArray("precipitation_probability_max");
            JSONArray dailyTMax = daily.optJSONArray("temperature_2m_max");
            JSONArray dailyTMin = daily.optJSONArray("temperature_2m_min");

            if (dailyTimes != null && dailyCodes != null && dailyTMax != null && dailyTMin != null) {
                SimpleDateFormat parseDateFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                SimpleDateFormat outDateFmt = new SimpleDateFormat("EEE d", Locale.ITALY);

                for (int i = 1; i <= 5; i++) {
                    if (i < dailyTimes.length()) {
                        String dateIso = dailyTimes.optString(i, "");
                        String dayLabel = "Giorno " + i;
                        try {
                            Date parsed = parseDateFmt.parse(dateIso);
                            if (parsed != null) {
                                String formatted = outDateFmt.format(parsed);
                                dayLabel = formatted.substring(0, 1).toUpperCase(Locale.ITALY) + formatted.substring(1);
                            }
                        } catch (Exception ignored) {}

                        int dCode = dailyCodes.optInt(i, 0);
                        String dEmoji = getEmojiForWmoCode(dCode, true);
                        String dLabel = getLabelForWmoCode(dCode, true);
                        int dRainProb = dailyRainProb != null && i < dailyRainProb.length() ? dailyRainProb.optInt(i, 0) : 0;
                        String dRainStr = dRainProb >= 15 ? "💧 " + dRainProb + "%" : "";
                        long dMax = Math.round(dailyTMax.optDouble(i, 15.0));
                        long dMin = Math.round(dailyTMin.optDouble(i, 10.0));

                        editor.putString("d" + i + "_day", dayLabel);
                        editor.putString("d" + i + "_desc", dEmoji + " " + dLabel);
                        editor.putString("d" + i + "_rain", dRainStr);
                        editor.putString("d" + i + "_temp", dMax + "° / " + dMin + "°");
                    }
                }
            }

            editor.apply();

            // 5. Ridisegna immediatamente i widget
            WeatherWidgetProvider.updateAllWidgets(context);
            Log.d(TAG, "Widget data refreshed successfully for " + cityName + " at " + updateTime);
            return true;

        } catch (Exception e) {
            Log.e(TAG, "Failed to parse weather JSON", e);
            return false;
        }
    }

    private static String reverseGeocode(double lat, double lon) {
        try {
            String urlStr = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=it";
            String jsonStr = httpGet(urlStr, 5000);
            if (jsonStr != null) {
                JSONObject obj = new JSONObject(jsonStr);
                String locality = obj.optString("locality", "");
                if (locality.isEmpty()) locality = obj.optString("city", "");
                if (locality.isEmpty()) locality = obj.optString("principalSubdivision", "");
                if (!locality.isEmpty()) {
                    if (locality.contains(" Giovanni XXIII")) {
                        locality = locality.replace(" Giovanni XXIII", "");
                    } else if (locality.contains("(")) {
                        locality = locality.split("\\(")[0].trim();
                    }
                    if (locality.length() > 22) {
                        locality = locality.substring(0, 21) + "…";
                    }
                    return locality;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Reverse geocode failed: " + e.getMessage());
        }
        return null;
    }

    private static String httpGet(String urlStr, int timeoutMs) {
        HttpURLConnection conn = null;
        BufferedReader reader = null;
        try {
            URL url = new URL(urlStr);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(timeoutMs);
            conn.setReadTimeout(timeoutMs);
            conn.setRequestProperty("User-Agent", "AlPiofNativeWidget/1.0");

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                InputStream in = conn.getInputStream();
                reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            } else {
                Log.w(TAG, "HTTP " + responseCode + " for " + urlStr);
            }
        } catch (Exception e) {
            Log.w(TAG, "HTTP GET failed for " + urlStr + ": " + e.getMessage());
        } finally {
            if (reader != null) {
                try { reader.close(); } catch (Exception ignored) {}
            }
            if (conn != null) {
                conn.disconnect();
            }
        }
        return null;
    }

    public static String getEmojiForWmoCode(int code, boolean isDay) {
        if (code == 0) return isDay ? "☀️" : "🌙";
        if (code == 1 || code == 2) return isDay ? "⛅" : "☁️";
        if (code == 3) return "☁️";
        if (code == 45 || code == 48) return "🌫️";
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️";
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "❄️";
        if (code >= 95) return "⛈️";
        return isDay ? "☀️" : "🌙";
    }

    public static String getLabelForWmoCode(int code, boolean isDay) {
        switch (code) {
            case 0: return isDay ? "Cielo sereno" : "Notte serena";
            case 1: return "Prevalentemente sereno";
            case 2: return "Parzialmente nuvoloso";
            case 3: return "Coperto";
            case 45: return "Nebbia";
            case 48: return "Nebbia con brina";
            case 51: return "Pioviggine leggera";
            case 53: return "Pioviggine moderata";
            case 55: return "Pioviggine densa";
            case 56:
            case 57: return "Pioviggine gelata";
            case 61: return "Pioggia debole";
            case 63: return "Pioggia moderata";
            case 65: return "Pioggia forte";
            case 66:
            case 67: return "Pioggia gelata";
            case 71: return "Neve debole";
            case 73: return "Neve moderata";
            case 75: return "Neve forte";
            case 77: return "Granuli di neve";
            case 80: return "Rovesci deboli";
            case 81: return "Rovesci moderati";
            case 82: return "Rovesci violenti";
            case 85: return "Rovesci di neve deboli";
            case 86: return "Rovesci di neve forti";
            case 95: return "Temporale";
            case 96:
            case 99: return "Temporale con grandine";
            default: return "Variabile";
        }
    }
}
