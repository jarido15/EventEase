import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

const ServicesInfoScreen = () => {
  const navigation = useNavigation();
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = () => {
    if (!isChecked) {
      alert('Please agree to the Terms and Conditions');
      return;
    }
    alert('Account Created Successfully!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Services Information Section</Text>

      {/* Service Dropdown */}
      {/* <RNPickerSelect
        onValueChange={(value) => setSelectedService(value)}
        items={[
          { label: 'Photography', value: 'photography' },
          { label: 'Catering', value: 'catering' },
          { label: 'Event Planning', value: 'event_planning' },
        ]}
        placeholder={{ label: 'Services', value: null }}
        style={pickerSelectStyles}
      /> */}

      {/* Description Input */}
      <TextInput
        style={styles.textArea}
        placeholder="Description of services offered"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* Terms & Conditions */}
      {/* <View style={styles.termsContainer}>
        <CheckBox value={isChecked} onValueChange={setIsChecked} />
        <Text style={styles.termsText}>
          I agree to the <Text style={styles.linkText}>Terms of Service and Privacy Policy</Text>
        </Text>
      </View> */}

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F9FA', alignItems: 'center' },
  backButton: { position: 'absolute', top: 10, left: 10 },
  backArrow: { fontSize: 24, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 40 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  textArea: { width: '100%', height: 120, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, padding: 15, backgroundColor: '#E3F2FD', textAlignVertical: 'top' },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  termsText: { marginLeft: 10, fontSize: 14, color: '#666' },
  linkText: { color: '#007bff', textDecorationLine: 'underline' },
  button: { width: '100%', height: 50, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

// Picker select styles
const pickerSelectStyles = {
  inputIOS: { height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderColor: '#ccc', borderWidth: 1 },
  inputAndroid: { height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderColor: '#ccc', borderWidth: 1 },
};

export default ServicesInfoScreen;
