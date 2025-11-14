// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEQoGzcNChYif628SGYsp8lgmb5ZleD7A",
  authDomain: "kanban-board-62b21.firebaseapp.com",
  databaseURL: "https://kanban-board-62b21-default-rtdb.firebaseio.com",
  projectId: "kanban-board-62b21",
  storageBucket: "kanban-board-62b21.firebasestorage.app",
  messagingSenderId: "171787622408",
  appId: "1:171787622408:web:db99067c29be41ac6019bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;

