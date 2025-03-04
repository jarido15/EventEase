
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Modal
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
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .where('status', '==', 'Pending')
        .get();

      const servicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingServices(servicesList);
    } catch (error) {
      console.error('Error fetching pending services:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const acceptService = async () => {
    if (!selectedService) return;
  
    setUpdating(true);
    try {
      const batch = firestore().batch();
      const serviceRef = firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .doc(selectedService.id);
  
      // Update the service status in Supplier -> Services
      batch.update(serviceRef, { status: 'Booked' });
  
      // Find and update the corresponding booking in Bookings collection
      const bookingsSnapshot = await firestore()
        .collection('Bookings')
        .where('serviceId', '==', selectedService.id)
        .get();
  
      bookingsSnapshot.forEach(doc => {
        const bookingRef = firestore().collection('Bookings').doc(doc.id);
        batch.update(bookingRef, { status: 'Booked' });
      });
  
      // Commit batch updates
      await batch.commit();
  
      Alert.alert('Success', 'Service and Booking have been updated to Booked!');
      setModalVisible(false);
      fetchPendingServices(); // Refresh the pending list
    } catch (error) {
      console.error('Error updating service and booking:', error);
      Alert.alert('Error', 'Failed to update service and booking.');
    } finally {
      setUpdating(false);
    }
  };
  

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.screenContainer}>
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
                  <Text style={styles.bold}>Date:</Text> {service.date || 'N/A'}
                </Text>
                <Text style={styles.tapText}>Tap to view details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 🔹 Modal for Service Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>Service Details</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Service:</Text> {selectedService.serviceName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Date:</Text> {selectedService.date || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Location:</Text> {selectedService.location || 'Not specified'}
                </Text>

                {/* 🔹 Accept Button */}
                <TouchableOpacity
                  style={[styles.acceptButton, updating && styles.disabledButton]}
                  onPress={acceptService}
                  disabled={updating}
                >
                  <Text style={styles.acceptButtonText}>{updating ? 'Updating...' : 'Accept & Book'}</Text>
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



const OngoingScreen = () => {
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
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .where('status', '==', 'Booked')
        .get();

      const servicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingServices(servicesList);
    } catch (error) {
      console.error('Error fetching pending services:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const acceptService = async () => {
    if (!selectedService) return;
  
    setUpdating(true);
    try {
      const batch = firestore().batch();
      const serviceRef = firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .doc(selectedService.id);
  
      // Update the service status in Supplier -> Services
      batch.update(serviceRef, { status: 'Finished' });
  
      // Find and update the corresponding booking in Bookings collection
      const bookingsSnapshot = await firestore()
        .collection('Bookings')
        .where('serviceId', '==', selectedService.id)
        .get();
  
      bookingsSnapshot.forEach(doc => {
        const bookingRef = firestore().collection('Bookings').doc(doc.id);
        batch.update(bookingRef, { status: 'Finished' });
      });
  
      // Commit batch updates
      await batch.commit();
  
      Alert.alert('Success', 'Service and Booking have been updated to Booked!');
      setModalVisible(false);
      fetchPendingServices(); // Refresh the pending list
    } catch (error) {
      console.error('Error updating service and booking:', error);
      Alert.alert('Error', 'Failed to update service and booking.');
    } finally {
      setUpdating(false);
    }
  };
  

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.screenContainer}>
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
                  <Text style={styles.bold}>Date:</Text> {service.date || 'N/A'}
                </Text>
                <Text style={styles.tapText}>Tap to view details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 🔹 Modal for Service Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>Service Details</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Service:</Text> {selectedService.serviceName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Date:</Text> {selectedService.date || 'N/A'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Location:</Text> {selectedService.location || 'Not specified'}
                </Text>

                {/* 🔹 Accept Button */}
                <TouchableOpacity
                  style={[styles.acceptButton, updating && styles.disabledButton]}
                  onPress={acceptService}
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

const FinishScreen = () => (
  <ScrollView contentContainerStyle={styles.screenContainer}>
    <BookingCard name="Finished" date="Jan. 15, 2025" />
  </ScrollView>
);

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


      <Tab.Navigator initialRouteName="Pending"   screenOptions={{
    lazy: false,
    tabBarIndicatorStyle: {
      backgroundColor: 'blue', // Debug: Force it to be visible
      height: 3, 
      width: '25%', // Fix potential width issues
    },
  }}>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
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
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: 'gray',
  },
  screenContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#D9D9D9',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    color: 'black',
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
});

export default SupplierBookingScreen;
