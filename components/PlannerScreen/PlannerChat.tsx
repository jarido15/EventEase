import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const PlannerChat = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const navigation = useNavigation();

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const suppliersSnapshot = await firestore().collection('Supplier').get();
        const clientsSnapshot = await firestore().collection('Clients').get();

        // Combine supplier and client data
        const suppliers = suppliersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const clients = clientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChatUsers([...suppliers, ...clients]);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header>
        <Appbar.Content title="Messages" />
      </Appbar.Header>

      {/* Chat List */}
      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
     
              <TouchableOpacity
                      style={styles.chatItem}
                      onPress={() => navigation.navigate('PlannerChatScreen', { user: item })}
                    >
                      <Image source={require('../images/usericon.png')} style={styles.avatar} />
                      <View style={styles.chatInfo}>
                        {/* Display user name */}
                        <Text style={styles.name}>{item.fullName || 'No Name'}</Text>
                       
                      </View>
                      <Text style={styles.time}>{item.time || ''}</Text>
                    </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
});

export default PlannerChat;
