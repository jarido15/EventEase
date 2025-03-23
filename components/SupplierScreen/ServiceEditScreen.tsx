import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ServiceEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { service } = route.params;  

  const [serviceName, setServiceName] = useState(service.serviceName);
  const [servicePrice, setServicePrice] = useState(service.servicePrice.toString());
  const [description, setDescription] = useState(service.description);
  const [imageUri, setImageUri] = useState(service.imageUrl); // Track selected image

  const user = auth().currentUser;

  // Function to select an image
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error) {
        setImageUri(response.assets[0].uri); // Update image preview
      }
    });
  };

  // Function to upload image to Firebase Storage
  const uploadImage = async () => {
    if (!imageUri || imageUri === service.imageUrl) return service.imageUrl; // Skip upload if image is unchanged

    const imageName = `services/${user.uid}/${service.id}.jpg`; // Define unique image path
    const reference = storage().ref(imageName);

    await reference.putFile(imageUri); // Upload file
    return await reference.getDownloadURL(); // Get new image URL
  };

  // Function to update service in Firestore
  const handleUpdate = async () => {
    try {
      const imageUrl = await uploadImage(); // Upload new image if changed

      await firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .doc(service.id)
        .update({
          serviceName,
          servicePrice: parseFloat(servicePrice),
          description,
          imageUrl, // Update image URL
        });

      Alert.alert('Success', 'Service updated successfully!');
      navigation.goBack(); // Go back to previous screen
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service.');
    }
  };

  // Function to delete service from Firestore
  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('Supplier')
                .doc(user.uid)
                .collection('Services')
                .doc(service.id)
                .delete();

              Alert.alert('Deleted', 'Service has been deleted.');
              navigation.goBack(); // Go back to previous screen
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* App Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#3498db' }}>
  {/* Back Button */}
  <TouchableOpacity onPress={() => navigation.navigate('Suppliermain')}>
       <Image source={require('../images/back.png')} style={{width: 24, height: 24, tintColor: '#003049' }} />
  </TouchableOpacity>

  {/* Title */}
  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', flex: 1, marginLeft: 20 }}>
    Edit Services
  </Text>
</View>





      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Service Image */}
        <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center', marginBottom: 20 }}>
  {imageUri ? (
    <Image
      source={{ uri: imageUri }}
      style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 10 }}
    />
  ) : (
    <Text style={{ textAlign: 'center', color: 'gray', marginBottom: 10 }}>No Image Available</Text>
  )}

  {/* Change Image Button */}
  <TouchableOpacity 
    onPress={pickImage} 
    style={{
      backgroundColor: '#003049',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Change Image</Text>
  </TouchableOpacity>
</TouchableOpacity>


        {/* Service Name */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Service Name</Text>
        <TextInput
          value={serviceName}
          onChangeText={setServiceName}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
          }}
        />

        {/* Service Price */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Price (Php)</Text>
        <TextInput
          value={servicePrice}
          onChangeText={setServicePrice}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
          }}
        />

        {/* Description */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 5,
            height: 100,
            textAlignVertical: 'top',
            marginBottom: 20,
          }}
        />

        {/* Buttons */}
        <Button title="Update Service" color="#003049" onPress={handleUpdate} />
        <View style={{ marginTop: 10 }}>
          <Button title="Delete Service" color="#c1121f" onPress={handleDelete} />
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceEditScreen;
