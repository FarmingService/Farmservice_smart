import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage'; 
import { 
  FaFolder, FaFolderOpen, FaBars, FaChartBar, FaMap, 
  FaFileAlt, FaCog, FaSignOutAlt, FaUser, FaUpload, FaTimesCircle,
  FaArrowLeft, FaTimes
} from 'react-icons/fa';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("archivos");
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('full'); // 'full', 'collapsed', or 'hidden'

  const foldersRef = useRef([]);
  const fileInputRef = useRef(null);
  const sidebarRef = useRef(null);
  const profileOptionsRef = useRef(null);

  // Detectar si es dispositivo móvil y configurar sidebar inicial
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      
      // Configurar el modo inicial del sidebar según el tamaño de pantalla
      if (isMobileView) {
        setSidebarMode('hidden');
        setIsSidebarOpen(false);
      } else {
        setSidebarMode('full');
        setIsSidebarOpen(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Función para cambiar el modo del sidebar
  const toggleSidebar = () => {
    if (isMobile) {
      // En móvil solo alterna entre oculto y completo
      if (sidebarMode === 'hidden') {
        setSidebarMode('full');
        setIsSidebarOpen(true);
      } else {
        setSidebarMode('hidden');
        setIsSidebarOpen(false);
      }
    } else {
      // En escritorio alterna entre completo y colapsado
      if (sidebarMode === 'full') {
        setSidebarMode('collapsed');
        setIsSidebarOpen(true);
      } else if (sidebarMode === 'collapsed') {
        setSidebarMode('full');
        setIsSidebarOpen(true);
      } else {
        setSidebarMode('full');
        setIsSidebarOpen(true);
      }
    }
  };

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
      setShowProfileOptions(false);
    } catch (error) {
      console.error('Error al subir la foto:', error);
    }
    setLoading(false);
  };

  const cancelImageSelection = () => {
    setImagePreview(user?.photoURL || null);
    setProfilePic(null);
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

  // Abrir diálogo de selección de archivos
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Manejar navegación en secciones y cerrar sidebar en móvil
  const handleSectionChange = (section) => {
    setActiveSection(section);
    // En móvil, cerrar sidebar después de seleccionar una opción
    if (isMobile) {
      setSidebarMode('hidden');
      setIsSidebarOpen(false);
    }
  };

  // Cerrar opciones de perfil y sidebar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar sidebar en móvil si se hace clic fuera
      if (isMobile && isSidebarOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) && 
          !event.target.classList.contains('toggle-sidebar') && 
          !event.target.closest('.toggle-sidebar')) {
        setSidebarMode('hidden');
        setIsSidebarOpen(false);
      }
      
      // Cerrar opciones de perfil si se hace clic fuera
      if (showProfileOptions && 
          profileOptionsRef.current && 
          !profileOptionsRef.current.contains(event.target) &&
          !event.target.closest('.profile-pic-container')) {
        setShowProfileOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileOptions, isMobile, isSidebarOpen]);

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

  // Determinar clases para el sidebar basado en su modo
  const sidebarClasses = `sidebar ${isSidebarOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''} ${sidebarMode === 'collapsed' ? 'collapsed' : ''}`;
  
  // Determinar clases para el contenido principal
  const mainContentClasses = `main-content ${isSidebarOpen && !isMobile ? (sidebarMode === 'collapsed' ? 'sidebar-collapsed' : 'sidebar-expanded') : ''}`;

  return (
    <div className="user-view-container">
      {/* Overlay para dispositivos móviles cuando el sidebar está abierto */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => {
          setSidebarMode('hidden');
          setIsSidebarOpen(false);
        }}></div>
      )}
      
      {/* Botón flotante para abrir el sidebar en dispositivos móviles cuando está oculto */}
      {isMobile && !isSidebarOpen && (
        <button 
          className="mobile-sidebar-toggle" 
          onClick={() => {
            setSidebarMode('full');
            setIsSidebarOpen(true);
          }}
          aria-label="Abrir menú"
        >
          <FaBars />
        </button>
      )}

      {/* Sidebar mejorado con modos */}
      <div className={sidebarClasses} ref={sidebarRef}>
        <div className="sidebar-header">
          {isMobile ? (
            <button 
              className="close-sidebar" 
              onClick={() => {
                setSidebarMode('hidden');
                setIsSidebarOpen(false);
              }}
              aria-label="Cerrar menú"
            >
              <FaTimes />
            </button>
          ) : (
            <button 
              className="toggle-sidebar" 
              onClick={toggleSidebar}
              aria-label={sidebarMode === 'full' ? "Colapsar menú" : "Expandir menú"}
            >
              {sidebarMode === 'full' ? <FaArrowLeft /> : <FaBars />}
            </button>
          )}
        </div>

        <div className="sidebar-content">
          {/* Perfil en el sidebar - Mejorado */}
          <div className="profile-sidebar">
            <div 
              className="profile-pic-container" 
              onClick={() => sidebarMode === 'full' && setShowProfileOptions(!showProfileOptions)}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Foto de perfil" className="profile-pic" />
              ) : (
                <div className="no-profile-pic">
                  <FaUser size={sidebarMode === 'collapsed' ? 20 : 32} />
                </div>
              )}
            </div>
            
            {sidebarMode === 'full' && (
              <h3 title={user.displayName || user.email}>
                {user.displayName || user.email}
              </h3>
            )}
            
            {/* Opciones de perfil desplegables */}
            {showProfileOptions && sidebarMode === 'full' && (
              <div className="profile-options" ref={profileOptionsRef}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleProfilePicChange} 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button className="profile-option-btn" onClick={triggerFileInput}>
                  <FaUpload /> Cambiar foto de perfil
                </button>
                {imagePreview && imagePreview !== user.photoURL && (
                  <div>
                    <img src={imagePreview} alt="Vista previa" className="image-preview" />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="profile-option-btn upload-btn" 
                        onClick={handleUploadProfilePic} 
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        {loading ? 'Subiendo...' : 'Guardar'}
                      </button>
                      <button 
                        className="profile-option-btn" 
                        onClick={cancelImageSelection}
                        style={{ 
                          backgroundColor: '#e74c3c',
                          flex: 1
                        }}
                      >
                        <FaTimesCircle /> Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sidebar-menu">
            <button 
              className={activeSection === "archivos" ? "active" : ""}
              onClick={() => handleSectionChange("archivos")}
              title="Mis Archivos"
            >
              <FaFolder /> {sidebarMode === 'full' && <span>Mis Archivos</span>}
            </button>
            <button 
              className={activeSection === "geoportal" ? "active" : ""}
              onClick={() => window.open('prototipe/maps.html', '_blank')}
              title="Geoportal"
            >
              <FaMap /> {sidebarMode === 'full' && <span>Geoportal</span>}
            </button>
            <button 
              className={activeSection === "metricas" ? "active" : ""}
              onClick={() => window.open("../Metricas.html", '_blank')}
              title="Predicción"
            >
              <FaChartBar /> {sidebarMode === 'full' && <span>Predicción</span>}
            </button>
            <button 
              className={activeSection === "configuracion" ? "active" : ""}
              onClick={() => handleSectionChange("configuracion")}
              title="Configuración"
            >
              <FaCog /> {sidebarMode === 'full' && <span>Configuración</span>}
            </button>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <FaSignOutAlt /> {sidebarMode === 'full' && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={mainContentClasses}>
        <div className="content-header">
          <h2>
            {activeSection === "archivos" && "Mis Archivos"}
            {activeSection === "configuracion" && "Configuración"}
          </h2>
          
          {activeSection === "archivos" && (
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar archivo..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          )}
        </div>

        {activeSection === "archivos" && (
          <div className="files-container">
            {filteredFolders.length === 0 ? (
              <p className="no-files">No se encontraron carpetas o archivos.</p>
            ) : (
              <div className="folder-grid">
                {filteredFolders.map((folder, index) => (
                  <div key={index} className="folder-card">
                    <div 
                      className="folder-header"
                      onClick={() => fetchFolderContents(folder)}
                    >
                      <span className="folder-icon">
                        {expandedFolder === folder ? <FaFolderOpen size={24} /> : <FaFolder size={24} />}
                      </span>
                      <span className="folder-name">{folder}</span>
                    </div>
                    
                    {loadingFolder === folder && <p className="loading-text">Cargando...</p>}
                    
                    {expandedFolder === folder && folderContents[folder] && (
                      <div className="file-grid">
                        {folderContents[folder].length === 0 ? (
                          <p>Esta carpeta está vacía</p>
                        ) : (
                          folderContents[folder].map((file, idx) => (
                            <a 
                              key={idx} 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="file-item"
                            >
                              <FaFileAlt />
                              <span className="file-name">{file.name}</span>
                            </a>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "configuracion" && (
          <div className="config-section">
            <h3>Configuración de la cuenta</h3>
            <p>Aquí podrás cambiar la configuración de tu cuenta en el futuro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;