import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { initializeApp } from '@react-native-firebase/app';



// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7NLE_JsVAeLQJ9ebBGkl7wrKRgpCXT0E",
  authDomain: "eventease-550b2.firebaseapp.com",
  projectId: "eventease-550b2",
  storageBucket: "eventease-550b2.appspot.com",
  messagingSenderId: "547402221261",
  appId: "1:547402221261:web:867c47d2f125fcdd8ccb84",
  // measurementId: "G-W76565CM2F"
};


const app = initializeApp(firebaseConfig);


export { auth, firestore, storage  };


