import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../firebase/config";

const auth = getAuth(app);
const storage = getStorage(app);

const uploadProfileImage = async (file, userId) => {
  try {
    const storageRef = ref(storage, `profile-images/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password, displayName, photoFile) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    let photoURL = null;
    if (photoFile) {
      photoURL = await uploadProfileImage(photoFile, result.user.uid);
    }

    if (displayName || photoURL) {
      await updateProfile(result.user, {
        displayName: displayName || result.user.email.split('@')[0],
        photoURL: photoURL || null,
      });
    }

    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName || result.user.email.split('@')[0],
        photoURL: photoURL,
      },
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password, rememberMe = false) => {
  try {
    // Configurar persistencia según "Recuérdame"
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, browserSessionPersistence);
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL,
      },
    };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

export { auth };

