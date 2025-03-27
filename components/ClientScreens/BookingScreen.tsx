/* eslint-disable quotes */
/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

const BookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [gcashNumber, setGcashNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [viewedCancellations, setViewedCancellations] = useState(new Set()); // Track viewed cancellations
  const [cancelledService, setCancelledService] = useState(''); // Track cancelled service name
  const [cancelReason, setCancelReason] = useState(''); // Track cancelled reason
  const [cancelModalVisible, setCancelModalVisible] = useState(false); // Show modal for cancellations
  const navigation = useNavigation();
  const [dismissedBookings, setDismissedBookings] = useState(new Set()); // To track dismissed bookings
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('Bookings')
      .where('uid', '==', currentUser.uid)
      .where('status', '==', 'Pending') // Listen to both statuses
      .onSnapshot(async snapshot => {
        if (snapshot.empty) {
          console.log('No bookings found');
          setBookings([]);
          setLoading(false); // Stop loading when no bookings are found
          return;
        }

        const bookingsData = await Promise.all(
          snapshot.docs.map(async doc => {
            const bookingData = doc.data();

            // Skip dismissed bookings
            if (dismissedBookings.has(doc.id)) {
              return null;
            }

            // Fetch supplier details
            const supplierSnapshot = await firestore()
              .collection('Supplier')
              .where('supplierName', '==', bookingData.supplierName)
              .get();

            const supplierData = supplierSnapshot.empty
              ? {}
              : supplierSnapshot.docs[0].data();

            return {
              id: doc.id,
              ...bookingData,
              supplierDetails: supplierData,
            };
          }),
        );

        // Remove null entries (for dismissed bookings) and update state
        setBookings(bookingsData.filter(booking => booking !== null));
        setLoading(false); // Stop loading after data is fetched
      });

    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, [dismissedBookings]); 


  
  
  
  // Run whenever dismissed bookings change

  // Auto popup when a booking is cancelled
  useEffect(() => {
    if (bookings.length > 0) {
      const cancelledBooking = bookings.find(
        booking =>
          booking.status === 'Cancelled' &&
          !viewedCancellations.has(booking.id),
      );

      if (cancelledBooking) {
        setCancelledService(cancelledBooking.serviceName);
        setCancelReason(cancelledBooking.cancelReason || 'No reason provided');

        // Mark this cancellation as viewed
        setViewedCancellations(prev => new Set(prev).add(cancelledBooking.id));

        // Alert user about the cancellation
        Alert.alert(
          'Booking Update',
          `Your booking for ${
            cancelledBooking.serviceName
          } has been cancelled, due to reason: ${
            cancelledBooking.cancelReason || 'No reason provided.'
          }`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Add the cancelled booking to dismissed bookings set to remove from the list
                setDismissedBookings(prev =>
                  new Set(prev).add(cancelledBooking.id),
                );
              },
            },
          ],
        );
      }
    }
  }, [bookings]); // This effect triggers whenever bookings change

  // Real-time listener for cancelled bookings to trigger the alert immediately
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribeCancelled = firestore()
      .collection('Bookings')
      .where('uid', '==', currentUser.uid)
      .where('status', '==', 'Cancelled') // Listen for cancelled bookings only
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const cancelledBooking = change.doc.data();

            // Alert user about the cancellation
            Alert.alert(
              'Booking Update',
              `Your booking for ${
                cancelledBooking.serviceName
              } has been cancelled, due to reason: ${
                cancelledBooking.cancelReason ||
                'No reason provided, Your Downpayment will be return within 72 hours, Thank You.'
              }`,
            );

            // Optionally, add the cancelled booking to the `viewedCancellations` set
            setViewedCancellations(prev => new Set(prev).add(change.doc.id));
          }
        });
      });

    return () => unsubscribeCancelled(); // Cleanup the listener
  }, []);

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
      // Fetch the booking data based on supplierName
      const bookingSnapshot = await firestore()
        .collection('Bookings')
        .where('supplierName', '==', supplierName)
        .limit(1) // Limit to the first match, assuming you only need one booking per supplier
        .get();

      if (bookingSnapshot.empty) {
        Alert.alert('Error', 'Booking not found for this supplier.');
        return;
      }

      // Extract imageUrl from the booking document
      const bookingData = bookingSnapshot.docs[0].data();
      const imageUrl = bookingData.imageUrl;

      // Fetch supplier data based on supplierName
      const supplierSnapshot = await firestore()
        .collection('Supplier')
        .where('supplierName', '==', supplierName)
        .limit(1) // Limit to the first match
        .get();

      if (supplierSnapshot.empty) {
        Alert.alert('Error', 'Supplier not found.');
        return;
      }

      // Extract the supplier data
      const supplierData = supplierSnapshot.docs[0].data();
      const supplierId = supplierSnapshot.docs[0].id;

      // Add to favorites subcollection
      await firestore()
        .collection('Clients')
        .doc(user.uid)
        .collection('Favorite')
        .doc(supplierId)
        .set({
          serviceName: serviceName,
          supplierName: supplierName,
          imageUrl: imageUrl,
          BusinessName: supplierData.BusinessName,
          ContactNumber: supplierData.ContactNumber,
          email: supplierData.email,
          Location: supplierData.Location,
          supplierId: supplierId,
        });

      // Update local state or UI as needed
      setFavorites(prevFavorites => ({...prevFavorites, [supplierId]: true}));
      Alert.alert('Success', 'Added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Could not add to favorites.');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!gcashNumber || !referenceNumber || !amount) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to make a payment.');
        return;
      }

      // Check that serviceId and supplierId are available
      if (!selectedBooking.serviceId || !selectedBooking.supplierId) {
        Alert.alert('Error', 'Service or supplier ID is missing.');
        return;
      }

      // Fetch the booking data from the Bookings collection using serviceId and supplierId
      const bookingSnapshot = await firestore()
        .collection('Bookings')
        .where('serviceId', '==', selectedBooking.serviceId)
        .where('supplierId', '==', selectedBooking.supplierId)
        .get();

      if (bookingSnapshot.empty) {
        Alert.alert('Error', 'Booking not found.');
        return;
      }

      // Assuming we only have one booking match for the given serviceId and supplierId
      const bookingDoc = bookingSnapshot.docs[0];
      const bookingData = bookingDoc.data();
      const bookingRef = firestore().collection('Bookings').doc(bookingDoc.id);

      // Prepare the payment data
      const paymentData = {
        userId: currentUser.uid,
        serviceId: selectedBooking.serviceId,
        supplierId: selectedBooking.supplierId,
        serviceName: bookingData.serviceName, // Get serviceName from Booking
        supplierName: bookingData.supplierName, // Get supplierName from Booking
        servicePrice: bookingData.servicePrice, // Get servicePrice from Booking
        referenceNumber: referenceNumber,
        amountPaid: amount,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      // Log the payment data to verify before saving
      console.log('Payment Data:', paymentData);

      // Save the payment to Firestore in the Payments collection
      await firestore().collection('Payments').add(paymentData);

      // Update the booking status to "Paid"
      await bookingRef.update({status: 'Paid'});

      // Optionally, update any payment-related status or actions here
      Alert.alert(
        'Success',
        'Payment submitted successfully! Booking status updated to Paid.',
      );
      setModalVisible(false); // Close the modal after payment submission
    } catch (error) {
      console.error('Error submitting payment:', error);
      Alert.alert(
        'Error',
        error.message ||
          'There was an issue submitting the payment. Please try again.',
      );
    }
  };

  const openPaymentModal = async (serviceId, supplierId) => {
    try {
      // Fetch the corresponding supplier and service details
      const serviceSnapshot = await firestore()
        .collection('Supplier')
        .doc(supplierId)
        .collection('Services')
        .doc(serviceId)
        .get();

      if (serviceSnapshot.exists) {
        const serviceData = serviceSnapshot.data();
        setGcashNumber(serviceData.gcashNumber || ''); // Set the gcashNumber in the modal
        setSelectedBooking({serviceId, supplierId});
        setModalVisible(true);
      } else {
        Alert.alert('Error', 'Service not found.');
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  const handleCancelBooking = async (bookingId, serviceId, supplierId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              // 1. Fetch the booking details from the Bookings collection
              const bookingSnapshot = await firestore()
                .collection('Bookings')
                .doc(bookingId)
                .get();

              if (!bookingSnapshot.exists) {
                Alert.alert('Error', 'Booking not found.');
                return;
              }

              const bookingData = bookingSnapshot.data();
              const {eventDate, eventDuration} = bookingData;

              if (!eventDate || !eventDuration) {
                Alert.alert(
                  'Error',
                  'Event date or event duration is missing in the booking.',
                );
                return;
              }

              // 2. Fetch the Supplier's service and get the current unavailableDates array
              const serviceSnapshot = await firestore()
                .collection('Supplier')
                .doc(supplierId)
                .collection('Services')
                .doc(serviceId)
                .get();

              if (!serviceSnapshot.exists) {
                Alert.alert('Error', 'Service not found.');
                return;
              }

              const serviceData = serviceSnapshot.data();
              const unavailableDates = serviceData.unavailableDates || [];

              // 3. Format the eventDate and eventDuration
              const formattedEventDateStr = eventDate;
              const formattedEventDurationStr = eventDuration;

              // 4. Check if the eventDate and eventDuration exist in unavailableDates
              const updatedUnavailableDates = unavailableDates.map(date =>
                date.eventDate === formattedEventDateStr &&
                date.eventDuration === formattedEventDurationStr
                  ? {eventDate: '00-00-00', eventDuration: '00-00-00'}
                  : date,
              );

              // 5. If no update is made, show an alert
              if (
                updatedUnavailableDates.every(
                  date =>
                    date.eventDate !== '00-00-00' ||
                    date.eventDuration !== '00-00-00',
                )
              ) {
                Alert.alert(
                  'No update needed',
                  'The selected event date and duration were not found in unavailableDates.',
                );
                return;
              }

              // 6. Update the unavailableDates array in Firestore
              await firestore()
                .collection('Supplier')
                .doc(supplierId)
                .collection('Services')
                .doc(serviceId)
                .update({unavailableDates: updatedUnavailableDates});

              // 7. Delete the booking from the Bookings collection
              await firestore().collection('Bookings').doc(bookingId).delete();

              Alert.alert(
                'Success',
                'Booking has been cancelled and the service date updated. Your Downpayment will be return within 72 hours, Thank You.',
              );
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert(
                'Error',
                error.message || 'There was an issue cancelling the booking.',
              );
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Loading Bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with navigation back button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../images/back.png')}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.header}>Your Bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <Text style={styles.noBookingsText}>You have no bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri: item.imageUrl || 'https://via.placeholder.com/300',
                }}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.supplierName}>
                  Supplier: {item.supplierName}
                </Text>
                <Text style={styles.location}>Location: {item.location}</Text>
                <Text style={styles.eventName}>
                  Event Name: {item.eventName}
                </Text>
                <Text style={styles.eventPlace}>
                  Event Place: {item.eventPlace}
                </Text>
                <Text style={styles.venueType}>
                  Venue Type: {item.venueType}
                </Text>
                <Text style={styles.status}>Status: {item.status}</Text>
                <Text style={styles.price}>Price: ₱{item.servicePrice}</Text>

                {/* Add to Favorite button */}
                <TouchableOpacity
                  onPress={() =>
                    addToFavorites(item.serviceName, item.supplierName)
                  }
                  style={styles.favoriteButton}>
                  <Image
                    source={require('../images/addfavorite.png')}
                    style={styles.favoriteIcon}
                  />
                  <Text style={styles.favoriteText}>Add to Favorites</Text>
                </TouchableOpacity>

                {/* Show Pay Now only if paymentMethod is Gcash */}
                {item.paymentMethod === 'GCash' && (
                  <TouchableOpacity
                    onPress={() =>
                      openPaymentModal(item.serviceId, item.supplierId)
                    }
                    style={styles.paymentButton}>
                    <Text style={styles.paymentText}>💳 Pay Now</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() =>
                    handleCancelBooking(
                      item.id,
                      item.serviceId,
                      item.supplierId,
                      item.bookingDate,
                    )
                  }
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity onPress={() => navigation.navigate('CompleteService')}>
        <View style={styles.complete}>
          <Image
            source={require('../images/completed-task.png')}
            style={styles.bookicon}
          />
        </View>
      </TouchableOpacity>

      {/* Payment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Details</Text>
            <TextInput
              style={styles.input}
              placeholder="GCash Number"
              value={gcashNumber}
              placeholderTextColor={'#888'}
              editable={false} // Disable editing for the gcashNumber
            />
                   <TextInput
  placeholder="Enter Reference Number"
  placeholderTextColor={'#888'}
  style={[styles.input, { color: '#888' }]} // Added text color
  value={referenceNumber}
  onChangeText={text => {
    const filteredText = text.replace(/[^0-9]/g, '').slice(0, 13);
    setReferenceNumber(filteredText); // Fix: Updating referenceNumber, not gcashNumber
  }}
  keyboardType="numeric"
  maxLength={13}
/>

            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor={'#888'}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <Button title="Submit" onPress={handlePaymentSubmit} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#5392DD',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
  },
  noBookingsText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 15,
    backgroundColor: '#FAFAFA',
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
  status: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  favoriteIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  favoriteText: {
    fontSize: 16,
    color: '#007AFF',
  },
  paymentButton: {
    backgroundColor: '#5392DD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  paymentText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    color: '#888'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  complete: {
    width: 64,
    height: 64,
    borderRadius: 50,
    backgroundColor: '#5392DD',
    left: '80%',
    bottom: '60%',
    alignItems: 'center',
    justifyContent: 'center', // Ensures content is centered
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 4}, // Shadow position
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 4, // Shadow blur
    elevation: 5, // For Android shadow
  },

  bookicon: {
    width: 35,
    height: 35,
    alignSelf: 'center',
  },
});

export default BookingsScreen;
