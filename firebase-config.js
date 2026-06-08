/**
 * Firebase Config and Initializer - Blue Dale Construction
 * Paste your Firebase credentials inside the object below.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBZA951U2f_V877AohKQ4Hu292MzGHpXRE",
  authDomain: "blue-dale-construction-295e6.firebaseapp.com",
  projectId: "blue-dale-construction-295e6",
  storageBucket: "blue-dale-construction-295e6.firebasestorage.app",
  messagingSenderId: "198316148450",
  appId: "1:198316148450:web:9eda0441f12340ecd040bb"
};

// Check if configuration has been updated by user
const isPlaceholder = (config) => {
  return !config.apiKey || config.apiKey.startsWith("YOUR_");
};

// Global variables to hold database state
window.firebaseEnabled = false;
window.isFirebaseDemo = true;
window.db = null;
window.auth = null;
window.storage = null;

// Initialize Firebase if user has provided credentials
if (!isPlaceholder(firebaseConfig)) {
  try {
    // Initialize App
    firebase.initializeApp(firebaseConfig);
    
    // Set References
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    window.storage = firebase.storage();

    // DEBUG
console.log("Firebase initialized");
console.log("window.db =", window.db);
console.log("window.auth =", window.auth);
console.log("window.storage =", window.storage);
    
    window.firebaseEnabled = true;
    window.isFirebaseDemo = false;
    console.log("Firebase Database successfully initialized.");
  } catch (error) {
    console.error("Error initializing Firebase, falling back to Demo Mode:", error);
    window.isFirebaseDemo = true;
  }
} else {
  console.warn("Firebase credentials not found. Running in Demo Mode (Local Mock Database).");
  window.isFirebaseDemo = true;
}
