import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

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

const ChatScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsersWithLastMessage = async () => {
      setLoading(true); // Start loading
      try {
        const suppliersSnapshot = await firestore().collection('Supplier').get();
        const plannersSnapshot = await firestore().collection('Planner').get();

        const fetchLastMessage = async (userId) => {
          const messagesSnapshot = await firestore()
            .collection('Chats')
            .doc(userId)
            .collection('Messages')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

          if (!messagesSnapshot.empty) {
            const lastMessageData = messagesSnapshot.docs[0].data();
            return {
              lastMessage: lastMessageData.text || 'No messages',
              time: lastMessageData.timestamp?.toDate().toLocaleTimeString() || '',
            };
          } else {
            return { lastMessage: 'No messages yet', time: '' };
          }
        };

        const suppliers = await Promise.all(
          suppliersSnapshot.docs.map(async (doc) => {
            const user = { id: doc.id, type: 'Supplier', ...doc.data() };
            const { lastMessage, time } = await fetchLastMessage(doc.id);
            return { ...user, lastMessage, time };
          })
        );

        const planners = await Promise.all(
          plannersSnapshot.docs.map(async (doc) => {
            const user = { id: doc.id, type: 'Planner', ...doc.data() };
            const { lastMessage, time } = await fetchLastMessage(doc.id);
            return { ...user, lastMessage, time };
          })
        );

        setChatUsers([...suppliers, ...planners]);
      } catch (error) {
        console.error('Error fetching users with last messages:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUsersWithLastMessage();
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
          {() => <ChatList users={chatUsers.filter(user => user.type === 'Supplier')} searchQuery={searchQuery} navigation={navigation} loading={loading} />}
        </Tab.Screen>
        <Tab.Screen name="Planners">
          {() => <ChatList users={chatUsers.filter(user => user.type === 'Planner')} searchQuery={searchQuery} navigation={navigation} loading={loading} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

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
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // Loader Style
});

export default ChatScreen;
