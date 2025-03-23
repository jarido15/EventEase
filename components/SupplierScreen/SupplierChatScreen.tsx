import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // For getting current user ID
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const SupplierChatScreen = ({ route }) => {
  const { user } = route.params; // Receiver's user data passed from the chat list
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = auth().currentUser.uid; // Get the logged-in user's ID
  const navigation = useNavigation();

  useEffect(() => {
    // Listen for new messages in Firestore for the chat between the current user and the receiver
    const chatId = currentUserId < user.id ? `${currentUserId}_${user.id}` : `${user.id}_${currentUserId}`; // Unique chat ID

    const unsubscribe = firestore()
      .collection('Chats')
      .doc(chatId)
      .collection('Messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((querySnapshot) => {
        const messagesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      });

    return () => unsubscribe(); // Unsubscribe when the component unmounts
  }, [currentUserId, user.id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const chatId = currentUserId < user.id ? `${currentUserId}_${user.id}` : `${user.id}_${currentUserId}`; // Unique chat ID

    await firestore()
      .collection('Chats')
      .doc(chatId)
      .collection('Messages')
      .add({
        text: newMessage,
        senderId: currentUserId, // Logged-in user's ID
        receiverId: user.id, // Receiver's ID
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

    setNewMessage('');
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <Appbar.Header style={styles.appBar}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../images/back.png')} style={styles.backButton} />
          </TouchableOpacity>
          <Appbar.Content title={user.fullName || 'Chat'} />
        </View>
      </Appbar.Header>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === currentUserId ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  appBar: {
    backgroundColor: '#669bbc', // Add your desired background color here
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 24,
    height: 24,
    tintColor: '#fdf0d5', // Change the tint color to white for better visibility
    marginRight: 20,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    maxWidth: '75%',
  },
  sentMessage: {
    backgroundColor: '#e0ffe0',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginRight: 10,
  },
});

export default SupplierChatScreen;