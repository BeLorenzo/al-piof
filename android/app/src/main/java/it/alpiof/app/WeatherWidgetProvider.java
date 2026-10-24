package it.alpiof.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

public class WeatherWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "alpiof_widget_prefs";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
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
        String aqi = prefs.getString("aqi", "EAQI --");
        boolean showUv = prefs.getBoolean("showUv", false);
        String uv = prefs.getString("uv", "UV --");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather);

        // Click on widget opens MainActivity
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        // Data binding
        views.setTextViewText(R.id.tv_widget_city, city);
        views.setTextViewText(R.id.tv_widget_time, updateTime);
        views.setTextViewText(R.id.tv_widget_icon, iconEmoji);
        views.setTextViewText(R.id.tv_widget_temp, temp);
        views.setTextViewText(R.id.tv_widget_desc, desc + (subtext.isEmpty() ? "" : " • " + subtext));

        // Chips
        if (showRain && rain != null && !rain.isEmpty()) {
            views.setViewVisibility(R.id.chip_rain, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_rain, "💧 " + rain);
        } else {
            views.setViewVisibility(R.id.chip_rain, View.GONE);
        }

        if (showWind && wind != null && !wind.isEmpty()) {
            views.setViewVisibility(R.id.chip_wind, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_wind, "💨 " + wind);
        } else {
            views.setViewVisibility(R.id.chip_wind, View.GONE);
        }

        if (showAqi && aqi != null && !aqi.isEmpty()) {
            views.setViewVisibility(R.id.chip_aqi, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_aqi, "🌱 " + aqi);
        } else {
            views.setViewVisibility(R.id.chip_aqi, View.GONE);
        }

        if (showUv && uv != null && !uv.isEmpty()) {
            views.setViewVisibility(R.id.chip_uv, View.VISIBLE);
            views.setTextViewText(R.id.tv_widget_uv, "☀️ " + uv);
        } else {
            views.setViewVisibility(R.id.chip_uv, View.GONE);
        }

        // Optional Hourly Strip (if toggled on or if widget is expanded)
        boolean showHourlyStrip = prefs.getBoolean("showHourlyStrip", false);
        if (showHourlyStrip) {
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
        } else {
            views.setViewVisibility(R.id.layout_hourly_strip, View.GONE);
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

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
