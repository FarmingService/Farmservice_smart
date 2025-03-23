import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut, onAuthStateChanged, updateProfile, updateEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { 
  FaFolder, FaBars, FaChartBar, FaMap, FaCog, FaSignOutAlt, FaUser, FaUpload, FaTimesCircle,
  FaArrowLeft, FaTimes, FaSave, FaTrashAlt, FaLock
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

  // Nuevos estados para configuración
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  // Actualizar información del perfil del usuario
  const updateUserProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Actualizar nombre de usuario
      if (displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName });
        setUser((prevUser) => ({ ...prevUser, displayName }));
      }
      
      // Actualizar correo electrónico (requiere reautenticación)
      if (email !== user.email && currentPassword) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, email);
        setUser((prevUser) => ({ ...prevUser, email }));
        setCurrentPassword('');
      }
      
      setMessage({ text: 'Perfil actualizado con éxito', type: 'success' });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setMessage({ 
        text: error.code === 'auth/wrong-password' 
          ? 'Contraseña incorrecta' 
          : error.code === 'auth/requires-recent-login'
          ? 'Es necesario volver a iniciar sesión para esta acción'
          : 'Error al actualizar perfil: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cuenta de usuario
  const deleteUserAccount = async () => {
    if (!currentPassword) {
      return setMessage({ text: 'Debe ingresar su contraseña para eliminar la cuenta', type: 'error' });
    }
    
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteUser(auth.currentUser);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      setMessage({ 
        text: error.code === 'auth/wrong-password' 
          ? 'Contraseña incorrecta' 
          : 'Error al eliminar cuenta: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
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
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
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
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={updateUserProfile} className="profile-form">
              <div className="form-group">
                <label>Nombre de usuario</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>
              
              <div className="form-group">
                <label>Correo electrónico</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                {email !== user.email && (
                  <p className="info-text">
                    <FaLock /> Para cambiar el correo, es necesario verificar tu contraseña.
                  </p>
                )}
              </div>
              
              {(email !== user.email) && (
                <div className="form-group">
                  <label>Contraseña actual</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                className="save-btn" 
                disabled={loading || (displayName === user.displayName && email === user.email)}
              >
                <FaSave /> Guardar cambios
              </button>
            </form>
            
            <div className="account-danger-zone">
              <h4>Zona de peligro</h4>
              
              {!showDeleteConfirm ? (
                <button 
                  className="delete-account-btn" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <FaTrashAlt /> Eliminar mi cuenta
                </button>
              ) : (
                <div className="delete-confirmation">
                  <p className="warning-text">
                    Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
                  </p>
                  
                  <div className="form-group">
                    <label>Confirma tu contraseña para continuar</label>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>
                  
                  <div className="delete-actions">
                    <button 
                      className="confirm-delete-btn" 
                      onClick={deleteUserAccount}
                      disabled={loading || !currentPassword}
                    >
                      <FaTrashAlt /> {loading ? 'Eliminando...' : 'Confirmar eliminación'}
                    </button>
                    
                    <button 
                      className="cancel-delete-btn" 
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setCurrentPassword('');
                      }}
                    >
                      <FaTimesCircle /> Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;