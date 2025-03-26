import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

interface PlannerService {
  id: string;
  serviceName: string;
  servicePrice: string;
  imageUrl: string;
  description: string;
  selectedServices: string[];
  location: string;
  averageRating: string;
  avatarUrl?: string;
  uid: string;
  fullName: string;
}

const SearchPlannerScreen = () => {
  const navigation = useNavigation();
  const [plannerServices, setPlannerServices] = useState<PlannerService[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchPlannerServices = async () => {
      try {
        const plannerRef = await firestore().collection('Planner').get();
        const services: PlannerService[] = [];

        for (const plannerDoc of plannerRef.docs) {
          const plannerId = plannerDoc.id; // Get the doc ID from Planner collection
          const plannerServicesRef = plannerDoc.ref.collection('PlannerServices');
          const servicesSnapshot = await plannerServicesRef.get();
          const plannerData = plannerDoc.data();
          const fullName = plannerData.fullName || 'Unknown';

          servicesSnapshot.forEach((doc) => {
            const serviceData = doc.data();
            services.push({
              id: doc.id,
              serviceName: serviceData.serviceName,
              servicePrice: serviceData.servicePrice,
              selectedServices: serviceData.selectedServices || [],
              imageUrl: serviceData.imageUrl,
              description: serviceData.description,
              location: serviceData.location,
              averageRating: serviceData.averageRating,
              avatarUrl: serviceData.avatarUrl || '',
              uid: plannerId, // Pass the correct planner's document ID
              fullName,
            });
          });
        }

        setPlannerServices(services);
      } catch (error) {
        console.error('Error fetching planner services:', error);
      }
    };

    fetchPlannerServices();
  }, []);

  const handleContactPress = (plannerId, plannerName, plannerAvatar) => {
    navigation.navigate('ClientChatScreen', {
      user: {
        id: plannerId, // Now correctly using the doc.id from the Planner collection
        fullName: plannerName,
        avatarUrl: plannerAvatar,
      },
    });
  };

  const filteredServices = plannerServices.filter(service =>
    service.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../images/back.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.header}>Search Planner</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search services or suppliers..."
        value={searchQuery}
        placeholderTextColor="#888"
        onChangeText={setSearchQuery}
      />

      {filteredServices.length === 0 ? (
        <Text style={styles.noDataText}>No services found</Text>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                <Text style={styles.supplierName}>Planner: {item.fullName}</Text>
                <Text style={styles.price}>₱ {item.servicePrice}</Text>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.description}>{item.description}</Text>

                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContactPress(item.uid, item.fullName, item.avatarUrl)}
                >
                  <Text style={styles.contactButtonText}>Contact Planner</Text>
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
    padding: 16,
    backgroundColor: '#F5F5F5',
    paddingTop: 100,
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
    width: '109%',
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
    marginLeft: 20,
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 20,
    paddingLeft: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  card: {
    flexDirection: 'column',
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: '#007BFF',
    marginVertical: 4,
  },
  supplierName: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginVertical: 8,
  },
  contactButton: {
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});

export default SearchPlannerScreen;
