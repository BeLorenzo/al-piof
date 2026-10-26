package it.alpiof.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

public class WeatherWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "alpiof_widget_prefs";
    public static final String ACTION_REFRESH_WIDGET = "it.alpiof.app.ACTION_REFRESH_WIDGET";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && ACTION_REFRESH_WIDGET.equals(intent.getAction())) {
            final Context appContext = context.getApplicationContext();
            final SharedPreferences prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            final String previousTime = prefs.getString("updateTime", "--:--");
            prefs.edit().putString("updateTime", "↻ ...").apply();
            updateAllWidgets(appContext);

            final PendingResult result = goAsync();
            new Thread(() -> {
                try {
                    boolean ok = WeatherWidgetUpdater.fetchAndUpdateSync(appContext);
                    if (!ok) {
                        String fallbackTime = "↻ ...".equals(previousTime) ? "--:--" : previousTime;
                        prefs.edit().putString("updateTime", fallbackTime).apply();
                        updateAllWidgets(appContext);
                    }
                } finally {
                    result.finish();
                }
            }).start();
            return;
        }
        super.onReceive(context, intent);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        WeatherWidgetWorker.enqueuePeriodicWork(context);
        final Context appContext = context.getApplicationContext();
        final PendingResult result = goAsync();
        new Thread(() -> {
            try {
                WeatherWidgetUpdater.fetchAndUpdateSync(appContext);
            } finally {
                result.finish();
            }
        }).start();
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        WeatherWidgetWorker.enqueuePeriodicWork(context);
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        final Context appContext = context.getApplicationContext();
        final PendingResult result = goAsync();
        new Thread(() -> {
            try {
                WeatherWidgetUpdater.fetchAndUpdateSync(appContext);
            } finally {
                result.finish();
            }
        }).start();
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
            new ComponentName(context, WeatherWidgetProvider.class)
        );
        if (appWidgetIds != null && appWidgetIds.length > 0) {
            for (int id : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, id);
            }
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String city = prefs.getString("city", "Milano");
        String temp = prefs.getString("temp", "--°");
        String desc = prefs.getString("desc", "Meteo");
        String iconEmoji = prefs.getString("iconEmoji", "☀️");
        String subtext = prefs.getString("subtext", "");
        String updateTime = prefs.getString("updateTime", "--:--");
        String theme = prefs.getString("theme", "slate_dark");

        boolean showRain = prefs.getBoolean("showRain", true);
        String rain = prefs.getString("rain", "0%");
        boolean showWind = prefs.getBoolean("showWind", true);
        String wind = prefs.getString("wind", "-- km/h");
        boolean showAqi = prefs.getBoolean("showAqi", true);
        String aqi = prefs.getString("aqi", "AQI --");
        boolean showUv = prefs.getBoolean("showUv", true);
        String uv = prefs.getString("uv", "UV --");
        boolean showPressure = prefs.getBoolean("showPressure", false);
        String pressure = prefs.getString("pressure", "-- hPa");
        boolean showHumidity = prefs.getBoolean("showHumidity", false);
        String humidity = prefs.getString("humidity", "--%");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather);

        // Click on widget opens MainActivity
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        // Click on right section (temp and time) triggers instant background refresh
        Intent refreshIntent = new Intent(context, WeatherWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH_WIDGET);
        refreshIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(
            context, appWidgetId, refreshIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.tv_widget_temp, refreshPendingIntent);
        views.setOnClickPendingIntent(R.id.tv_widget_time, refreshPendingIntent);

        // 1. Header Data binding
        views.setTextViewText(R.id.tv_widget_city, city);
        views.setTextViewText(R.id.tv_widget_time, updateTime);
        views.setTextViewText(R.id.tv_widget_icon, iconEmoji);
        views.setTextViewText(R.id.tv_widget_temp, temp);
        views.setTextViewText(R.id.tv_widget_desc, desc + (subtext.isEmpty() ? "" : " • " + subtext));

        // 2. Selectable Extra Chips
        boolean anyChip = false;

        if (showRain && rain != null && !rain.isEmpty()) {
            views.setViewVisibility(R.id.chip_rain, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_rain, "💧 " + rain);
            anyChip = true;
        } else {
            views.setViewVisibility(R.id.chip_rain, View.GONE);
        }

        if (showWind && wind != null && !wind.isEmpty()) {
            views.setViewVisibility(R.id.chip_wind, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_wind, "💨 " + wind);
            anyChip = true;
        } else {
            views.setViewVisibility(R.id.chip_wind, View.GONE);
        }

        if (showAqi && aqi != null && !aqi.isEmpty()) {
            views.setViewVisibility(R.id.chip_aqi, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_aqi, "🌱 " + aqi);
            anyChip = true;
        } else {
            views.setViewVisibility(R.id.chip_aqi, View.GONE);
        }

        if (showUv && uv != null && !uv.isEmpty()) {
            views.setViewVisibility(R.id.chip_uv, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_uv, "☀️ " + uv);
            anyChip = true;
        } else {
            views.setViewVisibility(R.id.chip_uv, View.GONE);
        }

        if (showPressure && pressure != null && !pressure.isEmpty()) {
            views.setViewVisibility(R.id.chip_pressure, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_pressure, "⏲️ " + pressure);
            anyChip = true;
        } else {
            views.setViewVisibility(R.id.chip_pressure, View.GONE);
        }

        if (showHumidity && humidity != null && !humidity.isEmpty()) {
            views.setViewVisibility(R.id.chip_humidity, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_humidity, "💦 " + humidity);
            anyChip = true;
        } else {
            views.setViewVisibility(R.id.chip_humidity, View.GONE);
        }

        views.setViewVisibility(R.id.ll_widget_chips, anyChip ? View.VISIBLE : View.GONE);

        // 3. Default 4-Hour Strip (Always visible in 4x1 base widget)
        views.setViewVisibility(R.id.layout_hourly_strip, View.VISIBLE);
        views.setTextViewText(R.id.tv_h1_time, prefs.getString("h1_time", "13:00"));
        views.setTextViewText(R.id.tv_h1_icon, prefs.getString("h1_icon", "☀️"));
        views.setTextViewText(R.id.tv_h1_temp, prefs.getString("h1_temp", "--°"));

        views.setTextViewText(R.id.tv_h2_time, prefs.getString("h2_time", "14:00"));
        views.setTextViewText(R.id.tv_h2_icon, prefs.getString("h2_icon", "☀️"));
        views.setTextViewText(R.id.tv_h2_temp, prefs.getString("h2_temp", "--°"));

        views.setTextViewText(R.id.tv_h3_time, prefs.getString("h3_time", "15:00"));
        views.setTextViewText(R.id.tv_h3_icon, prefs.getString("h3_icon", "☀️"));
        views.setTextViewText(R.id.tv_h3_temp, prefs.getString("h3_temp", "--°"));

        views.setTextViewText(R.id.tv_h4_time, prefs.getString("h4_time", "16:00"));
        views.setTextViewText(R.id.tv_h4_icon, prefs.getString("h4_icon", "☀️"));
        views.setTextViewText(R.id.tv_h4_temp, prefs.getString("h4_temp", "--°"));

        // 4. Dynamic Multi-Day Forecast Section when widget is resized from 4x1 to 4x2 (all 5 upcoming days)
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int minHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) : 0;

        if (minHeight >= 115) {
            views.setViewVisibility(R.id.layout_daily_section, View.VISIBLE);
            views.setViewVisibility(R.id.row_day_1, View.VISIBLE);
            views.setViewVisibility(R.id.row_day_2, View.VISIBLE);
            views.setViewVisibility(R.id.row_day_3, View.VISIBLE);
            views.setViewVisibility(R.id.row_day_4, View.VISIBLE);
            views.setViewVisibility(R.id.row_day_5, View.VISIBLE);

            views.setTextViewText(R.id.tv_d1_day, prefs.getString("d1_day", "Dom"));
            views.setTextViewText(R.id.tv_d1_desc, prefs.getString("d1_desc", "☀️ Sereno"));
            views.setTextViewText(R.id.tv_d1_rain, prefs.getString("d1_rain", ""));
            views.setTextViewText(R.id.tv_d1_temp, prefs.getString("d1_temp", "--° / --°"));

            views.setTextViewText(R.id.tv_d2_day, prefs.getString("d2_day", "Lun"));
            views.setTextViewText(R.id.tv_d2_desc, prefs.getString("d2_desc", "☀️ Sereno"));
            views.setTextViewText(R.id.tv_d2_rain, prefs.getString("d2_rain", ""));
            views.setTextViewText(R.id.tv_d2_temp, prefs.getString("d2_temp", "--° / --°"));

            views.setTextViewText(R.id.tv_d3_day, prefs.getString("d3_day", "Mar"));
            views.setTextViewText(R.id.tv_d3_desc, prefs.getString("d3_desc", "☀️ Sereno"));
            views.setTextViewText(R.id.tv_d3_rain, prefs.getString("d3_rain", ""));
            views.setTextViewText(R.id.tv_d3_temp, prefs.getString("d3_temp", "--° / --°"));

            views.setTextViewText(R.id.tv_d4_day, prefs.getString("d4_day", "Mer"));
            views.setTextViewText(R.id.tv_d4_desc, prefs.getString("d4_desc", "☀️ Sereno"));
            views.setTextViewText(R.id.tv_d4_rain, prefs.getString("d4_rain", ""));
            views.setTextViewText(R.id.tv_d4_temp, prefs.getString("d4_temp", "--° / --°"));

            views.setTextViewText(R.id.tv_d5_day, prefs.getString("d5_day", "Gio"));
            views.setTextViewText(R.id.tv_d5_desc, prefs.getString("d5_desc", "☀️ Sereno"));
            views.setTextViewText(R.id.tv_d5_rain, prefs.getString("d5_rain", ""));
            views.setTextViewText(R.id.tv_d5_temp, prefs.getString("d5_temp", "--° / --°"));
        } else {
            views.setViewVisibility(R.id.layout_daily_section, View.GONE);
        }

        // Apply theme background and text colors
        int bgDrawableRes = R.drawable.widget_bg_dark;
        int textColor = 0xFFF1F5F9; // slate-100
        int subTextColor = 0xFF94A3B8; // slate-400
        int cityColor = 0xFF38BDF8; // sky-400

        if ("oled".equals(theme)) {
            bgDrawableRes = R.drawable.widget_bg_oled;
            textColor = 0xFFFFFFFF;
            subTextColor = 0xFFA1A1AA;
            cityColor = 0xFF38BDF8;
        } else if ("rose_milk".equals(theme)) {
            bgDrawableRes = R.drawable.widget_bg_rose;
            textColor = 0xFF881337; // rose-900
            subTextColor = 0xFF9F1239; // rose-800
            cityColor = 0xFFE11D48; // rose-600
        } else if ("light".equals(theme)) {
            bgDrawableRes = R.drawable.widget_bg_light;
            textColor = 0xFF0F172A; // slate-900
            subTextColor = 0xFF64748B; // slate-500
            cityColor = 0xFF0284C7; // sky-600
        } else if ("glass".equals(theme)) {
            bgDrawableRes = R.drawable.widget_bg_glass;
            textColor = 0xFFF8FAFC;
            subTextColor = 0xFFCBD5E1;
            cityColor = 0xFF38BDF8;
        }

        views.setInt(R.id.widget_root, "setBackgroundResource", bgDrawableRes);
        views.setTextColor(R.id.tv_widget_city, cityColor);
        views.setTextColor(R.id.tv_widget_temp, textColor);
        views.setTextColor(R.id.tv_widget_desc, textColor);
        views.setTextColor(R.id.tv_widget_time, subTextColor);

        views.setTextColor(R.id.tv_h1_time, subTextColor);
        views.setTextColor(R.id.tv_h1_temp, textColor);
        views.setTextColor(R.id.tv_h2_time, subTextColor);
        views.setTextColor(R.id.tv_h2_temp, textColor);
        views.setTextColor(R.id.tv_h3_time, subTextColor);
        views.setTextColor(R.id.tv_h3_temp, textColor);
        views.setTextColor(R.id.tv_h4_time, subTextColor);
        views.setTextColor(R.id.tv_h4_temp, textColor);

        views.setTextColor(R.id.tv_d1_day, textColor);
        views.setTextColor(R.id.tv_d1_desc, subTextColor);
        views.setTextColor(R.id.tv_d1_temp, textColor);
        views.setTextColor(R.id.tv_d2_day, textColor);
        views.setTextColor(R.id.tv_d2_desc, subTextColor);
        views.setTextColor(R.id.tv_d2_temp, textColor);
        views.setTextColor(R.id.tv_d3_day, textColor);
        views.setTextColor(R.id.tv_d3_desc, subTextColor);
        views.setTextColor(R.id.tv_d3_temp, textColor);
        views.setTextColor(R.id.tv_d4_day, textColor);
        views.setTextColor(R.id.tv_d4_desc, subTextColor);
        views.setTextColor(R.id.tv_d4_temp, textColor);
        views.setTextColor(R.id.tv_d5_day, textColor);
        views.setTextColor(R.id.tv_d5_desc, subTextColor);
        views.setTextColor(R.id.tv_d5_temp, textColor);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
