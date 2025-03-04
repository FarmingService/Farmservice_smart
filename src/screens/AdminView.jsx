import React, { useState, useEffect, useMemo } from "react";
import { getAuth, signOut } from "firebase/auth";
import firebaseApp from "../firebase/credenciales";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import IniciarSesion from "../pages/IniciarSesion";
import { 
  FaSignOutAlt, 
  FaTrashAlt,  
  FaUsers, 
  FaMap, 
  FaChartBar, 
  FaFileAlt, 
  FaCog, 
  FaCheck, 
  FaTimes
} from "react-icons/fa"; 
import "./AdminView.css";

// Configuración de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Inicialización de Firebase Auth, Firestore y Storage
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


const AdminView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [userList, setUserList] = useState([]);
  const [showActive, setShowActive] = useState(true);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle logout
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
  
  // Fetch users from Firestore - otencion de usuarios"
  
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

  
  // Toggle user status - gestion de usuarios
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

  // Delete user
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


  // Pie chart data
  const data = useMemo(() => ({
    labels: ["Usuarios Activos", "Usuarios Inactivos"],
    datasets: [
      {
        data: [activeUsers, totalUsers - activeUsers],
        backgroundColor: ["#3498db", "#e74c3c"],
        hoverBackgroundColor: ["#2980b9", "#c0392b"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  }), [activeUsers, totalUsers]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom",
        labels: {
          font: {
            size: 14,
            family: "'Poppins', sans-serif"
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} (${((value / totalUsers) * 100).toFixed(2)}%)`;
          },
        },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutBounce",
    },
  }), [totalUsers]);

  // Filter users based on active/inactive status and search term
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
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (!isLoggedIn) return <IniciarSesion />;

  return (
    <div className={`admin-dashboard ${showSidebar ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="hamburger-menu" onClick={toggleSidebar}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      
      <div className="sidebar">
        <div className="logo">
          <h2>Admin Panel</h2>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={activeSection === "geoportal" ? "active" : ""}
            onClick={() => window.open('prototipe/maps.html', '_blank')} // seccion abrir geoportal
          >
            <FaMap /> <span>Geoportal</span>
          </button>
          <button 
            className={activeSection === "metricas" ? "active" : ""}
            onClick={() => window.open("../Metricas.html", '_blank')} // seccion - abrir metricas
          >
            <FaChartBar /> <span>Métricas</span>

          </button>
          <button 
         className={activeSection === "reportes" ? "active" : ""}
          onClick={() => window.open("../Reportes.html", "_blank")}
          >
         <FaFileAlt /> <span>Reportes</span>
        </button>
          <button 
            className={activeSection === "configuracion" ? "active" : ""}
            onClick={() => setActiveSection("configuracion")}
          >
            <FaCog /> <span>Configuración</span>
          </button>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
          >
            <FaSignOutAlt /> <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Dashboard de Administración</h1>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Buscar usuarios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
            <div className="stat-card">
            
              
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="chart-container">
              <div className="card-header">
                <h3>Distribución de Usuarios</h3>
              </div>
              <div className="chart-wrapper">
                <Pie data={data} options={options} />
              </div>
            </div>

            <div className="user-management">
              <div className="card-header">
                <h3>Gestión de Usuarios</h3>
                <button onClick={() => setShowActive(!showActive)} className="filter-btn">
                  {showActive ? "Mostrar Todos" : "Mostrar Activos"}
                </button>
              </div>
              
              <div className="user-table-container">
                {filteredUsers.length === 0 ? (
                  <p className="no-data">No se encontraron usuarios</p>
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
                              onClick={() => toggleUserStatus(user.id, user.estado)}
                            >
                              {user.estado === "activo" ? <FaTimes /> : <FaCheck />}
                              <span>{user.estado === "activo" ? "Desactivar" : "Activar"}</span>
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>
                              <FaTrashAlt />
                              <span>Eliminar</span>
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
    </div>
    
  );
};

export default AdminView;