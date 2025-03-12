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
import CreateEvent from './components/ClientScreens/CreateEvent';




// Import Bottom Tabs Components
import HomeScreen from './components/ClientScreens/HomeScreen';
import SearchScreen from './components/ClientScreens/SearchScreen';
import ChatsScreen from './components/ClientScreens/ChatScreen';
import ProfileScreen from './components/ClientScreens/ProfileScreen';
import Products from './components/SupplierScreen/Products';
import Chats from './components/SupplierScreen/chat';
import ServiceEditScreen from './components/SupplierScreen/ServiceEditScreen';
import PlannerRegister from './components/PlannerScreen/PlannerRegister';
import PlannerHomeScreen from './components/PlannerScreen/PlannerHomeScreen';
import PlannerLogin from './components/PlannerScreen/PlannerLogin';
import PlannerEvent from './components/PlannerScreen/PlannerEvent';
import PlannerProfileScreen from './components/PlannerScreen/PlannerProfile';
import PlannerChat from './components/PlannerScreen/PlannerChat';
import PlannerChatScreen from './components/PlannerScreen/PlannerChatScreen';
import SupplierChat from './components/SupplierScreen/SupplierChat';
import SupplierChatScreen from './components/SupplierScreen/SupplierChatScreen';

import SupplierProfileScreen from './components/SupplierScreen/SupplierProfileScreen';
import SupplierBookingScreen from './components/SupplierScreen/SupplierBookingScreen';
import ClientChatScreen from './components/ClientScreens/ClientChatScreen';

import EditServiceScreen from './components/PlannerScreen/PlannerEditService';

import MyEventsScreen from './components/ClientScreens/MyEvent';
import BookingScreen from './components/ClientScreens/BookingScreen';
import FavoriteScreen from './components/ClientScreens/FavoriteScreen';




// Import Images
const homeIcon = require('./components/images/home.png');
const searchIcon = require('./components/images/search.png');
const chatsIcon = require('./components/images/chat.png');
const profileIcon = require('./components/images/profile.png');
const productIcon = require('./components/images/order.png');
const messageIcon = require('./components/images/messenger.png');
const bookingIcon = require('./components/images/booking.png');
const plannerHome = require('./components/images/planner-home.png');
const plannerAdd = require('./components/images/add.png');
const plannerChat = require('./components/images/telegram.png');
const plannerUser = require('./components/images/planner-user.png');



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
        tabBarShowLabel: true, // Hide text labels if needed
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
          if (route.name === 'Home') iconSource = plannerHome;
          else if (route.name === 'Products') iconSource = plannerAdd;
          else if (route.name === 'Chats') iconSource = plannerChat;
          else if (route.name === 'Booking') iconSource = bookingIcon;

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
        tabBarShowLabel: true, // Hide text labels if needed
        tabBarStyle: {
          height: 70,
          paddingBottom: 10, 
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
        component={SupplierChat}
        options={{ headerShown: false }} // Remove header for Chats tab
      />
      <Tab.Screen 
        name="Booking"
        component={SupplierBookingScreen}
        options={{ headerShown: false }} // Remove header for Profile tab
      />
    </Tab.Navigator>
  );
}
function PlannerBottomTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;
          if (route.name === 'Home') iconSource = plannerHome;
          else if (route.name === 'Products') iconSource = plannerAdd;
          else if (route.name === 'Chats') iconSource = plannerChat;
          else if (route.name === 'Profile') iconSource = plannerUser;

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
        tabBarShowLabel: true, // Hide text labels if needed
        tabBarStyle: {
          height: 70, // Set custom height for the bottom tab
          paddingBottom: 10, // Optional: Adjust the padding at the bottom
        },
      })}
    >
      <Tab.Screen 
        name="Home"
        component={PlannerHomeScreen}
        options={{ headerShown: false }} // Remove header for Home tab
      />
      <Tab.Screen 
        name="Products"
        component={PlannerEvent}
        options={{ headerShown: false }} // Remove header for Search tab
      />
      <Tab.Screen 
        name="Chats"
        component={PlannerChat}
        options={{ headerShown: false }} // Remove header for Chats tab
      />
      <Tab.Screen 
        name="Profile"
        component={PlannerProfileScreen}
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
        <Stack.Screen name="ServiceEditScreen" component={ServiceEditScreen} />

        <Stack.Screen name="SupplierProfileScreen" component={SupplierProfileScreen} />

        <Stack.Screen name="MyEventScreen" component={MyEventsScreen} />

        <Stack.Screen name="PlannerRegister" component={PlannerRegister} />
        <Stack.Screen name="PlannerHomeScreen" component={PlannerHomeScreen} />
        <Stack.Screen name="PlannerLogin" component={PlannerLogin} />
        <Stack.Screen name="EditService" component={EditServiceScreen} options={{ title: 'Edit Service' }} />
        <Stack.Screen name="PlannerChatScreen" component={PlannerChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="SupplierChatScreen" component={SupplierChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="ClientChatScreen" component={ClientChatScreen} options={{ title: 'Chat' }} />
        
        <Stack.Screen name="BookingScreen" component={BookingScreen} />
        <Stack.Screen name="FavoriteScreen" component={FavoriteScreen}  />



        <Stack.Screen name="CreateEvent" component={CreateEvent} />

        {/* This is where we place BottomTabs inside Stack Navigator */}
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="Suppliermain" component={SupplierBottomTabs} />
        <Stack.Screen name="Plannermain" component={PlannerBottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
