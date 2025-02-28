const express = require("express");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(express.json());

// Load Firebase Admin SDK credentials
const serviceAccount = require('../api/admin-sdk.json'); // Update with your file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get OAuth 2.0 Access Token
async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

// Send Notification via FCM HTTP v1 API
async function sendNotification(fcmToken, title, body) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to get access token");

    const projectId = serviceAccount.project_id;
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const message = {
      message: {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        android: {
          priority: "high",
        },
      },
    };

    const response = await axios.post(url, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Notification sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error.response?.data || error.message);
    throw error;
  }
}

// API Endpoint for Sending Notifications
app.post("/send-notification", async (req, res) => {
  const { fcmToken, title, body } = req.body;

  if (!fcmToken || !title || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await sendNotification(fcmToken, title, body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
