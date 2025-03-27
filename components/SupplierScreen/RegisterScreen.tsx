import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, Image,  ActivityIndicator 
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SupplierRegister = ({ navigation }) => {
  const [supplierName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidGmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!supplierName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (!isValidGmail(email)) {
      Alert.alert('Error', 'Please enter a valid Gmail address');
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
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await firestore().collection('Supplier').doc(user.uid).set({
        supplierName,
        email,
        earnings: 0,
        accountStatus: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Proceeding......');
      navigation.navigate('SupplierRegister2');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../images/eclipse.png')} style={styles.eclipse} />
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Together, We'll Craft Memorable Events.</Text>

        <TextInput style={styles.input} placeholder="Enter Full Name" value={supplierName} placeholderTextColor="#888" onChangeText={setFullName} />
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

        <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="black" /> : <Text style={styles.buttonText}>Continue</Text>}
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
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
  button: { width: '100%', height: 50, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
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
});

export default SupplierRegister;
