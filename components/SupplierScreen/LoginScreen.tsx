import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
  Modal
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const supplierQuery = await firestore()
        .collection('Supplier')
        .where('email', '==', email)
        .get();

      if (supplierQuery.empty) {
        Alert.alert('Error', 'This email is not registered as a supplier.');
        setLoading(false);
        return;
      }

      const supplierData = supplierQuery.docs[0].data();
      const status = supplierData.accountStatus; // Get account status

      if (status === 'pending') {
        setModalVisible(true); // Show modal for pending accounts
        setLoading(false);
        return;
      }

      await auth().signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem('userType', 'Supplier');
      Alert.alert('Success', `Welcome ${email}!`);
      navigation.navigate('Suppliermain');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'User not found');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => navigation.replace('LoginOption')} style={styles.backButton}>
            <Image source={require('../images/back.png')} style={styles.arrow} />
          </TouchableOpacity>

          <Text style={styles.title}>Your Event Planning Journey Starts Here!</Text>
          <Text style={styles.subtitle}>Your Event Planning Journey Starts Here!</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input with Toggle */}
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

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          {/* Signup and Forgot Password */}
          <TouchableOpacity onPress={() => navigation.navigate('SupplierRegister')}>
            <Text style={styles.forgotPasswordTextSignup}>Don't have an account? Signup!</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Reset link sent!')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Modal for Pending Accounts */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Account Pending</Text>
            <Text style={styles.modalText}>
              Your account is awaiting approval. You will receive an update once it's activated.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  arrow: { width: 40, height: 36, tintColor: 'black' },
  forgotPasswordTextSignup: { color: 'black', marginTop: 15, fontSize: 14 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, fontWeight: 'semibold', marginBottom: 20, color: '#333', textAlign: 'center' },
  input: { width: '90%', padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, backgroundColor: '#fff', marginBottom: 15 },
  button: { backgroundColor: '#5392DD', padding: 15, borderRadius: 25, width: '90%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  forgotPassword: { color: '#5392DD', marginTop: 15, textAlign: 'center', fontSize: 14 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '90%', borderWidth: 1, borderColor: '#ccc', borderRadius: 20, backgroundColor: '#fff', marginBottom: 15, paddingRight: 15 },
  passwordInput: { flex: 1, padding: 15, color: '#000' },
  toggle: { color: '#5392DD', fontWeight: 'bold', paddingHorizontal: 10 },

  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: '#5392DD', padding: 10, borderRadius: 10, width: '60%', alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;
