import React, { useState } from 'react';
import { 
  Modal,
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator 
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const validEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com']; // Add valid domains

const PlannerRegister = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
      const [modalVisible, setModalVisible] = useState(false);

  const isValidEmail = (email) => {
    const emailParts = email.split('@');
    if (emailParts.length !== 2) return false;

    const domain = emailParts[1];
    return validEmailDomains.includes(domain);
  };

  const handleContinue = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
      if (!agreedToTerms) {
          Alert.alert('Error', 'You must agree to the Terms and Conditions');
          return;
        }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email with an accepted domain');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    setLoading(true); // Start loading
  
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      await firestore().collection('Planner').doc(user.uid).set({
        uid: user.uid,
        fullName,
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  
      // ✅ Show success alert with OK button
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('PlannerLogin') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../images/eclipse.png')} style={styles.eclipse} />
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Together, We'll Craft Memorable Events.</Text>

        <TextInput style={styles.input} placeholder="Enter Full Name" value={fullName} placeholderTextColor="#888" onChangeText={setFullName} />
        <TextInput 
          style={styles.input} 
          placeholder="Enter Email Address" 
          value={email} 
          onChangeText={setEmail} 
          placeholderTextColor="#888"
          keyboardType="email-address" 
          autoCapitalize="none"
        />
         <View style={styles.passwordContainer}>
                                      <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#888"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                      />
                                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
                                      </TouchableOpacity>
                                    </View>
         <View style={styles.passwordContainer}>
                                      <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Confirm password"
                                        placeholderTextColor="#888"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                      />
                                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
                                      </TouchableOpacity>
                                    </View>
                                       {/* Terms and Conditions Checkbox */}
                                              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}>
                                                <Image source={agreedToTerms ? require('../images/checkedbox.png') : require('../images/Uncheckedbox.png')} style={styles.checkbox} />
                                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                                  <Text style={styles.termsText}>I agree to the Terms and Conditions</Text>
                                                </TouchableOpacity>
                                              </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={!agreedToTerms ||loading}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
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

        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={() => navigation.navigate('PlannerLogin')}>Sign in</Text>
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
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
  button: { width: '100%', height: 50, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  signInText: { marginTop: 20, color: '#666' },
  signInLink: { color: '#007bff', fontWeight: 'bold' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingRight: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    color: '#000',
  },
  toggle: {
    color: '#5392DD',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
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

export default PlannerRegister;
