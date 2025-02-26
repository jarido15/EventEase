import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Assuming you're using Firebase Auth for user management
import { Alert } from 'react-native';

// Request notification permissions
export async function requestUserPermission(): Promise<void> {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Notification permission granted.');
    }
}

// Get and Save FCM Token in Firestore
export async function getFCMToken(): Promise<string | null> {
    try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);

        // Get the current user (Supplier)
        const currentUser = auth().currentUser;

        if (currentUser && token) {
            // Save the token inside the Supplier document in Firestore
            await firestore().collection('Supplier').doc(currentUser.uid).set({
                fcmToken: token
            });

            console.log('FCM Token saved to Firestore for Supplier:', currentUser.uid);
        } else {
            console.warn('No authenticated user found or token is empty.');
        }

        return token;
    } catch (error) {
        console.error('Error getting or saving FCM token:', error);
        return null;
    }
}

// Foreground notification handler
export function setupForegroundNotificationListener(): void {
    messaging().onMessage(async remoteMessage => {
        Alert.alert('New Notification', remoteMessage.notification?.body || 'You have a new message.');
    });
}

// Background notification handler
export function setupBackgroundMessageHandler(): void {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
    });
}

// Handle notification click events
export function setupNotificationOpenedListener(): void {
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('User clicked on notification:', remoteMessage);
    });

    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification caused app to open:', remoteMessage);
            }
        });
}
