import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { 
  FaFolder, FaBars, FaChartBar, FaMap, FaCog, FaSignOutAlt, FaUser, FaUpload, FaTimesCircle,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("archivos");
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('full'); // 'full', 'collapsed', or 'hidden'
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState('reportes/');

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
    try {
      const downloadURL = URL.createObjectURL(profilePic);
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

  // Cargar carpetas y archivos desde Firebase Storage
  const loadFilesAndFolders = async (path) => {
    const rootRef = ref(storage, path);
    const folderList = await listAll(rootRef);
    const folderNames = folderList.prefixes.map(folderRef => folderRef.name);
    setFolders(folderNames);

    const fileUrls = await Promise.all(folderList.items.map(item => getDownloadURL(item)));
    setFiles(fileUrls);
  };

  // Navegar a una carpeta
  const handleFolderClick = (folderName) => {
    const newPath = `${currentPath}${folderName}/`;
    setCurrentPath(newPath);
    loadFilesAndFolders(newPath);
  };

  // Volver a la carpeta anterior
  const handleBackClick = () => {
    const newPath = currentPath.split('/').slice(0, -2).join('/') + '/';
    setCurrentPath(newPath);
    loadFilesAndFolders(newPath);
  };

  // Sondeo periódico para actualizar la lista de carpetas y archivos
  useEffect(() => {
    const intervalId = setInterval(() => loadFilesAndFolders(currentPath), 10000); // Actualizar cada 10 segundos
    return () => clearInterval(intervalId);
  }, [currentPath]);

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

  // Escuchar cambios en autenticación
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (user.photoURL) setImagePreview(user.photoURL);
        loadFilesAndFolders(currentPath);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [currentPath]);

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
        </div>

        {activeSection === "archivos" && (
          <div className="files-container">
            {currentPath !== 'reportes/' && (
              <button onClick={handleBackClick}>
                <FaArrowLeft /> Atrás
              </button>
            )}
            {folders.length === 0 && files.length === 0 ? (
              <p className="no-files">No se encontraron carpetas o archivos.</p>
            ) : (
              <ul>
                {folders.map((folderName, index) => (
                  <li key={index} onClick={() => handleFolderClick(folderName)}>
                    <strong>{folderName}</strong>
                  </li>
                ))}
                {files.map((fileUrl, index) => (
                  <li key={index}>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      {fileUrl.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
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