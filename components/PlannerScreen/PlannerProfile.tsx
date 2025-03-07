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
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const PlannerProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({});
  const user = auth().currentUser;
  const navigation = useNavigation();


  
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const doc = await firestore().collection('Planner').doc(user.uid).get();
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
      await firestore().collection('Planner').doc(user.uid).update(editData);
      setProfile(prev => ({ ...prev, ...editData }));
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      const currentUser = auth().currentUser; // Get current user
      if (!currentUser) {
        Alert.alert("Error", "No user is currently signed in.");
        return;
      }
      await auth().signOut();
      navigation.replace('PlannerLogin');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert("Error", "Failed to log out. Please try again.");
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supplier Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {profile ? (
        <View style={styles.card}>
          <ProfileItem label="Full Name" value={profile.fullName} />
          <ProfileItem label="Email" value={profile.email} />
    
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
            {Object.keys(profile).map((key) => (
              key !== 'email' && (
                <TextInput
                  key={key}
                  style={styles.input}
                  placeholder={key}
                  defaultValue={profile[key]}
                  onChangeText={(text) => handleEdit(key, text)}
                />
              )
            ))}
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  editButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5 },
  editText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  value: { fontSize: 16, color: '#333' },
  logoutButton: { marginTop: 20, backgroundColor: 'red', padding: 12, borderRadius: 5, alignItems: 'center' },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 5 },
  saveButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center' },
  saveText: { color: 'white', fontSize: 16 },
  cancelButton: { marginTop: 10, backgroundColor: 'gray', padding: 10, borderRadius: 5, alignItems: 'center' },
  cancelText: { color: 'white', fontSize: 16 },
});

export default PlannerProfileScreen;
