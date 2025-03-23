import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';

const EditServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { service } = route.params;

  const [eventName, setEventName] = useState(service.eventName);
  const [eventDate, setEventDate] = useState(new Date(service.eventDate));
  const [eventTime, setEventTime] = useState(new Date(service.eventTime));
  const [venue, setVenue] = useState(service.venue);
  const [price, setPrice] = useState(service.price);
  const [venueType, setVenueType] = useState(service.venueType);
  const [eventImage, setEventImage] = useState({ uri: service.eventImage });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (date) => date.toISOString().split('T')[0];
  const formatTime = (time) => time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleSave = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      let imageUrl = service.eventImage;
      if (eventImage.uri !== service.eventImage) {
        const imageRef = storage().ref(`event_images/${Date.now()}`);
        await imageRef.putFile(eventImage.uri);
        imageUrl = await imageRef.getDownloadURL();
      }

      await firestore()
        .collection('Planner')
        .doc(user.uid)
        .collection('PlannerServices')
        .doc(service.id)
        .update({
          eventName,
          eventDate: formatDate(eventDate),
          eventTime: formatTime(eventTime),
          venue,
          price,
          venueType,
          eventImage: imageUrl,
        });

      Alert.alert('Success', 'Service updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service.');
    }
  };

  const handleDelete = async () => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      await firestore()
        .collection('Planner')
        .doc(user.uid)
        .collection('PlannerServices')
        .doc(service.id)
        .delete();

      Alert.alert('Success', 'Service deleted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Failed to delete service.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this service?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
      { cancelable: true }
    );
  };

  const chooseImage = () => {
    launchImageLibrary({ noData: true }, (response) => {
      if (response.didCancel) {
        console.log('User canceled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        setEventImage(response.assets[0]);
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Edit Service</Text>

      <Text>Event Name</Text>
      <TextInput
        value={eventName}
        onChangeText={setEventName}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Event Date</Text>
      <TouchableOpacity style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} onPress={() => setShowDatePicker(true)}>
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

      <Text>Event Time</Text>
      <TouchableOpacity style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} onPress={() => setShowTimePicker(true)}>
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

      <Text>Venue</Text>
      <TextInput
        value={venue}
        onChangeText={setVenue}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Text>Venue Type</Text>
      <View style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}>
        <Picker selectedValue={venueType} onValueChange={(itemValue) => setVenueType(itemValue)}>
          <Picker.Item label="Outdoor" value="Outdoor" />
          <Picker.Item label="Indoor" value="Indoor" />
        </Picker>
      </View>

      <Text>Event Image</Text>
      <TouchableOpacity style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} onPress={chooseImage}>
        <Text>Choose Image</Text>
      </TouchableOpacity>
      {eventImage && <Image source={{ uri: eventImage.uri }} style={{ width: '100%', height: 200, marginBottom: 10 }} />}

      <Button title="Save Changes" onPress={handleSave} style={{ marginBottom: 10 }} />
      <View style={{ marginVertical: 10 }}>
        <Button title="Delete Service" onPress={confirmDelete} color="#ef233c" />
      </View>
      <View style={{ marginVertical: 10 }}>
        <Button title="Cancel" onPress={() => navigation.goBack()} color="#669bbc" />
      </View>
    </ScrollView>
  );
};

export default EditServiceScreen;