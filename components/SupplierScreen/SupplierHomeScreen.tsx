import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Avatar, Card, Appbar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getFCMToken, requestUserPermission } from '../Notification/notificationService';

const SupplierHomeScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = auth().currentUser;
  const [servicesCount, setServicesCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .get();

      const servicesList = await Promise.all(snapshot.docs.map(async doc => {
        const serviceData = doc.data();
        const ratingsSnapshot = await firestore()
          .collection('Supplier')
          .doc(user.uid)
          .collection('Services')
          .doc(doc.id)
          .collection('Rating')
          .get();

        const ratings = ratingsSnapshot.docs.map(ratingDoc => ratingDoc.data().rating);
        const averageRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'No rating';

        return {
          id: doc.id,
          ...serviceData,
          averageRating,
        };
      }));

    setServices(servicesList);
  } catch (error) {
    console.error('Error fetching services:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchCounts = async () => {
    try {
      const servicesSnapshot = await firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .get();
      setServicesCount(servicesSnapshot.size);

      const historySnapshot = await firestore()
        .collection('Bookings')
        .where('supplierId', '==', user.uid)
        .where('status', '==', 'Paid')
        .get();
      setHistoryCount(historySnapshot.size);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCounts();
      fetchServices();
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

      // const setupNotifications = async () => {
      //   try {
      //     await requestUserPermission();
      //     const token = await getFCMToken();

      //     if (token) {
      //       console.log('FCM Token:', token);
      //       if (user) {
      //         await firestore().collection('Supplier').doc(user.uid).update({
      //           fcmToken: token,
      //         });
      //       }
      //     }
      //   } catch (error) {
      //     console.error('Error fetching FCM token:', error);
      //   }
      // };

      // setupNotifications();

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Dashboard" titleStyle={styles.headerTitle} />
        <TouchableOpacity onPress={() => navigation.navigate('SupplierProfileScreen')}>
          <Avatar.Image size={40} source={require('../images/profile-account.png')} />
        </TouchableOpacity>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Statistics Section */}
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
                      <Text style={styles.serviceRating}>Rating: {item.averageRating}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#003049',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    color: '#fdf0d5',
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
    marginBottom: 10,
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
    color: '#333',
    marginTop: 10,
  },
  servicePrice: {
    fontSize: 16,
    color: '#007bff',
    marginTop: 5,
  },
  serviceRating: {
    fontSize: 16,
    color: '#ffcc00',
    marginTop: 5,
  },
});

export default SupplierHomeScreen;