import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const navigation = useNavigation();

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const suppliersSnapshot = await firestore().collection('Supplier').get();
        const plannerSnapshot = await firestore().collection('Planner').get();

        const suppliers = suppliersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const planners = plannerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChatUsers([...suppliers, ...planners]);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Messages" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Chat List */}
      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('ClientChatScreen', { user: item })}
          >
            <Image
              source={
                item.avatar
                  ? { uri: item.avatar }
                  : require('../images/avatar.png') // Local fallback image
              }
              style={styles.avatar}
              onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)}
            />
            <View style={styles.chatInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {item.fullName || 'No Name'}
              </Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage || 'No messages yet'}
              </Text>
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
    backgroundColor: '#F8F9FB',
  },
  appBar: {
    backgroundColor: '#6200EE', // Modern purple color
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: '#ddd', // Adds a clean border
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
  },
  time: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});

export default ChatScreen;
