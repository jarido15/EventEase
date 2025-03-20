import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Appbar } from 'react-native-paper';

const ClientChatScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = auth().currentUser.uid;

  useEffect(() => {
    const chatId = currentUserId < user.id ? `${currentUserId}_${user.id}` : `${user.id}_${currentUserId}`;

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

    return () => unsubscribe();
  }, [currentUserId, user.id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const chatId = currentUserId < user.id ? `${currentUserId}_${user.id}` : `${user.id}_${currentUserId}`;

    await firestore()
      .collection('Chats')
      .doc(chatId)
      .collection('Messages')
      .add({
        text: newMessage,
        senderId: currentUserId,
        receiverId: user.id,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

    setNewMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Appbar.Header style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Image source={user.avatarUrl ? { uri: user.avatarUrl } : require('../images/avatar.png')} style={styles.avatar} />
        <Appbar.Content title={user.supplierName || user.fullName || 'Chat'} titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[styles.messageWrapper, item.senderId === currentUserId ? styles.sentWrapper : styles.receivedWrapper]}
          >
            {item.senderId !== currentUserId && (
              <Image source={user.avatarUrl ? { uri: user.avatarUrl } : require('../images/avatar.png')} style={styles.messageAvatar} />
            )}
            <View
              style={[
                styles.messageContainer,
                item.senderId === currentUserId ? styles.sentMessage : styles.receivedMessage,
              ]}
            >
              <Text style={[styles.messageText, item.senderId !== currentUserId && { color: '#000' }]}>
                {item.text}
              </Text>
            </View>
            {item.senderId === currentUserId && (
              <Image source={require('../images/avatar.png')} style={styles.messageAvatar} />
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Image source={require('../images/sendicon.png')} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  appBar: {
    backgroundColor: '#6200EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  sentWrapper: {
    alignSelf: 'flex-end',
  },
  receivedWrapper: {
    alignSelf: 'flex-start',
  },
  messageContainer: {
    padding: 12,
    maxWidth: '75%',
    borderRadius: 20,
    elevation: 3,
  },
  sentMessage: {
    backgroundColor: '#6200EE',
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 10,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#6200EE',
    borderRadius: 50,
    padding: 10,
    marginLeft: 10,
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default ClientChatScreen;
