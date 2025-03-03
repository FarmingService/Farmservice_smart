import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '../firebase/credenciales';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(firebaseApp);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Usuario autenticado:', userCredential.user);
      navigate('/user-view'); // Redirige a la vista del usuario
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Iniciar sesión</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;