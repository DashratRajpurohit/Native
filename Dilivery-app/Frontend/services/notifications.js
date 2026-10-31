import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  return finalStatus === 'granted';
}

export async function scheduleProofSubmittedNotification(reportId) {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.log('Notification permission denied, skipping notification.');
    return;
  }
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Delivery Chacker",
      body: `Your parcel proof ${reportId} has been submitted successfully.`,
    },
    trigger: null, // trigger: null fires it immediately
  });
}
