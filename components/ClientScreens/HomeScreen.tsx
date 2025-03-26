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
  Modal,
} from 'react-native';
import { auth, firestore } from '../../firebaseConfig';
import { BackHandler, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';


const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);


  const fetchUserData = async () => {
    const user = auth().currentUser;
    if (user) {
      try {
        const userDocRef = firestore().collection("Clients").doc(user.uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          setFullName(userDoc.data().fullName);
        }

        // Fetch only upcoming events
        const eventsSnapshot = await userDocRef
          .collection("MyEvent")
          .where("status", "==", "Upcoming")
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

  useEffect(() => {
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

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const user = auth().currentUser;
              const userDocRef = firestore().collection("Clients").doc(user.uid);
              await userDocRef.collection("MyEvent").doc(eventId).delete();

              setEvents(events.filter(event => event.id !== eventId));
            } catch (error) {
              console.error("Error deleting event:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (selectedEvent) {
      try {
        const user = auth().currentUser;
        const userDocRef = firestore().collection("Clients").doc(user.uid);
        await userDocRef.collection("MyEvent").doc(selectedEvent.id).update({
          eventName: selectedEvent.eventName,
          eventPlace: selectedEvent.eventPlace,
          eventTime: selectedEvent.eventTime,
          eventDate: selectedEvent.eventDate,
        });

        fetchUserData();
        setModalVisible(false);
      } catch (error) {
        console.error("Error updating event:", error);
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setShowDatePicker(false); // Hide the picker after selection
      setSelectedEvent((prevEvent) => ({
        ...prevEvent,
        eventDate: selectedDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      }));
    }
  };
  
  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setShowTimePicker(false); // Hide the picker after selection
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setSelectedEvent((prevEvent) => ({
        ...prevEvent,
        eventTime: `${hours}:${minutes}`, // Format: HH:MM
      }));
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

                    {/* Edit & Delete Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity style={styles.editButton} onPress={() => handleEditEvent(item)}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEvent(item.id)}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <Text style={styles.noEventsText}>No upcoming events yet.</Text>
          )}

           {/* Edit Event Modal */}
           <Modal visible={modalVisible} animationType="fade" transparent={true}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Edit Event</Text>

      {/* Event Name Input */}
      <TextInput
        style={styles.modalInput}
        value={selectedEvent?.eventName}
        onChangeText={(text) => setSelectedEvent({ ...selectedEvent, eventName: text })}
        placeholder="Event Name"
        placeholderTextColor="#888"
      />

      {/* Event Place Input */}
      <TextInput
        style={styles.modalInput}
        value={selectedEvent?.eventPlace}
        onChangeText={(text) => setSelectedEvent({ ...selectedEvent, eventPlace: text })}
        placeholder="Event Place"
        placeholderTextColor="#888"
      />

      {/* Date Picker */}
      <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateTimeText}>{selectedEvent?.eventDate || '📅 Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={selectedEvent?.eventDate ? new Date(selectedEvent.eventDate) : new Date()}
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.dateTimeText}>{selectedEvent?.eventTime || '⏰ Select Time'}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={selectedEvent?.eventTime ? new Date() : new Date()} // Default to current time
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Action Buttons */}
      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F8F8F8',
    color: '#333',
  },
  dateTimeButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#5392DD',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
