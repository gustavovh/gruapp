import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(targetToken: string, title: string, body: string, data?: any) {
  if (!Expo.isExpoPushToken(targetToken)) {
    console.error(`Push token ${targetToken} is not a valid Expo push token`);
    return;
  }

  const message = {
    to: targetToken,
    sound: 'default', // Can be customized with channel sound on Android
    title,
    body,
    data: data || {},
    priority: 'high' as const,
    channelId: 'default',
  };

  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);
    console.log("Notification sent successfully:", tickets);
    return tickets;
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
