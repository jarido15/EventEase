import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SupplierProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({});
  const user = auth().currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      console.log('Current User ID:', user.uid);
    } else {
      console.log('No user is logged in');
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const doc = await firestore().collection('Supplier').doc(user.uid).get();
          if (doc.exists) {
            setProfile(doc.data());
          } else {
            Alert.alert('Error', 'Profile not found');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleEdit = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      await firestore().collection('Supplier').doc(user.uid).update(editData);
      setProfile(prev => ({ ...prev, ...editData }));
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    const user = auth().currentUser; // Ensure we get the latest user state
    await AsyncStorage.removeItem('userType'); // Clear session
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }

    try {
      await auth().signOut();
      setProfile(null);
      navigation.reset({
        index: 0,
        routes: [{ name: 'SupplierLogin' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const uploadImage = async (uri: string, path: string) => {
    const reference = storage().ref(path);
    await reference.putFile(uri);
    return await reference.getDownloadURL();
  };

  const handleImagePicker = async (field: string) => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.error) {
      console.log('ImagePicker Error: ', result.error);
    } else {
      const uri = result.assets[0].uri;
      const downloadURL = await uploadImage(uri, `Supplier/${user.uid}/${field}`);
      handleEdit(field, downloadURL);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Suppliermain')}>
          <Image source={require('../images/back.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
        <Image source={require('../images/edit.png')} style={styles.backButton} />
        </TouchableOpacity>
      </View>

      {profile ? (
        <View>
          <Image
            source={profile.coverPhoto ? { uri: profile.coverPhoto } : require('../images/default-cover.jpg')}
            style={styles.coverPhoto}
          />
          <Image
            source={profile.profilePicture ? { uri: profile.profilePicture } : require('../images/profile-account.png')}
            style={styles.profilePicture}
          />
          <ProfileItem label="Full Name" value={profile.supplierName} />
          <ProfileItem label="Email" value={profile.email} />
          <ProfileItem label="Business Name" value={profile.BusinessName} />
          <ProfileItem label="Contact Number" value={profile.ContactNumber} />
          <ProfileItem label="Address" value={profile.Address} />
          <ProfileItem label="Location" value={profile.Location} />
          <ProfileItem label="Earnings" value={`PHP ${profile.earnings}`} />
        </View>
      ) : (
        <Text style={styles.errorText}>Profile not found</Text>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <ScrollView>
              {profile &&
                Object.keys(profile).map(
                  (key) =>
                    key !== 'profilePicture' &&
                    key !== 'coverPhoto' &&
                    key !== 'earnings' &&
                    key !== 'accountStatus' &&
                    key !== 'createdAt' &&
                    key !== 'email' && (
                      <TextInput
                        key={key}
                        style={styles.input}
                        placeholder={key}
                        defaultValue={profile[key]}
                        onChangeText={(text) => handleEdit(key, text)}
                      />
                    )
                )}
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePicker('profilePicture')}>
                <Text style={styles.uploadText}>Upload Profile Picture</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImagePicker('coverPhoto')}>
                <Text style={styles.uploadText}>Upload Cover Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const ProfileItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { width: 24, height: 24, tintColor: '#003049' },
  title: { fontSize: 20, fontWeight: '600', color: '#003049' },
  editButton: { backgroundColor: '#669bbc', padding: 10, borderRadius: 5 },
  editText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 },
  coverPhoto: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  profilePicture: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 15 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  value: { fontSize: 14, color: '#333', fontWeight: '300' },
  logoutButton: { marginTop: 20, backgroundColor: '#c1121f', padding: 12, borderRadius: 5, alignItems: 'center' },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 5 },
  uploadButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  uploadText: { color: 'white', fontSize: 16 },
  saveButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center' },
  saveText: { color: 'white', fontSize: 16 },
  cancelButton: { marginTop: 10, backgroundColor: 'gray', padding: 10, borderRadius: 5, alignItems: 'center' },
  cancelText: { color: 'white', fontSize: 16 },
});

export default SupplierProfileScreen;