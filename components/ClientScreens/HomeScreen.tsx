import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { auth, firestore } from '../../firebaseConfig'; // Ensure this path is correct

const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser; // Get the logged-in user
      if (user) {
        try {
          const userDoc = await firestore().collection('Clients').doc(user.uid).get();
          if (userDoc.exists) {
            setFullName(userDoc.data().fullName); // Assuming 'fullName' is stored in Firestore
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.name}>Hi! {fullName || 'User'}</Text>
          <Text style={styles.subtitle}>Here is what is next for your event!</Text>
          <Image source={require('../images/Ellipse.png')} style={styles.ellipse} />

          {/* Quick Access Section */}
          <Text style={styles.quick}>Quick Access</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')}>
            <View style={styles.createevent}>
              <Image source={require('../images/pen.png')} style={styles.penicon} />
              <Text style={styles.makeevent}>Create Event</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <View style={styles.searchevent}>
              <Image source={require('../images/findicon.png')} style={styles.findicon} />
              <Text style={styles.findevent}>Browse Event</Text>
            </View>
          </TouchableOpacity>

          {/* Search bar */}
          <TextInput style={styles.searchBar} placeholder="Search service" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 30,
    fontWeight: '400',
    bottom: '26%',
    right: '28%',
  },
  subtitle: {
    fontSize: 12,
    bottom: '26%',
    right: '20%',
    color: '#969696',
  },
  ellipse: {
    width: 62,
    height: 62,
    bottom: '35%',
    left: '30%',
  },
  searchBar: {
    height: 55,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 100,
    paddingLeft: 10,
    bottom: '50%',
  },
  quick: {
    fontSize: 18,
    color: '#969696',
    fontWeight: '800',
    right: '30%',
    bottom: '23%',
  },
  createevent: {
    width: 157,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
    bottom: '300%',
    right: '23%',
  },
  penicon: {
    width: 24,
    height: 24,
    top: 10,
    right: 45,
  },
  makeevent: {
    color: '#5392DD',
    fontSize: 15,
    left: 15,
    bottom: 10,
  },
  searchevent: {
    width: 157,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
    bottom: '400%',
    left: '23%',
  },
  findicon: {
    width: 24,
    height: 24,
    top: 10,
    right: 45,
  },
  findevent: {
    color: '#5392DD',
    fontSize: 15,
    left: 15,
    bottom: 10,
  },
});

export default HomeScreen;
