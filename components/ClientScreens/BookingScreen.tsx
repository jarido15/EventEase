import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation

const BookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const navigation = useNavigation();  // Hook for navigation

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const currentUser = auth().currentUser;

        if (!currentUser) {
          console.log('User not logged in');
          return;
        }

        // Query the Bookings collection for the current user's bookings
        const bookingsSnapshot = await firestore()
          .collection('Bookings')
          .where('uid', '==', currentUser.uid)
          .get();

        if (!bookingsSnapshot.empty) {
          const bookingsData = await Promise.all(bookingsSnapshot.docs.map(async (doc) => {
            const bookingData = doc.data();
            const supplierSnapshot = await firestore()
              .collection('Suppliers')
              .where('supplierName', '==', bookingData.supplierName)
              .get();
            const supplierData = supplierSnapshot.empty ? {} : supplierSnapshot.docs[0].data();

            return {
              ...bookingData,
              supplierDetails: supplierData,
            };
          }));

          setBookings(bookingsData);
        } else {
          console.log('No bookings found');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const addToFavorites = async (serviceName, supplierName) => {
    const user = auth().currentUser;
    if (!user) return;
  
    // Check if both serviceName and supplierName are valid before proceeding
    if (!serviceName || !supplierName) {
      Alert.alert('Error', 'Invalid service or supplier information.');
      return;
    }
  
    try {
      // Find Supplier details by supplierName from the Bookings Collection
      const bookingSnapshot = await firestore()
        .collection('Bookings')
        .where('supplierName', '==', supplierName)
        .get();
  
      if (bookingSnapshot.empty) {
        Alert.alert('Error', 'Booking not found for this supplier.');
        return;
      }
  
      const bookingData = bookingSnapshot.docs[0].data();
      const imageUrl = bookingData.imageUrl; // Use imageUrl from Bookings collection
  
      // Now, find Supplier details from the Supplier collection based on supplierName
      const supplierSnapshot = await firestore()
        .collection('Supplier')  // Use the correct collection name 'Suppliers'
        .where('supplierName', '==', supplierName)
        .get();
  
      if (supplierSnapshot.empty) {
        Alert.alert('Error', 'Supplier not found.');
        return;
      }
  
      const supplierData = supplierSnapshot.docs[0].data();
      const supplierId = supplierSnapshot.docs[0].id;
  
      // Add the supplier to the Favorite Subcollection under the current user
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
        });
  
      // Update the UI
      setFavorites({ ...favorites, [supplierId]: true });
      Alert.alert('Success', 'Added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Could not add to favorites.');
    }
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
          <Image source={require('../images/back.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.header}>Your Bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <Text style={styles.noBookingsText}>You have no bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/300' }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.supplierName}>Supplier: {item.supplierName}</Text>
                <Text style={styles.location}>Location: {item.location}</Text>
                <Text style={styles.eventName}>Event Name: {item.eventName}</Text>
                <Text style={styles.eventPlace}>Event Place: {item.eventPlace}</Text>
                <Text style={styles.venueType}>Venue Type: {item.venueType}</Text>
                <Text style={styles.status}>Status: {item.status}</Text>
                <Text style={styles.price}>Price: ${item.servicePrice}</Text>

                {/* Add to Favorite button */}
                <TouchableOpacity 
                  onPress={() => addToFavorites(item.serviceName, item.supplierName)}  // Corrected to pass parameters
                  style={styles.favoriteButton}
                >
                  <Image source={require('../images/addfavorite.png')} style={styles.favoriteIcon} />
                  <Text style={styles.favoriteText}>Add to Favorites</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Ensures content is spaced evenly
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backButton: {
    width: 30,
    height: 30,
    tintColor: '#fff', // Ensure the back button is visible on the blue background
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
    marginHorizontal: 20, // Added margin to left and right of the card
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
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
});

export default BookingsScreen;
