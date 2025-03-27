import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, Image,  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SupplierRegister2 = ({ navigation }) => {
  const [BusinessName, setBusinessName] = useState('');
  const [Location, setLocation] = useState('');
  const [ContactNumber, setContactNumber] = useState('');
      const [agreedToTerms, setAgreedToTerms] = useState(false);
        const [modalVisible, setModalVisible] = useState(false);

  const handleContinue = async () => {
    if (!BusinessName || !Location || !ContactNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
        if (!agreedToTerms) {
              Alert.alert('Error', 'You must agree to the Terms and Conditions');
              return;
            }

    if (ContactNumber.length !== 11) {
      Alert.alert('Error', 'Contact number must be 11 digits');
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
        Location,
        ContactNumber,
        status: "Pending",
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

        <TextInput style={styles.input} placeholder="Business Name" value={BusinessName} placeholderTextColor="#888" onChangeText={setBusinessName} />
        <TextInput style={styles.input} placeholder="Location" value={Location} placeholderTextColor="#888" onChangeText={setLocation} />
        <TextInput 
          style={styles.input} 
          placeholder="Business Contact Number" 
          value={ContactNumber} 
          placeholderTextColor="#888"
          onChangeText={setContactNumber} 
          keyboardType="number-pad" 
          maxLength={11} // Limit input to 11 digits
        />
         <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}>
                                                        <Image source={agreedToTerms ? require('../images/checkedbox.png') : require('../images/Uncheckedbox.png')} style={styles.checkbox} />
                                                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                                                          <Text style={styles.termsText}>I agree to the Terms and Conditions</Text>
                                                        </TouchableOpacity>
                                                      </TouchableOpacity>

                                                       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                                                                <View style={styles.modalOverlay}>
                                                                  <View style={styles.modalContainer}>
                                                                    
                                                                    <Text style={styles.modalTitle}>Terms and Conditions</Text>
                                                                    
                                                                    <ScrollView style={styles.modalScroll}>
                                                                      <Text style={styles.modalText}>
                                                                        • Must use a valid GCash account for payments.{'\n\n'}
                                                                        • Initial payment can be made via GCash or in-person cash.{'\n\n'}
                                                                        • If a client cancels a booking, the supplier/planner must refund 100% of the initial payment unless a non-refundable deposit applies.{'\n\n'}
                                                                        • Clients should verify suppliers before booking and request contracts if needed.
                                                                      </Text>
                                                                    </ScrollView>
                                                              
                                                                    <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                                                      <Text style={styles.modalButtonText}>Close</Text>
                                                                    </TouchableOpacity>
                                                              
                                                                  </View>
                                                                </View>
                                                              </Modal>

        <TouchableOpacity style={styles.button} disabled={!agreedToTerms} onPress={handleContinue}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={() => navigation.navigate('SupplierLogin')}>Sign in</Text>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '85%',
  },
  checkbox: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#5392DD',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 200,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'left',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#5392DD',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SupplierRegister2;
