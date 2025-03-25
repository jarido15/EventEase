import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Alert, StyleSheet,
  TouchableOpacity, Image, TextInput, ScrollView,
  Modal,
  Button
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import StarRating from 'react-native-star-rating-widget';
import { auth } from '../../firebaseConfig';

const CompleteService = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null); // ✅ FIXED missing state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPaidBookings = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'You must be logged in.');
          return;
        }
  
        const bookingSnapshot = await firestore()
          .collection('Bookings')
          .where('status', '==', 'Paid')
          .where('uid', '==', currentUser.uid) // ✅ Only fetch bookings of the logged-in client
          .get();
  
        if (bookingSnapshot.empty) {
          setLoading(false);
          return;
        }
  
        const bookingList = await Promise.all(
          bookingSnapshot.docs.map(async (doc) => {
            const bookingData = { id: doc.id, ...doc.data() };
  
            const paymentSnapshot = await firestore()
              .collection('Payments')
              .where('serviceId', '==', bookingData.serviceId)
              .where('supplierId', '==', bookingData.supplierId)
              .get();
  
            let paymentTimestamp = null;
            if (!paymentSnapshot.empty) {
              const paymentData = paymentSnapshot.docs[0].data();
              paymentTimestamp = paymentData.timestamp
                ? paymentData.timestamp.toDate().toLocaleString()
                : 'N/A';
            }
  
            const ratingSnapshot = await firestore()
              .collection('Ratings')
              .where('bookingId', '==', bookingData.id)
              .where('userId', '==', currentUser.uid)
              .get();
  
            const isRated = !ratingSnapshot.empty;
  
            return { ...bookingData, paymentTimestamp, isRated };
          })
        );
  
        setBookings(bookingList);
        setFilteredBookings(bookingList);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        Alert.alert('Error', 'Failed to fetch bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPaidBookings();
  }, []);
  

  // Function to filter bookings based on search text
  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(booking =>
        booking.serviceName.toLowerCase().includes(text.toLowerCase()) ||
        booking.supplierName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  };

  const toggleModal = (booking = null) => {
    setSelectedBooking(booking);
    setIsModalVisible(!isModalVisible);
  };

  const handleRatingSubmit = async () => {
    if (!selectedBooking) {
      Alert.alert('Error', 'No booking selected.');
      return;
    }

    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      // Check if supplierId is present in selectedBooking
      if (!selectedBooking.supplierId) {
        Alert.alert('Error', 'Supplier ID is missing in the booking.');
        return;
      }

      // Fetch the supplier document by matching supplierId with Supplier collection document ID
      const supplierRef = firestore().collection('Supplier').doc(selectedBooking.supplierId);
      const supplierDoc = await supplierRef.get();

      if (!supplierDoc.exists) {
        Alert.alert('Error', 'Supplier not found.');
        return;
      }

      // Extract BusinessName from the supplier document
      const businessName = supplierDoc.data().BusinessName || 'Unknown';

      // Save the rating to Firestore
      await firestore().collection('Ratings').add({
        bookingId: selectedBooking.id,  // Include the bookingId here
        serviceName: selectedBooking.serviceName,
        supplierName: selectedBooking.supplierName,
        supplierId: selectedBooking.supplierId,
        BusinessName: businessName,  // Correct field name
        rating: rating,
        comment: comment,
        userId: userId,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      await firestore().collection('Supplier').doc(selectedBooking.supplierId).collection('Services').doc(selectedBooking.serviceId).collection('Rating').add({
        bookingId: selectedBooking.id,  // Include the bookingId here
        serviceName: selectedBooking.serviceName,
        supplierName: selectedBooking.supplierName,
        supplierId: selectedBooking.supplierId,
        BusinessName: businessName,  // Correct field name
        rating: rating,
        comment: comment,
        userId: userId,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Rating submitted successfully!');
      setIsModalVisible(false);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <ScrollView contentContainerStyle={styles.bookingContent}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        )}
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={styles.supplierName}>Supplier: {item.supplierName}</Text>
        <Text style={styles.location}>Location: {item.location}</Text>
        <Text style={styles.eventName}>Event Name: {item.eventName}</Text>
        <Text style={styles.eventPlace}>Event Place: {item.eventPlace}</Text>
        <Text style={styles.venueType}>Venue Type: {item.venueType}</Text>
        <Text style={styles.servicePrice}>Service Price: ${item.servicePrice}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.timestamp}>Payment Date: {item.paymentTimestamp}</Text>

        {/* Show the "Rate Service" button only if the booking has not been rated yet */}
        {!item.isRated && (
          <TouchableOpacity style={styles.rateButton} onPress={() => toggleModal(item)}>
            <Text style={styles.rateButtonText}>Rate Service</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../images/back.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.header}>Completed Bookings</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by Service Name or Supplier Name"
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No completed bookings yet.</Text>}
      />

<Modal visible={isModalVisible} transparent animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Rate Service</Text>
      <StarRating rating={rating} onChange={setRating} starSize={30} />
      <TextInput
        style={styles.commentInput}
        placeholder="Write a comment"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleRatingSubmit}>
        <Text style={styles.submitButtonText}>Submit Rating</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#5392DD',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: '112%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  backButton: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.2,
    left: '20%',
  },
  searchBar: {
    marginTop: 60,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#5392DD',
  },
  bookingItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 15,
    marginHorizontal: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
    maxHeight: 800, // Set a max height
  },
  bookingContent: {
    flexGrow: 1,
    padding: 15,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  eventName: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  eventPlace: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  venueType: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  rateButton: { backgroundColor: '#5392DD', padding: 10, borderRadius: 10, marginTop: 10 },
  rateButtonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentInput: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50', // Green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f44336', // Red
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CompleteService;
