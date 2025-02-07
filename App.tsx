/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

// Import Screens
import GetStartedScreen from './components/GetStartScreen';
import LoginOption from './components/LoginOption';
import ClientLogin from './components/ClientScreens/ClientLogin';
import Register from './components/ClientScreens/Register';
import LogInScreen from './components/SupplierScreen/LoginScreen';
import SupplierRegister from './components/SupplierScreen/RegisterScreen';
import SupplierRegister2 from './components/SupplierScreen/RegisterScreen';
import SupplierCategory from './components/SupplierScreen/SupplierCategory';
import RegisterScreen2 from './components/SupplierScreen/RegisterScreen2';
import SupplierHomeScreen from './components/SupplierScreen/SupplierHomeScreen';



// Import Bottom Tabs Components
import HomeScreen from './components/ClientScreens/HomeScreen';
import SearchScreen from './components/ClientScreens/SearchScreen';
import ChatsScreen from './components/ClientScreens/ChatScreen';
import ProfileScreen from './components/ClientScreens/ProfileScreen';
import Products from './components/SupplierScreen/Products';
import Chats from './components/SupplierScreen/chat';



// Import Images
const homeIcon = require('./components/images/home.png');
const searchIcon = require('./components/images/search.png');
const chatsIcon = require('./components/images/chat.png');
const profileIcon = require('./components/images/profile.png');
const productIcon = require('./components/images/order.png');
const messageIcon = require('./components/images/messenger.png');


// Create Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs Component
function BottomTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;
          if (route.name === 'Home') iconSource = homeIcon;
          else if (route.name === 'Search') iconSource = searchIcon;
          else if (route.name === 'Chats') iconSource = chatsIcon;
          else if (route.name === 'Profile') iconSource = profileIcon;

          return (
            <Image
              source={iconSource}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#5392DD' : 'gray',
              }}
            />
          );
        },
        tabBarActiveTintColor: '#5392DD',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false, // Hide text labels if needed
        tabBarStyle: {
          height: 70, // Set custom height for the bottom tab
          paddingBottom: 10, // Optional: Adjust the padding at the bottom
        },
      })}
    >
      <Tab.Screen 
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }} // Remove header for Home tab
      />
      <Tab.Screen 
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }} // Remove header for Search tab
      />
      <Tab.Screen 
        name="Chats"
        component={ChatsScreen}
        options={{ headerShown: false }} // Remove header for Chats tab
      />
      <Tab.Screen 
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }} // Remove header for Profile tab
      />
    </Tab.Navigator>
  );
}


function SupplierBottomTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;
          if (route.name === 'Home') iconSource = homeIcon;
          else if (route.name === 'Products') iconSource = productIcon;
          else if (route.name === 'Chats') iconSource = messageIcon;
          else if (route.name === 'Profile') iconSource = profileIcon;

          return (
            <Image
              source={iconSource}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#5392DD' : 'gray',
              }}
            />
          );
        },
        tabBarActiveTintColor: '#5392DD',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false, // Hide text labels if needed
        tabBarStyle: {
          height: 70, // Set custom height for the bottom tab
          paddingBottom: 10, // Optional: Adjust the padding at the bottom
        },
      })}
    >
      <Tab.Screen 
        name="Home"
        component={SupplierHomeScreen}
        options={{ headerShown: false }} // Remove header for Home tab
      />
      <Tab.Screen 
        name="Products"
        component={Products}
        options={{ headerShown: false }} // Remove header for Search tab
      />
      <Tab.Screen 
        name="Chats"
        component={Chats}
        options={{ headerShown: false }} // Remove header for Chats tab
      />
      <Tab.Screen 
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }} // Remove header for Profile tab
      />
    </Tab.Navigator>
  );
}





// Stack Navigator with Bottom Tabs
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="LoginOption" component={LoginOption} />
        <Stack.Screen name="ClientLogin" component={ClientLogin} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="SupplierLogin" component={LogInScreen} />
        <Stack.Screen name="SupplierRegister" component={SupplierRegister} />
        <Stack.Screen name="SupplierRegister2" component={RegisterScreen2} />
        <Stack.Screen name="SupplierCategory" component={SupplierCategory} />
        <Stack.Screen name="SupplierHomeScreen" component={SupplierHomeScreen} />


        {/* This is where we place BottomTabs inside Stack Navigator */}
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="Suppliermain" component={SupplierBottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
