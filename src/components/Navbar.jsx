import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importar Link de react-router-dom
import '../styles/Navbar.css'; // Importar el archivo CSS de estilos

const Navbar = () => {
  // Estado para controlar si el menú está abierto
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detectar el desplazamiento de la página para cambiar la apariencia de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Limpiar el evento al desmontar el componente
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para alternar el estado del menú
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} aria-label="Barra de navegación principal">
      <div className="navbar-container">
        <Link to="/" className="logo">
          Smart Farming
        </Link>

        {/* Icono del menú (hamburguesa) */}
        <button
          className={`navbar-toggle ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Lista de enlaces de navegación */}
        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          </li>
          <li>
            <Link to="/services" onClick={() => setMenuOpen(false)}>Servicios</Link>
          </li>
          <li>
            <Link to="/iniciar-sesion" onClick={() => setMenuOpen(false)}>Iniciar Sesión</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
