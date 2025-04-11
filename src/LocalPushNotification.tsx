// npx expo install expo-notifications
import React, { useEffect } from 'react';
import { View, Button, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NotificationScreen() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hello!',
        body: 'This is a local push notification.',
        sound: 'default',
      },
      trigger: null,
    });
  };

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      alert('Must use a physical device for push notifications');
      return;
    }

    // ** Fetch current notification permissions properly **
    const { granted: existingPermission } =
      await Notifications.getPermissionsAsync();

    let finalPermission = existingPermission;

    if (!existingPermission) {
      const { granted: newPermission } =
        await Notifications.requestPermissionsAsync();
      finalPermission = newPermission;
    }

    if (!finalPermission) {
      alert('Failed to get push token for push notifications!');
      return;
    }

    if (!Constants.expoConfig?.extra?.eas?.projectId) {
      alert('Project ID not found in Expo config.');
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;

    console.log('Expo Push Token:', token);

    return token;
  }

  return (
    <View style={styles.container}>
      <Button title="Send Notification" onPress={sendNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
