import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const FavoriteScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth().currentUser;
      if (!user) return;

      try {
        // Fetch the Favorites subcollection for the logged-in user
        const favoritesSnapshot = await firestore()
          .collection('Clients')
          .doc(user.uid)
          .collection('Favorite')
          .get();

        const favoritesData = favoritesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            serviceName: data.serviceName,
            supplierName: data.supplierName,
            imageUrl: data.imageUrl,
            BusinessName: data.BusinessName,
            ContactNumber: data.ContactNumber,
            email: data.email,
            Location: data.Location,
          };
        });

        setFavorites(favoritesData);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favoriteId) => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      // Remove the favorite document from Firestore
      await firestore()
        .collection('Clients')
        .doc(user.uid)
        .collection('Favorite')
        .doc(favoriteId)
        .delete();

      // Remove the favorite item from the state
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      Alert.alert('Success', 'Favorite removed successfully!');
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Could not remove favorite.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.itemContent}>
        <Text style={styles.title}>{item.serviceName}</Text>
        <Text style={styles.supplierName}>Supplier: {item.supplierName}</Text>
        <Text style={styles.businessName}>Business: {item.BusinessName}</Text>
        <Text style={styles.location}>Location: {item.Location}</Text>
        <Text style={styles.contact}>Contact: {item.ContactNumber}</Text>
        <Text style={styles.email}>Email: {item.email}</Text>
      </View>
      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Image source={require('../images/trash.png')} style={styles.removeIcon} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Favorites</Text>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  supplierName: {
    fontSize: 16,
    color: '#555',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
  },
  location: {
    fontSize: 16,
    color: '#007AFF',
  },
  contact: {
    fontSize: 16,
  },
  email: {
    fontSize: 16,
    color: '#555',
  },
  removeButton: {
    marginLeft: 10,
  },
  removeIcon: {
    width: 20,
    height: 20,
    tintColor: 'red',
  },
});

export default FavoriteScreen;
