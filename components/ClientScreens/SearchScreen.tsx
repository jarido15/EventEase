import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import functions from "@react-native-firebase/functions";
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

const SearchScreen = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([
    'Calapan', 'Naujan', 'Victoria', 'Socorro', 'Pola', 'Pinamalayan', 'Gloria'
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [eventTime, setEventTime] = useState(new Date());
  const [eventDate, setEventDate] = useState(new Date());
  const [eventPlace, setEventPlace] = useState('');
  const [venueType, setVenueType] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await firestore().collection("Supplier").get();
        let serviceList = [];
        let locationSet = new Set(locations);

        for (let doc of snapshot.docs) {
          const supplierData = doc.data();
          locationSet.add(supplierData.Location);

          const servicesSnapshot = await doc.ref
            .collection("Services")
            .orderBy("createdAt", "desc")
            .get();

          servicesSnapshot.forEach((serviceDoc) => {
            const serviceData = serviceDoc.data();
            serviceList.push({
              id: serviceDoc.id,
              supplierId: doc.id,
              ...serviceData,
              supplierName: supplierData.fullName,
              Location: supplierData.Location,
            });
          });
        }

        setServices(serviceList);
        setFilteredServices(serviceList);
        setLocations([...locationSet]);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterServices(query, location);
  };

  const handleLocationFilter = (selectedLocation) => {
    setLocation(selectedLocation);
    filterServices(searchQuery, selectedLocation);
  };

  const filterServices = (query, selectedLocation) => {
    let filtered = services;

    if (query.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.serviceName.toLowerCase().includes(query.toLowerCase()) ||
          item.supplierName.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((item) => item.location === selectedLocation);
    }

    setFilteredServices(filtered);
  };

  const handleBooking = (service) => {
    // Reset form fields when booking a new service
    resetForm();

    setSelectedService(service);
    setModalVisible(true);
  };

  const resetForm = () => {
    setEventDate(new Date());
    setEventTime(new Date());
    setEventPlace('');
    setVenueType('');
  };

  const handleSubmitBooking = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to book a service.");
        return;
      }

      if (!selectedService.supplierId) {
        Alert.alert("Error", "Supplier ID is missing. Please try again.");
        return;
      }

      // Check if the service is already booked by another user at the same time
      const existingBookingSnapshot = await firestore()
        .collection('Bookings')
        .where('serviceId', '==', selectedService.id)
        .where('eventDate', '==', eventDate.toISOString().split('T')[0])
        .where('eventTime', '==', eventTime.toISOString().split('T')[1].slice(0, 5))
        .get();

      if (!existingBookingSnapshot.empty) {
        // If the booking already exists, show an alert and don't proceed
        Alert.alert("Error", "This service is already booked for the selected time.");
        return;
      }

      // Check if the service is already booked by the current user (to avoid booking it again)
      const userBookingSnapshot = await firestore()
        .collection('Bookings')
        .where('userId', '==', currentUser.uid)
        .where('serviceId', '==', selectedService.id)
        .get();

      if (!userBookingSnapshot.empty) {
        Alert.alert("Error", "You have already booked this service.");
        return;
      }

      const serviceRef = firestore()
        .collection('Supplier')
        .doc(selectedService.supplierId)
        .collection('Services')
        .doc(selectedService.id);

      await firestore().collection('Bookings').add({
        userId: currentUser.uid, 
        serviceId: selectedService.id,
        supplierId: selectedService.supplierId,
        serviceName: selectedService.serviceName,
        supplierName: selectedService.supplierName,
        location: selectedService.Location,
        servicePrice: selectedService.servicePrice,
        imageUrl: selectedService.imageUrl,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'Pending',
        eventTime,
        eventDate,
        eventPlace,
        venueType,
      });

      const serviceDoc = await serviceRef.get();
      if (!serviceDoc.exists) {
        throw new Error("Service document not found");
      }

      await serviceRef.update({ status: 'Pending' });

      await sendPushNotification(selectedService.supplierId, selectedService.serviceName);

      Alert.alert('Success', 'Service booked successfully!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error booking service:', error);
      Alert.alert('Error', error.message || 'Failed to book the service. Please try again.');
    }
  };

  const sendPushNotification = async (supplierId, serviceName) => {
    try {
      const supplierDoc = await firestore().collection("Supplier").doc(supplierId).get();
      const supplierData = supplierDoc.data();
      const fcmToken = supplierData?.fcmToken;

      if (!fcmToken) {
        console.warn("No FCM token found for supplier:", supplierId);
        return;
      }

      const response = await functions().httpsCallable("sendPushNotification")({
        fcmToken,
        serviceName,
      });

      console.log("Push notification response:", response);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const showTimePickerHandler = () => {
    setShowTimePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEventTime(selectedTime);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Services</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search services or suppliers..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <Picker
        selectedValue={location}
        style={styles.picker}
        onValueChange={(itemValue) => handleLocationFilter(itemValue)}
      >
        <Picker.Item label="All Locations" value="" />
        {locations.map((loc, index) => (
          <Picker.Item key={`${loc}-${index}`} label={loc} value={loc} />
        ))}
      </Picker>

      {filteredServices.length === 0 ? (
        <Text style={styles.noDataText}>No services available</Text>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.supplierName}>Supplier: {item.supplierName}</Text>
                <Text style={styles.location}>Location: {item.Location}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBooking(item)}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}></View>
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Book {selectedService?.serviceName}</Text>

          <TextInput
            style={styles.input}
            placeholder="Event Date"
            value={eventDate.toLocaleDateString()}
            onFocus={showDatePickerHandler}
          />
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Event Time"
            value={eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            onFocus={showTimePickerHandler}
          />
          {showTimePicker && (
            <DateTimePicker
              value={eventTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter Event Place"
            value={eventPlace}
            onChangeText={setEventPlace}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Venue Type"
            value={venueType}
            onChangeText={setVenueType}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBooking}>
            <Text style={styles.submitButtonText}>Submit Booking</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#5392DD',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#5392DD',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  image: {
    width: '100%',
    height: 220,
  },
  cardContent: {
    padding: 16,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777',
    marginTop: 6,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  bookButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 40,
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SearchScreen;
