import React, { useState } from 'react';
import '../styles/Home.css';
// ventana incial 
const Home = () => {
  // Estado para manejar la visibilidad de cada sección
  const [visibleContent, setVisibleContent] = useState(null);

  const toggleContent = (section) => {
    // Si la sección que se clicó ya está visible, se oculta
    if (visibleContent === section) {
      setVisibleContent(null);
    } else {
      setVisibleContent(section);
    }
  };

  return (
    <div className="home-page">
      {/* Sección de bienvenida */}
      <section id="home" className="home-container">
        <div className="home-overlay">
          <h1 className="home-title">Bienvenido a Smart Farming</h1>
          <p className="home-description">La mejor experiencia digital para ti</p>
          <a href="#more-info" className="home-btn">Descubre Más</a>
        </div>
        <div className="home-background"></div>
      </section>

      {/* Sección de más información */}
      <section id="more-info" className="more-info-section">
        <h2>Descubre lo que ofrecemos</h2>
        <p>Te proporcionamos soluciones innovadoras y personalizadas para llevar tu negocio al siguiente nivel. ¡Explora más!</p>
        
        <div className="features">
          <div className="feature-card">
            <i className="fa fa-lightbulb" aria-hidden="true"></i>
            <h3 onClick={() => toggleContent('innovacion')}>Innovación</h3>
            {visibleContent === 'innovacion' && (
              <p>Trabajamos con tecnología de vanguardia para ofrecer soluciones que marcan la diferencia.</p>
            )}
          </div>
          <div className="feature-card">
            <i className="fa fa-check-circle" aria-hidden="true"></i>
            <h3 onClick={() => toggleContent('calidad')}>Calidad</h3>
            {visibleContent === 'calidad' && (
              <p>Nuestros productos son fabricados con los más altos estándares de calidad.</p>
            )}
          </div>
          <div className="feature-card">
            <i className="fa fa-headset" aria-hidden="true"></i>
            <h3 onClick={() => toggleContent('soporte')}>Soporte 24/7</h3>
            {visibleContent === 'soporte' && (
              <p>Te acompañamos en todo momento, con atención al cliente disponible 24 horas al día.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sección de testimonios */}
      <section id="testimonials" className="testimonials-section">
        <h2>Lo que dicen nuestros clientes</h2>
        <div className="testimonials">
          <div className="testimonial-card">
            <p>"Gracias a esta plataforma, nuestro negocio ha crecido un 50% en menos de 6 meses. ¡Altamente recomendados!"</p>
            <span>- Juan Pérez, CEO de Tech Innovators</span>
          </div>
          <div className="testimonial-card">
            <p>"El soporte 24/7 es increíble, siempre están dispuestos a ayudar y responder nuestras preguntas."</p>
            <span>- Ana García, Directora de Marketing</span>
          </div>
        </div>
      </section>

      {/* Sección de llamada a la acción */}
      <section id="cta" className="cta-section">
        <h2>¡Únete a nosotros hoy!</h2>
        <p>Empieza ahora y transforma tu negocio con nuestras soluciones innovadoras.</p>
        <a href="#contact" className="cta-btn">Contáctanos</a>
      </section>

      {/* Sección de contacto */}
      <section id="contact" className="contact-section">
        <h2>Contacto</h2>
        <p>¿Tienes alguna pregunta o comentario? ¡Contáctanos!</p>
        <div className="contact-image">
            <img src="/images/fondo2.jpg" alt="Contáctanos" /> 
          </div>
      </section>
    </div>
  );
};

export default Home;
