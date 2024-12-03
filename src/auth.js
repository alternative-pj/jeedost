import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "./firebaseSetup";
import { getDatabase, ref, get, set } from "firebase/database";

// Initialize Firebase Auth
const auth = getAuth();

// Initialize Firebase Database
const database = getDatabase();

// Google Login
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const role = await fetchUserRole(user.uid);
    redirectToDashboard(role);
    return user;
  } catch (error) {
    console.error('Error during Google login: ', error);
  }
};

// Email and Password Sign-Up
export const emailSignUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Store user role in the database
    await set(ref(database, 'users/' + user.uid), {
      name: name,
      role: 'student' // Default role
    });
    console.log('User signed up: ', user);
    return user;
  } catch (error) {
    console.error('Error during email sign-up: ', error);
  }
};

// Email and Password Login
export const emailLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const role = await fetchUserRole(user.uid);
    redirectToDashboard(role);
    return user;
  } catch (error) {
    console.error('Error during email login: ', error);
  }
};

// Function to fetch user role
const fetchUserRole = async (userId) => {
  const roleRef = ref(database, 'users/' + userId + '/role');
  const snapshot = await get(roleRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.error('No role found for user:', userId);
    return null;
  }
};

// Function to redirect based on role
const redirectToDashboard = (role) => {
  if (role === 'admin') {
    window.location.href = '/admin-dashboard';
  } else {
    window.location.href = '/study-page';
  }
};
