import React from 'react';
import { View, Text, FlatList, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, Card } from 'react-native-paper';


const Events = [
    { id: '1', name: 'Birthday Party', clientName: 'John Doe', date: '2025-03-10' },
    { id: '2', name: 'Anniversary Celebration', clientName: 'Emma Smith', date: '2025-06-15' },
  ];
  

const products = [
  { id: '1', name: 'Camera', image: './components/images/camera1.jpg' },
  { id: '2', name: 'Birthday Catering', image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Photo Booth Setup', image: 'https://via.placeholder.com/150' },
  { id: '4', name: 'Floral Decorations', image: 'https://via.placeholder.com/150' },
];

const SupplierHomeScreen = () => {
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
        
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 10 }}>Products</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={{ margin: 10 }}>
                <Card.Cover source={{ uri: item.image }} />
                <Card.Content>
                  <Text>{item.name}</Text>
                </Card.Content>
              </Card>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default SupplierHomeScreen;
