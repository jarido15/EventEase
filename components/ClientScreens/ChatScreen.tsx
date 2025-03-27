import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

// 🔹 Chat List Component
const ChatList = ({ users, searchQuery, navigation, loading }) => {
  const filteredUsers = users.filter(user =>
    (user.supplierName || user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#5392DD" style={styles.loader} />;
  }

  return (
    <FlatList
      data={filteredUsers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => navigation.navigate('ClientChatScreen', { user: item })}
        >
          <Image
            source={item.avatar ? { uri: item.avatar } : require('../images/avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.chatInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {item.supplierName || item.fullName || 'No Name'}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || 'No messages yet'}
            </Text>
          </View>
          <Text style={styles.time}>{item.time || ''}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

// 🔹 Main Chat Screen Component
const ChatScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  
  const currentUser = auth().currentUser; // 🔹 Fetch the currently logged-in user
  const currentUserID = currentUser ? currentUser.uid : null;

  useEffect(() => {
    if (!currentUserID) {
      console.log('User is not logged in.');
      return;
    }

    fetchUsersWithMessages();
  }, [currentUserID]);

  const fetchUsersWithMessages = async () => {
    if (!currentUserID) return;

    setLoading(true);
    try {
      const [suppliersSnapshot, plannersSnapshot] = await Promise.all([
        firestore().collection('Supplier').get(),
        firestore().collection('Planner').get(),
      ]);

      const allUsers = [
        ...suppliersSnapshot.docs.map(doc => ({ id: doc.id, type: 'Supplier', ...doc.data() })),
        ...plannersSnapshot.docs.map(doc => ({ id: doc.id, type: 'Planner', ...doc.data() })),
      ];

      console.log('Fetched Users:', allUsers.length, allUsers);

      const usersWithMessages = [];

      for (const user of allUsers) {
        const chatDocID = `${user.id}_${currentUserID}`;
        const reverseChatDocID = `${currentUserID}_${user.id}`;

        const chatRef1 = firestore().collection('Chats').doc(chatDocID).collection('Messages');
        const chatRef2 = firestore().collection('Chats').doc(reverseChatDocID).collection('Messages');

        const [messagesSnapshot1, messagesSnapshot2] = await Promise.all([
          chatRef1.limit(1).get(),
          chatRef2.limit(1).get(),
        ]);

        if (!messagesSnapshot1.empty || !messagesSnapshot2.empty) {
          usersWithMessages.push(user);
          console.log(`User ${user.id} (${user.type}) has messages.`);
        }
      }

      setChatUsers(usersWithMessages);
      console.log('Users with messages:', usersWithMessages.length, usersWithMessages);
    } catch (error) {
      console.error('Error fetching users with messages:', error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Messages" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        placeholderTextColor={'#888'}
        onChangeText={setSearchQuery}
      />

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#5392DD' },
          tabBarIndicatorStyle: { backgroundColor: 'white' },
          tabBarLabelStyle: { color: 'white', fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="Suppliers">
          {() => <ChatList users={chatUsers.filter(user => user.type === 'Supplier')} searchQuery={searchQuery} navigation={navigation} loading={loading} />}
        </Tab.Screen>
        <Tab.Screen name="Planners">
          {() => <ChatList users={chatUsers.filter(user => user.type === 'Planner')} searchQuery={searchQuery} navigation={navigation} loading={loading} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  appBar: { backgroundColor: "#5392DD", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  searchInput: { height: 40, borderColor: '#ddd', borderWidth: 1, borderRadius: 20, margin: 15, paddingLeft: 15, backgroundColor: '#fff' },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 15, marginHorizontal: 10, marginVertical: 5, backgroundColor: 'white', borderRadius: 12, elevation: 3 },
  avatar: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 2, borderColor: '#ddd', marginRight: 15 },
  chatInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600', color: '#333' },
  lastMessage: { fontSize: 14, color: '#777' },
  time: { fontSize: 12, color: '#888', textAlign: 'right' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;