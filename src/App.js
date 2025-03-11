import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"; // Archivo de estilos globales

// Componentes principales
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas del proyecto
import Home from './components/Home';
import Servicios from './pages/Servicios';
import IniciarSesion from './pages/IniciarSesion';
import UserView from './screens/UserView.jsx'; // Vista del usuario
import AdminView from './screens/AdminView.jsx'; // Vista del Administrador

// Firebase
import firebaseApp from './firebase/credenciales';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const App = () => {
  const [user, setUser] = useState(null); // Estado para almacenar usuario autenticado
  const [loading, setLoading] = useState(true); // Indicador de carga para esperar la autenticación
  const [isAdmin, setIsAdmin] = useState(false); // Para verificar si el usuario es admin

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  useEffect(() => {
    // Verificar el estado de autenticación
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(firestore, `usuarios/${currentUser.uid}`);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User Data:", userData); // Log de los datos del usuario
          if (userData.rol === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false); // Deja de mostrar el indicador de carga
    });
  }, [auth, firestore]);

  if (loading) {
    return <div>Loading...</div>; // Muestra un loading mientras se verifica el usuario
  }

  // Componente para proteger las rutas
  const ProtectedRoute = ({ element, isAdminRequired }) => {
    if (!user) {
      return <IniciarSesion />; // Redirigir a login si no está autenticado
    }
    if (isAdminRequired && !isAdmin) {
      return <div>Acceso denegado. Solo administradores pueden acceder a esta página.</div>; // Si es ruta admin y no es admin
    }
    return element; // Si pasa la validación, se muestra la página
  };

  return (
    <Router>
      <Navbar />
      
      <Routes>
        {/* Página de inicio */}
        <Route path="/" element={<Home />} />
        
        {/* Página de servicios */}
        <Route path="/services" element={<Servicios />} />
        
        {/* Página de iniciar sesión */}
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        
        {/* Página de la vista del usuario */}
        <Route 
          path="/user-view" 
          element={<ProtectedRoute element={<UserView />} isAdminRequired={false} />} 
        />
        
        {/* Página de la vista del Administrador */}
        <Route 
          path="/admin-view" 
          element={<ProtectedRoute element={<AdminView />} isAdminRequired={true} />} 
        />
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;
