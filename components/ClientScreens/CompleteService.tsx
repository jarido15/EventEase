import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Alert, StyleSheet,
  TouchableOpacity, Image, TextInput, ScrollView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const CompleteService = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPaidBookings = async () => {
      try {
        const bookingSnapshot = await firestore()
          .collection('Bookings')
          .where('status', '==', 'Paid')
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
              paymentTimestamp = paymentData.timestamp ? paymentData.timestamp.toDate().toLocaleString() : 'N/A';
            }

            return { ...bookingData, paymentTimestamp };
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
        ListEmptyComponent={<Text style={styles.emptyMessage}>No paid bookings found.</Text>}
      />
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
    maxHeight: 500, // Set a max height
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
});

export default CompleteService;
