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
  Image
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
  
    try {
      // Check if email exists in "Supplier" collection
      const supplierDoc = await firestore()
        .collection('Supplier')
        .where('email', '==', email)
        .get();
  
      if (supplierDoc.empty) {
        Alert.alert('Error', 'This email is not registered as a supplier.');
        return;
      }
  
      // Firebase Authentication Login
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', `Welcome ${email}!`);
      navigation.navigate('Suppliermain'); // Change 'Home' to your next screen
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'User not found');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset the password');
      return;
    }

    // Send password reset email
    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent!');
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          Alert.alert('Error', 'Invalid email address');
        } else if (error.code === 'auth/user-not-found') {
          Alert.alert('Error', 'No user found with this email');
        } else {
          Alert.alert('Error', error.message);
        }
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require('../images/eclipse.png')} style={styles.eclipse}/>

          <TouchableOpacity onPress={() => navigation.navigate('LoginOption')}>
            <Image source={require('../images/arrow.png')} style={styles.arrow}/>
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

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SupplierRegister')}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <Text style={styles.register}>Sign Up</Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  eclipse: {
    width: 230,
    height: 240,
    bottom: '15%',
    right: '22%',
  },
  arrow: {
    width: 40,
    height: 36,
    right: '40%',
    bottom: 280,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    bottom: '15%',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: 'semibold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    bottom: '15%',
  },
  input: {
    width: '90%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    bottom: '12%',
  },
  button: {
    backgroundColor: '#5392DD',
    padding: 15,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    top: '-5%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#000',
    top: '220%',
    right: '8%',
  },
  register: {
    color: '#5392DD',
    top: '170%',
    left: '30%',
  },
  forgotPassword: {
    color: '#5392DD',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default LoginScreen;
