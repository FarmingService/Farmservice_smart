import React from 'react';
import '../styles/Footer.css';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 SmartFarming. Todos los derechos reservados.</p>
        <p>Desarrollado por: Juan P. 🌍🔬</p>
        <ul className="social-links">
          <li>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
          </li>
          <li>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
