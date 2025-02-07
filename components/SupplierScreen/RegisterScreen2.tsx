import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, Image 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SupplierRegister2 = ({ navigation }) => {
  const [BusinessName, setBusinessName] = useState('');
  const [Address, setAddress] = useState('');
  const [Location, setLocation] = useState('');
  const [ContactNumber, setContactNumber] = useState('');

  const handleContinue = async () => {
    if (!BusinessName || !Address || !Location || !ContactNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
  
    try {
      const user = auth().currentUser; // Get the logged-in user
      if (!user) {
        Alert.alert('Error', 'User not found. Please sign in again.');
        return;
      }
  
      await firestore().collection('Supplier').doc(user.uid).update({
        BusinessName,
        Address,
        Location,
        ContactNumber,
        createdAt: firestore.FieldValue.serverTimestamp(), // Firestore timestamp
      });
  
      Alert.alert('Success', 'Business details saved!');
      navigation.navigate('SupplierCategory');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../images/eclipse.png')} style={styles.eclipse} />
        <Text style={styles.title}>Create Your Business Profile</Text>
        <Text style={styles.subtitle}>Let's set up your business details.</Text>

        <TextInput style={styles.input} placeholder="Business Name" value={BusinessName} onChangeText={setBusinessName} />
        <TextInput style={styles.input} placeholder="Business Address" value={Address} onChangeText={setAddress} keyboardType='default' />
        <TextInput style={styles.input} placeholder="Location" value={Location} onChangeText={setLocation} />
        <TextInput style={styles.input} placeholder="Business Contact Number" value={ContactNumber} onChangeText={setContactNumber} keyboardType="number-pad" />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={() => navigation.navigate('SignIn')}>Sign in</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  eclipse: { width: 230, height: 240, position: 'absolute', top: -5, right: '43%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
  button: { width: '100%', height: 50, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  signInText: { marginTop: 20, color: '#666' },
  signInLink: { color: '#007bff', fontWeight: 'bold' },
});

export default SupplierRegister2;
