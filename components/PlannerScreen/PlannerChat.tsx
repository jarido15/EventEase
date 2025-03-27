import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const PlannerChat = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true); // ✅ Added loading state
  const navigation = useNavigation();
  const currentUserID = auth().currentUser?.uid;

  useEffect(() => {
    if (!currentUserID) {
      console.log('User is not logged in.');
      return;
    }

    fetchClients();
  }, [currentUserID]);

  const fetchClients = async () => {
    setLoading(true); // Start loading
    try {
      const snapshot = await firestore().collection('Clients').get();
      const allClients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Fetched Clients:', allClients.length, allClients);

      // Check for messages
      const clientsWithMessages = [];
      for (const client of allClients) {
        const chatDocID = `${client.id}_${currentUserID}`;
        const reverseChatDocID = `${currentUserID}_${client.id}`;

        const chatRef1 = firestore().collection('Chats').doc(chatDocID).collection('Messages');
        const chatRef2 = firestore().collection('Chats').doc(reverseChatDocID).collection('Messages');

        const [messagesSnapshot1, messagesSnapshot2] = await Promise.all([
          chatRef1.limit(1).get(),
          chatRef2.limit(1).get(),
        ]);

        if (!messagesSnapshot1.empty || !messagesSnapshot2.empty) {
          clientsWithMessages.push(client);
          console.log(`Client ${client.id} has messages.`);
        }
      }

      setClients(clientsWithMessages);
      setFilteredClients(clientsWithMessages);
      console.log('Clients with messages:', clientsWithMessages.length, clientsWithMessages);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
    setLoading(false); // Stop loading
  };

  const searchClients = async (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredClients(clients);
      return;
    }

    try {
      const searchSnapshot = await firestore()
        .collection('Clients')
        .where('fullName', '>=', query)
        .where('fullName', '<=', query + '\uf8ff')
        .get();

      const searchedClients = searchSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Searched Clients:', searchedClients.length, searchedClients);
      setFilteredClients(searchedClients);
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Messages" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search Clients..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={searchClients}
      />

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003049" />
          <Text style={styles.loadingText}>Loading Messages...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => navigation.navigate('PlannerChatScreen', { user: item })}
            >
              <Image source={require('../images/usericon.png')} style={styles.avatar} />
              <View style={styles.chatInfo}>
                <Text style={styles.name}>{item.fullName || 'No Name'}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noResults}>No clients found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  appBar: { backgroundColor: '#003049' },
  appBarTitle: { color: '#fdf0d5', fontSize: 16 },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  chatInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  noResults: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#003049' },
});

export default PlannerChat;
