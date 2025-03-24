/* eslint-disable no-trailing-spaces */
/* eslint-disable quotes */
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native'; // For navigation
import DateTimePicker from '@react-native-community/datetimepicker';
import Picker from 'react-native-picker-select';

const SupplierProfile = ({ route }) => {
  const { supplierId } = route.params;
  const [supplier, setSupplier] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [eventDuration, setEventDuration] = useState(new Date());
  const [eventName, setEventName] = useState('');
  const [eventPlace, setEventPlace] = useState('');
  const [venueType, setVenueType] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const navigation = useNavigation(); // Hook for navigation
  const [suggestions, setSuggestions] = useState([]);

  interface Service {
    id: string;
    supplierId: string;
    serviceName: string;
    servicePrice: number;
    imageUrl: string;
    description: string;
    location: string;
    supplierName: string;
    [key: string]: any; // To account for any other fields
  }
  

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        // Fetch supplier profile
        const doc = await firestore().collection('Supplier').doc(supplierId).get();
        if (doc.exists) {
          setSupplier(doc.data());
        }
  
        // Fetch services from the subcollection
        const servicesSnapshot = await firestore()
          .collection('Supplier')
          .doc(supplierId)
          .collection('Services')
          .get();
  
        const servicesList = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setServices(servicesList);
  
        // Fetch ratings from the Ratings collection
        const ratingsSnapshot = await firestore()
          .collection('Ratings')
          .where('supplierId', '==', supplierId)
          .get();
  
        if (!ratingsSnapshot.empty) {
          // Calculate overall rating
          const ratingsList = ratingsSnapshot.docs.map(doc => doc.data().rating);
          const totalRating = ratingsList.reduce((sum, rating) => sum + rating, 0);
          const averageRating = totalRating / ratingsList.length;
          
          setSupplier(prevSupplier => ({
            ...prevSupplier,
            averageRating: averageRating.toFixed(1) // Save average rating
          }));
        } else {
          setSupplier(prevSupplier => ({
            ...prevSupplier,
            averageRating: 'No Ratings'
          }));
        }
      } catch (error) {
        console.error('Error fetching supplier profile, services, or ratings:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSupplierData();
  }, [supplierId]);
  

  const addToFavorites = async (serviceName, supplierName) => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add favorites.');
      return;
    }

    if (!serviceName || !supplierName) {
      Alert.alert('Error', 'Invalid service or supplier information.');
      return;
    }

    try {
      const bookingSnapshot = await firestore()
        .collection('Bookings')
        .where('supplierName', '==', supplierName)
        .limit(1)
        .get();

      if (bookingSnapshot.empty) {
        Alert.alert('Error', 'Booking not found for this supplier.');
        return;
      }

      const bookingData = bookingSnapshot.docs[0].data();
      const imageUrl = bookingData.imageUrl;

      const supplierSnapshot = await firestore()
        .collection('Supplier')
        .where('supplierName', '==', supplierName)
        .limit(1)
        .get();

      if (supplierSnapshot.empty) {
        Alert.alert('Error', 'Supplier not found.');
        return;
      }

      const supplierData = supplierSnapshot.docs[0].data();
      const supplierId = supplierSnapshot.docs[0].id;

      await firestore()
        .collection('Clients')
        .doc(user.uid)
        .collection('Favorite')
        .doc(supplierId)
        .set({
          serviceName,
          supplierName,
          imageUrl,
          BusinessName: supplierData.BusinessName,
          ContactNumber: supplierData.ContactNumber,
          email: supplierData.email,
          Location: supplierData.Location,
          supplierId,
        });

      setFavorites(prevFavorites => ({ ...prevFavorites, [supplierId]: true }));
      Alert.alert('Success', 'Added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Could not add to favorites.');
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

  const handleDurationChange = (event, selectedDate) => {
    setShowDurationPicker(false);
    if (selectedDate) {
      setEventDuration(selectedDate);
    }
  };

  const handleBooking = () => {
    // Reset form fields when booking a new service
    resetForm();
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
  
      if (!selectedService?.supplierId || !eventDate || !eventDuration) {
        Alert.alert("Error", "Please fill in all the required fields.");
        return;
      }
      
      if (!selectedService) {
        Alert.alert("Error", "Selected service is undefined.");
        return;
      }
  
      const trimmedEventName = eventName.trim();
  
      const myEventSnapshot = await firestore()
        .collection("Clients")
        .doc(currentUser.uid)
        .collection("MyEvent")
        .where("status", "==", "Upcoming")
        .get({ source: "server" });
  
      const matchingEvent = myEventSnapshot.docs.find(doc => {
        const event = doc.data();
        return event.eventName.trim() === trimmedEventName;
      });
  
      if (!matchingEvent) {
        Alert.alert("Error", `No matching event found with the name: ${trimmedEventName}`);
        return;
      }
  
      const existingBookingSnapshot = await firestore()
        .collection("Bookings")
        .where("serviceId", "==", selectedService.id)
        .where("eventDate", "==", eventDate.toISOString().split("T")[0])
        .where("eventTime", "==", eventTime.toISOString().split("T")[1].slice(0, 5))
        .get();
  
      if (!existingBookingSnapshot.empty) {
        Alert.alert("Error", "This service is already booked for the selected time.");
        return;
      }
  
      const userBookingSnapshot = await firestore()
        .collection("Bookings")
        .where("uid", "==", currentUser.uid)
        .where("serviceId", "==", selectedService.id)
        .get();
  
      if (!userBookingSnapshot.empty) {
        Alert.alert("Error", "You have already booked this service.");
        return;
      }
  
      const serviceRef = firestore()
        .collection("Supplier")
        .doc(selectedService.supplierId)
        .collection("Services")
        .doc(selectedService.id);
  
      const serviceDoc = await serviceRef.get();
      if (!serviceDoc.exists) {
        throw new Error("Service document not found");
      }
  
      const serviceData = serviceDoc.data();
      const unavailableDates = serviceData?.unavailableDates || [];
  
      const eventStartDate = new Date(eventDate);
      const eventEndDate = new Date(eventDuration);
  
      if (eventEndDate < eventStartDate) {
        throw new Error("Event duration must be the same day or later than the event start date.");
      }
  
      const formattedEventDate = eventStartDate.toISOString().split("T")[0];
      const formattedEventEndDate = eventEndDate.toISOString().split("T")[0];
  
      const isUnavailable = unavailableDates.some(date => {
        return date.eventDate === formattedEventDate || date.eventDuration === formattedEventEndDate;
      });
  
      if (isUnavailable) {
        Alert.alert("Error", "This service is unavailable for the selected date and time.");
        return;
      }
  
      const newUnavailableDates = [
        ...unavailableDates,
        { eventDate: formattedEventDate, eventDuration: formattedEventEndDate }
      ];
  
      await serviceRef.update({
        unavailableDates: newUnavailableDates
      });
  
      const bookingData = {
        uid: currentUser.uid,
        serviceId: selectedService.id || "",
        supplierId: selectedService.supplierId || "",
        serviceName: selectedService.serviceName || "",
        supplierName: selectedService.supplierName || "",
        location: selectedService.location || "",
        servicePrice: selectedService.servicePrice || 0,
        imageUrl: selectedService.imageUrl || "",
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: "Pending",
        eventTime: eventTime.toISOString().split("T")[1].slice(0, 5),
        eventDate: formattedEventDate,
        eventPlace: eventPlace || "",
        venueType: venueType || "",
        paymentMethod: paymentMethod || "",
        referenceNumber: referenceNumber || "",
        eventName: eventName || "",
        eventDuration: formattedEventEndDate,
      };
  
      const docRef = await firestore().collection("Bookings").add(bookingData);
  
      await serviceRef.update({ status: "Pending" });
  
      // await sendPushNotification(selectedService.supplierId, selectedService.serviceName);
  
      // ✅ Navigate to PaymentMethodScreen with booking data
      navigation.navigate('PaymentMethodScreen', {
        bookingId: docRef.id,
        amount: selectedService.servicePrice,
        referenceNumber,
        eventName,
        eventDate: formattedEventDate,
        eventDuration: formattedEventEndDate,
        serviceName: selectedService.serviceName,
      });
  
      setModalVisible(false);
    } catch (error) {
      console.error("Error booking service:", error);
      Alert.alert("Error", error.message || "Failed to book the service. Please try again.");
    }
  };
  
  useEffect(() => {
    // Fetch event name suggestions when the user types in the event name input
    if (eventName.length > 2) {
      const fetchSuggestions = async () => {
        const userUid = auth().currentUser?.uid;
        if (!userUid) return;

        try {
          const eventNamesSnapshot = await firestore()
            .collection('Clients')
            .doc(userUid)
            .collection('MyEvent')
            .where('eventName', '>=', eventName)
            .where('eventName', '<=', eventName + '\uf8ff')
            .get();

          const events = eventNamesSnapshot.docs.map(doc => doc.data().eventName);
          setSuggestions(events);
        } catch (error) {
          console.error('Error fetching event names:', error);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [eventName]);
  
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSupplier}>Supplier not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button with an Image */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image
          source={require('../images/back1.png')} // Use your own image for back button
          style={styles.backButtonImage}
        />
      </TouchableOpacity>

      {/* Static header section for supplier info */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: supplier.profileImage }} style={styles.profileImage} />
        <Text style={styles.name}>{supplier.supplierName}</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.info}>📍 {supplier.Location}</Text>
          <Text style={styles.info}>📞 {supplier.ContactNumber}</Text>
          <Text style={styles.info}>📧 {supplier.email}</Text>
          <Text style={styles.rating}>⭐ {supplier.averageRating || 'No Ratings'}</Text>
        </View>
        <Text style={styles.description}>{supplier.description}</Text>
      </View>

      {/* FlatList for services (only this part is scrollable) */}
      <FlatList
  data={services}
  keyExtractor={item => item.id}
  renderItem={({ item }) => (
    <View style={styles.serviceCard}>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />}
      <Text style={styles.serviceName}>{item.serviceName}</Text>
      <Text style={styles.servicePrice}>₱{item.servicePrice || 'Not listed'}</Text>
      <Text style={styles.serviceDesc}>{item.description}</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => addToFavorites(item.serviceName, supplier.supplierName)}
        >
          <Text style={styles.favoriteButtonText}>💖 Add to Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBooking(item)} // Pass item to the handleBooking
        >
          <Text style={styles.bookButtonText}>📅 Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
  ListEmptyComponent={<Text style={styles.noServices}>No services available</Text>}
/>


<Modal visible={modalVisible} animationType="slide" transparent={true}>
      <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}></View>
      </TouchableOpacity>
      <View style={styles.modalContainer}>
        <FlatList
          data={['dummy']} // Placeholder to render the form fields
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => (
            <>
              <Text style={styles.modalTitle}>Book {selectedService?.serviceName}</Text>

              <Text style={styles.label}>Event Start Date:</Text>
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

              <Text style={styles.label}>Event End Date:</Text>
              <TextInput
                style={styles.input}
                placeholder="Event Duration (YYYY-MM-DD)"
                value={eventDuration.toLocaleDateString()}
                onFocus={() => setShowDurationPicker(true)}
              />
              {showDurationPicker && (
                <DateTimePicker
                  value={eventDuration}
                  mode="date"
                  display="default"
                  onChange={handleDurationChange}
                />
              )}

              <Text style={styles.label}>Event Time:</Text>
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

              <Text style={styles.label}>Event Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Event Name"
                value={eventName}
                placeholderTextColor={'#888'}
                onChangeText={setEventName}
              />
              {suggestions.length > 0 && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setEventName(item)}>
                      <Text style={styles.suggestionItem}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              <Text style={styles.label}>Event Place:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Event Place"
                value={eventPlace}
                placeholderTextColor={'#888'}
                onChangeText={setEventPlace}
              />

              <Text style={styles.label}>Select Event Venue Type:</Text>
              <Picker
                selectedValue={venueType}
                style={styles.picker1}
                onValueChange={(itemValue) => setVenueType(itemValue)}
              >
                <Picker.Item label="Select Venue" value="" />
                <Picker.Item label="Indoor" value="Indoor" />
                <Picker.Item label="Outdoor" value="Outdoor" />
              </Picker>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBooking}>
                <Text style={styles.submitButtonText}>Submit Booking</Text>
              </TouchableOpacity>
            </>
          )}
        />
      </View>
    </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5392DD',
    marginTop: 10,
  },
  picker1: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#5392DD',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#5392DD',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1,
    backgroundColor: 'transparent',
    padding: 10,
  },
  backButtonImage: { width: 30, height: 30 },
  headerContainer: { padding: 10, backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, elevation: 5, },
  profileImage: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  infoContainer: { marginTop: 10, alignItems: 'center' },
  info: { fontSize: 14, color: '#555', textAlign: 'center' },
  rating: { fontSize: 16, color: '#ffcc00', marginTop: 5, textAlign: 'center' },
  description: { fontSize: 16, color: '#777', marginTop: 10, textAlign: 'center' },
  serviceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginHorizontal: 15, marginBottom: 15, elevation: 5 },
  serviceImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 15 },
  serviceName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  servicePrice: { fontSize: 16, color: '#007AFF', marginTop: 5 },
  serviceDesc: { fontSize: 14, color: '#555', marginTop: 10 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  favoriteButton: { backgroundColor: '#ff6347', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  bookButton: { backgroundColor: '#007aff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  favoriteButtonText: { color: '#fff', fontWeight: 'bold' },
  bookButtonText: { color: '#fff', fontWeight: 'bold' },
  noServices: { fontSize: 16, fontStyle: 'italic', color: 'gray', textAlign: 'center', marginTop: 20 },
  noSupplier: { fontSize: 18, color: '#ff6347', textAlign: 'center', marginTop: 50 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginTop: 'auto',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  modalContent: {
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#888',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default SupplierProfile;
