import React, { useState, useCallback, useEffect } from 'react';

import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Avatar, Card, Appbar, Divider } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getFCMToken, requestUserPermission } from '../Notification/notificationService';

const Events = [
  { id: '1', name: 'Birthday Party', clientName: 'John Doe', date: 'March 10, 2025' },
  { id: '2', name: 'Anniversary Celebration', clientName: 'Emma Smith', date: 'June 15, 2025' },
];

const SupplierHomeScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = auth().currentUser;
  const [servicesCount, setServicesCount] = useState(0);
const [historyCount, setHistoryCount] = useState(0);


  // Function to fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .orderBy('createdAt', 'desc')
        .get();

      const servicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when screen is focused

   
  useEffect(() => {
    if (user) {
      fetchCounts();
  

      // Set up a real-time listener
      const unsubscribe = firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
          const servicesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setServices(servicesList);
          setLoading(false);
        }, error => {
          console.error('Error fetching services:', error);
          setLoading(false);
        });

      // Request permission and get FCM token
      const setupNotifications = async () => {
        try {
          await requestUserPermission();
          const token = await getFCMToken();
  
          if (token) {
            console.log('FCM Token:', token);
            
            // Store this token in Firestore under the planner's user profile
            const user = auth().currentUser;
            if (user) {
              await firestore().collection('Supplier').doc(user.uid).set({
                fcmToken: token,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching FCM token:', error);
        }
      };

  
      // Cleanup listener on unmount
      return () => unsubscribe();
    }
  }, [user]);
  
  

  const fetchCounts = async () => {
    try {
      // Fetch total number of services
      const servicesSnapshot = await firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .get();
      setServicesCount(servicesSnapshot.size);
  
      // Fetch number of completed or cancelled services (history)
      const historySnapshot = await firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .where('status', 'in', ['Finished', 'Cancelled']) // Fetch both finished and cancelled
        .get();
      setHistoryCount(historySnapshot.size);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header style={styles.header}>
  <Appbar.Content title="Supplier Dashboard" titleStyle={styles.headerTitle} />
  <TouchableOpacity onPress={() => navigation.navigate('SupplierProfileScreen')}>
    <Avatar.Image size={40} source={require('../images/user.png')} />
  </TouchableOpacity>
</Appbar.Header>


      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Upcoming Events Section */}
        <View style={styles.section}>
  <View style={styles.statContainer}>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{servicesCount}</Text>
      <Text style={styles.statLabel}>Services</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{historyCount}</Text>
      <Text style={styles.statLabel}>Finished</Text>
    </View>
  </View>
</View>



        <Divider style={styles.divider} />

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Services</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
          ) : services.length === 0 ? (
            <Text style={styles.emptyText}>No services added yet.</Text>
          ) : (
            <FlatList
              data={services}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => navigation.navigate('ServiceEditScreen', { service: item })}>
                  <Card style={styles.serviceCard}>
                    <Card.Cover source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.serviceImage} />
                    <Card.Content>
                      <Text style={styles.serviceTitle}>{item.serviceName || 'No Name'}</Text>
                      <Text style={styles.servicePrice}>Php {item.servicePrice || 'N/A'}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular', 
  
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007bff',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Regular'
  },
  scrollView: {
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
     fontFamily: 'Poppins-Regular',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: '#ffebcc',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    width: 200,
  },
  eventTitle: {
    fontSize: 14,
     fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  eventText: {
    fontSize: 14,
    color: '#555',
  },
  divider: {
    marginVertical: 20,
    marginHorizontal: 20,
    height: 1,
    backgroundColor: '#ddd',
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  serviceCard: {
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  serviceImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
     fontFamily: 'Poppins-Regular',
    color: '#333',
    marginTop: 10,
  },
  servicePrice: {
    fontSize: 16,
    color: '#007bff',
    marginTop: 5,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 16,
    color: 'white',
  },
  
});

export default SupplierHomeScreen;