import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, Image, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import firestore, { FieldValue } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Appbar } from 'react-native-paper';

const ClientChatScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const currentUser = auth().currentUser;

  if (!currentUser || !user?.id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: User not authenticated.</Text>
      </View>
    );
  }

  const currentUserId = currentUser.uid;
  const chatId = [currentUserId, user.id].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Chats')
      .doc(chatId)
      .collection('Messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        setMessages(messagesData);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
  
    const messageData = {
      text: newMessage,
      senderId: currentUserId,
      receiverId: user.id,
      timestamp: firestore.FieldValue.serverTimestamp(),
    };
  
    try {
      // ✅ Add the message to Firestore
      await firestore()
        .collection('Chats')
        .doc(chatId)
        .collection('Messages')
        .add(messageData);
  
      // ✅ Update last message details in Firestore (without modifying user object)
      await firestore().collection('Chats').doc(chatId).set({
        lastMessage: newMessage,
        lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
  
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Image source={user.avatarUrl ? { uri: user.avatarUrl } : require('../images/avatar.png')} style={styles.avatar} />
        <Appbar.Content title={user.supplierName || user.fullName || 'Chat'} titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={styles.loader} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageWrapper, item.senderId === currentUserId ? styles.sentWrapper : styles.receivedWrapper]}>
              {item.senderId !== currentUserId && (
                <Image source={user.avatarUrl ? { uri: user.avatarUrl } : require('../images/avatar.png')} style={styles.messageAvatar} />
              )}
              <View style={[styles.messageContainer, item.senderId === currentUserId ? styles.sentMessage : styles.receivedMessage]}>
                <Text style={item.senderId === currentUserId ? styles.sentText : styles.receivedText}>
                  {item.text}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity onPress={handleSendMessage} style={[styles.sendButton, sending && styles.disabledButton]} disabled={sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Image source={require('../images/sendicon.png')} style={styles.sendIcon} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  appBar: { backgroundColor: '#6200EE', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  backButton: { padding: 10 },
  backIcon: { width: 24, height: 24, tintColor: '#FFFFFF' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageWrapper: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  sentWrapper: { alignSelf: 'flex-end' },
  receivedWrapper: { alignSelf: 'flex-start' },
  messageContainer: { padding: 12, maxWidth: '75%', borderRadius: 20, elevation: 3 },
  sentMessage: { backgroundColor: '#6200EE', borderBottomRightRadius: 0 },
  receivedMessage: { backgroundColor: '#fff', borderBottomLeftRadius: 0 },
  sentText: { fontSize: 16, color: '#fff' }, // White text for sent messages
  receivedText: { fontSize: 16, color: '#000' }, // Black text for received messages
  messageAvatar: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, marginHorizontal: 10, marginBottom: 50, elevation: 3 },
  input: { flex: 1, fontSize: 16, paddingVertical: 8, color: '#333' },
  sendButton: { backgroundColor: '#6200EE', borderRadius: 50, padding: 10, marginLeft: 10 },
  disabledButton: { opacity: 0.5 },
  sendIcon: { width: 24, height: 24, tintColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#FF0000' },
});

export default ClientChatScreen;
