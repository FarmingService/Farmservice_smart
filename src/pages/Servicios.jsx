import React, { useState, useRef } from 'react';
import { useSprings, animated } from 'react-spring';
import '../styles/Servicios.css';

const serviciosData = [
  {
    src: "../images/drone.jpg",
    title: "Aplicación de Drones",
    description: "Configuraciones que se adaptan perfectamente a diversos sectores industriales.",
  },
  {
    src: "../images/monitoreo.jpg",
    title: "Monitoreo",
    description: "Soluciones personalizadas para mejorar procesos.",
  },
  {
    src: "../images/agricultura.jpg",
    title: "Agricultura Inteligente",
    description: "Con un enfoque innovador, garantizamos resultados óptimos.",
  },
  {
    src: "../images/diseño.jpg",
    title: "Diseño y Construcción de Drones",
    description: "Desarrollamos soluciones tecnológicas avanzadas.",
  }
];

const Servicios = () => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const cardRef = useRef([]);

  // Configuración para animar cada tarjeta independientemente
  const springs = useSprings(
    serviciosData.length,
    serviciosData.map((_, index) => ({
      transform: 'scale(1)',
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
      config: { mass: 5, tension: 500, friction: 80 },
    }))
  );

  // Efecto 3D cuando el mouse entra en una tarjeta
  const handleMouseEnter = (index) => {
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Movimiento de la tarjeta con el mouse (efecto 3D)
  const handleMouseMove = (e, index) => {
    if (hoverIndex === index) {
      const card = cardRef.current[index];
      const { clientX: mouseX, clientY: mouseY } = e;
      const { offsetTop, offsetLeft, clientWidth, clientHeight } = card;
      const x = mouseX - (offsetLeft + clientWidth / 2);
      const y = mouseY - (offsetTop + clientHeight / 2);
      const degX = (y / clientHeight) * 15;
      const degY = -(x / clientWidth) * 15;

      card.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg)`;
    }
  };

  return (
    <section id="services" className="servicios-container">
      <div className="servicios-header">
        <h2>Servicios</h2>
        <p>Ofrecemos una variedad de servicios diseñados para satisfacer tus necesidades.</p>
      </div>
      <div className="servicios-cards">
        {serviciosData.map((servicio, index) => (
          <animated.div
            key={index}
            ref={(el) => (cardRef.current[index] = el)}
            className="servicio-card"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave()}
            onMouseMove={(e) => handleMouseMove(e, index)}
            style={{
              transform: springs[index].transform,
              boxShadow: springs[index].boxShadow,
            }}
          >
            <img src={servicio.src} alt={servicio.title} className="servicio-image" />
            <h3>{servicio.title}</h3>
            <p>{servicio.description}</p>
          </animated.div>
        ))}
      </div>
    </section>
  );
};

export default Servicios;
