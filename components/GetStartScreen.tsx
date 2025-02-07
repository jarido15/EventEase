import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GetStartedScreen = ({ navigation }) => {
  
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched !== null) {
          navigation.replace('LoginOption'); // Skip this screen if user has launched before
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
      }
    };

    checkFirstLaunch();
  }, []);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true'); // Store launch status
      navigation.replace('LoginOption'); // Navigate to the next screen
    } catch (error) {
      console.error('Error saving first launch:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./images/starticon.png')} style={styles.image} />
      <Image source={require('./images/eclipse.png')} style={styles.eclipse}/>
      <Text style={styles.title}>Welcome to EventEase!</Text>
      <Text style={styles.subtitle}>Plan effortlessly, celebrate with EventEase!</Text>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
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
