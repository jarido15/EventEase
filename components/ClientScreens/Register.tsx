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
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window'); // Get screen width for scrolling

const Register = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [Address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !mobileNumber || !Address) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'You must agree to the Terms and Conditions');
      return;
    }

    // Mobile Number Validation
    const mobileRegex = /^09\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      Alert.alert('Error', 'Mobile number must be 11 digits and start with 09');
      return;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
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

      await firestore().collection('Clients').doc(user.uid).set({
        uid: user.uid,
        fullName,
        mobileNumber,
        Address,
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('ClientLogin');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Image source={require('../images/eclipse.png')} style={styles.eclipse} />

          <TouchableOpacity onPress={() => navigation.navigate('ClientLogin')} style={styles.arrowContainer}>
            <Image source={require('../images/arrow.png')} style={styles.arrow} />
          </TouchableOpacity>

          <Text style={styles.title}>Your Event Planning Journey Starts Here!</Text>
          <Text style={styles.subtitle}>Together, We'll Craft Memorable Events.</Text>

          {/* Scrollable Input Fields */}
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const newPage = Math.round(event.nativeEvent.contentOffset.x / width);
              setPage(newPage);
            }}
            scrollEventThrottle={16}
          >
            {/* Page 1 - Basic Info */}
            <View style={styles.page}>
              <TextInput style={styles.input} placeholder="Enter your full name"  placeholderTextColor="#888" value={fullName} onChangeText={setFullName} />
              <TextInput style={styles.input} placeholder="Enter your mobile number"  placeholderTextColor="#888" value={mobileNumber} 
                onChangeText={(text) => {
                  if (/^\d*$/.test(text) && text.length <= 11) {
                    setMobileNumber(text);
                  }
                }} keyboardType="number-pad"
              />
              <TextInput style={styles.input} placeholder="Enter your address"  placeholderTextColor="#888" value={Address} onChangeText={setAddress} />
            </View>

            {/* Page 2 - Email & Passwords */}
            <View style={styles.page}>
              <TextInput style={styles.input} placeholder="Enter your email"  placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="email-address" />
              
              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordInput}  placeholderTextColor="#888" placeholder="Enter your password" value={password} 
                  onChangeText={setPassword} secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordInput}  placeholderTextColor="#888" placeholder="Confirm your password" value={confirmPassword} 
                  onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.toggle}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Terms and Conditions Checkbox */}
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}>
            <Image source={agreedToTerms ? require('../images/checkedbox.png') : require('../images/Uncheckedbox.png')} style={styles.checkbox} />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.termsText}>I agree to the Terms and Conditions</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Button - Disabled if Terms are not checked */}
          {page === 1 ? (
            <TouchableOpacity 
              style={[styles.button, (!agreedToTerms || loading) && styles.disabledButton]} 
              onPress={handleRegister} 
              disabled={!agreedToTerms || loading}
            >
              {loading ? <ActivityIndicator size="small" color="black" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>
          ) : (
            <Text style={styles.swipeText}>Swipe left for email & password setup →</Text>
          )}

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
    paddingVertical: 20,
  },
  eclipse: {
    width: 230,
    height: 240,
    position: 'absolute',
    top: -5,
    right: '43%',
  },
  arrowContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  arrow: {
    width: 40,
    height: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: '25%',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  page: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },
  input: {
    width: '85%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    fontSize: 14,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingRight: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#000',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
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
  button: {
    backgroundColor: '#5392DD',
    padding: 15,
    borderRadius: 10,
    width: '85%',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipeText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
  dotContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#5392DD',
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


export default Register;
