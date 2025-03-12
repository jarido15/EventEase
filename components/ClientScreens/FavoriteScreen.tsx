import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth().currentUser;
      if (!user) return;

      try {
        const favoritesSnapshot = await firestore()
          .collection('Clients')
          .doc(user.uid)
          .collection('Favorite')
          .get();

        const favoritesData = favoritesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

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
      await firestore()
        .collection('Clients')
        .doc(user.uid)
        .collection('Favorite')
        .doc(favoriteId)
        .delete();

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      Alert.alert('Success', 'Favorite removed successfully!');
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Could not remove favorite.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />

      <View style={styles.cardContent}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={styles.supplier}>Supplier: {item.supplierName}</Text>
        <Text style={styles.business}>Business Name: {item.BusinessName}</Text>
        <Text style={styles.location}>Address: {item.Location}</Text>
        <Text style={styles.contact}>Contact Number: {item.ContactNumber}</Text>
        <Text style={styles.email}>Email: {item.email}</Text>

        <TouchableOpacity 
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Image source={require('../images/delete.png')} style={styles.removeIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Your Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>No favorites yet! ❤️</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 80 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
  },
  navBar: {
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
    width: "109%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    left: '45%',
  },
  noFavoritesText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#888',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
    top: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  supplier: {
    fontSize: 16,
    color: '#555',
  },
  business: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 6,
  },
  location: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  contact: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#444',
  },
  removeIcon: {
    width: 34,
    height: 34,
    left: '90%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
});

export default FavoriteScreen;
