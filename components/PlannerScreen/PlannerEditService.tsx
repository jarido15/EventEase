import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';


const EditServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); // ✅ Access route params safely
  const { service } = route.params; // ✅ Correctly extract service

  const [serviceName, setServiceName] = useState(service.serviceName);
  const [servicePrice, setServicePrice] = useState(service.servicePrice);

  const handleSave = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      await firestore()
        .collection('Planner')
        .doc(user.uid)
        .collection('PlannerServices')
        .doc(service.id)
        .update({
          serviceName,
          servicePrice,
        });

      Alert.alert('Success', 'Service updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Edit Service</Text>
      
      <Text>Service Name</Text>
      <TextInput
        value={serviceName}
        onChangeText={setServiceName}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Service Price</Text>
      <TextInput
        value={servicePrice}
        onChangeText={setServicePrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
};

export default EditServiceScreen;
