import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import api   from './api.js';

// Importa o sistema principal do arquivo gerado pelo Claude
// Cole o conteúdo do padaria-system.jsx aqui substituindo este import
// OU copie o arquivo para src/Sistema.jsx e importe abaixo:
// import Sistema from './Sistema.jsx';

// ── Placeholder enquanto o sistema não é conectado ───────────────────────────
function SistemaPlaceholder({ usuario, onLogout }) {
  return (
    <div style={{ fontFamily:"Georgia,serif", background:"#1a0f00", minHeight:"100vh", color:"#f5e6c8", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ fontSize:60 }}>🥖</div>
      <div style={{ fontSize:22, fontWeight:700, color:"#f0c040" }}>Olá, {usuario.nome}!</div>
      <div style={{ fontSize:14, color:"#c8a060" }}>Backend conectado com sucesso ✅</div>
      <div style={{ fontSize:13, color:"#5a3a00", maxWidth:400, textAlign:"center" }}>
        Cole o conteúdo do <strong style={{color:"#c8a060"}}>padaria-system.jsx</strong> em{' '}
        <strong style={{color:"#c8a060"}}>src/Sistema.jsx</strong> e importe neste arquivo.
      </div>
      <button onClick={onLogout} style={{ padding:"8px 20px", borderRadius:8, border:"1px solid #5a3a00", background:"transparent", color:"#c8a060", cursor:"pointer", fontSize:13 }}>
        Sair
      </button>
    </div>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  // Verifica token salvo ao carregar
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

  return <SistemaPlaceholder usuario={usuario} onLogout={handleLogout} />;
  // Após integrar o sistema completo, substitua a linha acima por:
  // return <Sistema usuario={usuario} onLogout={handleLogout} />;
}
