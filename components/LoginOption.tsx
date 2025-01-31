import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginOptionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Account Type</Text>

      <Image source={require('./images/eclipse.png')} style={styles.eclipse}/>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ClientLogin')}>
        <Image source={require('./images/client.png')} style={styles.icon}/>
        <Text style={styles.optionText}>Client Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('SupplierLogin')}>
      <Image source={require('./images/supplier.png')} style={styles.icon}/>
        <Text style={styles.optionText}>Event Supplier</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('PlannerLogin')}>
      <Image source={require('./images/planner.png')} style={styles.icon}/>
        <Text style={styles.optionText}>Event Planner</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginOptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  eclipse: {
    width: 230,
    height: 240,
    bottom: '20%',
    right: '25%',
  },
  icon:{
    width: 51,
    height: 52,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    top: '20%',
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 20,
    width: '90%',
    marginBottom: 35,
    elevation: 10, // Android shadow
    shadowColor: '#5392DD', // iOS shadow color
    shadowOffset: { width: 5, height: 10 }, // iOS shadow position
    shadowOpacity: 0.5, // iOS shadow opacity
    shadowRadius: 5, // iOS shadow blur
    bottom: '5%',
  },

  optionText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#000',
    fontWeight: 'bold',
  },
});
