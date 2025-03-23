import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const PlannerHomeScreen = () => {
  const [myServices, setMyServices] = useState([]);
  const navigation = useNavigation(); 
  const [loading, setLoading] = useState(true);

  // Fetch services from Planner Collection
  const fetchMyServices = async () => {
    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) return;

      const servicesSnapshot = await firestore()
        .collection('Planner')
        .doc(user.uid)
        .collection('PlannerServices')
        .get();

      const myServicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMyServices(myServicesList);
    } catch (error) {
      console.error('Error fetching planner services:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyServices();
    }, [])
  );

  const renderPlannerCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EditService', { service: item })} 
    >
      <Card style={{ margin: 10 }}>
        <Card.Cover source={{ uri: item.eventImage || 'https://via.placeholder.com/150' }} />
        <Card.Content style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{item.eventName}</Text>
          <Text>Price: Php {item.price}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 25, backgroundColor: '#003049' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fdf0d5', flex: 1 }}>Dashboard</Text>
        <TouchableOpacity>
  
        </TouchableOpacity>
      </View>
<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000',padding: 10 }}>Services</Text>
      {/* My Services Section */}
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
      ) : myServices.length > 0 ? (
        <FlatList data={myServices} keyExtractor={(item) => item.id} renderItem={renderPlannerCard} />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>No planner services added yet.</Text>
      )}
    </View>
  );
};

export default PlannerHomeScreen;