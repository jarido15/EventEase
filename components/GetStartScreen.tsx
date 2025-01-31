import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const GetStartedScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('./images/starticon.png')} style={styles.image} />
      <Image source={require('./images/eclipse.png')} style={styles.eclipse}/>
      <Text style={styles.title}>Welcome to EventEase!</Text>
      <Text style={styles.subtitle}>Plan effortlessly, celebrate with EventEase!</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginOption')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GetStartedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  image: {
    width: 207,
    height: 177,
    alignSelf: 'center',
    top: '15%',
  },
  eclipse: {
    width: 230,
    height: 240,
    bottom: '41%',
    right: '25%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    bottom: '15%',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    bottom: '15%',
  },
  button: {
    backgroundColor: '#5392DD',
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: 328,
    height: 62,
    borderRadius: 8,
    elevation: 3,
    alignItems:'center',
    top: '10%',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
