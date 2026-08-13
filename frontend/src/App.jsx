import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import Sistema from './Sistema.jsx';
import api from './api.js';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('padaria_token');
    if (!token) { setVerificando(false); return; }
    api.get('/auth/me')
      .then(({ data }) => setUsuario(data))
      .catch(() => sessionStorage.removeItem('padaria_token'))
      .finally(() => setVerificando(false));
  }, []);

  const handleLogin  = (u) => setUsuario(u);
  const handleLogout = () => { sessionStorage.removeItem('padaria_token'); setUsuario(null); };

  if (verificando) {
    return (
      <div style={{ background:"#1a0f00", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:40, animation:"spin 1s linear infinite" }}>🥖</div>
        <style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  if (!usuario) return <Login onLogin={handleLogin} />;

  return <Sistema usuario={usuario} onLogout={handleLogout} />;
}
