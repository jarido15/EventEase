import React, { useState, useCallback  } from 'react';
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
  ActivityIndicator
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlannerLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true); // Start loading

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await AsyncStorage.setItem('userType', 'Planner');

      const plannerDoc = await firestore().collection('Planner').doc(user.uid).get();
      if (!plannerDoc.exists) {
        await auth().signOut();
        Alert.alert('Error', 'You are not authorized to log in as a planner');
        return;
      }

      Alert.alert('Success', `Welcome ${email}!`);
      navigation.navigate('Plannermain');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'User not found');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const goToRegister = useCallback(() => {
    navigation.navigate('PlannerRegister');
  }, [navigation]);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >

        <ScrollView contentContainerStyle={styles.scrollContainer}>
  

        <TouchableOpacity 
  onPress={() => navigation.replace('LoginOption')} 
  style={styles.backButton} // Updated style
>
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

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>


  <TouchableOpacity onPress={() => navigation.navigate('PlannerRegister')}>
            <Text style={styles.forgotPasswordTextSignup}>Don't have an account? Signup!</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </ScrollView>
 
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
  backButton: {
    position: 'absolute', 
    top: 40, 
    left: 20, 
    zIndex: 10, // Ensures it's on top
  },
  arrow: {
    width: 40,
    height: 36,
    tintColor: 'black', // Optional: Ensures visibility
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
    left: '35%',
  },
  forgotPasswordText: {
    color: '#5392DD',
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordTextSignup: {
    color: 'black',
    marginTop: 15,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 5,
    bottom: 80,
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
});

export default PlannerLogin;
