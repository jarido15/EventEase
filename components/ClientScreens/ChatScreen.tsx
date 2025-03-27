import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

// 🔹 Chat List Component

const ChatList = ({ users, searchQuery, navigation, loading }) => {

const ChatList = ({ users, searchQuery, navigation, loading, refreshing, onRefresh }) => {

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5392DD']} />}
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
          <Text style={styles.time}>
            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
          </Text>
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

  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  
  const currentUser = auth().currentUser; // 🔹 Fetch the currently logged-in user
  const currentUserID = currentUser ? currentUser.uid : null;

  const currentUser = auth().currentUser;
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

    const unsubscribe = fetchUsersWithMessages();

    return () => unsubscribe && unsubscribe();
  }, [currentUserID]);

  // 🔄 Function to fetch users and listen for latest messages
  const fetchUsersWithMessages = () => {
    if (!currentUserID) return;

    setLoading(true);

    const unsubscribeSuppliers = firestore()
      .collection('Supplier')
      .onSnapshot(snapshot => {
        const suppliers = snapshot.docs.map(doc => ({ id: doc.id, type: 'Supplier', ...doc.data() }));
        updateChatUsers(suppliers);
      });

    const unsubscribePlanners = firestore()
      .collection('Planner')
      .onSnapshot(snapshot => {
        const planners = snapshot.docs.map(doc => ({ id: doc.id, type: 'Planner', ...doc.data() }));
        updateChatUsers(planners);
      });

    return () => {
      unsubscribeSuppliers();
      unsubscribePlanners();
    };
  };

  // 🔄 Update chat users with latest message and sort by timestamp
  const updateChatUsers = (newUsers) => {
    const allUsers = [...newUsers];

    allUsers.forEach(user => {
      const chatDocID = `${user.id}_${currentUserID}`;
      const reverseChatDocID = `${currentUserID}_${user.id}`;

      const chatRef1 = firestore().collection('Chats').doc(chatDocID).collection('Messages');
      const chatRef2 = firestore().collection('Chats').doc(reverseChatDocID).collection('Messages');

      const unsubscribeMessages = chatRef1
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot(snapshot1 => {
          processLatestMessage(snapshot1, user);
        });

      const unsubscribeMessagesReverse = chatRef2
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot(snapshot2 => {
          processLatestMessage(snapshot2, user);
        });

      return () => {
        unsubscribeMessages();
        unsubscribeMessagesReverse();
      };
    });

    setLoading(false);
  };

  // 🔄 Process the latest message for a user (Fix: Create a new object)
  const processLatestMessage = (snapshot, user) => {
    if (!snapshot.empty) {
      const latestMessageDoc = snapshot.docs[0].data();
      
      // Create a new user object instead of modifying the original one
      const updatedUser = {
        ...user,
        lastMessage: latestMessageDoc.text || 'No message',
        timestamp: latestMessageDoc.timestamp?.toMillis() || 0,
      };

      setChatUsers(prevUsers => {
        // Remove the old entry if exists, then add the updated user
        const updatedUsers = prevUsers.filter(u => u.id !== updatedUser.id);
        return [...updatedUsers, updatedUser].sort((a, b) => b.timestamp - a.timestamp);
      });
    }
  };

  // 🔄 Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsersWithMessages();
    setRefreshing(false);
  }, []);


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
          {() => <ChatList users={chatUsers.filter(user => user.type === 'Supplier')} searchQuery={searchQuery} navigation={navigation} loading={loading} refreshing={refreshing} onRefresh={onRefresh} />}
        </Tab.Screen>
        <Tab.Screen name="Planners">
          {() => <ChatList users={chatUsers.filter(user => user.type === 'Planner')} searchQuery={searchQuery} navigation={navigation} loading={loading} refreshing={refreshing} onRefresh={onRefresh} />}
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