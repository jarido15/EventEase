import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.profilecontainer}>
      </View>

      {/* My Event Button - Navigates to MyEventScreen */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('MyEventScreen')}>
        <Text style={styles.text}>📅 My Event</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <Text style={styles.text}>⭐ Favourite Supplier</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
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
    height: '45%',
    alignItems: 'center',
    alignSelf: 'center',
    borderBottomRightRadius: 55,
    borderBottomLeftRadius: 55,
    bottom: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default ProfileScreen;
