
import { useState, useEffect, useRef } from "react";

const CATEGORIAS_INICIAIS = [
  { id:1, nome:"Pães",       emoji:"🍞" },
  { id:2, nome:"Frios",      emoji:"🧀" },
  { id:3, nome:"Laticínios", emoji:"🥛" },
  { id:4, nome:"Salgados",   emoji:"🥐" },
  { id:5, nome:"Bebidas",    emoji:"☕" },
  { id:6, nome:"Doces",      emoji:"🍰" },
];

const PRODUTOS_INICIAIS = [
  { id:1,  nome:"Pão Francês",       preco:8.90,  categoriaId:1, disponivel:true,  vendaPeso:true  },
  { id:2,  nome:"Pão de Queijo",     preco:3.50,  categoriaId:1, disponivel:true,  vendaPeso:false },
  { id:3,  nome:"Pão de Forma",      preco:9.90,  categoriaId:1, disponivel:true,  vendaPeso:false },
  { id:4,  nome:"Queijo Mussarela",  preco:42.00, categoriaId:2, disponivel:true,  vendaPeso:true  },
  { id:5,  nome:"Presunto Cozido",   preco:32.00, categoriaId:2, disponivel:true,  vendaPeso:true  },
  { id:6,  nome:"Salame",            preco:38.00, categoriaId:2, disponivel:true,  vendaPeso:true  },
  { id:7,  nome:"Leite Integral 1L", preco:4.80,  categoriaId:3, disponivel:true,  vendaPeso:false },
  { id:8,  nome:"Iogurte Natural",   preco:6.50,  categoriaId:3, disponivel:true,  vendaPeso:false },
  { id:9,  nome:"Coxinha",           preco:5.00,  categoriaId:4, disponivel:true,  vendaPeso:false },
  { id:10, nome:"Café Expresso",     preco:6.00,  categoriaId:5, disponivel:true,  vendaPeso:false },
  { id:11, nome:"Suco de Laranja",   preco:7.00,  categoriaId:5, disponivel:true,  vendaPeso:false },
  { id:12, nome:"Brigadeiro",        preco:3.00,  categoriaId:6, disponivel:true,  vendaPeso:false },
];

const MESAS_TOTAL = 12;
const fmt   = (v) => v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const fmtKg = (g) => g >= 1000 ? (g/1000).toFixed(3)+" kg" : g.toFixed(0)+"g";
const now   = () => new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
const today = () => new Date().toLocaleDateString("pt-BR");

const S = {
  app:          { fontFamily:"'Playfair Display','Georgia',serif", background:"#1a0f00", minHeight:"100vh", color:"#f5e6c8" },
  header:       { background:"linear-gradient(135deg,#2d1a00 0%,#4a2c00 50%,#2d1a00 100%)", borderBottom:"2px solid #c8860a", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, position:"sticky", top:0, zIndex:100, boxShadow:"0 4px 20px rgba(200,134,10,0.3)" },
  logo:         { fontSize:22, fontWeight:700, color:"#f0c040", letterSpacing:1, display:"flex", alignItems:"center", gap:10 },
  navBtn:   (a) => ({ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", transition:"all 0.2s", background:a?"#c8860a":"transparent", color:a?"#1a0f00":"#c8a060" }),
  main:         { padding:24, maxWidth:1400, margin:"0 auto" },
  card:         { background:"linear-gradient(145deg,#2a1800,#1f1000)", border:"1px solid #3d2200", borderRadius:16, padding:20, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" },
  sectionTitle: (c) => ({ fontSize:16, fontWeight:700, color:c||"#f0c040", marginBottom:16, display:"flex", alignItems:"center", gap:8 }),
  grid2:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  grid4:        { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 },
  input:        { width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #5a3a00", background:"#150c00", color:"#f5e6c8", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  label:        { fontSize:12, color:"#c8a060", marginBottom:6, display:"block", fontWeight:600 },
  btnPrimary:   { padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c8860a,#e6a020)", color:"#1a0f00", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
  btnSecondary: { padding:"8px 14px", borderRadius:8, border:"1px solid #5a3a00", background:"transparent", color:"#c8a060", fontSize:13, cursor:"pointer", fontFamily:"inherit" },
  btnDanger:    { padding:"4px 10px", borderRadius:8, border:"none", background:"#5a1a00", color:"#ff6b35", fontSize:13, cursor:"pointer", fontFamily:"inherit" },
  btnSuccess:   { padding:"12px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#1a5a00,#2a8a00)", color:"#b8ffb8", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", width:"100%" },
  badge:    (c) => ({ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:c==="green"?"#1a3a00":c==="red"?"#3a0a00":c==="blue"?"#0a1a3a":c==="purple"?"#1a0a3a":"#3a2a00", color:c==="green"?"#6aff6a":c==="red"?"#ff6a6a":c==="blue"?"#6ab8ff":c==="purple"?"#cc88ff":"#ffc84a" }),
  tag:          { display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px", borderRadius:20, border:"1px solid #5a3a00", background:"#2a1400", color:"#c8a060", fontSize:12, cursor:"pointer" },
  tagActive:    { display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px", borderRadius:20, border:"1px solid #c8860a", background:"#3a2000", color:"#f0c040", fontSize:12, cursor:"pointer" },
  toast:        { position:"fixed", bottom:24, right:24, background:"#2a8a00", color:"#b8ffb8", padding:"12px 20px", borderRadius:12, fontWeight:600, fontSize:14, zIndex:999, boxShadow:"0 4px 20px rgba(0,0,0,0.5)", animation:"slideIn 0.3s ease" },
  overlay:      { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" },
};

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, []);
  return <div style={S.toast}>{msg}</div>;
}

function ModalPesagem({ produto, onConfirmar, onFechar }) {
  const [unidade, setUnidade] = useState("g");
  const [valor, setValor]     = useState("");
  const inputRef              = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);
  const pesoKg  = valor ? (unidade === "g" ? +valor / 1000 : +valor) : 0;
  const total   = pesoKg * produto.preco;
  const valido  = pesoKg > 0;
  const confirmar = () => { if (!valido) return; onConfirmar(produto, pesoKg, total); };
  const handleKey = (e) => { if (e.key === "Enter" && valido) confirmar(); if (e.key === "Escape") onFechar(); };
  return (
    <div style={S.overlay} onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:"linear-gradient(145deg,#2a1800,#150c00)", border:"2px solid #c8860a", borderRadius:20, padding:32, width:380, boxShadow:"0 20px 60px rgba(0,0,0,0.8)" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>⚖️</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#f0c040" }}>Lançar Pesagem</div>
          <div style={{ fontSize:14, color:"#c8a060", marginTop:4 }}>{produto.nome}</div>
          <div style={{ fontSize:13, color:"#f0a020", marginTop:2 }}>{fmt(produto.preco)} / kg</div>
        </div>
        <div style={{ display:"flex", gap:0, background:"#150c00", borderRadius:10, padding:3, marginBottom:16, border:"1px solid #3d2200" }}>
          {["g","kg"].map((u) => (
            <button key={u} onClick={() => { setUnidade(u); setValor(""); }} style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:14, transition:"all 0.2s", background:unidade===u?"linear-gradient(135deg,#c8860a,#e6a020)":"transparent", color:unidade===u?"#1a0f00":"#c8a060" }}>
              {u === "g" ? "Gramas (g)" : "Quilos (kg)"}
            </button>
          ))}
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={S.label}>Peso aferido na balança</label>
          <div style={{ position:"relative" }}>
            <input ref={inputRef} style={{ ...S.input, fontSize:24, fontWeight:700, textAlign:"center", padding:"14px 50px 14px 14px", letterSpacing:2 }}
              type="number" step={unidade==="g"?"1":"0.001"} min="0"
              placeholder={unidade==="g" ? "000" : "0.000"}
              value={valor} onChange={(e) => setValor(e.target.value)} onKeyDown={handleKey} />
            <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#c8860a", fontWeight:700, fontSize:16 }}>{unidade}</span>
          </div>
        </div>
        <div style={{ background:"#150c00", borderRadius:12, padding:16, marginBottom:20, border:"1px solid "+(valido?"#c8860a":"#3d2200") }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#c8a060", marginBottom:8 }}>
            <span>Peso</span>
            <span style={{ color:"#f5e6c8", fontWeight:600 }}>{pesoKg > 0 ? fmtKg(pesoKg*1000) : "—"}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#c8a060", marginBottom:8 }}>
            <span>Preço/kg</span><span style={{ color:"#f5e6c8" }}>{fmt(produto.preco)}</span>
          </div>
          <div style={{ borderTop:"1px solid #3d2200", paddingTop:10, display:"flex", justifyContent:"space-between", fontSize:20, fontWeight:900 }}>
            <span style={{ color:"#c8a060" }}>Total</span>
            <span style={{ color:valido?"#f0c040":"#5a3a00" }}>{valido ? fmt(total) : "—"}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ ...S.btnSecondary, flex:1 }} onClick={onFechar}>Cancelar</button>
          <button disabled={!valido} onClick={confirmar} style={{ flex:2, padding:"12px 0", borderRadius:10, border:"none", cursor:valido?"pointer":"not-allowed", fontFamily:"inherit", fontWeight:700, fontSize:15, background:valido?"linear-gradient(135deg,#c8860a,#e6a020)":"#2a1a00", color:valido?"#1a0f00":"#5a3a00", transition:"all 0.2s" }}>
            {valido ? "✅ Lançar "+fmt(total) : "✅ Lançar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Cardapio({ produtos, categorias, itensAtivos, onAdd, onAddPeso }) {
  const [catFiltro, setCatFiltro] = useState(0);
  const [busca, setBusca]         = useState("");
  const filtrados = produtos.filter((p) =>
    p.disponivel &&
    (catFiltro === 0 || p.categoriaId === catFiltro) &&
    (busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase()))
  );
  const handleClick = (p) => { if (p.vendaPeso) onAddPeso(p); else onAdd(p); };
  return (
    <div style={{ ...S.card, overflowY:"auto", display:"flex", flexDirection:"column", gap:12 }}>
      <input style={S.input} placeholder="🔍 Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <span style={catFiltro===0?S.tagActive:S.tag} onClick={() => setCatFiltro(0)}>Todos</span>
        {categorias.map((c) => (
          <span key={c.id} style={catFiltro===c.id?S.tagActive:S.tag} onClick={() => setCatFiltro(c.id)}>{c.emoji} {c.nome}</span>
        ))}
      </div>
      <div style={S.grid4}>
        {filtrados.map((p) => {
          const cat  = categorias.find((c) => c.id===p.categoriaId);
          const itPeso = itensAtivos?.filter((i) => i.vendaPeso && i.prodId===p.id) || [];
          const qtdPeso= itPeso.reduce((s,i) => s+i.pesoKg, 0);
          const qtdUnit= itensAtivos?.find((i) => !i.vendaPeso && i.id===p.id)?.qtd || 0;
          const temItem= p.vendaPeso ? qtdPeso>0 : qtdUnit>0;
          return (
            <div key={p.id} onClick={() => handleClick(p)} style={{ padding:14, borderRadius:14, cursor:"pointer", userSelect:"none", position:"relative", transition:"all 0.15s", background:temItem?"#2a1800":"#150c00", border:temItem?"2px solid #c8860a":"1px solid #3d2200" }}>
              {p.vendaPeso && (
                <div style={{ position:"absolute", top:7, left:7, background:"#1a0a3a", border:"1px solid #7040cc", borderRadius:6, padding:"2px 6px", fontSize:9, color:"#cc88ff", fontWeight:700 }}>⚖️ PESO</div>
              )}
              {temItem && (
                <div style={{ position:"absolute", top:7, right:7, background:"#c8860a", color:"#1a0f00", borderRadius:8, padding:"2px 6px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900 }}>
                  {p.vendaPeso ? fmtKg(qtdPeso*1000) : qtdUnit}
                </div>
              )}
              <div style={{ fontSize:26, marginBottom:6, marginTop:p.vendaPeso?10:0 }}>{cat?.emoji||"🍞"}</div>
              <div style={{ fontSize:12, fontWeight:600, color:"#f5e6c8", marginBottom:3, lineHeight:1.3 }}>{p.nome}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#f0c040" }}>{fmt(p.preco)}{p.vendaPeso?" /kg":""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PainelItens({ titulo, cor, itens, total, onAdd, onRemove, rodape }) {
  return (
    <div style={{ ...S.card, display:"flex", flexDirection:"column", gap:8 }}>
      <div style={S.sectionTitle(cor||"#f0c040")}>{titulo}</div>
      <div style={{ flex:1, overflowY:"auto", maxHeight:340, display:"flex", flexDirection:"column", gap:4 }}>
        {itens.length === 0
          ? <div style={{ color:"#5a3a00", textAlign:"center", padding:16, fontSize:13 }}>Nenhum item ainda</div>
          : itens.map((item, idx) => (
            <div key={item.uid||idx} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #2a1500" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"#f5e6c8", display:"flex", alignItems:"center", gap:6 }}>
                  {item.vendaPeso && <span style={{ fontSize:10, color:"#cc88ff" }}>⚖️</span>}
                  {item.nome}
                  {item.vendaPeso && <span style={{ fontSize:11, color:"#c8860a", marginLeft:2 }}>{fmtKg(item.pesoKg*1000)}</span>}
                </div>
                <div style={{ fontSize:11, color:"#c8860a" }}>
                  {item.vendaPeso
                    ? fmt(item.precoPor)+" /kg × "+(item.pesoKg).toFixed(3)+" kg = "+fmt(item.total)
                    : fmt(item.preco)+" × "+item.qtd+" = "+fmt(item.preco*item.qtd)
                  }
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                {!item.vendaPeso && <>
                  <button style={S.btnDanger} onClick={() => onRemove(item.uid, false)}>−</button>
                  <span style={{ color:"#f0c040", fontWeight:700, minWidth:18, textAlign:"center" }}>{item.qtd}</span>
                  <button style={{ ...S.btnSecondary, padding:"4px 10px", fontSize:12 }} onClick={() => onAdd(item)}>+</button>
                </>}
                {item.vendaPeso && <button style={S.btnDanger} onClick={() => onRemove(item.uid, true)}>✕</button>}
              </div>
            </div>
          ))
        }
      </div>
      {itens.length > 0 && (
        <div style={{ borderTop:"2px solid #c8860a", paddingTop:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:17, fontWeight:900, color:"#f0c040", marginBottom:10 }}>
            <span>Total</span><span>{fmt(total)}</span>
          </div>
          {rodape}
        </div>
      )}
    </div>
  );
}

function Comanda({ produtos, categorias, comandas, setComandas, setToast }) {
  const [tipoVenda, setTipoVenda]     = useState("balcao");
  const [mesaSel, setMesaSel]         = useState(null);
  const [carrinho, setCarrinho]       = useState([]);
  const [modalPeso, setModalPeso]     = useState(null);
  const [nomeCliente, setNomeCliente] = useState("");
  const [pagamento, setPagamento]     = useState("dinheiro");
  const [valorRecebido, setValorRecebido] = useState("");

  const getMesa   = (n) => comandas.find((c) => c.mesa===n && c.status==="aberta");
  const abrirMesa = (n) => { if (!getMesa(n)) setComandas((cs) => [...cs, { id:Date.now(), mesa:n, itens:[], status:"aberta", hora:now(), data:today(), tipo:"mesa" }]); setMesaSel(n); };
  const comanda   = mesaSel ? getMesa(mesaSel) : null;
  const calcTotal = (itens) => itens.reduce((s,i) => s+(i.vendaPeso?i.total:i.preco*i.qtd), 0);
  const totalMesa  = comanda ? calcTotal(comanda.itens) : 0;
  const totalBalcao= calcTotal(carrinho);
  const troco      = pagamento==="dinheiro" && valorRecebido ? (+valorRecebido - totalBalcao) : null;

  const confirmarPeso = (prod, pesoKg, total) => {
    const item = { uid:Date.now(), prodId:prod.id, id:prod.id, nome:prod.nome, vendaPeso:true, precoPor:prod.preco, pesoKg, total };
    if (tipoVenda==="balcao") { setCarrinho((c) => [...c, item]); }
    else if (comanda) { setComandas((cs) => cs.map((c) => c.id===comanda.id ? {...c, itens:[...c.itens, item]} : c)); }
    setToast("⚖️ "+prod.nome+" — "+fmtKg(pesoKg*1000)+" → "+fmt(total));
    setModalPeso(null);
  };

  const addMesa = (prod) => {
    if (!comanda) return;
    if (prod.vendaPeso) { setModalPeso(prod); return; }
    setComandas((cs) => cs.map((c) => {
      if (c.id!==comanda.id) return c;
      const ex = c.itens.find((i) => !i.vendaPeso && i.id===prod.id);
      if (ex) return { ...c, itens:c.itens.map((i) => (!i.vendaPeso&&i.id===prod.id)?{...i,qtd:i.qtd+1}:i) };
      return { ...c, itens:[...c.itens, {...prod, uid:Date.now(), qtd:1}] };
    }));
    setToast("✅ "+prod.nome+" → Mesa "+mesaSel);
  };
  const removeMesa = (uid, isPeso) => {
    setComandas((cs) => cs.map((c) => {
      if (c.id!==comanda.id) return c;
      if (isPeso) return { ...c, itens:c.itens.filter((i) => i.uid!==uid) };
      return { ...c, itens:c.itens.map((i) => i.uid===uid?{...i,qtd:Math.max(0,i.qtd-1)}:i).filter((i) => i.vendaPeso||i.qtd>0) };
    }));
  };
  const fecharMesa = () => {
    if (!comanda||comanda.itens.length===0) return;
    setComandas((cs) => cs.map((c) => c.id===comanda.id?{...c,status:"fechada",totalFinal:totalMesa,pagamento,nomeCliente}:c));
    setToast("🎉 Mesa "+mesaSel+" fechada — "+fmt(totalMesa));
    setMesaSel(null);
  };

  const addBalcao = (prod) => {
    if (prod.vendaPeso) { setModalPeso(prod); return; }
    setCarrinho((b) => {
      const ex = b.find((i) => !i.vendaPeso && i.id===prod.id);
      if (ex) return b.map((i) => (!i.vendaPeso&&i.id===prod.id)?{...i,qtd:i.qtd+1}:i);
      return [...b, {...prod, uid:Date.now(), qtd:1}];
    });
    setToast("✅ "+prod.nome+" adicionado");
  };
  const removeBalcao = (uid, isPeso) => {
    if (isPeso) { setCarrinho((b) => b.filter((i) => i.uid!==uid)); return; }
    setCarrinho((b) => b.map((i) => i.uid===uid?{...i,qtd:Math.max(0,i.qtd-1)}:i).filter((i) => i.vendaPeso||i.qtd>0));
  };
  const finalizarBalcao = () => {
    if (carrinho.length===0) return;
    if (pagamento==="dinheiro" && troco!==null && troco<0) { setToast("⚠️ Valor recebido insuficiente!"); return; }
    setComandas((cs) => [...cs, { id:Date.now(), mesa:"Balcão", itens:[...carrinho], status:"fechada", hora:now(), data:today(), totalFinal:totalBalcao, pagamento, nomeCliente:nomeCliente||"Consumidor", tipo:"balcao" }]);
    setToast("🛍️ Venda finalizada — "+fmt(totalBalcao));
    setCarrinho([]); setNomeCliente(""); setValorRecebido("");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {modalPeso && <ModalPesagem produto={modalPeso} onConfirmar={confirmarPeso} onFechar={() => setModalPeso(null)} />}
      <div style={{ display:"flex", gap:0, background:"#150c00", borderRadius:12, padding:4, width:"fit-content", border:"1px solid #3d2200" }}>
        {[{key:"balcao",icon:"🛍️",label:"Balcão / Viagem"},{key:"mesa",icon:"🍽️",label:"Mesas"}].map((t) => (
          <button key={t.key} onClick={() => setTipoVenda(t.key)} style={{ padding:"10px 28px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700, transition:"all 0.2s", background:tipoVenda===t.key?"linear-gradient(135deg,#c8860a,#e6a020)":"transparent", color:tipoVenda===t.key?"#1a0f00":"#c8a060" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tipoVenda==="balcao" && (
        <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:20, minHeight:"calc(100vh - 200px)" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={S.card}>
              <div style={S.sectionTitle("#6ab8ff")}>🛍️ Venda Balcão / Viagem</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div><label style={S.label}>Nome do cliente (opcional)</label>
                  <input style={S.input} placeholder="Ex: João da Silva" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} /></div>
                <div><label style={S.label}>Forma de pagamento</label>
                  <select style={S.input} value={pagamento} onChange={(e) => setPagamento(e.target.value)}>
                    <option value="dinheiro">💵 Dinheiro</option>
                    <option value="pix">📱 Pix</option>
                    <option value="debito">💳 Débito</option>
                    <option value="credito">💳 Crédito</option>
                  </select></div>
                {pagamento==="dinheiro" && (
                  <div><label style={S.label}>Valor recebido (R$)</label>
                    <input style={S.input} type="number" step="0.01" placeholder="0,00" value={valorRecebido} onChange={(e) => setValorRecebido(e.target.value)} />
                    {troco!==null && totalBalcao>0 && (
                      <div style={{ marginTop:8, padding:"8px 12px", borderRadius:8, background:troco>=0?"#1a3a00":"#3a0a00", color:troco>=0?"#6aff6a":"#ff6a6a", fontWeight:700, fontSize:14, textAlign:"center" }}>
                        {troco>=0 ? "💵 Troco: "+fmt(troco) : "⚠️ Valor insuficiente"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <PainelItens titulo="🧺 Carrinho" cor="#6ab8ff" itens={carrinho} total={totalBalcao}
              onAdd={addBalcao} onRemove={removeBalcao}
              rodape={<button style={S.btnSuccess} onClick={finalizarBalcao}>✅ Finalizar Venda</button>} />
          </div>
          <Cardapio produtos={produtos} categorias={categorias} itensAtivos={carrinho} onAdd={addBalcao} onAddPeso={(p) => setModalPeso(p)} />
        </div>
      )}

      {tipoVenda==="mesa" && (
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20, minHeight:"calc(100vh - 200px)" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={S.card}>
              <div style={S.sectionTitle()}>🍽️ Mesas</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {Array.from({length:MESAS_TOTAL},(_,i)=>i+1).map((n) => {
                  const aberta=!!getMesa(n); const ativa=mesaSel===n;
                  return (
                    <button key={n} onClick={() => abrirMesa(n)} style={{ padding:"13px 0", borderRadius:12, fontFamily:"inherit", fontWeight:700, fontSize:15, cursor:"pointer", transition:"all 0.15s", border:ativa?"2px solid #f0c040":aberta?"2px solid #c8860a":"1px solid #3d2200", background:ativa?"#3a2000":aberta?"#2a1500":"#150c00", color:ativa?"#f0c040":aberta?"#f0a020":"#c8a060" }}>
                      {n}<div style={{fontSize:9,marginTop:2,opacity:0.7}}>{aberta?"● ativo":"○ livre"}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            {comanda && <PainelItens titulo={"📋 Mesa "+mesaSel} itens={comanda.itens} total={totalMesa} onAdd={addMesa} onRemove={removeMesa} rodape={<button style={S.btnSuccess} onClick={fecharMesa}>💳 Fechar Conta</button>} />}
            {!comanda && mesaSel===null && <div style={{...S.card,textAlign:"center",color:"#5a3a00",padding:30,fontSize:13}}>👆 Toque em uma mesa para abrir</div>}
          </div>
          <Cardapio produtos={produtos} categorias={categorias} itensAtivos={comanda?.itens||[]} onAdd={addMesa} onAddPeso={(p) => setModalPeso(p)} />
        </div>
      )}
    </div>
  );
}

function CadastroProdutos({ produtos, setProdutos, categorias, setCategorias }) {
  const [form, setForm]       = useState({ nome:"", preco:"", categoriaId:1, disponivel:true, vendaPeso:false });
  const [formCat, setFormCat] = useState({ nome:"", emoji:"🍞" });
  const [editId, setEditId]   = useState(null);
  const [filtro, setFiltro]   = useState(0);
  const [tab, setTab]         = useState("produtos");
  const salvar     = () => { if (!form.nome||!form.preco) return; if (editId){setProdutos((p)=>p.map((x)=>x.id===editId?{...x,...form,preco:+form.preco}:x));setEditId(null);}else setProdutos((p)=>[...p,{...form,preco:+form.preco,id:Date.now()}]); setForm({nome:"",preco:"",categoriaId:1,disponivel:true,vendaPeso:false}); };
  const editar     = (p) => { setForm({...p}); setEditId(p.id); };
  const remover    = (id) => setProdutos((p)=>p.filter((x)=>x.id!==id));
  const toggleDisp = (id) => setProdutos((p)=>p.map((x)=>x.id===id?{...x,disponivel:!x.disponivel}:x));
  const salvarCat  = () => { if (!formCat.nome) return; setCategorias((c)=>[...c,{...formCat,id:Date.now()}]); setFormCat({nome:"",emoji:"🍞"}); };
  const filtrados  = filtro ? produtos.filter((p)=>p.categoriaId===filtro) : produtos;
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {["produtos","categorias"].map((t)=><button key={t} style={S.navBtn(tab===t)} onClick={()=>setTab(t)}>{t==="produtos"?"📦 Produtos":"🏷️ Categorias"}</button>)}
      </div>
      {tab==="produtos" && (
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.sectionTitle()}>{editId?"✏️ Editar":"➕ Novo"} Produto</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label style={S.label}>Nome</label><input style={S.input} placeholder="Ex: Queijo Mussarela" value={form.nome} onChange={(e)=>setForm({...form,nome:e.target.value})} /></div>
              <div>
                <label style={S.label}>{form.vendaPeso?"Preço por kg (R$)":"Preço unitário (R$)"}</label>
                <input style={S.input} type="number" step="0.01" placeholder="0,00" value={form.preco} onChange={(e)=>setForm({...form,preco:e.target.value})} />
              </div>
              <div><label style={S.label}>Categoria</label>
                <select style={S.input} value={form.categoriaId} onChange={(e)=>setForm({...form,categoriaId:+e.target.value})}>
                  {categorias.map((c)=><option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
                </select>
              </div>
              <div style={{background:"#150c00",borderRadius:12,padding:14,border:"1px solid #3d2200"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                  <label style={{...S.label,margin:0,color:form.vendaPeso?"#cc88ff":"#c8a060"}}>⚖️ Vendido por peso (balança)</label>
                  <div onClick={()=>setForm({...form,vendaPeso:!form.vendaPeso})} style={{width:44,height:24,borderRadius:12,background:form.vendaPeso?"#7040cc":"#3d2200",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
                    <div style={{position:"absolute",top:2,left:form.vendaPeso?22:2,width:20,height:20,borderRadius:"50%",background:"#f5e6c8",transition:"all 0.2s"}} />
                  </div>
                </div>
                {form.vendaPeso && <div style={{fontSize:11,color:"#cc88ff"}}>Atendente digita o peso após pesar na balança</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={form.disponivel} onChange={(e)=>setForm({...form,disponivel:e.target.checked})} style={{accentColor:"#c8860a",width:16,height:16}} />
                <label style={{...S.label,margin:0}}>Disponível para venda</label>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button style={S.btnPrimary} onClick={salvar}>{editId?"💾 Salvar":"➕ Adicionar"}</button>
                {editId && <button style={S.btnSecondary} onClick={()=>{setEditId(null);setForm({nome:"",preco:"",categoriaId:1,disponivel:true,vendaPeso:false});}}>Cancelar</button>}
              </div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.sectionTitle()}>📋 Cadastrados ({filtrados.length})</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              <span style={filtro===0?S.tagActive:S.tag} onClick={()=>setFiltro(0)}>Todos</span>
              {categorias.map((c)=><span key={c.id} style={filtro===c.id?S.tagActive:S.tag} onClick={()=>setFiltro(c.id)}>{c.emoji} {c.nome}</span>)}
            </div>
            <div style={{maxHeight:420,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
              {filtrados.map((p)=>{
                const cat=categorias.find((c)=>c.id===p.categoriaId);
                return (
                  <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"#150c00",border:"1px solid #3d2200"}}>
                    <div>
                      <div style={{fontWeight:600,color:"#f5e6c8",fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                        {cat?.emoji} {p.nome}
                        {p.vendaPeso && <span style={S.badge("purple")}>⚖️ /kg</span>}
                      </div>
                      <div style={{fontSize:12,color:"#c8860a",fontWeight:700}}>{fmt(p.preco)}{p.vendaPeso?" /kg":""}</div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={S.badge(p.disponivel?"green":"red")}>{p.disponivel?"Ativo":"Inativo"}</span>
                      <button style={S.btnSecondary} onClick={()=>toggleDisp(p.id)}>⟳</button>
                      <button style={S.btnSecondary} onClick={()=>editar(p)}>✏️</button>
                      <button style={S.btnDanger} onClick={()=>remover(p.id)}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {tab==="categorias" && (
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.sectionTitle()}>🏷️ Nova Categoria</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label style={S.label}>Nome</label><input style={S.input} placeholder="Ex: Frios" value={formCat.nome} onChange={(e)=>setFormCat({...formCat,nome:e.target.value})} /></div>
              <div><label style={S.label}>Emoji</label><input style={S.input} placeholder="🧀" value={formCat.emoji} onChange={(e)=>setFormCat({...formCat,emoji:e.target.value})} /></div>
              <button style={S.btnPrimary} onClick={salvarCat}>➕ Criar</button>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.sectionTitle()}>📂 Categorias</div>
            {categorias.map((c)=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",borderRadius:10,background:"#150c00",border:"1px solid #3d2200",marginBottom:8}}>
                <span>{c.emoji} {c.nome}</span>
                <span style={{fontSize:12,color:"#c8a060"}}>{produtos.filter((p)=>p.categoriaId===c.id).length} produtos</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Historico({ comandas }) {
  const fechadas = [...comandas.filter((c)=>c.status==="fechada")].reverse();
  const imprimir = (c) => {
    const linhas = [
      "===== PADARIA =====",
      c.tipo==="balcao"?"BALCAO — "+(c.nomeCliente||"Consumidor"):"MESA "+c.mesa,
      c.data+"  "+c.hora,
      "------------------",
      ...c.itens.map((i)=>i.vendaPeso?i.nome+" "+fmtKg(i.pesoKg*1000)+"  "+fmt(i.total):i.nome+" x"+i.qtd+"  "+fmt(i.preco*i.qtd)),
      "------------------",
      "TOTAL: "+fmt(c.totalFinal),
      c.pagamento?"Pgto: "+c.pagamento.toUpperCase():"",
      "==================",
    ].filter(Boolean).join("\n");
    alert(linhas);
  };
  return (
    <div style={S.card}>
      <div style={S.sectionTitle()}>🧾 Histórico de Vendas ({fechadas.length})</div>
      {fechadas.length===0?<div style={{color:"#5a3a00",textAlign:"center",padding:40}}>Nenhuma venda ainda</div>:(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {fechadas.map((c)=>(
            <div key={c.id} style={{padding:"14px 16px",borderRadius:12,background:"#150c00",border:"1px solid #3d2200",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,color:"#f5e6c8"}}>{c.tipo==="balcao"?"🛍️ Balcão":"🍽️ Mesa "+c.mesa}</span>
                  {c.nomeCliente&&<span style={{fontSize:12,color:"#6ab8ff"}}>{c.nomeCliente}</span>}
                  <span style={S.badge(c.tipo==="balcao"?"blue":"yellow")}>{c.pagamento||"—"}</span>
                </div>
                <div style={{fontSize:12,color:"#c8a060"}}>{c.data} às {c.hora} · {c.itens.length} itens</div>
                <div style={{fontSize:11,color:"#5a3a00",marginTop:3}}>{c.itens.slice(0,3).map((i)=>i.vendaPeso?i.nome+" "+fmtKg(i.pesoKg*1000):i.nome+" ×"+i.qtd).join(" · ")}{c.itens.length>3?" ...":""}</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:16,fontWeight:700,color:"#f0c040"}}>{fmt(c.totalFinal)}</span>
                <button style={S.btnSecondary} onClick={()=>imprimir(c)}>🖨️ Imprimir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Relatorio({ comandas }) {
  const hoje=today(); const hojeV=comandas.filter((c)=>c.status==="fechada"&&c.data===hoje);
  const totalDia=hojeV.reduce((s,c)=>s+(c.totalFinal||0),0);
  const ticketMed=hojeV.length?totalDia/hojeV.length:0;
  const mesaCount=hojeV.filter((c)=>c.tipo!=="balcao").length;
  const balcCount=hojeV.filter((c)=>c.tipo==="balcao").length;
  const totalGeral=comandas.filter((c)=>c.status==="fechada").reduce((s,c)=>s+(c.totalFinal||0),0);
  const ranking={};
  hojeV.forEach((c)=>c.itens.forEach((i)=>{ranking[i.nome]=(ranking[i.nome]||0)+(i.vendaPeso?1:i.qtd);}));
  const rankArr=Object.entries(ranking).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxQtd=rankArr[0]?.[1]||1;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[{label:"Vendas Hoje",value:fmt(totalDia),icon:"💰",color:"#f0c040"},{label:"Mesas",value:mesaCount,icon:"🍽️",color:"#6ab8ff"},{label:"Balcão",value:balcCount,icon:"🛍️",color:"#ff9f6a"},{label:"Ticket Médio",value:fmt(ticketMed),icon:"📊",color:"#6aff6a"}].map((k)=>(
          <div key={k.label} style={{...S.card,textAlign:"center"}}><div style={{fontSize:28,marginBottom:6}}>{k.icon}</div><div style={{fontSize:22,fontWeight:900,color:k.color}}>{k.value}</div><div style={{fontSize:12,color:"#c8a060",marginTop:4}}>{k.label}</div></div>
        ))}
      </div>
      <div style={S.grid2}>
        <div style={S.card}>
          <div style={S.sectionTitle()}>🏅 Mais Vendidos Hoje</div>
          {rankArr.length===0?<div style={{color:"#5a3a00",textAlign:"center",padding:20}}>Sem vendas hoje</div>:rankArr.map(([nome,qtd],idx)=>(
            <div key={nome} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                <span style={{color:"#f5e6c8"}}>{idx+1}. {nome}</span><span style={{color:"#f0c040",fontWeight:700}}>{qtd}×</span>
              </div>
              <div style={{background:"#150c00",borderRadius:6,height:8,overflow:"hidden"}}>
                <div style={{width:`${(qtd/maxQtd)*100}%`,height:"100%",background:"linear-gradient(90deg,#c8860a,#f0c040)",borderRadius:6}} />
              </div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={S.sectionTitle()}>📅 Últimas Vendas</div>
          {hojeV.length===0?<div style={{color:"#5a3a00",textAlign:"center",padding:20}}>Sem vendas hoje</div>:[...hojeV].reverse().slice(0,8).map((c)=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,background:"#150c00",marginBottom:6}}>
              <div><span style={{fontWeight:600,color:"#f5e6c8"}}>{c.tipo==="balcao"?"🛍️ Balcão":"🍽️ Mesa "+c.mesa}</span><span style={{fontSize:11,color:"#c8a060",marginLeft:8}}>{c.hora}</span></div>
              <span style={{color:"#f0c040",fontWeight:700}}>{fmt(c.totalFinal)}</span>
            </div>
          ))}
          <div style={{borderTop:"1px solid #3d2200",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",color:"#c8a060",fontSize:13}}>
            <span>Total geral acumulado</span><span style={{color:"#f0c040",fontWeight:700}}>{fmt(totalGeral)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [aba, setAba]               = useState("comanda");
  const [produtos, setProdutos]     = useState(PRODUTOS_INICIAIS);
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIAIS);
  const [comandas, setComandas]     = useState([]);
  const [toast, setToast]           = useState(null);
  const abertas = comandas.filter((c)=>c.status==="aberta").length;
  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#150c00; }
        ::-webkit-scrollbar-thumb { background:#5a3a00; border-radius:3px; }
        select option { background:#150c00; color:#f5e6c8; }
        @keyframes slideIn { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        button:hover { filter:brightness(1.15); }
      `}</style>
      <header style={S.header}>
        <div style={S.logo}>🥖 <span>PadariaSystem</span></div>
        <nav style={{display:"flex",gap:4}}>
          {[{key:"comanda",label:"🍽️ Vendas"+(abertas>0?" ("+abertas+")":"")},{key:"cadastro",label:"📦 Produtos"},{key:"historico",label:"🧾 Histórico"},{key:"relatorio",label:"📊 Relatório"}].map((n)=>(
            <button key={n.key} style={S.navBtn(aba===n.key)} onClick={()=>setAba(n.key)}>{n.label}</button>
          ))}
        </nav>
        <div style={{fontSize:12,color:"#c8a060"}}>{today()}</div>
      </header>
      <main style={S.main}>
        {aba==="comanda"   && <Comanda produtos={produtos} categorias={categorias} comandas={comandas} setComandas={setComandas} setToast={setToast} />}
        {aba==="cadastro"  && <CadastroProdutos produtos={produtos} setProdutos={setProdutos} categorias={categorias} setCategorias={setCategorias} />}
        {aba==="historico" && <Historico comandas={comandas} />}
        {aba==="relatorio" && <Relatorio comandas={comandas} />}
      </main>
      {toast && <Toast msg={toast} onClose={()=>setToast(null)} />}
    </div>
  );
}
