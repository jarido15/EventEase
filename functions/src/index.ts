import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

admin.initializeApp();

const getAccessToken = async () => {
    const serviceAccount = require("../../api/admin-sdk.json"); // 🔥 Make sure this file exists

    const jwtClient = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const token = await jwtClient.authorize();
    return token.access_token;
};

export const sendPushNotification = functions.https.onCall(async (data, context) => {
    try {
        const { fcmToken, serviceName } = data;

        if (!fcmToken) throw new Error("FCM token is missing.");

        const accessToken = await getAccessToken();

        const message = {
            message: {
                token: fcmToken,
                notification: {
                    title: "New Booking Received",
                    body: `Your service "${serviceName}" has been booked!`,
                },
                android: {
                    priority: "high",
                },
                data: {
                    serviceName: serviceName,
                    type: "booking",
                },
            },
        };

        const response = await fetch(
            "https://fcm.googleapis.com/v1/projects/547402221261/messages:send",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            }
        );

        const result = await response.json();
        return { success: true, result };
    } catch (error) {
        console.error("Error sending push notification:", error);
        return { success: false, error: error.message };
    }
});
