import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:3001';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/users?email=${email}&password=${password}`);
    const data = await res.json();

    if (data.length > 0) {
      // Guardar usuario en localStorage
      localStorage.setItem('auth', JSON.stringify(data[0]));
      Swal.fire('¡Bienvenido!', 'Inicio de sesión exitoso', 'success');
      navigate('/dashboard');
    } else {
      Swal.fire('Error', 'Correo o contraseña incorrectos', 'error');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
