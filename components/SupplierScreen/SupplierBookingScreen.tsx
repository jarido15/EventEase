import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';



// 🔹 Booking Card Component
const BookingCard = ({ name, date }: { name: string; date: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      <Text style={styles.bold}>Name:</Text> {name}
    </Text>
    <Text style={styles.cardTitle}>
      <Text style={styles.bold}>Date:</Text> {date}
    </Text>
    <Text style={styles.tapText}>Tap to view details</Text>
  </View>
);

// 🔹 Screens for Each Tab
const PendingScreen = () => (
  <ScrollView contentContainerStyle={styles.screenContainer}>
    <BookingCard name="Pending" date="Feb. 10, 2025 to Feb. 12, 2025" />
  </ScrollView>
);

const OngoingScreen = () => (
  <ScrollView contentContainerStyle={styles.screenContainer}>
    <BookingCard name="Ongoing" date="March 5, 2025" />
  </ScrollView>
);

const FinishScreen = () => (
  <ScrollView contentContainerStyle={styles.screenContainer}>
    <BookingCard name="Finished" date="Jan. 15, 2025" />
  </ScrollView>
);

const CancelledScreen = () => (
  <ScrollView contentContainerStyle={styles.screenContainer}>
    <BookingCard name="Cancelled" date="April 20, 2025" />
  </ScrollView>
);

const Tab = createMaterialTopTabNavigator();

// 🔹 Main Booking Screen
const SupplierBookingScreen = () => {

  return (
    <View style={styles.container}>
    

      {/* 🔹 Title */}
      <Text style={styles.title}>Booking</Text>


      <Tab.Navigator initialRouteName="Pending"   screenOptions={{
    lazy: false,
    tabBarIndicatorStyle: {
      backgroundColor: 'blue', // Debug: Force it to be visible
      height: 3, 
      width: '25%', // Fix potential width issues
    },
  }}>
  <Tab.Screen name="Pending" component={PendingScreen} />
  <Tab.Screen name="Ongoing" component={OngoingScreen} />
  <Tab.Screen name="Finished" component={FinishScreen} />
  <Tab.Screen name="Cancelled" component={CancelledScreen} />
</Tab.Navigator>


    </View>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  screenContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#D9D9D9',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    color: 'black',
  },
  bold: {
    fontWeight: 'bold',
  },
  tapText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
});

export default SupplierBookingScreen;
