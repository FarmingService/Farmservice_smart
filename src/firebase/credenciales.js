import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Para la autenticación
import { getDatabase } from 'firebase/database'; // Para la base de datos en tiempo real

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAF7DzrspLL0eWjCB88OKmFjNjA6_RzDNM",
  authDomain: "cavoundalfa-bfaa0.firebaseapp.com",
  projectId: "cavoundalfa-bfaa0",
  storageBucket: "cavoundalfa-bfaa0.appspot.com",
  messagingSenderId: "979607031398",
  appId: "1:979607031398:web:55deaf56721e1f902c67a7"
};

// Inicializa Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicializa Firebase Authentication y Firebase Realtime Database
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);

// Exporta firebaseApp como default y los demás servicios
export default firebaseApp;
export { auth, database };
