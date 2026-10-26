package it.alpiof.app;

import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.util.concurrent.TimeUnit;

public class WeatherWidgetWorker extends Worker {

    public static final String WORK_NAME = "alpiof_widget_periodic_update";
    private static final String TAG = "WeatherWidgetWorker";

    public WeatherWidgetWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        try {
            Log.d(TAG, "Executing periodic background widget update");
            boolean ok = WeatherWidgetUpdater.fetchAndUpdateSync(getApplicationContext());
            return ok ? Result.success() : Result.retry();
        } catch (Exception e) {
            Log.e(TAG, "Error in periodic widget update", e);
            return Result.retry();
        }
    }

    public static void enqueuePeriodicWork(Context context) {
        try {
            Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

            PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(
                WeatherWidgetWorker.class,
                30, TimeUnit.MINUTES,
                15, TimeUnit.MINUTES
            )
            .setConstraints(constraints)
            .build();

            WorkManager.getInstance(context.getApplicationContext()).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            );
            Log.d(TAG, "Enqueued periodic WorkManager job for widget updates (30 min)");
        } catch (Exception e) {
            Log.w(TAG, "Failed to enqueue periodic work: " + e.getMessage());
        }
    }
}
