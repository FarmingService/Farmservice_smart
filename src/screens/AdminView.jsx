import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";
import firebaseApp from "../firebase/credenciales";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  listAll, 
  deleteObject,
  getMetadata
} from "firebase/storage";
import IniciarSesion from "../pages/IniciarSesion";
import { 
  FaSignOutAlt, 
  FaTrashAlt,  
  FaUsers, 
  FaCheck, 
  FaTimes,
  FaUpload,
  FaFolder,
  FaFolderPlus,
  FaFile,
  FaDownload,
  FaChartBar,
  FaMapMarkedAlt
} from "react-icons/fa"; 
import "./AdminView.css";

// Inicialización de Firebase Auth, Firestore y Storage
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const AdminView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [userList, setUserList] = useState([]);
  const [showActive, setShowActive] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para la gestión de reportes
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState("reportes/");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  
  const fileInputRef = useRef(null);

  // Funciones para abrir ventanas externas
  const openGeoportal = () => {
    window.open('prototipe/maps.html', '_blank');
  };

  const openMetricas = () => {
    window.open('./Metricas.html', '_blank');
  };

  // Manejo del cierre de sesión
  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
    if (confirmLogout) {
      signOut(auth)
        .then(() => {
          setIsLoggedIn(false);
        })
        .catch((error) => {
          console.error("Error al cerrar sesión:", error);
        });
    }
  };

  // Obtener los usuarios desde Firestore
  useEffect(() => {
    const usersCollection = collection(db, "usuarios");
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserList(users);
      setTotalUsers(users.length);
      const active = users.filter((user) => user.estado === "activo").length;
      setActiveUsers(active);
    });
    return () => unsubscribe();
  }, []);

  // Función para listar archivos y carpetas en Storage - ahora con useCallback
  const listFilesAndFolders = useCallback(async () => {
    try {
      const storageRef = ref(storage, currentPath);
      const result = await listAll(storageRef);
      
      // Procesar carpetas
      const folderPaths = new Set();
      result.prefixes.forEach((folderRef) => {
        const name = folderRef.name;
        folderPaths.add(name);
      });
      
      // Convertir a formato de array para el estado
      const folderArray = Array.from(folderPaths).map(name => ({
        name,
        path: `${currentPath}${name}/`,
        isFolder: true
      }));
      
      // Procesar archivos - Filtrar los .placeholder
      const filePromises = result.items
        .filter(item => !item.name.endsWith('.placeholder')) // Filtrar archivos placeholder
        .map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url,
            size: metadata.size,
            type: metadata.contentType,
            isFolder: false,
            updated: new Date(metadata.updated)
          };
        });
      
      const fileArray = await Promise.all(filePromises);
      
      setFolders(folderArray);
      setFiles(fileArray);
    } catch (error) {
      console.error("Error al listar archivos y carpetas:", error);
    }
  }, [currentPath]);

  // Listar archivos y carpetas cuando la ruta cambia
  useEffect(() => {
    listFilesAndFolders();
  }, [listFilesAndFolders]);

  // Función para subir archivos
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    Array.from(files).forEach(file => {
      const storageRef = ref(storage, `${currentPath}${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("Error al subir el archivo:", error);
          setIsUploading(false);
        }, 
        () => {
          setIsUploading(false);
          setUploadProgress(0);
          listFilesAndFolders();
        }
      );
    });
  };

  // Función modificada para crear nueva carpeta sin archivos placeholder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    // En lugar de crear un archivo placeholder, simplemente actualizamos el estado
    // y esperamos a que se suba un archivo real a esta carpeta
    const newFolder = {
      name: newFolderName,
      path: `${currentPath}${newFolderName}/`,
      isFolder: true
    };
    
    setFolders(prevFolders => [...prevFolders, newFolder]);
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  // Función para eliminar archivo o carpeta
  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar ${item.isFolder ? "esta carpeta" : "este archivo"}?`);
    if (!confirmDelete) return;
    
    try {
      if (item.isFolder) {
        // Si es carpeta, necesitamos eliminar recursivamente todos los archivos
        await deleteFolder(item.path);
      } else {
        // Si es archivo, simplemente lo eliminamos
        const fileRef = ref(storage, item.path);
        await deleteObject(fileRef);
      }
      
      listFilesAndFolders();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Función auxiliar para eliminar carpetas recursivamente
  const deleteFolder = async (folderPath) => {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    // Eliminar todas las subcarpetas
    for (const prefix of result.prefixes) {
      await deleteFolder(prefix.fullPath);
    }
    
    // Eliminar todos los archivos
    for (const item of result.items) {
      await deleteObject(item);
    }
  };

  // Navegar a una carpeta
  const navigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
  };

  // Navegar a la carpeta superior
  const navigateUp = () => {
    if (currentPath === "reportes/") return;
    
    const pathParts = currentPath.split('/');
    // Removemos el último elemento (nombre de la carpeta actual) y el penúltimo elemento (que está vacío después del último /)
    pathParts.splice(-2, 2);
    const newPath = pathParts.join('/') + '/';
    setCurrentPath(newPath);
  };

  // Cambiar el estado de un usuario
  const toggleUserStatus = async (userId, currentStatus) => {
    const userRef = doc(db, "usuarios", userId);
    try {
      await updateDoc(userRef, {
        estado: currentStatus === "activo" ? "inactivo" : "activo",
      });
    } catch (error) {
      console.error("Error al actualizar el estado del usuario:", error);
    }
  };

  // Eliminar un usuario
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este usuario?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "usuarios", userId));
        setUserList(prevUsers => prevUsers.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    }
  };

  // Filtrar usuarios según estado (activo/inactivo) y término de búsqueda
  const filteredUsers = useMemo(() => {
    let filtered = userList;
    
    if (showActive) {
      filtered = filtered.filter((user) => user.estado === "activo");
    }
    
    if (searchTerm) {
      filtered = filtered.filter(
        (user) => 
          user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.correo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [userList, showActive, searchTerm]);

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isLoggedIn) return <IniciarSesion />;

  return (
    <div className="admin-dashboard">
      {/* Contenido principal */}
      <div className="main-content">
        <div className="header">
          <h1>Dashboard de Administración</h1>
          
          {/* Nueva sección de pestañas */}
          <div className="navigation-tabs">
            <button 
              className="tab-button"
              onClick={openGeoportal}
            >
              <FaMapMarkedAlt /> Geoportal
            </button>
            <button 
              className="tab-button"
              onClick={openMetricas}
            >
              <FaChartBar /> Métricas
            </button>
          </div>
         
          <button 
            className="logout-btn" 
            onClick={handleLogout}
          >
            <FaSignOutAlt /> <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Layout del Dashboard */}
        <div className="dashboard-layout">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon users-active">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h4>Usuarios Activos</h4>
                <p>{activeUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon users-inactive">
                <FaTimes />
              </div>
              <div className="stat-info">
                <h4>Usuarios Inactivos</h4>
                <p>{totalUsers - activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Gestión de usuarios */}
            <div className="user-management">
              <div className="card-header">
                <h3>Gestión de Usuarios</h3>
                <div className="search-bar">
            <input 
              type="text" 
              placeholder="Buscar usuarios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Control de búsqueda
            />
          </div>
                <button onClick={() => setShowActive(!showActive)} className="filter-btn">
                  {showActive ? "Mostrar Todos" : "Mostrar Activos"}
                </button>
              </div>
              
              <div className="user-table-container">
                {filteredUsers.length === 0 ? (
                  <p className="no-data">No se encontraron usuarios</p> // Mensaje cuando no hay usuarios
                ) : (
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Tabla de usuarios */}
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.nombre || "Sin nombre"}</td>
                          <td>{user.correo || "Sin correo"}</td>
                          <td>
                            <span className={`status-badge ${user.estado === "activo" ? "active" : "inactive"}`}>
                              {user.estado === "activo" ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button 
                              className={`toggle-btn ${user.estado === "activo" ? "deactivate" : "activate"}`}
                              onClick={() => toggleUserStatus(user.id, user.estado)} // Alternar estado
                            >
                              {user.estado === "activo" ? <FaTimes /> : <FaCheck />}
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteUser(user.id)} // Eliminar usuario
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          
          {/* NUEVA SECCIÓN: Gestión de Reportes */}
          <div className="report-management">
            <div className="card-header">
              <h3>Gestión de Reportes</h3>
              <div className="report-actions">
                <button 
                  className="upload-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaUpload /> Subir Archivo
                </button>
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
                
                <button 
                  className="folder-btn"
                  onClick={() => setShowNewFolderInput(true)}
                >
                  <FaFolderPlus /> Nueva Carpeta
                </button>
              </div>
            </div>
            
            {/* Barra de progreso de carga */}
            {isUploading && (
              <div className="upload-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress.toFixed(1)}%</span>
              </div>
            )}
            
            {/* Input para crear nueva carpeta */}
            {showNewFolderInput && (
              <div className="new-folder-input">
                <input 
                  type="text" 
                  placeholder="Nombre de la carpeta" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button onClick={handleCreateFolder}>Crear</button>
                <button onClick={() => setShowNewFolderInput(false)}>Cancelar</button>
              </div>
            )}
            
            {/* Navegación de carpetas */}
            <div className="folder-navigation">
              <button 
                className="back-btn"
                onClick={navigateUp}
                disabled={currentPath === "reportes/"}
              >
                ⬅️ Volver
              </button>
              <span className="current-path">{currentPath}</span>
            </div>
            
            {/* Explorador de archivos */}
            <div className="file-explorer">
              {folders.length === 0 && files.length === 0 ? (
                <p className="no-data">No hay archivos ni carpetas en esta ubicación</p>
              ) : (
                <table className="file-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Tamaño</th>
                      <th>Última modificación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Primero mostrar las carpetas */}
                    {folders.map((folder) => (
                      <tr key={folder.path} className="folder-row">
                        <td 
                          className="folder-name" 
                          onClick={() => navigateToFolder(folder.path)}
                        >
                          <FaFolder className="folder-icon" /> {folder.name}
                        </td>
                        <td>Carpeta</td>
                        <td>-</td>
                        <td>-</td>
                        <td className="actions-cell">
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(folder)}
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Luego mostrar los archivos */}
                    {files.map((file) => (
                      <tr key={file.path} className="file-row">
                        <td className="file-name">
                          <FaFile className="file-icon" /> {file.name}
                        </td>
                        <td>{file.type || "Desconocido"}</td>
                        <td>{formatFileSize(file.size)}</td>
                        <td>{file.updated.toLocaleString()}</td>
                        <td className="actions-cell">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="download-btn"
                          >
                            <FaDownload />
                          </a>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(file)}
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;