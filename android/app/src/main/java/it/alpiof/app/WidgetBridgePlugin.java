package it.alpiof.app;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(
            WeatherWidgetProvider.PREFS_NAME,
            Context.MODE_PRIVATE
        );
        SharedPreferences.Editor editor = prefs.edit();

        if (call.hasOption("city")) editor.putString("city", call.getString("city"));
        if (call.hasOption("temp")) editor.putString("temp", call.getString("temp"));
        if (call.hasOption("desc")) editor.putString("desc", call.getString("desc"));
        if (call.hasOption("iconEmoji")) editor.putString("iconEmoji", call.getString("iconEmoji"));
        if (call.hasOption("subtext")) editor.putString("subtext", call.getString("subtext"));
        if (call.hasOption("updateTime")) editor.putString("updateTime", call.getString("updateTime"));
        if (call.hasOption("theme")) editor.putString("theme", call.getString("theme"));

        if (call.hasOption("showRain")) editor.putBoolean("showRain", Boolean.TRUE.equals(call.getBoolean("showRain")));
        if (call.hasOption("rain")) editor.putString("rain", call.getString("rain"));
        if (call.hasOption("showWind")) editor.putBoolean("showWind", Boolean.TRUE.equals(call.getBoolean("showWind")));
        if (call.hasOption("wind")) editor.putString("wind", call.getString("wind"));
        if (call.hasOption("showAqi")) editor.putBoolean("showAqi", Boolean.TRUE.equals(call.getBoolean("showAqi")));
        if (call.hasOption("aqi")) editor.putString("aqi", call.getString("aqi"));
        if (call.hasOption("showUv")) editor.putBoolean("showUv", Boolean.TRUE.equals(call.getBoolean("showUv")));
        if (call.hasOption("uv")) editor.putString("uv", call.getString("uv"));
        if (call.hasOption("showPressure")) editor.putBoolean("showPressure", Boolean.TRUE.equals(call.getBoolean("showPressure")));
        if (call.hasOption("pressure")) editor.putString("pressure", call.getString("pressure"));
        if (call.hasOption("showHumidity")) editor.putBoolean("showHumidity", Boolean.TRUE.equals(call.getBoolean("showHumidity")));
        if (call.hasOption("humidity")) editor.putString("humidity", call.getString("humidity"));

        // 4-Hour Forecast Strip
        for (int i = 1; i <= 4; i++) {
            String p = "h" + i + "_";
            if (call.hasOption(p + "time")) editor.putString(p + "time", call.getString(p + "time"));
            if (call.hasOption(p + "icon")) editor.putString(p + "icon", call.getString(p + "icon"));
            if (call.hasOption(p + "temp")) editor.putString(p + "temp", call.getString(p + "temp"));
        }

        // 5-Day Forecast Rows (for 4x3 and 4x4 widget expansion)
        for (int i = 1; i <= 5; i++) {
            String p = "d" + i + "_";
            if (call.hasOption(p + "day")) editor.putString(p + "day", call.getString(p + "day"));
            if (call.hasOption(p + "desc")) editor.putString(p + "desc", call.getString(p + "desc"));
            if (call.hasOption(p + "rain")) editor.putString(p + "rain", call.getString(p + "rain"));
            if (call.hasOption(p + "temp")) editor.putString(p + "temp", call.getString(p + "temp"));
        }

        editor.apply();

        WeatherWidgetProvider.updateAllWidgets(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("URL missing");
            return;
        }
        try {
            android.content.Intent intent = new android.content.Intent(
                android.content.Intent.ACTION_VIEW,
                android.net.Uri.parse(url)
            );
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
