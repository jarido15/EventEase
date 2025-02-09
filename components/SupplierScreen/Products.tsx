import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import * as ImagePicker from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const Products = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Function to pick an image
  const handleSelectImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  // Function to upload image to Firebase Storage
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image.');
      return null;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to upload.');
      return null;
    }

    const filename = `Supplier/${user.uid}/services/${Date.now()}.jpg`;
    const storageRef = storage().ref(filename);
    
    setUploading(true);
    try {
      await storageRef.putFile(imageUri);
      const downloadURL = await storageRef.getDownloadURL();
      setUploading(false);
      return downloadURL;
    } catch (error) {
      setUploading(false);
      console.error('Upload failed:', error);
      return null;
    }
  };

  // Function to upload service details to Firestore
  const addService = async () => {
    if (!serviceName || !servicePrice || !description) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const imageUrl = await uploadImage();
    if (!imageUrl) return;

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      await firestore()
        .collection('Supplier')
        .doc(user.uid)
        .collection('Services')
        .add({
          serviceName,
          servicePrice,
          description,
          imageUrl,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Success', 'Service added successfully!');
      setServiceName('');
      setServicePrice('');
      setDescription('');
      setImageUri(null);
    } catch (error) {
      console.error('Error adding service:', error);
      Alert.alert('Error', 'Failed to add service.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Services" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Product Image:</Text>

            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No Image Selected</Text>
              </View>
            )}

            <TouchableOpacity style={styles.addImageButton} onPress={handleSelectImage}>
              <Text style={styles.addImageText}>📸 Add Image</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Service Name:</Text>
            <TextInput style={styles.input} placeholder="Enter service name" value={serviceName} onChangeText={setServiceName} />

            <Text style={styles.label}>Service Price:</Text>
            <TextInput style={styles.input} placeholder="Enter Service price" keyboardType="numeric" value={servicePrice} onChangeText={setServicePrice} />

            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description"
              multiline={true}
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={{ marginTop: 20 }}>
              <Button title={uploading ? "Uploading..." : "Add Service"} onPress={addService} disabled={uploading} />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  card: {
    margin: 20,
    padding: 15,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 10,
  },
  placeholderText: {
    fontSize: 12,
    color: '#555',
  },
  addImageButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addImageText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Products;
