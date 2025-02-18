import React from 'react';
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Appbar, List } from 'react-native-paper';

const chatUsers = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hey! How are you?',
    time: '2:30 PM',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Emma Smith',
    lastMessage: 'See you tomorrow!',
    time: '1:15 PM',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'Michael Brown',
    lastMessage: 'Let’s catch up soon!',
    time: '11:45 AM',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

const PlannerChatScreen = () => {
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
          <TouchableOpacity style={styles.chatItem} onPress={() => console.log(`Chat with ${item.name}`)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
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

export default PlannerChatScreen;
