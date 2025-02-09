import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Events = [
  { id: '1', name: 'Birthday Party', clientName: 'John Doe', date: '2025-03-10' },
  { id: '2', name: 'Anniversary Celebration', clientName: 'Emma Smith', date: '2025-06-15' },
];

const SupplierHomeScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = auth().currentUser;

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

  // Use useFocusEffect to refresh data when returning to this screen
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchServices();
      }
    }, [user])
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#3498db' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 }}>Welcome, Supplier</Text>
        <TouchableOpacity>
          <Avatar.Image size={40} source={{ uri: 'https://via.placeholder.com/100' }} />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {/* Upcoming Events Section */}
        <View>
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
        </View>
        
        {/* Services Section */}
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 10 }}>Your Services</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
          ) : services.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>
              No services added yet.
            </Text>
          ) : (
            <FlatList
              data={services}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ServiceEditScreen', { service: item })}
                >
                <Card style={{ margin: 10 }}>
  <Card.Cover source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} />
  
  <Card.Content style={{ marginTop: 10 }}>
    {/* Ensure serviceName exists before rendering */}
    {item.serviceName ? (
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
        {item.serviceName}
      </Text>
    ) : null}

    {/* Ensure servicePrice exists before rendering */}
    {item.servicePrice ? (
      <Text>Price: Php {item.servicePrice}</Text>
    ) : null}
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

export default SupplierHomeScreen;
