/* eslint-disable quotes */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const ViewBookedServicesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { eventName, clientId } = route.params;  // Assuming clientId is passed as a parameter
  const [eventImage, setEventImage] = useState(null);  // State for eventImage
  const [eventDate, setEventDate] = useState(null);  // State for eventDate
  const [bookedServices, setBookedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Fetch the client document from the Clients collection
        const clientDoc = await firestore()
          .collection("Clients") // Navigate to Clients collection
          .doc(clientId) // Use clientId to fetch the specific client
          .collection("MyEvent") // Access the MyEvent subcollection
          .where("eventName", "==", eventName) // Filter by eventName
          .get();

        console.log("Fetched client documents:", clientDoc.docs);

        if (!clientDoc.empty) {
          const eventData = clientDoc.docs[0].data();
          console.log("Fetched event data:", eventData); // Log fetched data

          setEventImage(eventData.eventImage || null); // Set the eventImage from the event data

          // Set eventDate directly since it's already in the correct format (yyyy-mm-dd)
          setEventDate(eventData.eventDate);  // Should be in the format yy-mm-dd
        } else {
          console.log("No matching event found for the given eventName.");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    const fetchBookedServices = async () => {
      try {
        const snapshot = await firestore()
          .collection("Bookings")
          .where("eventName", "==", eventName)
          .get();

        const servicesList = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const supplierDoc = await firestore()
              .collection("Supplier")
              .doc(data.supplierId)
              .get();

            const supplierData = supplierDoc.data();

            return {
              imageUrl: data.imageUrl,
              serviceName: data.serviceName,
              supplierName: data.supplierName,
              BusinessName: supplierData?.BusinessName || "Unknown Business",
            };
          })
        );

        setBookedServices(servicesList);
      } catch (error) {
        console.error("Error fetching booked services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
    fetchBookedServices();
  }, [eventName, clientId]);  // Added clientId as a dependency

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading booked services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
           <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Image source={require("../images/back.png")} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Booked Services</Text>
              </View>

      {/* Event Section */}
      <View style={styles.eventContainer}>
        <Image
          source={eventImage ? { uri: eventImage } : require('../images/upevent.png')}
          style={styles.eventImage}
        />
        <Text style={styles.eventName}>{eventName}</Text>
      </View>
      <Text style={styles.booktext}>Booked Services</Text>

      {/* Booked Services Section */}
      {bookedServices.length === 0 ? (
        <Text style={styles.noDataText}>No booked services found for this event.</Text>
      ) : (
        <FlatList
          data={bookedServices}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.serviceItem}>
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : require('../images/upevent.png')}
                style={styles.serviceImage}
              />
              <Text style={styles.serviceName}>Service: {item.serviceName}</Text>
              <Text style={styles.supplierName}>Supplier: {item.supplierName}</Text>
              <Text style={styles.businessName}>Business: {item.BusinessName}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: "#5392DD",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        width: "111%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
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
  container: { flex: 1, padding: 20, backgroundColor: "#F9F9F9" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#555" },
  backButton: {
    marginBottom: 10,
    padding: 8,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  booktext:{
    fontSize: 30,
    fontWeight: '800',
    top: '10%',
  },
  eventContainer: {
    top: '10%',
    marginBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 2,
    borderBottomColor: '#5392DD',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    height: 130,
  },
  eventImage: {
    width: "30%",
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  eventName: { fontSize: 25, fontWeight: "bold", marginBottom: 5, bottom: 80, left: '35%', textDecorationLine: 'underline', },
  eventDate: { fontSize: 16, color: "#444" },
  noDataText: { marginTop: 30, textAlign: "center", color: "#777", fontSize: 16 },
  serviceItem: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 2,
    top: '30%',
  },
  serviceImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  serviceName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  supplierName: { fontSize: 14, color: "#555", marginBottom: 2 },
  businessName: { fontSize: 14, color: "#555" },
});

export default ViewBookedServicesScreen;
