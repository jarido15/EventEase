import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";

const MyEventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Upcoming");
  const user = auth().currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    if (!user?.uid) {
      console.error("No logged-in user found.");
      setLoading(false);
      return;
    }

    console.log("Current User UID:", user.uid); // Log the UID to check

    const fetchEvents = async () => {
      try {
        const snapshot = await firestore()
          .collection("Client")
          .doc(user.uid)
          .collection("MyEvent")
          .orderBy("date", "asc")
          .get();

        if (snapshot.empty) {
          console.log("No events found for this user.");
          setEvents([]); // No events, set an empty array
        } else {
          const eventList = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Event Date Type:", data.date); // Log event date type for debugging
            return {
              id: doc.id,
              eventDate: data.date?.toDate() || new Date(), // Safely handle the date field
              eventImage: data.imageUrl || "https://via.placeholder.com/300", // Fallback image if none exists
              eventName: data.name || "Unnamed Event", // Default event name if none exists
              eventTime: data.time || "Unknown Time", // Default time if none exists
            };
          });
          console.log("Fetched Events:", eventList); // Log the fetched events
          setEvents(eventList); // Update state with fetched events
        }
      } catch (error) {
        console.error("Error fetching user events:", error);
      } finally {
        setLoading(false); // Stop loading indicator once fetch is complete
      }
    };

    fetchEvents();
  }, [user?.uid]); // Dependency array, only fetch when the user UID changes

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading My Events...</Text>
      </View>
    );
  }

  const now = new Date();
  const filteredEvents = events.filter((item) => {
    const eventDate = new Date(item.eventDate); // Ensure this is a Date object
    console.log("Comparing eventDate:", eventDate, "with now:", now); // Log the comparison
    if (selectedTab === "Upcoming") return eventDate > now;
    if (selectedTab === "Ongoing") return eventDate.toDateString() === now.toDateString();
    if (selectedTab === "Previous") return eventDate < now;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Events</Text>
      </View>

      {/* Tabs for Filtering */}
      <View style={styles.tabContainer}>
        {["Upcoming", "Ongoing", "Previous"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredEvents.length === 0 ? (
        <Text style={styles.noDataText}>No {selectedTab} events available</Text>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const eventDate = new Date(item.eventDate);
            return (
              <View style={styles.card}>
                {/* Event Image */}
                <Image source={{ uri: item.eventImage }} style={styles.eventImage} resizeMode="cover" />

                {/* Event Details */}
                <View style={styles.eventDetails}>
                  <Text style={styles.eventName}>{item.eventName}</Text>
                  <Text style={styles.eventDate}>📅 {eventDate.toDateString()}</Text>
                  <Text style={styles.eventTime}>⏰ {item.eventTime}</Text>
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#007AFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  backButton: {
    paddingHorizontal: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "white",
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventDetails: {
    padding: 15,
  },
  eventName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  eventTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});

export default MyEventsScreen;
