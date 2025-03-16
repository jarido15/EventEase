import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Appbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const suppliersSnapshot = await firestore().collection('Supplier').get();
        const plannersSnapshot = await firestore().collection('Planner').get();

        const suppliers = suppliersSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'Supplier', // Identifies this as a Supplier
          ...doc.data(),
        }));

        const planners = plannersSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'Planner', // Identifies this as a Planner
          ...doc.data(),
        }));

        const allUsers = [...suppliers, ...planners];
        setChatUsers(allUsers);
        setFilteredUsers(allUsers); // Initialize filtered list with all users
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle search query change
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = chatUsers.filter((user) =>
        ((user.supplierName || user.fullName || "").toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(chatUsers);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Messages" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.note}>
          These are all the suppliers and planners you can chat with. Use the search bar below to find a specific contact.
        </Text>

        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {/* Chat List */}
        <FlatList
          data={filteredUsers}
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
                  {item.type === 'Supplier' 
                    ? `Supplier: ${item.supplierName || 'No Name'}` 
                    : `Planner: ${item.fullName || 'No Name'}`
                  }
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage || 'No messages yet'}
                </Text>
              </View>
              <Text style={styles.time}>{item.time || ''}</Text>
            </TouchableOpacity>
          )}
          scrollEnabled={false} // Prevents double scroll inside ScrollView
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#5392DD",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    paddingTop: 80, // Avoids overlapping with Appbar
    paddingBottom: 20,
  },
  note: {
    padding: 10,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 10,
    paddingLeft: 15,
    backgroundColor: '#fff',
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
    borderColor: '#ddd',
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
