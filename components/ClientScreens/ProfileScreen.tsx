import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const user = auth().currentUser;

  // Fetch user data from Firestore when component mounts
  useEffect(() => {
    if (user?.uid) {
      const fetchUserData = async () => {
        try {
          const userDoc = await firestore()
            .collection('Clients')
            .doc(user.uid)
            .get();

          if (userDoc.exists) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      };
      fetchUserData();
    }
  }, [user?.uid]);

  return (
    <View style={styles.container}>
      <View style={styles.profilecontainer}>
        {/* Profile Image */}
        <Image
          source={
            userData?.profileImage ? { uri: userData.profileImage } : require('../images/usericon.png')
          }
          style={styles.profileImage}
        />

        {/* User Full Name */}
        {userData && (
          <Text style={styles.userName}>{userData.fullName || 'No Name Available'}</Text>
        )}

        {/* User Email */}
        {userData && (
          <Text style={styles.userEmail}>{userData.email || 'No Email Available'}</Text>
        )}
      </View>

      {/* My Event Button - Navigates to MyEventScreen */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('MyEventScreen')}>
        <Text style={styles.text}>📅 My Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('FavoriteScreen')}>
        <Text style={styles.text}>⭐ Favourite Supplier</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('BookingScreen')}>
        <Text style={styles.text}>💳 Payment and Booking</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Text style={styles.text}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  profilecontainer: {
    backgroundColor: '#5392DD',
    width: '115%',
    height: '35%',
    alignItems: 'center',
    alignSelf: 'center',
    borderBottomRightRadius: 55,
    borderBottomLeftRadius: 55,
    bottom: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingTop: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    height: 85,
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
    left: '25%',
  },
});

export default ProfileScreen;
