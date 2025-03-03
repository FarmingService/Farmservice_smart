import React, { useState } from "react";
import firebaseApp from "../firebase/credenciales";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../pages/design.css";

const auth = getAuth(firebaseApp);

function IniciarSesion() {
  const firestore = getFirestore(firebaseApp);
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rol: "",
    nombre: "",
    apellido: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const navigate = useNavigate();

  const generarMensajeError = (code) => {
    const errorMessages = {
      "auth/email-already-in-use": "Este correo electrónico ya está registrado. Intenta iniciar sesión.",
      "auth/weak-password": "La contraseña es demasiado débil. Asegúrate de que tenga al menos 6 caracteres.",
      "auth/user-not-found": "Usuario no encontrado. Verifica tu correo electrónico o regístrate.",
      "auth/wrong-password": "Correo electrónico o contraseña incorrectos. Intenta nuevamente.",
      "auth/invalid-email": "El correo electrónico no es válido. Por favor, verifica tu entrada.",
    };
    return errorMessages[code] || "Parece que algo salio mal. Revise su correo o contraseña por favor.";
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validarDatos = () => {
    const { email, password, rol, nombre, apellido } = formData;
    const errores = {};

    if (!email || !password || (isRegistrando && (!rol || !nombre || !apellido))) {
      if (!email) errores.email = "Por favor, ingresa un correo electrónico válido.";
      if (!password) errores.password = "Por favor, ingresa una contraseña.";
      if (isRegistrando) {
        if (!rol) errores.rol = "Por favor, selecciona un rol (Administrador/Usuario).";
        if (!nombre) errores.nombre = "Por favor, ingresa tu nombre.";
        if (!apellido) errores.apellido = "Por favor, ingresa tu apellido.";
      }
    }

    if (password && password.length < 6) {
      errores.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setError(errores);
    return Object.keys(errores).length === 0;
  };

  const verificarUsuarioEnBD = async (uid) => {
    const docuRef = doc(firestore, `usuarios/${uid}`);
    const docSnap = await getDoc(docuRef);
    return docSnap.exists();
  };

  const registrarUsuario = async () => {
    const { email, password, rol, nombre, apellido } = formData;
    try {
      const infoUsuario = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(infoUsuario.user, {
        displayName: `${nombre} ${apellido}`,
      });

      const docuRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);
      await setDoc(docuRef, { correo: email, rol, nombre, apellido, estado: "inactivo" });

      const userRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (userData?.rol === "admin") {
        setNombreUsuario(userData.nombre);
        navigate("/admin-view");
      } else {
        setNombreUsuario(userData.nombre);
        navigate("/user-view");
      }
    } catch (error) {
      setError({ registro: generarMensajeError(error.code) });
      setTimeout(() => setError({}), 4000);  // Error se borra después de 4 segundos
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validarDatos()) return;

    const { email, password } = formData;

    try {
      if (!isRegistrando) {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const usuarioRegistrado = await verificarUsuarioEnBD(user.uid);

        if (!usuarioRegistrado) {
          setError({ login: "Este usuario no está permitido. Por favor, regístrate primero." });
          setTimeout(() => setError({}), 4000);  // Error se borra después de 4 segundos
          return;
        }

        const userRef = doc(firestore, `usuarios/${user.uid}`);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.rol === "admin") {
          setNombreUsuario(userData.nombre);
          navigate("/admin-view");
        } else {
          setNombreUsuario(userData.nombre);
          navigate("/user-view");
        }
      } else {
        await registrarUsuario();
      }
    } catch (error) {
      setError({ login: generarMensajeError(error.code) });
      setTimeout(() => setError({}), 4000);  // Error se borra después de 4 segundos
    }
  };

  const handlePasswordReset = async () => {
    const { email } = formData;
    if (!email) {
      setError({ reset: "Por favor, ingresa tu correo electrónico para recuperar la contraseña." });
      setTimeout(() => setError({}), 3500);  // Error se borra después de 4 segundos
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setPasswordResetMessage("Se ha enviado un enlace para restablecer tu contraseña a tu correo.");
    } catch (error) {
      setError({ reset: generarMensajeError(error.code) });
      setTimeout(() => setError({}), 3500);  // Error se borra después de 4 segundos
    }
  };

  const toggleForm = () => {
    setIsRegistrando(!isRegistrando);
    setError({});
    setPasswordResetMessage("");
  };

  return (
    <div className="login-container">
      <h1 className="login-title">{isRegistrando ? "Regístrate" : "Bienvenido"}</h1>
      <form onSubmit={submitHandler} className="login-form">
        <InputField
          label="Correo electrónico"
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={error.email}
        />
        <InputField
          label="Contraseña"
          id="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleInputChange}
          error={error.password}
        />
        <button type="button" className="toggle-password" onClick={togglePasswordVisibility}>
          {showPassword ? "Ocultar" : "Mostrar"} contraseña
        </button>

        {!isRegistrando && (
          <button type="button" className="button-password" onClick={handlePasswordReset}>
            ¿Olvidaste tu contraseña?
          </button>
        )}

        {isRegistrando && (
          <>
            <div className="form-group">
              <label>Rol:</label>
              <select id="rol" onChange={handleInputChange} value={formData.rol} required>
                <option value="">Selecciona un rol</option>
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
              </select>
              {error.rol && <p className="error-message">{error.rol}</p>}
            </div>

            <InputField
              label="Ingrese su nombre"
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              error={error.nombre}
            />

            <InputField
              label="Ingrese su apellido"
              id="apellido"
              type="text"
              value={formData.apellido}
              onChange={handleInputChange}
              error={error.apellido}
            />
          </>
        )}

        <button type="submit" className="submit-button">
          {isRegistrando ? "Registrar" : "Iniciar sesión"}
        </button>
      </form>

      <button onClick={toggleForm} className="toggle-form">
        {isRegistrando ? "Ya tengo una cuenta" : "Quiero registrarme"}
      </button>

      {error.login && <p className="error-message">{error.login}</p>}
      {error.reset && <p className="error-message">{error.reset}</p>}
      {passwordResetMessage && <p className="success-message">{passwordResetMessage}</p>}

      {nombreUsuario && <p className="user-name">Bienvenido, {nombreUsuario}</p>}
    </div>
  );
}

const InputField = ({ label, id, type, value, onChange, error }) => (
  <div className="form-group">
    <label>{label}:</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      required
    />
    {error && <p className="error-message">{error}</p>}
  </div>
);

export default IniciarSesion;
