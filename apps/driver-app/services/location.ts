import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { supabase } from '@workspace/integrations/supabase';

const LOCATION_TASK_NAME = 'background-location-task';

// 1. Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      const { latitude, longitude, heading, speed } = location.coords;
      const driverId = 1; // Simulated current driver ID

      console.log(`[Background GPS] Lat: ${latitude}, Lng: ${longitude}`);

      // 2. Broadcast to Supabase Realtime (Broadcast)
      // This is efficient and doesn't write to DB every second
      const channel = supabase.channel(`tracking:driver:${driverId}`);
      channel.send({
        type: 'broadcast',
        event: 'location-update',
        payload: {
          driverId,
          lat: latitude,
          lng: longitude,
          heading,
          speed,
          status: 'busy', // Simulated
          timestamp: new Date().toISOString(),
        },
      });

      // 3. (Optional) Batch save to DB for Breadcrumbs every X minutes
      // To be implemented to avoid overloading the DB
    }
  }
});

export async function startLocationTracking() {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    console.error('Foreground location permission not granted');
    return;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    console.error('Background location permission not granted');
    return;
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 10000, // 10 seconds
    distanceInterval: 10, // 10 meters
    foregroundService: {
      notificationTitle: 'GruaDirect Tracking',
      notificationBody: 'Your location is being tracked for towing services.',
      notificationColor: '#3b82f6',
    },
  });
}

export async function stopLocationTracking() {
  const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}
