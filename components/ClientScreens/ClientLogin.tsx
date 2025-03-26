import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      // Check if the user exists in Clients collection
      const clientSnapshot = await firestore()
        .collection('Clients')
        .where('email', '==', email)
        .get();

      if (clientSnapshot.empty) {
        setLoading(false);
        Alert.alert('Error', 'This account is not registered as a client.');
        return;
      }

      // Authenticate user
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // Save user type
      await AsyncStorage.setItem('userType', 'Clients');

      Alert.alert('Success', `Welcome ${email}!`);
      navigation.navigate('main');
    } catch (error) {
      setLoading(false);
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
        <View style={styles.innerContainer}>
          <TouchableOpacity onPress={() => navigation.replace('LoginOption')} style={styles.backButton}>
            <Image source={require('../images/back.png')} style={styles.arrow} />
          </TouchableOpacity>

          <Text style={styles.title}>Your Event Planning Journey Starts Here!</Text>
          <Text style={styles.subtitle}>Plan and manage your events effortlessly.</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
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

          {/* Login Button with Loading Indicator */}
          <TouchableOpacity style={[styles.button, loading && styles.disabledButton]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="black" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.register}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  arrow: {
    width: 40,
    height: 36,
    tintColor: 'black',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
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
  button: {
    backgroundColor: '#5392DD',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
    height: 50,
  },
  disabledButton: {
    backgroundColor: '#A0C4F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#888',
    marginTop: 20,
    fontSize: 14,
  },
  register: {
    color: '#5392DD',
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#5392DD',
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
