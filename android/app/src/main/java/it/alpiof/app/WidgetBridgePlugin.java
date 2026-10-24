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

        if (call.hasOption("showHourlyStrip")) editor.putBoolean("showHourlyStrip", Boolean.TRUE.equals(call.getBoolean("showHourlyStrip")));
        if (call.hasOption("h1_time")) editor.putString("h1_time", call.getString("h1_time"));
        if (call.hasOption("h1_icon")) editor.putString("h1_icon", call.getString("h1_icon"));
        if (call.hasOption("h1_temp")) editor.putString("h1_temp", call.getString("h1_temp"));
        if (call.hasOption("h2_time")) editor.putString("h2_time", call.getString("h2_time"));
        if (call.hasOption("h2_icon")) editor.putString("h2_icon", call.getString("h2_icon"));
        if (call.hasOption("h2_temp")) editor.putString("h2_temp", call.getString("h2_temp"));
        if (call.hasOption("h3_time")) editor.putString("h3_time", call.getString("h3_time"));
        if (call.hasOption("h3_icon")) editor.putString("h3_icon", call.getString("h3_icon"));
        if (call.hasOption("h3_temp")) editor.putString("h3_temp", call.getString("h3_temp"));
        if (call.hasOption("h4_time")) editor.putString("h4_time", call.getString("h4_time"));
        if (call.hasOption("h4_icon")) editor.putString("h4_icon", call.getString("h4_icon"));
        if (call.hasOption("h4_temp")) editor.putString("h4_temp", call.getString("h4_temp"));

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
