import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { SectionList } from 'react-native';
import { requestUserPermission, getFCMToken } from '../Notification/notificationService';

const Events = [
  { id: '1', name: 'Birthday Party', clientName: 'John Doe', date: '2025-03-10' },
  { id: '2', name: 'Anniversary Celebration', clientName: 'Emma Smith', date: '2025-06-15' },
];

const PlannerHomeScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();


  // Function to fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch all supplier documents
      const suppliersSnapshot = await firestore().collection('Supplier').get();
  
      let servicesList = [];
  
      // Step 2: Iterate over each supplier and fetch their services
      for (const supplierDoc of suppliersSnapshot.docs) {
        const servicesSnapshot = await supplierDoc.ref.collection('Services').get();
  
        const supplierServices = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Step 3: Add fetched services to the list
        servicesList = servicesList.concat(supplierServices);
      }
  
      // Step 4: Set the services state
      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };




const sections = [
  { title: 'Upcoming Events', data: Events },
  { title: 'Services', data: services },
];

<SectionList
  sections={sections}
  keyExtractor={(item, index) => item.id || index.toString()}
  renderSectionHeader={({ section: { title } }) => (
    <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 10 }}>{title}</Text>
  )}
  renderItem={({ item }) => {
    if (item.clientName) {
      // Render event card
      return (
        <Card style={{ margin: 10, padding: 20, borderRadius: 10, backgroundColor: '#f9c2ff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>{item.name}</Text>
          <Text style={{ fontSize: 16, color: '#555' }}>Client: {item.clientName}</Text>
          <Text style={{ fontSize: 16, color: '#555' }}>Date: {item.date}</Text>
        </Card>
      );
    } else {
      // Render service card
      return (
        <Card style={{ margin: 10 }}>
          <Card.Cover source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} />
          <Card.Content style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{item.serviceName}</Text>
            <Text>Price: Php {item.servicePrice}</Text>
          </Card.Content>
        </Card>
      );
    }
  }}
  ListEmptyComponent={
    loading ? (
      <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
    ) : (
      <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>
        No services added yet.
      </Text>
    )
  }
/>;



  
  
  // Use useFocusEffect to refresh data when returning to this screen
  useFocusEffect(
    useCallback(() => {
      fetchServices(); // Remove the `if (user)` check

      
    }, [])
  );
  

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#3498db' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 }}>Welcome, Event Planner</Text>
        <TouchableOpacity>
          <Avatar.Image size={40} source={{ uri: 'https://via.placeholder.com/100' }} />
        </TouchableOpacity>
      </View>
  
      {/* Render all sections in a single FlatList */}
      <FlatList
        ListHeaderComponent={
          <View>
            {/* Upcoming Events Section */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 10 }}>Upcoming Events</Text>
            <FlatList
              horizontal
              data={Events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={{ margin: 10, padding: 20, borderRadius: 10, backgroundColor: '#f9c2ff' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>{item.name}</Text>
                  <Text style={{ fontSize: 16, color: '#555' }}>Client: {item.clientName}</Text>
                  <Text style={{ fontSize: 16, color: '#555' }}>Date: {item.date}</Text>
                </Card>
              )}
            />
            <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 10 }}>Services</Text>
          </View>
        }
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={{ margin: 10 }}>
            <Card.Cover source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} />
            <Card.Content style={{ marginTop: 10 }}>
              {item.serviceName && (
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{item.serviceName}</Text>
              )}
              {item.servicePrice && <Text>Price: Php {item.servicePrice}</Text>}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>
              No services added yet.
            </Text>
          )
        }
      />
    </View>
  );
  
};

export default PlannerHomeScreen;
