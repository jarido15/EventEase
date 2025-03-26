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
  FlatList,
} from 'react-native';
import { auth, firestore } from '../../firebaseConfig';
import { BackHandler, Alert } from 'react-native';


const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        try {
          const userDocRef = firestore().collection("Clients").doc(user.uid);
          const userDoc = await userDocRef.get();
          if (userDoc.exists) {
            setFullName(userDoc.data().fullName);
          }

          // Fetch only events with "Upcoming" status
          const eventsSnapshot = await userDocRef
            .collection("MyEvent")
            .where("status", "==", "Upcoming") // Filter for Upcoming events only
            .get();

          const fetchedEvents = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            eventDate: doc.data().eventDate,
            venueType: doc.data().venueType,
          }));

          setEvents(fetchedEvents);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true; // prevent default behavior
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove(); // clean up the listener
  }, []);
  

  const handleSearch = async (query) => {
    setSearchQuery(query);

    const user = auth().currentUser;
    if (user && query.trim()) {
      try {
        const userDocRef = firestore().collection("Clients").doc(user.uid);
        const eventsSnapshot = await userDocRef
          .collection("MyEvent")
          .where("status", "==", "Upcoming")
          .where("eventName", ">=", query)
          .where("eventName", "<=", query + '\uf8ff') // to do a case-insensitive search
          .get();

        const filteredEvents = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          eventDate: doc.data().eventDate,
          venueType: doc.data().venueType,
        }));

        setEvents(filteredEvents);
      } catch (error) {
        console.error("Error searching events:", error);
      }
    } else if (!query.trim()) {
      // If search query is empty, fetch all upcoming events
      fetchUserData();
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContainer}>
          {/* Profile Section */}
          <View style={styles.header}>
            <Text style={styles.greetingText}>Hi, {fullName || 'User'} 👋</Text>
            <Text style={styles.subheadingText}>Here’s what’s next for your event!</Text>
          </View>

          {/* Search Bar */}
          <TextInput
            style={styles.searchBar}
            placeholder="Search for events..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />

          {/* Quick Access */}
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity style={styles.quickAccess} onPress={() => navigation.navigate('CreateEvent')}>
              <Image source={require('../images/pen.png')} style={styles.icon} />
              <Text style={styles.quickAccessText}>Create Event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccess} onPress={() => navigation.navigate('Search')}>
              <Image source={require('../images/findicon.png')} style={styles.icon} />
              <Text style={styles.quickAccessText}>Browse Events</Text>
            </TouchableOpacity>
          </View>

          {/* Events List with FlatList */}
          <Text style={styles.sectionTitle}>Your Upcoming Events</Text>
          {events.length > 0 ? (
            <FlatList
              data={events}
              renderItem={({ item }) => (
                <View style={styles.eventCard} key={item.id}>
                  <Image
                    source={item.eventImage ? { uri: item.eventImage } : require('../images/upevent.png')}
                    style={styles.eventImage}
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{item.eventName || 'Unnamed Event'}</Text>
                    <Text style={styles.eventDetails}>
                      📍 {item.eventPlace || 'Venue not set'} | 🕒 {item.eventTime || 'Time not set'}
                    </Text>
                    <Text style={styles.eventDate}>📅 {item.eventDate || 'Date not set'}</Text>
                    <Text style={styles.venueType}>🏠 {item.venueType || 'Venue type not set'}</Text>
                    <Text style={styles.eventServices}>
                      Services: {item.selectedServices?.join(', ') || 'No services selected'}
                    </Text>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <Text style={styles.noEventsText}>No upcoming events yet.</Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5392DD',
  },
  subheadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6D6D6D',
    marginTop: 4,
  },
  searchBar: {
    height: 50,
    backgroundColor: '#F1F1F1',
    borderRadius: 60,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    shadowColor: '#B0B0B0',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7C7E7',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: '48%',
    shadowColor: '#B0B0B0',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  quickAccessText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2F2F2F',
  },
  eventCard: {
    flexDirection: 'column',
    backgroundColor: '#E6F2FF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#B0B0B0',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
    height: 370,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5392DD',
  },
  eventDetails: {
    fontSize: 14,
    color: '#6D6D6D',
    marginTop: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#FF7043',
    marginTop: 5,
  },
  venueType: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 5,
  },
  eventServices: {
    fontSize: 14,
    fontWeight: '500',
    color: '#388E3C',
    marginTop: 5,
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 20,
  },
});

export default HomeScreen;
