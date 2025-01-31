import React from 'react';
import { View, Text, StyleSheet, Image, TextInput } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.name}> Hi! Juan</Text>
      <Text style={styles.subtitle}> Here is what is next for your event!</Text>
      <Image source={require('../images/Ellipse.png')} style={styles.ellipse}/>
      <Text style={styles.quick}> Quick Access</Text>
      
      {/* Add search bar below components */}
      <TextInput 
        style={styles.searchBar}
        placeholder="Search service"
      />
    </View>
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
    bottom: '32%',
    right: '30%',
  },
  subtitle: {
    fontSize: 12,
    bottom: '32%',
    right: '20%',
    color: '#969696',
  },
  ellipse: {
    width: 72,
    height: 72,
    bottom: '42%',
    left: '30%',
  },
  searchBar: {
    height: 55,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 100,
    paddingLeft: 10,
    bottom: '42%',
  },
  quick:{
    fontSize: 18,
    color: '#969696',
    fontWeight: '800',
    right: '30%',
    bottom: '27%',
  },
});

export default HomeScreen;
