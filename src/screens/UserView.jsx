import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage'; 
import { FaFolder, FaFolderOpen, FaSearch, FaBars, FaChartBar, FaGlobe, FaRegLightbulb } from 'react-icons/fa';
import firebaseApp from '../firebase/credenciales';
import IniciarSesion from '../pages/IniciarSesion';
import './UserView.css';

const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

const UserView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [folderContents, setFolderContents] = useState({});
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [loadingFolder, setLoadingFolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const foldersRef = useRef([]);

  // Cierre de sesión
  const handleLogout = () => {
    signOut(auth)
      .then(() => setIsLoggedIn(false))
      .catch((error) => console.error('Error al cerrar sesión:', error));
  };

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const filteredFolders = folders.filter((folder) =>
    folder.toLowerCase().includes(searchTerm)
  );

  // Manejo de la foto de perfil
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setProfilePic(file);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!profilePic) return alert('Selecciona una foto primero');
    setLoading(true);
    const storageRef = ref(storage, `profile_pics/${user.uid}`);
    try {
      await uploadBytes(storageRef, profilePic);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadURL });
      setUser((prevUser) => ({ ...prevUser, photoURL: downloadURL }));
      setImagePreview(null);
    } catch (error) {
      console.error('Error al subir la foto:', error);
    }
    setLoading(false);
  };

  // Obtener carpetas desde Firebase Storage
  const fetchFolders = async () => {
    try {
      const folderRef = ref(storage, 'files');
      const folderList = await listAll(folderRef);
      const folderNames = folderList.prefixes.map((folder) => folder.name);

      // Solo actualiza el estado si hay cambios
      if (JSON.stringify(foldersRef.current) !== JSON.stringify(folderNames)) {
        foldersRef.current = folderNames;
        setFolders(folderNames);
      }
    } catch (error) {
      console.error('Error al obtener carpetas:', error);
    }
  };

  // Obtener archivos de una carpeta
  const fetchFolderContents = async (folderName) => {
    if (expandedFolder === folderName) {
      setExpandedFolder(null);
      return;
    }

    if (folderContents[folderName]) {
      setExpandedFolder(folderName);
      return;
    }

    setLoadingFolder(folderName);
    const folderRef = ref(storage, `files/${folderName}`);
    try {
      const folderList = await listAll(folderRef);
      const fileUrls = await Promise.all(
        folderList.items.map(async (file) => {
          const fileURL = await getDownloadURL(file);
          return { name: file.name, url: fileURL };
        })
      );

      setFolderContents((prev) => ({
        ...prev,
        [folderName]: fileUrls,
      }));
      setExpandedFolder(folderName);
    } catch (error) {
      console.error('Error al obtener archivos:', error);
    } finally {
      setLoadingFolder(null);
    }
  };

  // Escuchar cambios en autenticación y carpetas en tiempo real
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (user.photoURL) setImagePreview(user.photoURL);
        fetchFolders();
      } else {
        setIsLoggedIn(false);
      }
    });

    // Actualización de carpetas en tiempo real
    const interval = setInterval(() => {
      fetchFolders();
    }, 3000);

    return () => {
      unsubscribeAuth();
      clearInterval(interval);
    };
  }, []);

  if (!isLoggedIn || !user) {
    return <IniciarSesion />;
  }

  return (
    <div className="user-view-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <FaBars />
        </button>
        {/* Contenido de la barra lateral */}
        <div className="sidebar-content">
          <h2>Bienvenido, {user.displayName || user.email}!</h2>
          

          {/* Nuevas opciones en la barra lateral */}
          <ul className="sidebar-options">
            <li>

            <button className="sidebar-option">
                <FaGlobe /> Geoportal
              </button>
              
              <button className="sidebar-option">
                <FaChartBar /> Métricas
              </button>
            </li>
            <li>
              <button className="sidebar-option">
                <FaRegLightbulb /> Pronostico
              </button>
            </li>
            <li>
              
              
              <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
          </button>
            </li>
          </ul>
        </div>
      </div>

      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="profile-section">
          <h2>Información del Perfil</h2>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Foto de perfil" className="profile-pic" />
          ) : (
            <div className="no-profile-pic">No tienes foto de perfil</div>
          )}
          <input type="file" onChange={handleProfilePicChange} />
          {imagePreview && !user.photoURL && (
            <img src={imagePreview} alt="Vista previa" className="image-preview" />
          )}
          <button onClick={handleUploadProfilePic} disabled={loading}>
            {loading ? 'Subiendo...' : 'Subir foto'}
          </button>
        </div>

        <div className="folders-section">
          <h2>Mis Carpetas</h2>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar carpeta..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          {filteredFolders.length === 0 ? (
            <p>No se encontraron carpetas.</p>
          ) : (
            <ul className="folder-list">
              {filteredFolders.map((folder, index) => (
                <li key={index} className="folder-item">
                  <span
                    onClick={() => fetchFolderContents(folder)}
                    className="folder-icon"
                  >
                    {expandedFolder === folder ? <FaFolderOpen /> : <FaFolder />}
                    {folder}
                  </span>
                  {loadingFolder === folder && <p>Cargando...</p>}
                  {expandedFolder === folder && folderContents[folder] && (
                    <ul className="file-list">
                      {folderContents[folder].map((file, idx) => (
                        <li key={idx}>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            {file.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;
