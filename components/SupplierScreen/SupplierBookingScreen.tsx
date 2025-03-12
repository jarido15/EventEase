import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useState, useEffect } from 'react';

// 🔹 Booking Card Component
const BookingCard = ({ name, date }: { name: string; date: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      <Text style={styles.bold}>Name:</Text> {name}
    </Text>
    <Text style={styles.cardTitle}>
      <Text style={styles.bold}>Date:</Text> {date}
    </Text>
    <Text style={styles.tapText}>Tap to view details</Text>
  </View>
);

const PendingScreen = () => {
  const [pendingServices, setPendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelReason, setShowCancelReason] = useState(false);
  const user = auth().currentUser;

  useEffect(() => {
    if (user) {
      const unsubscribe = firestore()
        .collection('Bookings')
        .where('supplierId', '==', user.uid)
        .where('status', '==', 'Pending')
        .onSnapshot(snapshot => {
          const servicesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPendingServices(servicesList);
          setLoading(false);
        }, error => {
          console.error('Error fetching pending services:', error);
          setLoading(false);
        });

      return () => unsubscribe();
    }
  }, [user]);

  const openModal = (service) => {
    setSelectedService(service);
    setModalVisible(true);
    setShowCancelReason(false);
    setCancelReason('');
  };

  const acceptService = async () => {
    if (!selectedService) return;

    setUpdating(true);
    try {
      const batch = firestore().batch();
      const bookingRef = firestore()
        .collection('Bookings')
        .doc(selectedService.id);

      // Update the booking status to 'Booked'
      batch.update(bookingRef, { status: 'Booked' });

      // Get the serviceId from the selectedService
      const serviceId = selectedService.serviceId;

      // Update the service status in Supplier -> Services
      const serviceRef = firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .doc(serviceId);

      // Add the eventDate and eventDuration to the unavailableDates array
      const unavailableDates = firestore.FieldValue.arrayUnion({
        eventDate: selectedService.eventDate,
        eventDuration: selectedService.eventDuration,
      });

      batch.update(serviceRef, { unavailableDates });

      // Commit batch updates
      await batch.commit();

      Alert.alert('Success', 'Service and Booking have been updated to Booked!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating service and booking:', error);
      Alert.alert('Error', 'Failed to update service and booking.');
    } finally {
      setUpdating(false);
    }
  };

  const cancelService = async () => {
    if (!selectedService || !cancelReason) {
      Alert.alert('Error', 'Please provide a reason for canceling.');
      return;
    }

    setUpdating(true);
    try {
      const bookingRef = firestore()
        .collection('Bookings')
        .doc(selectedService.id);

      // Update the booking status to 'Cancelled' and add the cancel reason
      await bookingRef.update({
        status: 'Cancelled',
        cancelReason: cancelReason,
      });

      Alert.alert('Success', 'Booking has been cancelled.');
      setModalVisible(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking.');
    } finally {
      setUpdating(false);
    }
  };



  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.topAlignedContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : pendingServices.length === 0 ? (
          <Text style={styles.emptyText}>No pending services found.</Text>
        ) : (
          pendingServices.map(service => (
            <TouchableOpacity key={service.id} onPress={() => openModal(service)}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  <Text style={styles.bold}>Service:</Text> {service.serviceName}
                </Text>
                <Text style={styles.cardTitle}>
                  <Text style={styles.bold}>Date:</Text> {(service.eventDate)}
                </Text>
                <Text style={styles.tapText}>Tap to view details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 🔹 Modal for Service Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>Service Details</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Service:</Text> {selectedService.serviceName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Location:</Text> {selectedService.location || 'Not specified'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Date:</Text> {(selectedService.eventDate)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Duration:</Text> {selectedService.eventDuration || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Name:</Text> {selectedService.eventName || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Place:</Text> {selectedService.eventPlace || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Venue Type:</Text> {selectedService.venueType || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Reference Number:</Text> {selectedService.referenceNumber || 'N/A'}
                </Text>

                {/* 🔹 Accept Button */}
                {!showCancelReason && (
                  <TouchableOpacity
                    style={[styles.acceptButton, updating && styles.disabledButton]}
                    onPress={acceptService}
                    disabled={updating}
                  >
                    <Text style={styles.acceptButtonText}>{updating ? 'Updating...' : 'Accept & Book'}</Text>
                  </TouchableOpacity>
                )}

                {/* 🔹 Cancel Button */}
                {!showCancelReason && (
                  <TouchableOpacity
                    style={[styles.cancelButton, updating && styles.disabledButton]}
                    onPress={() => setShowCancelReason(true)}
                    disabled={updating}
                  >
                    <Text style={styles.cancelButtonText}>{updating ? 'Updating...' : 'Cancel Booking'}</Text>
                  </TouchableOpacity>
                )}

                {/* 🔹 Cancel Reason Input and Confirm Button */}
                {showCancelReason && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Reason for canceling"
                      value={cancelReason}
                      onChangeText={setCancelReason}
                    />
                    <TouchableOpacity
                      style={[styles.cancelButton, updating && styles.disabledButton]}
                      onPress={cancelService}
                      disabled={updating}
                    >
                      <Text style={styles.cancelButtonText}>{updating ? 'Updating...' : 'Confirm Cancellation'}</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* 🔹 Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
const OngoingScreen = () => {
  const [ongoingServices, setOngoingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [updating, setUpdating] = useState(false);
  const user = auth().currentUser;

  useEffect(() => {
    if (user) {
      const unsubscribe = firestore()
        .collection('Bookings')
        .where('supplierId', '==', user.uid)
        .where('status', '==', 'Booked')
        .onSnapshot(snapshot => {
          const servicesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOngoingServices(servicesList);
          setLoading(false);
        }, error => {
          console.error('Error fetching ongoing services:', error);
          setLoading(false);
        });

      return () => unsubscribe();
    }
  }, [user]);

  const openModal = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const finishService = async () => {
    if (!selectedService) return;

    setUpdating(true);
    try {
      const batch = firestore().batch();
      const bookingRef = firestore()
        .collection('Bookings')
        .doc(selectedService.id);

      // Update the booking status to 'Finished'
      batch.update(bookingRef, { status: 'Finished' });

      // Get the serviceId from the selectedService
      const serviceId = selectedService.serviceId;

      // Update the service status in Supplier -> Services
      const serviceRef = firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .doc(serviceId);

      // Remove the specific eventDate and eventDuration from the unavailableDates array
      const unavailableDates = firestore.FieldValue.arrayRemove({
        eventDate: selectedService.eventDate,
        eventDuration: selectedService.eventDuration,
      });

      batch.update(serviceRef, { unavailableDates });

      // Commit batch updates
      await batch.commit();

      Alert.alert('Success', 'Service and Booking have been updated to Finished!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating service and booking:', error);
      Alert.alert('Error', 'Failed to update service and booking.');
    } finally {
      setUpdating(false);
    }
  };



  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.topAlignedContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : ongoingServices.length === 0 ? (
          <Text style={styles.emptyText}>No ongoing services found.</Text>
        ) : (
          ongoingServices.map(service => (
            <TouchableOpacity key={service.id} onPress={() => openModal(service)}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  <Text style={styles.bold}>Service:</Text> {service.serviceName}
                </Text>
                <Text style={styles.cardTitle}>
                  <Text style={styles.bold}>Date:</Text> {(service.eventDate)}
                </Text>
                <Text style={styles.tapText}>Tap to view details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 🔹 Modal for Service Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>Service Details</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Service:</Text> {selectedService.serviceName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Location:</Text> {selectedService.location || 'Not specified'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Date:</Text> {(selectedService.eventDate)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Duration:</Text> {selectedService.eventDuration || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Name:</Text> {selectedService.eventName || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Place:</Text> {selectedService.eventPlace || 'N/A'}
                </Text>

                {/* 🔹 Finish Button */}
                <TouchableOpacity
                  style={[styles.acceptButton, updating && styles.disabledButton]}
                  onPress={finishService}
                  disabled={updating}
                >
                  <Text style={styles.acceptButtonText}>{updating ? 'Updating...' : 'Finish'}</Text>
                </TouchableOpacity>

                {/* 🔹 Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FinishScreen = () => {
  const [pendingServices, setPendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [updating, setUpdating] = useState(false);
  const user = auth().currentUser;

  useEffect(() => {
    if (user) {
      fetchPendingServices();
    }
  }, [user]);

  const fetchPendingServices = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('Bookings')
        .where('supplierId', '==', user.uid)
        .where('status', '==', 'Finished')
        .get();

      const servicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingServices(servicesList);
    } catch (error) {
      console.error('Error fetching Finished services:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

 



  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.topAlignedContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : pendingServices.length === 0 ? (
          <Text style={styles.emptyText}>No finished services found.</Text>
        ) : (
          pendingServices.map(service => (
            <TouchableOpacity key={service.id} onPress={() => openModal(service)}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  <Text style={styles.bold}>Service:</Text> {service.serviceName}
                </Text>
                <Text style={styles.cardTitle}>
                  <Text style={styles.bold}>Date:</Text> {(service.eventDate)}
                </Text>
                <Text style={styles.tapText}>Tap to view details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 🔹 Modal for Service Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>Service Details</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Service:</Text> {selectedService.serviceName}
                </Text>
          
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Location:</Text> {selectedService.location || 'Not specified'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Date:</Text> {(selectedService.eventDate)}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Duration:</Text> {selectedService.eventDuration || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Name:</Text> {selectedService.eventName || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Event Place:</Text> {selectedService.eventPlace || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Venue Type:</Text> {selectedService.venueType || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Reference Number:</Text> {selectedService.referenceNumber || 'N/A'}
                </Text>

                {/* 🔹 Accept Button */}
              

                {/* 🔹 Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CancelledScreen = () => (
  <ScrollView contentContainerStyle={styles.screenContainer}>
    <BookingCard name="Cancelled" date="April 20, 2025" />
  </ScrollView>
);

const Tab = createMaterialTopTabNavigator();

// 🔹 Main Booking Screen
const SupplierBookingScreen = () => {
  return (
    <View style={styles.container}>
      {/* 🔹 Title */}
      <Text style={styles.title}>Booking</Text>

      <Tab.Navigator
        initialRouteName="Pending"
        screenOptions={{
          lazy: false,
          tabBarIndicatorStyle: {
            backgroundColor: 'blue', // Debug: Force it to be visible
            height: 3,
            width: '25%', // Fix potential width issues
          },
        }}
      >
        <Tab.Screen name="Pending" component={PendingScreen} />
        <Tab.Screen name="Ongoing" component={OngoingScreen} />
        <Tab.Screen name="Finished" component={FinishScreen} />
        <Tab.Screen name="Cancelled" component={CancelledScreen} />
      </Tab.Navigator>
    </View>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    color: '#333',
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  acceptButton: {
    marginTop: 15,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  screenContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  topAlignedContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  tapText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  cancelButton: {
    marginTop: 15,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SupplierBookingScreen;
