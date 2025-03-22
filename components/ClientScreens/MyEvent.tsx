/* eslint-disable quotes */
/* eslint-disable quotes */
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

    const fetchEvents = async () => {
      try {
        const snapshot = await firestore()
          .collection("Clients")
          .doc(user.uid)
          .collection("MyEvent")
          .get();

        const eventList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            eventDate: data.date?.toDate() || new Date(),
            eventImage: data.eventImage || null,
            eventName: data.eventName || "Unnamed Event",
            eventTime: data.eventTime || "Unknown Time",
            services: data.selectedServices || [],
            completedServices: data.completedServices || Array(data.selectedServices?.length).fill(false),
            status: data.status || "Upcoming",
          };
        });

        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching user events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user?.uid]);

  const handleServiceCheck = async (eventId, serviceIndex) => {
    const updatedEvents = events.map((event) =>
      event.id === eventId
        ? {
            ...event,
            completedServices: event.completedServices.map((status, index) =>
              index === serviceIndex ? !status : status
            ),
          }
        : event
    );
  
    setEvents(updatedEvents);
  
    const event = updatedEvents.find((item) => item.id === eventId);
  
    // Update Firestore with the new completedServices array
    await firestore()
      .collection("Clients")
      .doc(user.uid)
      .collection("MyEvent")
      .doc(eventId)
      .update({
        completedServices: event.completedServices,
      });
  };
  
  const fetchBookingDetails = async (eventName) => {
    try {
      const snapshot = await firestore()
        .collection("Bookings")
        .where("eventName", "==", eventName)
        .get();
  
      if (!snapshot.empty) {
        setBookingDetails(snapshot.docs[0].data()); // Assuming eventName is unique
        setModalVisible(true);
      } else {
        alert("No booking details found.");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      alert("Failed to fetch booking details.");
    }
  };
  

  const handleServiceComplete = async (eventId) => {
    const event = events.find((item) => item.id === eventId);
    const allServicesCompleted = event.services.every(
      (_, index) => event.completedServices[index]
    );

    if (allServicesCompleted) {
      await firestore()
        .collection("Clients")
        .doc(user.uid)
        .collection("MyEvent")
        .doc(eventId)
        .update({ status: "Ongoing" });

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, status: "Ongoing" } : event
        )
      );

      setSelectedTab("Ongoing");
    } else {
      alert("Please complete all services before marking as complete.");
    }
  };

  const handleMoveToPrevious = async (eventId) => {
    try {
      await firestore()
        .collection("Clients")
        .doc(user.uid)
        .collection("MyEvent")
        .doc(eventId)
        .update({ status: "Previous" });

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, status: "Previous" } : event
        )
      );

      setSelectedTab("Previous");
    } catch (error) {
      console.error("Error updating event status:", error);
      alert("Failed to update event. Try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading My Events...</Text>
      </View>
    );
  }

  const filteredEvents = events.filter((event) => event.status === selectedTab);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Events</Text>
      </View>

      <View style={styles.tabContainer}>
        {["Upcoming", "Ongoing", "Previous"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
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
                <Image
                  source={item.eventImage ? { uri: item.eventImage } : require("../images/upevent.png")}
                  style={styles.eventImage}
                  resizeMode="cover"
                />

                <View style={styles.eventDetails}>
                  <Text style={styles.eventName}>{item.eventName}</Text>
                  <Text style={styles.eventDate}>📅 {eventDate.toDateString()}</Text>
                  <Text style={styles.eventTime}>⏰ {item.eventTime}</Text>

                  <View style={styles.servicesContainer}>
                    <Text style={styles.servicesTitle}>Services:</Text>
                    {item.services.length === 0 ? (
                      <Text style={styles.noServices}>No services available.</Text>
                    ) : selectedTab === "Upcoming" ? (
                      item.services.map((service, index) => (
                        <View key={index} style={styles.serviceItem}>
                          <TouchableOpacity onPress={() => handleServiceCheck(item.id, index)}>
                            <Image
                              source={
                                item.completedServices[index]
                                  ? require("../images/checkedbox.png")
                                  : require("../images/Uncheckedbox.png")
                              }
                              style={styles.checkImage}
                            />
                          </TouchableOpacity>
                          <Text style={styles.serviceText}>{service}</Text>
                        </View>
                      ))
                    ) : (
                      item.services.map((service, index) => (
                        <Text key={index} style={styles.serviceText}>• {service}</Text>
                      ))
                    )}
                  </View>

                  {selectedTab === "Upcoming" && (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleServiceComplete(item.id)}
                    >
                      <Text style={styles.completeButtonText}>Service Complete</Text>
                    </TouchableOpacity>
                  )}

                  {selectedTab === "Ongoing" && (
                    <TouchableOpacity
                      style={[styles.completeButton, { backgroundColor: "green" }]}
                      onPress={() => handleMoveToPrevious(item.id)}
                    >
                      <Text style={styles.completeButtonText}>Event Complete</Text>
                    </TouchableOpacity>
                  )}
            {selectedTab !== "Previous" && (
              <TouchableOpacity
  style={[styles.completeButton, { backgroundColor: "#FF8C00" }]}
  onPress={() =>
    navigation.navigate("ViewBookedServices", {
      eventName: item.eventName,
      eventImage: item.eventImage,
      eventDate: item.eventDate,
    })
  }
>
  <Text style={styles.completeButtonText}>View Booked Services</Text>
</TouchableOpacity>

)}


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
    backgroundColor: "#5392DD",
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
    left: '40%',
    fontSize: 24,
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
    backgroundColor: "#5392DD",
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
  servicesContainer: {
    marginTop: 15,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  serviceText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  noServices: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
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
  checkImage: {
    width: 24,
    height: 24,
  },
  completeButton: {
    backgroundColor: "#5392DD",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  
});

export default MyEventsScreen;
