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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import functions from "@react-native-firebase/functions";

const SearchScreen = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([
    'Calapan', 'Naujan', 'Victoria', 'Socorro', 'Pola', 'Pinamalayan', 'Gloria'
  ]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snapshot = await firestore().collection('Supplier').get();
        let serviceList = [];
        let locationSet = new Set(locations);
  
        for (let doc of snapshot.docs) {
          const supplierData = doc.data();
          locationSet.add(supplierData.Location);
  
          const servicesSnapshot = await doc.ref
            .collection('Services')
            .orderBy('createdAt', 'desc')
            .get();
  
          servicesSnapshot.forEach((serviceDoc) => {
            serviceList.push({
              id: serviceDoc.id,
              supplierId: doc.id, // 🔥 Add supplierId (Supplier document ID)
              ...serviceDoc.data(),
              supplierName: supplierData.fullName,
              Location: supplierData.Location,
            });
          });
        }
  
        setServices(serviceList);
        setFilteredServices(serviceList);
        setLocations([...locationSet]);
      } catch (error) {
        console.error('Error fetching services:', error);
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
      filtered = filtered.filter((item) => item.Location === selectedLocation);
    }

    setFilteredServices(filtered);
  };

  const handleBooking = async (service) => {
    try {
        if (!service.supplierId) {
            Alert.alert("Error", "Supplier ID is missing. Please try again.");
            return;
        }

        const serviceRef = firestore()
            .collection('Supplier')
            .doc(service.supplierId)
            .collection('Services')
            .doc(service.id);

        // Create a new booking
        await firestore().collection('Bookings').add({
            serviceId: service.id,
            supplierId: service.supplierId,
            serviceName: service.serviceName,
            supplierName: service.supplierName,
            location: service.Location,
            servicePrice: service.servicePrice,
            imageUrl: service.imageUrl,
            timestamp: firestore.FieldValue.serverTimestamp(),
            status: 'Booked',
        });

        // Verify if the service document exists before updating
        const serviceDoc = await serviceRef.get();
        if (!serviceDoc.exists) {
            throw new Error("Service document not found");
        }

        // Update the service status to "Booked"
        await serviceRef.update({ status: 'Booked' });

        // 🔥 Send push notification
        await sendPushNotification(service.supplierId, service.serviceName);

        Alert.alert('Success', 'Service booked successfully!');
    } catch (error) {
        console.error('Error booking service:', error);
        Alert.alert('Error', error.message || 'Failed to book the service. Please try again.');
    }
};


const sendPushNotification = async (supplierId: string, serviceName: string) => {
  try {
      const supplierDoc = await firestore().collection("Supplier").doc(supplierId).get();
      const supplierData = supplierDoc.data();
      const fcmToken = supplierData?.fcmToken;

      if (!fcmToken) {
          console.warn("No FCM token found for supplier:", supplierId);
          return;
      }

      // Call Firebase Cloud Function
      const response = await functions().httpsCallable("sendPushNotification")({
          fcmToken,
          serviceName,
      });

      console.log("Push notification response:", response);
  } catch (error) {
      console.error("Error sending push notification:", error);
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
        {locations.map((loc) => (
          <Picker.Item key={loc} label={loc} value={loc} />
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
                <Text style={styles.price}>Price: ₱{item.servicePrice}</Text>
                
                {/* Book Now Button */}
                <TouchableOpacity style={styles.bookButton} onPress={() => handleBooking(item)}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    color: '#777',
    marginTop: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  bookButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;
