import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { BackHandler, Alert } from 'react-native';


import auth from '@react-native-firebase/auth';
const Events = [
  { id: '1', name: 'Birthday Party', clientName: 'John Doe', date: '2025-03-10' },
  { id: '2', name: 'Anniversary Celebration', clientName: 'Emma Smith', date: '2025-06-15' },
];

const PlannerHomeScreen = () => {
  const [services, setServices] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const navigation = useNavigation(); 
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'supplier', title: 'Supplier' }, 
    { key: 'myServices', title: 'My Services' },
  ]);
  const handleIndexChange = (newIndex: number) => {
    console.log("Tab changed to:", newIndex); // Debugging log
    setIndex(newIndex);
  };
  

  // Fetch services from Supplier Collection
  const fetchServices = async () => {
    setLoading(true);
    try {
      const suppliersSnapshot = await firestore().collection('Supplier').get();
      let servicesList = [];

      for (const supplierDoc of suppliersSnapshot.docs) {
        const servicesSnapshot = await supplierDoc.ref.collection('Services').get();
        const supplierServices = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        servicesList = servicesList.concat(supplierServices);
      }

      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true; // prevent default behavior
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove(); // clean up the listener
  }, []);
  

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
      fetchServices();
      fetchMyServices();
    }, [])
  );

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EditService', { service: item })} // ✅ No more error
    >
      <Card style={{ margin: 10 }}>
        <Card.Cover source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} />
        <Card.Content style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{item.serviceName}</Text>
          <Text>Price: Php {item.servicePrice}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // Services Tab
  const ServicesTab = () => (
    loading ? <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
    : services.length > 0 ? <FlatList data={services} keyExtractor={(item) => item.id} renderItem={renderServiceCard} />
    : <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>No services added yet.</Text>
  );

  // My Services Tab
  const MyServicesTab = () => (
    loading ? <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
    : myServices.length > 0 ? <FlatList data={myServices} keyExtractor={(item) => item.id} renderItem={renderServiceCard} />
    : <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>No planner services added yet.</Text>
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

      {/* Upcoming Events Section */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 10 }}>Upcoming Events</Text>
      <View>
 
  
  <FlatList
    horizontal
    data={Events}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 5 }} // Reduce extra spacing
    showsHorizontalScrollIndicator={false} // Hide scroll indicator
    renderItem={({ item }) => (
      <Card style={{ marginRight: 10, borderRadius: 10, width: 200 }}> 
        <Card.Content>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ fontSize: 14, color: '#555' }}>Client: {item.clientName}</Text>
          <Text style={{ fontSize: 14, color: '#555' }}>Date: {item.date}</Text>
        </Card.Content>
      </Card>
    )}
  />
</View>


      {/* Tab View */}
      <TabView
  navigationState={{ index, routes }}
  renderScene={SceneMap({
    supplier: ServicesTab, 
    myServices: MyServicesTab,
  })}
  onIndexChange={handleIndexChange}
  initialLayout={{ width: Dimensions.get('window').width }}
  renderTabBar={props => (
    <TabBar 
      {...props} 
      indicatorStyle={{ display: 'none' }} // Hides the indicator
    />
  )}
/>;

    </View>
  );
};

export default PlannerHomeScreen;
