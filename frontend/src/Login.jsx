import { useState } from 'react';
import api from './api';

export default function Login({ onLogin }) {
  const [email, setEmail]   = useState('admin@padaria.com');
  const [senha, setSenha]   = useState('');
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      sessionStorage.setItem('padaria_token', data.token);
      onLogin(data.usuario);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao conectar com o servidor');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily:"'Playfair Display',Georgia,serif", background:"#1a0f00", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"linear-gradient(145deg,#2a1800,#1f1000)", border:"1px solid #3d2200", borderRadius:20, padding:40, width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🥖</div>
          <div style={{ fontSize:24, fontWeight:800, color:"#f0c040" }}>PadariaSystem</div>
          <div style={{ fontSize:13, color:"#c8a060", marginTop:4 }}>PDV + Comanda Digital</div>
        </div>
        <form onSubmit={entrar} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:11, color:"#c8a060", marginBottom:5, display:"block", fontWeight:600, textTransform:"uppercase" }}>Email</label>
            <input
              style={{ width:"100%", padding:"10px 14px", borderRadius:9, border:"1px solid #5a3a00", background:"#150c00", color:"#f5e6c8", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
              type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize:11, color:"#c8a060", marginBottom:5, display:"block", fontWeight:600, textTransform:"uppercase" }}>Senha</label>
            <input
              style={{ width:"100%", padding:"10px 14px", borderRadius:9, border:"1px solid #5a3a00", background:"#150c00", color:"#f5e6c8", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
              type="password" value={senha} onChange={e=>setSenha(e.target.value)} required placeholder="••••••••"
            />
          </div>
          {erro && <div style={{ padding:"8px 12px", borderRadius:8, background:"#3a0a00", color:"#ff6a6a", fontSize:13 }}>⚠️ {erro}</div>}
          <button
            type="submit" disabled={loading}
            style={{ padding:"12px", borderRadius:10, border:"none", background:loading?"#3a2000":"linear-gradient(135deg,#c8860a,#e6a020)", color:loading?"#5a3a00":"#1a0f00", fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", marginTop:4 }}>
            {loading ? '⏳ Entrando...' : '🔑 Entrar'}
          </button>
        </form>
        <div style={{ marginTop:20, padding:"12px", borderRadius:8, background:"#150c00", border:"1px solid #3d2200", fontSize:12, color:"#5a3a00", textAlign:"center" }}>
          Login padrão: admin@padaria.com<br/>Senha: padaria123
        </div>
      </div>
    </div>
  );
}
