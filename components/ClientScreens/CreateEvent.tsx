/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const CreateEvent = ({ navigation }) => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [venue, setVenue] = useState('');
  const [venueType, setVenueType] = useState('Outdoor');
  const [selectedServices, setSelectedServices] = useState([]);
  const [eventImage, setEventImage] = useState(null); // State to store the image
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const services = [
    { label: 'Food & Beverage', value: 'food' },
    { label: 'Venue and Spaces', value: 'venue' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Decor and Styling', value: 'decor' },
    { label: 'Photography and Videography', value: 'photography' },
    { label: 'Event Rentals', value: 'rentals' },
    { label: 'Event Planning and Coordination', value: 'planning' },
    { label: 'Make-up and Wardrobe', value: 'makeup' },
  ];

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
  const formatTime = (time) => time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); // HH:MM AM/PM

  const handleCreateEvent = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an event.');
      return;
    }

    if (!eventName || !venue) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      // Upload the image to Firebase Storage
      let imageUrl = '';
      if (eventImage) {
        const imageRef = storage().ref(`event_images/${Date.now()}`);
        await imageRef.putFile(eventImage.uri);
        imageUrl = await imageRef.getDownloadURL();
      }

      // Add event to Firestore
      await firestore()
        .collection('Clients')
        .doc(user.uid)
        .collection('MyEvent')
        .add({
          eventName,
          eventDate: formatDate(eventDate),
          eventTime: formatTime(eventTime),
          venue,
          venueType,
          selectedServices,
          eventImage: imageUrl, // Save the image URL
          createdAt: firestore.FieldValue.serverTimestamp(),
          status: 'Upcoming',
        });

      Alert.alert('Success', 'Event created successfully!');
      navigation.navigate('Main'); // Adjust this based on your navigation
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const chooseImage = () => {
    launchImageLibrary({ noData: true }, (response) => {
      if (response.didCancel) {
        console.log('User canceled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        setEventImage(response.assets[0]); // Store the selected image
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Create Event</Text>

          {/* Event Name */}
          <TextInput
            style={styles.input}
            placeholder="Event Name"
            value={eventName}
            onChangeText={setEventName}
          />

          {/* Date Picker */}
          <Text style={styles.label}>Event Date</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{formatDate(eventDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setEventDate(selectedDate);
              }}
            />
          )}

          {/* Time Picker */}
          <Text style={styles.label}>Event Time</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
            <Text>{formatTime(eventTime)}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={eventTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setEventTime(selectedTime);
              }}
            />
          )}

          {/* Venue */}
          <TextInput
            style={styles.input}
            placeholder="Venue"
            value={venue}
            onChangeText={setVenue}
          />

          {/* Venue Type Dropdown */}
          <Text style={styles.label}>Venue Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={venueType}
              onValueChange={(itemValue) => setVenueType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Outdoor" value="Outdoor" />
              <Picker.Item label="Indoor" value="Indoor" />
            </Picker>
          </View>

          {/* List of Services */}
          <Text style={styles.label}>Select Services</Text>
          {services.map((service) => (
            <TouchableOpacity
              key={service.value}
              style={styles.checkboxContainer}
              onPress={() => toggleService(service.value)}
            >
              <Image
                source={selectedServices.includes(service.value) ? require('../images/checkedbox.png') : require('../images/Uncheckedbox.png')}
                style={styles.checkboxImage}
              />
              <Text style={styles.checkboxLabel}>{service.label}</Text>
            </TouchableOpacity>
          ))}

          {/* Image Upload */}
          <Text style={styles.label}>Event Image</Text>
          <TouchableOpacity style={styles.smallButton} onPress={chooseImage}>
            <Text style={styles.buttonText}>Choose Image</Text>
          </TouchableOpacity>
          {eventImage && (
            <Image source={{ uri: eventImage.uri }} style={styles.eventImage} />
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
            <Text style={styles.buttonText}>Create Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#5392DD',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#5392DD',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  smallButton: {
    backgroundColor: '#5392DD',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  eventImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: 'cover',
  },
});

export default CreateEvent;
