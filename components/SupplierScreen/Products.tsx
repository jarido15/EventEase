import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import * as ImagePicker from 'react-native-image-picker';


const Products = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Function to open image picker
  // const handleSelectImage = () => {
  //   ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
  //     if (!response.didCancel && response.assets && response.assets.length > 0) {
  //       setImageUri(response.assets[0].uri || null);
  //     }
  //   });
  // };
  

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header>
        <Appbar.Content title="Products" />
      </Appbar.Header>

      {/* Product Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Product Image:</Text>

          {/* Image Preview */}
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Image Selected</Text>
            </View>
          )}

          {/* Add Image Button */}
          <TouchableOpacity style={styles.addImageButton} >
            <Text style={styles.addImageText}>📸 Add Image</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Product Name:</Text>
          <TextInput style={styles.input} placeholder="Enter product name" />

          <Text style={styles.label}>Product Price:</Text>
          <TextInput style={styles.input} placeholder="Enter product price" keyboardType="numeric" />

          {/* Added spacing between price input and button */}
          <View style={{ marginTop: 20 }}>
            <Button title="Add Product" onPress={() => console.log('Product Added')} />
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
