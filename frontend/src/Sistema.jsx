import { useState, useEffect, useRef } from "react";

// ─── DADOS INICIAIS ───────────────────────────────────────────────────────────
const CATEGORIAS_INICIAIS = [
  { id:1, nome:"Pães",        emoji:"🍞", tipo:"padaria"    },
  { id:2, nome:"Frios",       emoji:"🧀", tipo:"padaria"    },
  { id:3, nome:"Salgados",    emoji:"🥐", tipo:"padaria"    },
  { id:4, nome:"Bebidas",     emoji:"☕", tipo:"padaria"    },
  { id:5, nome:"Doces",       emoji:"🍰", tipo:"padaria"    },
  { id:6, nome:"Laticínios",  emoji:"🥛", tipo:"mercado"    },
  { id:7, nome:"Mercearia",   emoji:"🛒", tipo:"mercado"    },
  { id:8, nome:"Limpeza",     emoji:"🧹", tipo:"mercado"    },
  { id:9, nome:"Higiene",     emoji:"🧴", tipo:"mercado"    },
  { id:10,nome:"Frios Emb.",  emoji:"📦", tipo:"mercado"    },
];

const PRODUTOS_INICIAIS = [
  // Padaria
  { id:1,  nome:"Pão Francês",        preco:8.90,  categoriaId:1, tipo:"padaria", vendaPeso:true,  estoque:null,  codbarra:"" },
  { id:2,  nome:"Pão de Queijo",      preco:3.50,  categoriaId:1, tipo:"padaria", vendaPeso:false, estoque:null,  codbarra:"" },
  { id:3,  nome:"Queijo Mussarela",   preco:42.00, categoriaId:2, tipo:"padaria", vendaPeso:true,  estoque:null,  codbarra:"" },
  { id:4,  nome:"Presunto Cozido",    preco:32.00, categoriaId:2, tipo:"padaria", vendaPeso:true,  estoque:null,  codbarra:"" },
  { id:5,  nome:"Coxinha",            preco:5.00,  categoriaId:3, tipo:"padaria", vendaPeso:false, estoque:null,  codbarra:"" },
  { id:6,  nome:"Café Expresso",      preco:6.00,  categoriaId:4, tipo:"padaria", vendaPeso:false, estoque:null,  codbarra:"" },
  // Mercadoria (com estoque e código de barras)
  { id:7,  nome:"Leite Integral 1L",  preco:4.80,  categoriaId:6, tipo:"mercado", vendaPeso:false, estoque:48,  codbarra:"7891234560010" },
  { id:8,  nome:"Iogurte Natural",    preco:6.50,  categoriaId:6, tipo:"mercado", vendaPeso:false, estoque:24,  codbarra:"7891234560027" },
  { id:9,  nome:"Achocolatado 200ml", preco:3.20,  categoriaId:6, tipo:"mercado", vendaPeso:false, estoque:60,  codbarra:"7891234560034" },
  { id:10, nome:"Arroz 5kg",          preco:28.90, categoriaId:7, tipo:"mercado", vendaPeso:false, estoque:30,  codbarra:"7891234560041" },
  { id:11, nome:"Feijão Carioca 1kg", preco:8.50,  categoriaId:7, tipo:"mercado", vendaPeso:false, estoque:40,  codbarra:"7891234560058" },
  { id:12, nome:"Açúcar Cristal 1kg", preco:5.90,  categoriaId:7, tipo:"mercado", vendaPeso:false, estoque:35,  codbarra:"7891234560065" },
  { id:13, nome:"Detergente 500ml",   preco:2.50,  categoriaId:8, tipo:"mercado", vendaPeso:false, estoque:50,  codbarra:"7891234560072" },
  { id:14, nome:"Sabão em Pó 1kg",    preco:12.90, categoriaId:8, tipo:"mercado", vendaPeso:false, estoque:20,  codbarra:"7891234560089" },
  { id:15, nome:"Shampoo 350ml",      preco:14.50, categoriaId:9, tipo:"mercado", vendaPeso:false, estoque:18,  codbarra:"7891234560096" },
  { id:16, nome:"Presunto Emb. 200g", preco:9.90,  categoriaId:10,tipo:"mercado", vendaPeso:false, estoque:22,  codbarra:"7891234560102" },
];

const MESAS_TOTAL = 12;
const fmt    = (v) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fmtKg  = (g) => g>=1000?(g/1000).toFixed(3)+" kg":g.toFixed(0)+"g";
const now    = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const today  = () => new Date().toLocaleDateString("pt-BR");
const uid    = () => Date.now() + Math.random();

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const S = {
  app:     { fontFamily:"'Playfair Display','Georgia',serif", background:"#1a0f00", minHeight:"100vh", color:"#f5e6c8" },
  header:  { background:"linear-gradient(135deg,#2d1a00 0%,#4a2c00 50%,#2d1a00 100%)", borderBottom:"2px solid #c8860a", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, position:"sticky", top:0, zIndex:100, boxShadow:"0 4px 20px rgba(200,134,10,0.3)" },
  logo:    { fontSize:20, fontWeight:800, color:"#f0c040", display:"flex", alignItems:"center", gap:8 },
  main:    { padding:22, maxWidth:1440, margin:"0 auto" },
  card:    { background:"linear-gradient(145deg,#2a1800,#1f1000)", border:"1px solid #3d2200", borderRadius:14, padding:18, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" },
  cardG:   { background:"linear-gradient(145deg,#1a1000,#220e00)", border:"1px solid #4a2800", borderRadius:14, padding:18 },
  sT:      (c)=>({ fontSize:15, fontWeight:700, color:c||"#f0c040", marginBottom:14, display:"flex", alignItems:"center", gap:7 }),
  grid2:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
  grid3:   { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 },
  grid4:   { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 },
  inp:     { width:"100%", padding:"9px 13px", borderRadius:9, border:"1px solid #5a3a00", background:"#150c00", color:"#f5e6c8", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  lbl:     { fontSize:11, color:"#c8a060", marginBottom:5, display:"block", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 },
  btnP:    { padding:"10px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#c8860a,#e6a020)", color:"#1a0f00", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" },
  btnS:    { padding:"7px 13px", borderRadius:8, border:"1px solid #5a3a00", background:"transparent", color:"#c8a060", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  btnD:    { padding:"3px 9px", borderRadius:7, border:"none", background:"#5a1a00", color:"#ff6b35", fontSize:13, cursor:"pointer", fontFamily:"inherit" },
  btnOk:   { padding:"11px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#1a5a00,#2a8a00)", color:"#b8ffb8", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", width:"100%" },
  btnGr:   { padding:"10px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#3a2000,#5a3400)", color:"#f0c040", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", border:"1px solid #c8860a" },
  tag:     { display:"inline-flex", alignItems:"center", gap:4, padding:"4px 11px", borderRadius:20, border:"1px solid #5a3a00", background:"#2a1400", color:"#c8a060", fontSize:12, cursor:"pointer" },
  tagA:    { display:"inline-flex", alignItems:"center", gap:4, padding:"4px 11px", borderRadius:20, border:"1px solid #c8860a", background:"#3a2000", color:"#f0c040", fontSize:12, cursor:"pointer" },
  tagG:    { display:"inline-flex", alignItems:"center", gap:4, padding:"4px 11px", borderRadius:20, border:"1px solid #4a8a00", background:"#1a3000", color:"#8aee3a", fontSize:12, cursor:"pointer" },
  bdg:     (c)=>({ display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700,
               background:c==="g"?"#1a3a00":c==="r"?"#3a0a00":c==="b"?"#0a1a3a":c==="y"?"#3a2a00":c==="p"?"#2a1040":"#2a1800",
               color:      c==="g"?"#8aee3a":c==="r"?"#ff6a6a":c==="b"?"#6ab8ff":c==="y"?"#f0c040":c==="p"?"#cc88ff":"#c8a060" }),
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" },
  toast:   { position:"fixed", bottom:20, right:20, padding:"11px 18px", borderRadius:11, fontWeight:700, fontSize:13, zIndex:999, boxShadow:"0 4px 20px rgba(0,0,0,0.6)", animation:"slideIn 0.3s ease" },
  navBtn:  (a,c)=>({ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", transition:"all 0.2s",
               background:a?(c==="g"?"linear-gradient(135deg,#1a5a00,#2a8a00)":"linear-gradient(135deg,#c8860a,#e6a020)"):"transparent",
               color:a?(c==="g"?"#b8ffb8":"#1a0f00"):c==="g"?"#8aee3a":"#c8a060" }),
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({msg,tipo,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,2600);return()=>clearTimeout(t);},[]);
  const bg = tipo==="ok"?"#1a5a1a":tipo==="err"?"#5a1a1a":tipo==="info"?"#1a2a5a":"#2a2a2a";
  const cl = tipo==="ok"?"#6aff6a":tipo==="err"?"#ff6a6a":tipo==="info"?"#6ab8ff":"#f0f0f0";
  return <div style={{...S.toast,background:bg,color:cl}}>{msg}</div>;
}

// ─── MODAL PESAGEM ────────────────────────────────────────────────────────────
function ModalPesagem({produto,onConfirmar,onFechar}){
  const [un,setUn]=useState("g"); const [val,setVal]=useState(""); const ref=useRef();
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),80);},[]);
  const pesoKg=val?(un==="g"?+val/1000:+val):0;
  const total=pesoKg*produto.preco; const ok=pesoKg>0;
  const confirmar=()=>{ if(!ok)return; onConfirmar(produto,pesoKg,total); };
  return(
    <div style={S.overlay} onClick={onFechar}>
      <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(145deg,#2a1800,#150c00)",border:"2px solid #c8860a",borderRadius:18,padding:28,width:360,boxShadow:"0 20px 60px rgba(0,0,0,0.9)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,marginBottom:6}}>⚖️</div>
          <div style={{fontSize:17,fontWeight:800,color:"#f0c040"}}>Lançar Pesagem</div>
          <div style={{fontSize:13,color:"#c8a060",marginTop:3}}>{produto.nome} · {fmt(produto.preco)}/kg</div>
        </div>
        <div style={{display:"flex",gap:0,background:"#150c00",borderRadius:9,padding:3,marginBottom:14,border:"1px solid #5a3a00"}}>
          {["g","kg"].map(u=>(
            <button key={u} onClick={()=>{setUn(u);setVal("");}} style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,background:un===u?"linear-gradient(135deg,#c8860a,#e6a020)":"transparent",color:un===u?"#1a0f00":"#c8a060"}}>
              {u==="g"?"Gramas":"Quilos"}
            </button>
          ))}
        </div>
        <div style={{marginBottom:14,position:"relative"}}>
          <input ref={ref} style={{...S.inp,fontSize:22,fontWeight:700,textAlign:"center",padding:"12px 44px 12px 12px",letterSpacing:2}}
            type="number" step={un==="g"?"1":"0.001"} min="0" placeholder={un==="g"?"000":"0.000"}
            value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&ok)confirmar();if(e.key==="Escape")onFechar();}} />
          <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#e94560",fontWeight:700,fontSize:15}}>{un}</span>
        </div>
        <div style={{background:"#150c00",borderRadius:10,padding:14,marginBottom:18,border:"1px solid "+(ok?"#c8860a":"#5a3a00")}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#8888aa",marginBottom:6}}><span>Peso</span><span style={{color:"#f0f0f0"}}>{pesoKg>0?fmtKg(pesoKg*1000):"—"}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#8888aa",marginBottom:6}}><span>Preço/kg</span><span style={{color:"#f0f0f0"}}>{fmt(produto.preco)}</span></div>
          <div style={{borderTop:"1px solid #3a3a5a",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900}}>
            <span style={{color:"#c8a060"}}>Total</span><span style={{color:ok?"#f0c040":"#5a3a00"}}>{ok?fmt(total):"—"}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{...S.btnS,flex:1}} onClick={onFechar}>Cancelar</button>
          <button disabled={!ok} onClick={confirmar} style={{flex:2,padding:"11px 0",borderRadius:9,border:"none",cursor:ok?"pointer":"not-allowed",fontFamily:"inherit",fontWeight:700,fontSize:14,background:ok?"linear-gradient(135deg,#c8860a,#e6a020)":"#2a1000",color:ok?"#1a0f00":"#5a3a00",transition:"all 0.2s"}}>
            {ok?"✅ Lançar "+fmt(total):"✅ Lançar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PAGAMENTO ─────────────────────────────────────────────────────────
function ModalPagamento({total,onConfirmar,onFechar}){
  const [pagamentos,setPagamentos]=useState([]);
  const [forma,setForma]=useState("dinheiro");
  const [valor,setValor]=useState("");
  const pago=pagamentos.reduce((s,p)=>s+p.valor,0);
  const restante=total-pago;
  const troco=forma==="dinheiro"&&valor?(+valor-restante):null;

  const addPagamento=()=>{
    const v=+valor||restante;
    if(v<=0)return;
    const aplicado=Math.min(v,restante);
    setPagamentos(p=>[...p,{forma,valor:aplicado,recebido:+valor||aplicado}]);
    setValor("");
  };
  const concluir=()=>{ if(pago<total-0.01)return; onConfirmar(pagamentos); };

  const icones={dinheiro:"💵",pix:"📱",debito:"💳",credito:"💳",vale:"🎫"};
  const nomes={dinheiro:"Dinheiro",pix:"Pix",debito:"Débito",credito:"Crédito",vale:"Vale-Ref."};

  return(
    <div style={S.overlay} onClick={onFechar}>
      <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(145deg,#2a1800,#150c00)",border:"2px solid #4a8a00",borderRadius:18,padding:28,width:420,boxShadow:"0 20px 60px rgba(0,0,0,0.9)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,marginBottom:6}}>💳</div>
          <div style={{fontSize:17,fontWeight:800,color:"#8aee3a"}}>Pagamento</div>
          <div style={{fontSize:22,fontWeight:900,color:"#f0c040",marginTop:4}}>Total: {fmt(total)}</div>
        </div>

        {pagamentos.length>0&&(
          <div style={{background:"#1a0c00",borderRadius:10,padding:12,marginBottom:14,border:"1px solid #4a3000"}}>
            {pagamentos.map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                <span style={{color:"#aaaacc"}}>{icones[p.forma]} {nomes[p.forma]}</span>
                <span style={{color:"#6aff6a",fontWeight:700}}>{fmt(p.valor)}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid #4a3000",paddingTop:8,display:"flex",justifyContent:"space-between",fontWeight:700}}>
              <span style={{color:"#8888aa"}}>Restante</span>
              <span style={{color:restante<=0?"#8aee3a":"#ff6a6a",fontSize:15}}>{fmt(Math.max(0,restante))}</span>
            </div>
          </div>
        )}

        {restante>0.01&&(<>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
            {Object.entries(nomes).map(([k,v])=>(
              <span key={k} style={forma===k?S.tagA:S.tag} onClick={()=>setForma(k)}>{icones[k]} {v}</span>
            ))}
          </div>
          <div style={{marginBottom:10}}>
            <label style={S.lbl}>{forma==="dinheiro"?"Valor recebido":"Valor (deixe vazio para restante)"}</label>
            <input style={S.inp} type="number" step="0.01" placeholder={fmt(restante)} value={valor} onChange={e=>setValor(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPagamento()} />
            {troco!==null&&restante>0&&(
              <div style={{marginTop:6,padding:"6px 10px",borderRadius:7,background:troco>=0?"#0d3a0d":"#3a0a0a",color:troco>=0?"#6aff6a":"#ff6a6a",fontSize:13,fontWeight:700}}>
                {troco>=0?"💵 Troco: "+fmt(troco):"⚠️ Valor insuficiente"}
              </div>
            )}
          </div>
          <button style={{...S.btnGr,width:"100%",marginBottom:12}} onClick={addPagamento}>
            + Adicionar {nomes[forma]}
          </button>
        </>)}

        <div style={{display:"flex",gap:8}}>
          <button style={{...S.btnS,flex:1}} onClick={onFechar}>Cancelar</button>
          <button disabled={pago<total-0.01} onClick={concluir} style={{flex:2,padding:"12px 0",borderRadius:9,border:"none",cursor:pago>=total-0.01?"pointer":"not-allowed",fontFamily:"inherit",fontWeight:700,fontSize:14,background:pago>=total-0.01?"linear-gradient(135deg,#1a5a00,#2a8a00)":"#2a1000",color:pago>=total-0.01?"#b8ffb8":"#5a3a00"}}>
            ✅ Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PDV MERCADORIA ───────────────────────────────────────────────────────────
function PdvMercadoria({produtos,setProdutos,categorias,setVendas,setToast}){
  const [carrinho,setCarrinho]=useState([]);
  const [busca,setBusca]=useState("");
  const [codBarra,setCodBarra]=useState("");
  const [catF,setCatF]=useState(0);
  const [modalPag,setModalPag]=useState(false);
  const [nomeCliente,setNomeCliente]=useState("");
  const cbRef=useRef();

  const cats=categorias.filter(c=>c.tipo==="mercado");
  const prods=produtos.filter(p=>p.tipo==="mercado"&&
    (catF===0||p.categoriaId===catF)&&
    (busca===""||p.nome.toLowerCase().includes(busca.toLowerCase())));

  const total=carrinho.reduce((s,i)=>s+i.preco*i.qtd,0);

  const addItem=(prod)=>{
    if(prod.estoque!==null&&prod.estoque<=0){setToast({msg:"⚠️ Estoque zerado: "+prod.nome,tipo:"err"});return;}
    setCarrinho(c=>{
      const ex=c.find(i=>i.id===prod.id);
      if(ex){
        if(prod.estoque!==null&&ex.qtd>=prod.estoque){setToast({msg:"⚠️ Estoque insuficiente",tipo:"err"});return c;}
        return c.map(i=>i.id===prod.id?{...i,qtd:i.qtd+1}:i);
      }
      return [...c,{...prod,uid:uid(),qtd:1}];
    });
    setToast({msg:"✅ "+prod.nome,tipo:"ok"});
  };

  const removeItem=(itemUid)=>setCarrinho(c=>c.map(i=>i.uid===itemUid?{...i,qtd:Math.max(0,i.qtd-1)}:i).filter(i=>i.qtd>0));
  const addQtd=(itemUid)=>{
    setCarrinho(c=>c.map(i=>{
      if(i.uid!==itemUid)return i;
      const prod=produtos.find(p=>p.id===i.id);
      if(prod?.estoque!==null&&i.qtd>=prod.estoque){setToast({msg:"⚠️ Estoque máximo",tipo:"err"});return i;}
      return{...i,qtd:i.qtd+1};
    }));
  };

  const buscarCodBarra=(cod)=>{
    const p=produtos.find(x=>x.codbarra===cod&&x.tipo==="mercado");
    if(p){addItem(p);setCodBarra("");}
    else{setToast({msg:"❌ Código não encontrado: "+cod,tipo:"err"});setCodBarra("");}
  };

  const finalizarVenda=(pagamentos)=>{
    // Baixa no estoque
    setProdutos(ps=>ps.map(p=>{
      const item=carrinho.find(i=>i.id===p.id);
      if(!item||p.estoque===null)return p;
      return{...p,estoque:Math.max(0,p.estoque-item.qtd)};
    }));
    setVendas(vs=>[...vs,{id:uid(),tipo:"mercado",itens:[...carrinho],total,pagamentos,nomeCliente:nomeCliente||"Consumidor",hora:now(),data:today(),status:"fechada"}]);
    setToast({msg:"🛒 Venda finalizada — "+fmt(total),tipo:"ok"});
    setCarrinho([]);setNomeCliente("");setModalPag(false);
  };

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,height:"calc(100vh-160px)"}}>
      {modalPag&&<ModalPagamento total={total} onConfirmar={finalizarVenda} onFechar={()=>setModalPag(false)} />}

      {/* Cardápio mercadoria */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Barra dupla: cód barras + busca */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:16}}>📷</span>
            <input ref={cbRef} style={{...S.inp,paddingLeft:34,background:"#150c00",border:"1px solid #c8860a",color:"#f0c040",fontSize:15,fontWeight:700,letterSpacing:2}}
              placeholder="Código de barras / EAN..." value={codBarra}
              onChange={e=>setCodBarra(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&codBarra.trim())buscarCodBarra(codBarra.trim());}} />
          </div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🔍</span>
            <input style={{...S.inp,paddingLeft:34}} placeholder="Buscar produto..." value={busca} onChange={e=>setBusca(e.target.value)} />
          </div>
        </div>

        {/* Categorias */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={catF===0?S.tagG:S.tag} onClick={()=>setCatF(0)}>Todos</span>
          {cats.map(c=><span key={c.id} style={catF===c.id?S.tagG:S.tag} onClick={()=>setCatF(c.id)}>{c.emoji} {c.nome}</span>)}
        </div>

        {/* Grid produtos */}
        <div style={{...S.grid4,overflowY:"auto",alignContent:"start"}}>
          {prods.map(p=>{
            const qtdC=carrinho.find(i=>i.id===p.id)?.qtd||0;
            const semEstoque=p.estoque!==null&&p.estoque<=0;
            return(
              <div key={p.id} onClick={()=>!semEstoque&&addItem(p)} style={{padding:12,borderRadius:12,cursor:semEstoque?"not-allowed":"pointer",userSelect:"none",position:"relative",opacity:semEstoque?0.45:1,transition:"all 0.15s",background:qtdC>0?"#2a1800":"#150c00",border:qtdC>0?"2px solid #2a9a2a":"1px solid #2a2a4a"}}>
                {qtdC>0&&<div style={{position:"absolute",top:6,right:6,background:"#2a9a2a",color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900}}>{qtdC}</div>}
                {semEstoque&&<div style={{position:"absolute",top:6,left:6,...S.bdg("r")}}>SEM ESTOQUE</div>}
                <div style={{fontSize:22,marginBottom:5}}>{categorias.find(c=>c.id===p.categoriaId)?.emoji||"📦"}</div>
                <div style={{fontSize:11,fontWeight:600,color:"#f0f0f0",marginBottom:3,lineHeight:1.3}}>{p.nome}</div>
                <div style={{fontSize:13,fontWeight:800,color:"#f0c040"}}>{fmt(p.preco)}</div>
                {p.estoque!==null&&<div style={{fontSize:10,color:p.estoque<=5?"#ff6a6a":"#c8a060",marginTop:2}}>Estq: {p.estoque}</div>}
                {p.codbarra&&<div style={{fontSize:9,color:"#5a3a00",marginTop:1}}>{p.codbarra}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel carrinho */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{...S.cardG}}>
          <div style={S.sT("#f0c040")}>🛒 Carrinho PDV</div>
          <div><label style={S.lbl}>Cliente (opcional)</label>
            <input style={S.inp} placeholder="Nome do cliente..." value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} /></div>
        </div>

        <div style={{...S.cardG,flex:1,overflowY:"auto",maxHeight:380}}>
          {carrinho.length===0
            ?<div style={{color:"#5a3a00",textAlign:"center",padding:24,fontSize:13}}>Nenhum item ainda.<br/>Escaneie ou clique em um produto.</div>
            :carrinho.map(item=>(
              <div key={item.uid} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #3d2200"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:"#f0f0f0"}}>{item.nome}</div>
                  <div style={{fontSize:11,color:"#c8860a"}}>{fmt(item.preco)} × {item.qtd} = <strong>{fmt(item.preco*item.qtd)}</strong></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <button style={S.btnD} onClick={()=>removeItem(item.uid)}>−</button>
                  <span style={{color:"#f0c040",fontWeight:800,minWidth:18,textAlign:"center"}}>{item.qtd}</span>
                  <button style={{...S.btnS,padding:"3px 9px",fontSize:12}} onClick={()=>addQtd(item.uid)}>+</button>
                </div>
              </div>
            ))
          }
        </div>

        {carrinho.length>0&&(
          <div style={{...S.cardG,borderColor:"#c8860a"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:900,color:"#f0c040",marginBottom:12}}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <button style={S.btnOk} onClick={()=>setModalPag(true)}>💳 Finalizar Venda</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMANDA DIGITAL (PADARIA) ────────────────────────────────────────────────
function ComandaDigital({produtos,setProdutos,categorias,comandas,setComandas,setToast}){
  const [modo,setModo]=useState("balcao");
  const [mesaSel,setMesaSel]=useState(null);
  const [carrinho,setCarrinho]=useState([]);
  const [modalPeso,setModalPeso]=useState(null);
  const [modalPag,setModalPag]=useState(false);
  const [nomeCliente,setNomeCliente]=useState("");
  const [catF,setCatF]=useState(0);
  const [busca,setBusca]=useState("");

  const cats=categorias.filter(c=>c.tipo==="padaria");
  const prods=produtos.filter(p=>p.tipo==="padaria"&&
    (catF===0||p.categoriaId===catF)&&
    (busca===""||p.nome.toLowerCase().includes(busca.toLowerCase())));

  const getMesa=n=>comandas.find(c=>c.mesa===n&&c.status==="aberta");
  const abrirMesa=n=>{if(!getMesa(n))setComandas(cs=>[...cs,{id:uid(),mesa:n,itens:[],status:"aberta",hora:now(),data:today(),tipo:"mesa"}]);setMesaSel(n);};
  const comanda=mesaSel?getMesa(mesaSel):null;
  const calcT=itens=>itens.reduce((s,i)=>s+(i.vendaPeso?i.total:i.preco*i.qtd),0);
  const totalMesa=comanda?calcT(comanda.itens):0;
  const totalBalcao=calcT(carrinho);

  const confirmarPeso=(prod,pesoKg,total)=>{
    const item={uid:uid(),prodId:prod.id,id:prod.id,nome:prod.nome,vendaPeso:true,precoPor:prod.preco,pesoKg,total};
    if(modo==="balcao")setCarrinho(c=>[...c,item]);
    else if(comanda)setComandas(cs=>cs.map(c=>c.id===comanda.id?{...c,itens:[...c.itens,item]}:c));
    setToast({msg:"⚖️ "+prod.nome+" "+fmtKg(pesoKg*1000)+" → "+fmt(total),tipo:"ok"});
    setModalPeso(null);
  };

  const addPadaria=(prod)=>{
    if(prod.vendaPeso){setModalPeso(prod);return;}
    if(modo==="balcao"){
      setCarrinho(b=>{
        const ex=b.find(i=>!i.vendaPeso&&i.id===prod.id);
        if(ex)return b.map(i=>(!i.vendaPeso&&i.id===prod.id)?{...i,qtd:i.qtd+1}:i);
        return[...b,{...prod,uid:uid(),qtd:1}];
      });
      setToast({msg:"✅ "+prod.nome,tipo:"ok"});
    } else {
      if(!comanda)return;
      setComandas(cs=>cs.map(c=>{
        if(c.id!==comanda.id)return c;
        const ex=c.itens.find(i=>!i.vendaPeso&&i.id===prod.id);
        if(ex)return{...c,itens:c.itens.map(i=>(!i.vendaPeso&&i.id===prod.id)?{...i,qtd:i.qtd+1}:i)};
        return{...c,itens:[...c.itens,{...prod,uid:uid(),qtd:1}]};
      }));
      setToast({msg:"✅ "+prod.nome+" → Mesa "+mesaSel,tipo:"ok"});
    }
  };

  const removeItem=(iUid,isPeso,isMesa)=>{
    if(isMesa){
      setComandas(cs=>cs.map(c=>{
        if(c.id!==comanda?.id)return c;
        if(isPeso)return{...c,itens:c.itens.filter(i=>i.uid!==iUid)};
        return{...c,itens:c.itens.map(i=>i.uid===iUid?{...i,qtd:Math.max(0,i.qtd-1)}:i).filter(i=>i.vendaPeso||i.qtd>0)};
      }));
    } else {
      if(isPeso)setCarrinho(b=>b.filter(i=>i.uid!==iUid));
      else setCarrinho(b=>b.map(i=>i.uid===iUid?{...i,qtd:Math.max(0,i.qtd-1)}:i).filter(i=>i.vendaPeso||i.qtd>0));
    }
  };
  const addQtdItem=(item,isMesa)=>{
    if(item.vendaPeso){setModalPeso({...item,id:item.prodId||item.id,preco:item.precoPor});return;}
    if(isMesa)setComandas(cs=>cs.map(c=>{if(c.id!==comanda?.id)return c;return{...c,itens:c.itens.map(i=>i.uid===item.uid?{...i,qtd:i.qtd+1}:i)};}));
    else setCarrinho(b=>b.map(i=>i.uid===item.uid?{...i,qtd:i.qtd+1}:i));
  };

  const fecharMesa=(pagamentos)=>{
    if(!comanda||comanda.itens.length===0)return;
    setComandas(cs=>cs.map(c=>c.id===comanda.id?{...c,status:"fechada",totalFinal:totalMesa,pagamentos,nomeCliente}:c));
    setToast({msg:"🎉 Mesa "+mesaSel+" fechada — "+fmt(totalMesa),tipo:"ok"});
    setMesaSel(null);setModalPag(false);
  };

  const finalizarBalcao=(pagamentos)=>{
    setComandas(cs=>[...cs,{id:uid(),mesa:"Balcão",itens:[...carrinho],status:"fechada",hora:now(),data:today(),totalFinal:totalBalcao,pagamentos,nomeCliente:nomeCliente||"Consumidor",tipo:"balcao"}]);
    setToast({msg:"🛍️ Balcão finalizado — "+fmt(totalBalcao),tipo:"ok"});
    setCarrinho([]);setNomeCliente("");setModalPag(false);
  };

  const itensAtivos=modo==="balcao"?carrinho:(comanda?.itens||[]);
  const totalAtivo=modo==="balcao"?totalBalcao:totalMesa;

  const PainelItem=({itens,isMesa})=>(
    <div style={{flex:1,overflowY:"auto",maxHeight:340}}>
      {itens.length===0
        ?<div style={{color:"#5a3a00",textAlign:"center",padding:20,fontSize:12}}>Nenhum item</div>
        :itens.map((item,idx)=>(
          <div key={item.uid||idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #3d2200"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#f0f0f0",display:"flex",alignItems:"center",gap:5}}>
                {item.vendaPeso&&<span style={{fontSize:10,color:"#cc88ff"}}>⚖️</span>}{item.nome}
                {item.vendaPeso&&<span style={{fontSize:10,color:"#e94560"}}>{fmtKg(item.pesoKg*1000)}</span>}
              </div>
              <div style={{fontSize:10,color:"#e94560"}}>
                {item.vendaPeso?fmt(item.precoPor)+"/kg × "+item.pesoKg.toFixed(3)+"kg = "+fmt(item.total):fmt(item.preco)+" × "+item.qtd+" = "+fmt(item.vendaPeso?item.total:item.preco*item.qtd)}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {!item.vendaPeso&&<><button style={S.btnD} onClick={()=>removeItem(item.uid,false,isMesa)}>−</button>
              <span style={{color:"#f0c040",fontWeight:800,minWidth:16,textAlign:"center",fontSize:13}}>{item.qtd}</span>
              <button style={{...S.btnS,padding:"3px 8px",fontSize:11}} onClick={()=>addQtdItem(item,isMesa)}>+</button></>}
              {item.vendaPeso&&<button style={S.btnD} onClick={()=>removeItem(item.uid,true,isMesa)}>✕</button>}
            </div>
          </div>
        ))
      }
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {modalPeso&&<ModalPesagem produto={modalPeso} onConfirmar={confirmarPeso} onFechar={()=>setModalPeso(null)} />}
      {modalPag&&<ModalPagamento total={totalAtivo} onConfirmar={modo==="balcao"?finalizarBalcao:fecharMesa} onFechar={()=>setModalPag(false)} />}

      {/* Toggle */}
      <div style={{display:"flex",gap:0,background:"#150c00",borderRadius:10,padding:3,width:"fit-content",border:"1px solid #5a3a00"}}>
        {[{key:"balcao",icon:"🛍️",label:"Balcão / Viagem"},{key:"mesa",icon:"🍽️",label:"Mesas"}].map(t=>(
          <button key={t.key} onClick={()=>setModo(t.key)} style={{padding:"9px 24px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,transition:"all 0.2s",background:modo===t.key?"linear-gradient(135deg,#c8860a,#e6a020)":"transparent",color:modo===t.key?"#1a0f00":"#c8a060"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:modo==="mesa"?"240px 1fr 300px":"1fr 320px",gap:14,minHeight:"calc(100vh - 220px)"}}>

        {/* Seletor mesas */}
        {modo==="mesa"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={S.card}>
              <div style={S.sT()}>🍽️ Mesas</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                {Array.from({length:MESAS_TOTAL},(_,i)=>i+1).map(n=>{
                  const ab=!!getMesa(n);const at=mesaSel===n;
                  return(<button key={n} onClick={()=>abrirMesa(n)} style={{padding:"11px 0",borderRadius:10,fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer",transition:"all 0.15s",border:at?"2px solid #f0c040":ab?"2px solid #c8860a":"1px solid #3d2200",background:at?"#3a2000":ab?"#2a1500":"#150c00",color:at?"#f0c040":ab?"#f0a020":"#c8a060"}}>
                    {n}<div style={{fontSize:8,marginTop:1,opacity:0.7}}>{ab?"● ativo":"○ livre"}</div>
                  </button>);
                })}
              </div>
            </div>
            {comanda&&(
              <div style={{...S.card,flex:1,display:"flex",flexDirection:"column",gap:8}}>
                <div style={S.sT()}>📋 Mesa {mesaSel}</div>
                <div>
                  <label style={S.lbl}>👤 Nome do cliente</label>
                  <input style={S.inp} placeholder="Ex: João Silva..." value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} />
                </div>
                <PainelItem itens={comanda.itens} isMesa={true} />
                {comanda.itens.length>0&&(
                  <div style={{borderTop:"2px solid #c8860a",paddingTop:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900,color:"#f0c040",marginBottom:8}}><span>Total</span><span>{fmt(totalMesa)}</span></div>
                    <button style={S.btnOk} onClick={()=>setModalPag(true)}>💳 Fechar Conta</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cardápio padaria */}
        <div style={{...S.card,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <input style={S.inp} placeholder="🔍 Buscar produto..." value={busca} onChange={e=>setBusca(e.target.value)} />
            {modo==="balcao"&&<input style={S.inp} placeholder="Nome do cliente..." value={nomeCliente} onChange={e=>setNomeCliente(e.target.value)} />}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={catF===0?S.tagA:S.tag} onClick={()=>setCatF(0)}>Todos</span>
            {cats.map(c=><span key={c.id} style={catF===c.id?S.tagA:S.tag} onClick={()=>setCatF(c.id)}>{c.emoji} {c.nome}</span>)}
          </div>
          <div style={S.grid4}>
            {prods.map(p=>{
              const cat=categorias.find(c=>c.id===p.categoriaId);
              const iAP=itensAtivos.filter(i=>i.vendaPeso&&(i.prodId||i.id)===p.id);
              const qtdP=iAP.reduce((s,i)=>s+i.pesoKg,0);
              const qtdU=itensAtivos.find(i=>!i.vendaPeso&&i.id===p.id)?.qtd||0;
              const tem=p.vendaPeso?qtdP>0:qtdU>0;
              return(
                <div key={p.id} onClick={()=>(modo==="mesa"&&!comanda)?setToast({msg:"👆 Selecione uma mesa primeiro",tipo:"info"}):addPadaria(p)} style={{padding:12,borderRadius:12,cursor:"pointer",userSelect:"none",position:"relative",transition:"all 0.15s",background:tem?"#2a1400":"#150c00",border:tem?"2px solid #c8860a":"1px solid #3d2200"}}>
                  {p.vendaPeso&&<div style={{position:"absolute",top:6,left:6,...S.bdg("p"),fontSize:9}}>⚖️</div>}
                  {tem&&<div style={{position:"absolute",top:6,right:6,background:"#c8860a",color:"#1a0f00",borderRadius:7,padding:"1px 5px",fontSize:10,fontWeight:900}}>{p.vendaPeso?fmtKg(qtdP*1000):qtdU}</div>}
                  <div style={{fontSize:24,marginBottom:5,marginTop:p.vendaPeso?10:0}}>{cat?.emoji||"🍞"}</div>
                  <div style={{fontSize:11,fontWeight:600,color:"#f0f0f0",marginBottom:2,lineHeight:1.3}}>{p.nome}</div>
                  <div style={{fontSize:12,fontWeight:800,color:"#f0c040"}}>{fmt(p.preco)}{p.vendaPeso?" /kg":""}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrinho balcão */}
        {modo==="balcao"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{...S.card,flex:1,display:"flex",flexDirection:"column",gap:8}}>
              <div style={S.sT()}>🧺 Carrinho</div>
              <PainelItem itens={carrinho} isMesa={false} />
              {carrinho.length>0&&(
                <div style={{borderTop:"2px solid #c8860a",paddingTop:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900,color:"#f0c040",marginBottom:8}}><span>Total</span><span>{fmt(totalBalcao)}</span></div>
                  <button style={S.btnOk} onClick={()=>setModalPag(true)}>💳 Finalizar Venda</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ESTOQUE ──────────────────────────────────────────────────────────────────
function Estoque({produtos,setProdutos,categorias}){
  const [busca,setBusca]=useState("");
  const [catF,setCatF]=useState(0);
  const [editId,setEditId]=useState(null);
  const [qtdAdj,setQtdAdj]=useState("");
  const cats=categorias.filter(c=>c.tipo==="mercado");
  const prods=produtos.filter(p=>p.tipo==="mercado"&&(catF===0||p.categoriaId===catF)&&(busca===""||p.nome.toLowerCase().includes(busca.toLowerCase())));
  const ajustar=(id,delta)=>setProdutos(ps=>ps.map(p=>p.id===id?{...p,estoque:Math.max(0,(p.estoque||0)+delta)}:p));
  const setEstoque=(id,v)=>setProdutos(ps=>ps.map(p=>p.id===id?{...p,estoque:Math.max(0,+v)}:p));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <input style={S.inp} placeholder="🔍 Buscar produto..." value={busca} onChange={e=>setBusca(e.target.value)} />
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={catF===0?S.tagG:S.tag} onClick={()=>setCatF(0)}>Todos</span>
          {cats.map(c=><span key={c.id} style={catF===c.id?S.tagG:S.tag} onClick={()=>setCatF(c.id)}>{c.emoji} {c.nome}</span>)}
        </div>
      </div>
      <div style={S.cardG}>
        <div style={S.sT("#f0c040")}>📦 Controle de Estoque — Mercadoria ({prods.length} itens)</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {prods.map(p=>{
            const baixo=p.estoque!==null&&p.estoque<=5;
            const zero=p.estoque!==null&&p.estoque<=0;
            return(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,background:"#0d0d1a",border:"1px solid "+(zero?"#5a1a1a":baixo?"#5a3a00":"#3d2200")}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:"#f0f0f0",fontSize:13,display:"flex",alignItems:"center",gap:7}}>
                    {categorias.find(c=>c.id===p.categoriaId)?.emoji} {p.nome}
                    {zero&&<span style={S.bdg("r")}>SEM ESTOQUE</span>}
                    {!zero&&baixo&&<span style={S.bdg("y")}>BAIXO</span>}
                  </div>
                  <div style={{fontSize:11,color:"#5a3a00",marginTop:2}}>Cód: {p.codbarra||"—"} · {fmt(p.preco)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button style={{...S.btnD,fontSize:16,padding:"2px 10px"}} onClick={()=>ajustar(p.id,-1)}>−</button>
                  {editId===p.id
                    ?<input autoFocus style={{...S.inp,width:70,textAlign:"center",fontSize:16,fontWeight:900,color:"#f0c040",padding:"4px"}}
                        value={qtdAdj} type="number" min="0"
                        onChange={e=>setQtdAdj(e.target.value)}
                        onBlur={()=>{setEstoque(p.id,qtdAdj||p.estoque);setEditId(null);}}
                        onKeyDown={e=>{if(e.key==="Enter"){setEstoque(p.id,qtdAdj||p.estoque);setEditId(null);}}} />
                    :<span onClick={()=>{setEditId(p.id);setQtdAdj(p.estoque||0);}} style={{color:zero?"#ff6a6a":baixo?"#f0c040":"#8aee3a",fontWeight:900,fontSize:20,minWidth:50,textAlign:"center",cursor:"pointer",borderBottom:"1px dashed #3a3a3a"}}>{p.estoque??0}</span>
                  }
                  <button style={{...S.btnS,fontSize:16,padding:"2px 10px"}} onClick={()=>ajustar(p.id,1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CADASTRO ─────────────────────────────────────────────────────────────────
function Cadastro({produtos,setProdutos,categorias,setCategorias}){
  const [tab,setTab]=useState("produtos");
  const [form,setForm]=useState({nome:"",preco:"",categoriaId:1,tipo:"padaria",vendaPeso:false,estoque:"",codbarra:""});
  const [formCat,setFormCat]=useState({nome:"",emoji:"🛒",tipo:"mercado"});
  const [editId,setEditId]=useState(null);
  const [filtro,setFiltro]=useState("todos");

  const salvar=()=>{
    if(!form.nome||!form.preco)return;
    const novo={...form,preco:+form.preco,estoque:form.tipo==="mercado"?(form.estoque===""?0:+form.estoque):null,id:Date.now()};
    if(editId){setProdutos(p=>p.map(x=>x.id===editId?{...x,...novo}:x));setEditId(null);}
    else setProdutos(p=>[...p,novo]);
    setForm({nome:"",preco:"",categoriaId:1,tipo:"padaria",vendaPeso:false,estoque:"",codbarra:""});
  };
  const editar=(p)=>{setForm({...p,preco:p.preco,estoque:p.estoque??""});setEditId(p.id);};
  const remover=(id)=>setProdutos(p=>p.filter(x=>x.id!==id));
  const salvarCat=()=>{if(!formCat.nome)return;setCategorias(c=>[...c,{...formCat,id:Date.now()}]);setFormCat({nome:"",emoji:"🛒",tipo:"mercado"});};
  const filtrados=produtos.filter(p=>filtro==="todos"||p.tipo===filtro);

  return(
    <div>
      <div style={{display:"flex",gap:7,marginBottom:18}}>
        {["produtos","categorias"].map(t=><button key={t} style={S.navBtn(tab===t)} onClick={()=>setTab(t)}>{t==="produtos"?"📦 Produtos":"🏷️ Categorias"}</button>)}
      </div>
      {tab==="produtos"&&(
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.sT()}>{editId?"✏️ Editar":"➕ Novo"} Produto</div>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <div><label style={S.lbl}>Nome</label><input style={S.inp} value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Nome do produto" /></div>
              <div style={S.grid2}>
                <div><label style={S.lbl}>{form.vendaPeso?"Preço por kg":"Preço unit."} (R$)</label><input style={S.inp} type="number" step="0.01" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} /></div>
                <div><label style={S.lbl}>Tipo</label>
                  <select style={S.inp} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value,categoriaId:e.target.value==="padaria"?1:6})}>
                    <option value="padaria">🥖 Padaria</option>
                    <option value="mercado">🛒 Mercadoria</option>
                  </select></div>
              </div>
              <div><label style={S.lbl}>Categoria</label>
                <select style={S.inp} value={form.categoriaId} onChange={e=>setForm({...form,categoriaId:+e.target.value})}>
                  {categorias.filter(c=>c.tipo===form.tipo).map(c=><option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
                </select></div>
              {form.tipo==="mercado"&&(
                <div style={S.grid2}>
                  <div><label style={S.lbl}>Estoque inicial</label><input style={S.inp} type="number" min="0" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})} placeholder="0" /></div>
                  <div><label style={S.lbl}>Cód. de barras (EAN)</label><input style={S.inp} value={form.codbarra} onChange={e=>setForm({...form,codbarra:e.target.value})} placeholder="7891234567890" /></div>
                </div>
              )}
              {form.tipo==="padaria"&&(
                <div style={{background:"#150c00",borderRadius:10,padding:12,border:"1px solid #5a3a00"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <label style={{...S.lbl,margin:0,color:form.vendaPeso?"#cc88ff":"#c8a060"}}>⚖️ Vendido por peso</label>
                    <div onClick={()=>setForm({...form,vendaPeso:!form.vendaPeso})} style={{width:42,height:22,borderRadius:11,background:form.vendaPeso?"#7040cc":"#5a3a00",cursor:"pointer",position:"relative"}}>
                      <div style={{position:"absolute",top:2,left:form.vendaPeso?22:2,width:18,height:18,borderRadius:"50%",background:"#f0f0f0",transition:"all 0.2s"}} />
                    </div>
                  </div>
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <button style={S.btnP} onClick={salvar}>{editId?"💾 Salvar":"➕ Adicionar"}</button>
                {editId&&<button style={S.btnS} onClick={()=>{setEditId(null);setForm({nome:"",preco:"",categoriaId:1,tipo:"padaria",vendaPeso:false,estoque:"",codbarra:""});}}>Cancelar</button>}
              </div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.sT()}>📋 Produtos ({filtrados.length})</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {["todos","padaria","mercado"].map(f=><span key={f} style={filtro===f?S.tagA:S.tag} onClick={()=>setFiltro(f)}>{f==="todos"?"Todos":f==="padaria"?"🥖 Padaria":"🛒 Mercado"}</span>)}
            </div>
            <div style={{maxHeight:440,overflowY:"auto",display:"flex",flexDirection:"column",gap:7}}>
              {filtrados.map(p=>{
                const cat=categorias.find(c=>c.id===p.categoriaId);
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:9,background:"#150c00",border:"1px solid #3d2200"}}>
                    <div>
                      <div style={{fontWeight:600,color:"#f0f0f0",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                        {cat?.emoji} {p.nome}
                        {p.tipo==="mercado"&&<span style={S.bdg("g")}>🛒</span>}
                        {p.vendaPeso&&<span style={S.bdg("p")}>⚖️/kg</span>}
                      </div>
                      <div style={{fontSize:11,color:"#c8860a",fontWeight:700}}>{fmt(p.preco)}{p.vendaPeso?" /kg":""}{p.estoque!==null?" · Estq: "+p.estoque:""}</div>
                    </div>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <button style={S.btnS} onClick={()=>editar(p)}>✏️</button>
                      <button style={S.btnD} onClick={()=>remover(p.id)}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {tab==="categorias"&&(
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.sT()}>🏷️ Nova Categoria</div>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <div><label style={S.lbl}>Nome</label><input style={S.inp} value={formCat.nome} onChange={e=>setFormCat({...formCat,nome:e.target.value})} placeholder="Ex: Bebidas" /></div>
              <div style={S.grid2}>
                <div><label style={S.lbl}>Emoji</label><input style={S.inp} value={formCat.emoji} onChange={e=>setFormCat({...formCat,emoji:e.target.value})} /></div>
                <div><label style={S.lbl}>Tipo</label>
                  <select style={S.inp} value={formCat.tipo} onChange={e=>setFormCat({...formCat,tipo:e.target.value})}>
                    <option value="padaria">🥖 Padaria</option>
                    <option value="mercado">🛒 Mercadoria</option>
                  </select></div>
              </div>
              <button style={S.btnP} onClick={salvarCat}>➕ Criar</button>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.sT()}>📂 Categorias</div>
            {["padaria","mercado"].map(tipo=>(
              <div key={tipo} style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#8888aa",fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>{tipo==="padaria"?"🥖 Padaria":"🛒 Mercadoria"}</div>
                {categorias.filter(c=>c.tipo===tipo).map(c=>(
                  <div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"#150c00",border:"1px solid #3d2200",marginBottom:5}}>
                    <span style={{fontSize:13,color:"#f5e6c8"}}>{c.emoji} {c.nome}</span>
                    <span style={{fontSize:11,color:"#5a3a00"}}>{produtos.filter(p=>p.categoriaId===c.id).length} prod.</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTÓRICO ────────────────────────────────────────────────────────────────
function Historico({comandas,vendas}){
  const [filtro,setFiltro]=useState("todos");
  const todasVendas=[
    ...comandas.filter(c=>c.status==="fechada").map(c=>({...c,origemTipo:c.tipo})),
    ...vendas.map(v=>({...v,origemTipo:"mercado"}))
  ].sort((a,b)=>b.id-a.id);

  const filtradas=todasVendas.filter(v=>filtro==="todos"||(filtro==="mercado"?v.origemTipo==="mercado":v.origemTipo!=="mercado"));

  const imprimir=(v)=>{
    const formas=v.pagamentos?.map(p=>p.forma+" "+fmt(p.valor)).join(", ")||v.pagamento||"—";
    const linhas=[
      "===== PADARIA + MERCADO =====",
      v.origemTipo==="mercado"?"MERCADORIA":v.origemTipo==="balcao"?"BALCAO":"MESA "+v.mesa,
      (v.nomeCliente||"Consumidor")+" | "+v.data+" "+v.hora,
      "-----------------------------",
      ...(v.itens||[]).map(i=>i.vendaPeso?i.nome+" "+fmtKg(i.pesoKg*1000)+" = "+fmt(i.total):i.nome+" x"+i.qtd+" = "+fmt(i.preco*i.qtd)),
      "-----------------------------",
      "TOTAL: "+fmt(v.totalFinal||v.total),
      "PGTO: "+formas,
      "============================="
    ].join("\n");
    alert(linhas);
  };

  return(
    <div style={S.card}>
      <div style={S.sT()}>🧾 Histórico de Vendas ({filtradas.length})</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {["todos","padaria","mercado"].map(f=><span key={f} style={filtro===f?S.tagA:S.tag} onClick={()=>setFiltro(f)}>{f==="todos"?"Todas":f==="padaria"?"🥖 Padaria":"🛒 Mercado"}</span>)}
      </div>
      {filtradas.length===0?<div style={{color:"#5a3a00",textAlign:"center",padding:40}}>Nenhuma venda ainda</div>:(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtradas.map(v=>(
            <div key={v.id} style={{padding:"12px 14px",borderRadius:10,background:"#150c00",border:"1px solid #3d2200",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                  <span style={{fontWeight:700,color:"#f0f0f0",fontSize:13}}>
                    {v.origemTipo==="mercado"?"🛒 Mercadoria":v.origemTipo==="balcao"?"🛍️ Balcão":"🍽️ Mesa "+v.mesa}
                  </span>
                  {v.nomeCliente&&<span style={{fontSize:11,color:"#6ab8ff"}}>{v.nomeCliente}</span>}
                  <span style={S.bdg(v.origemTipo==="mercado"?"g":"r")}>{v.origemTipo==="mercado"?"PDV":"Comanda"}</span>
                </div>
                <div style={{fontSize:11,color:"#5a3a00"}}>{v.data} às {v.hora} · {(v.itens||[]).length} itens</div>
                <div style={{fontSize:10,color:"#5a3a00",marginTop:2}}>{(v.itens||[]).slice(0,3).map(i=>i.vendaPeso?i.nome+" "+fmtKg(i.pesoKg*1000):i.nome+" ×"+(i.qtd||1)).join(" · ")}{(v.itens||[]).length>3?" ...":""}</div>
              </div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <span style={{fontSize:15,fontWeight:800,color:"#f0c040"}}>{fmt(v.totalFinal||v.total||0)}</span>
                <button style={S.btnS} onClick={()=>imprimir(v)}>🖨️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── RELATÓRIO ────────────────────────────────────────────────────────────────

// ─── FECHAMENTO DE CAIXA ──────────────────────────────────────────────────────
function FechamentoCaixa({comandas,vendas,setToast}){
  const hoje=today();
  const [periodoFiltro,setPeriodoFiltro]=useState("hoje");
  const [dataInicio,setDataInicio]=useState(hoje);
  const [dataFim,setDataFim]=useState(hoje);
  const [caixasFechados,setCaixasFechados]=useState([]);
  const [mostrarFechar,setMostrarFechar]=useState(false);
  const [obsFechar,setObsFechar]=useState("");
  const [sangria,setSangria]=useState("");
  const [suprimento,setSuprimento]=useState("");

  const filtrarPorPeriodo=(lista,campo)=>{
    if(periodoFiltro==="hoje") return lista.filter(v=>(v[campo]||v.data)===hoje);
    if(periodoFiltro==="semana"){
      const d=new Date(); d.setDate(d.getDate()-7);
      return lista.filter(v=>{
        const partes=(v[campo]||v.data||"").split("/");
        if(partes.length<3)return false;
        const dt=new Date(partes[2],partes[1]-1,partes[0]);
        return dt>=d;
      });
    }
    if(periodoFiltro==="personalizado"){
      return lista.filter(v=>{
        const partes=(v[campo]||v.data||"").split("/");
        if(partes.length<3)return false;
        const dt=new Date(partes[2],partes[1]-1,partes[0]);
        const ini=new Date(dataInicio.split("/").reverse().join("-"));
        const fim=new Date(dataFim.split("/").reverse().join("-"));
        return dt>=ini&&dt<=fim;
      });
    }
    return lista;
  };

  const todasVendas=[
    ...filtrarPorPeriodo(comandas.filter(c=>c.status==="fechada"),"data"),
    ...filtrarPorPeriodo(vendas,"data"),
  ];

  // Totais por forma de pagamento
  const porForma={};
  todasVendas.forEach(v=>{
    const pags=v.pagamentos||[{forma:v.pagamento||"dinheiro",valor:v.totalFinal||v.total||0}];
    pags.forEach(p=>{ porForma[p.forma]=(porForma[p.forma]||0)+p.valor; });
  });

  const totalGeral=Object.values(porForma).reduce((s,v)=>s+v,0);
  const totalDinheiro=porForma["dinheiro"]||0;
  const totalPix=porForma["pix"]||0;
  const totalDebito=porForma["debito"]||0;
  const totalCredito=porForma["credito"]||0;
  const totalVale=porForma["vale"]||0;
  const sangriaV=parseFloat(sangria)||0;
  const suprimentoV=parseFloat(suprimento)||0;
  const saldoCaixa=totalDinheiro+suprimentoV-sangriaV;

  // Hora a hora (últimas 12h)
  const horaAhora={};
  todasVendas.forEach(v=>{
    const h=(v.hora||"00:00").split(":")[0]+"h";
    horaAhora[h]=(horaAhora[h]||0)+(v.totalFinal||v.total||0);
  });
  const horasArr=Object.entries(horaAhora).sort((a,b)=>a[0].localeCompare(b[0]));
  const maxHora=Math.max(...horasArr.map(h=>h[1]),1);

  const fecharCaixa=()=>{
    const resumo={
      id:Date.now(),
      data:hoje,
      hora:now(),
      totalGeral,totalDinheiro,totalPix,totalDebito,totalCredito,totalVale,
      sangria:sangriaV,suprimento:suprimentoV,saldoCaixa,
      qtdVendas:todasVendas.length,
      obs:obsFechar,
    };
    setCaixasFechados(c=>[...c,resumo]);
    setToast({msg:"✅ Caixa fechado — "+fmt(totalGeral),tipo:"ok"});
    setMostrarFechar(false);
    setSangria("");setSuprimento("");setObsFechar("");
  };

  const imprimirFechamento=()=>{
    const linhas=[
      "====== FECHAMENTO DE CAIXA ======",
      "Data: "+hoje+"  Hora: "+now(),
      "--------------------------------",
      "VENDAS POR FORMA DE PAGAMENTO",
      "Dinheiro:    "+fmt(totalDinheiro),
      "Pix:         "+fmt(totalPix),
      "Débito:      "+fmt(totalDebito),
      "Crédito:     "+fmt(totalCredito),
      "Vale-Ref.:   "+fmt(totalVale),
      "--------------------------------",
      "TOTAL VENDAS: "+fmt(totalGeral),
      "Suprimento:   "+fmt(suprimentoV),
      "Sangria:     -"+fmt(sangriaV),
      "SALDO CAIXA: "+fmt(saldoCaixa),
      "================================",
      "Qtd. Vendas: "+todasVendas.length,
      "Ticket Médio: "+fmt(todasVendas.length?totalGeral/todasVendas.length:0),
    ].join("\n");
    alert(linhas);
  };

  const iconeForma={dinheiro:"💵",pix:"📱",debito:"💳",credito:"💳",vale:"🎫"};
  const nomeForma={dinheiro:"Dinheiro",pix:"Pix",debito:"Débito",credito:"Crédito",vale:"Vale-Ref."};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Filtro período */}
      <div style={{...S.card,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{color:"#c8a060",fontSize:13,fontWeight:600}}>📅 Período:</span>
        {[{k:"hoje",l:"Hoje"},{k:"semana",l:"Últimos 7 dias"},{k:"personalizado",l:"Personalizado"}].map(p=>(
          <span key={p.k} style={periodoFiltro===p.k?S.tagA:S.tag} onClick={()=>setPeriodoFiltro(p.k)}>{p.l}</span>
        ))}
        {periodoFiltro==="personalizado"&&(
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="text" style={{...S.inp,width:110}} placeholder="DD/MM/AAAA" value={dataInicio} onChange={e=>setDataInicio(e.target.value)} />
            <span style={{color:"#c8a060"}}>até</span>
            <input type="text" style={{...S.inp,width:110}} placeholder="DD/MM/AAAA" value={dataFim} onChange={e=>setDataFim(e.target.value)} />
          </div>
        )}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button style={S.btnS} onClick={imprimirFechamento}>🖨️ Imprimir</button>
          <button style={S.btnP} onClick={()=>setMostrarFechar(true)}>🔒 Fechar Caixa</button>
        </div>
      </div>

      {/* KPIs principais */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"Total de Vendas",v:fmt(totalGeral),i:"💰",c:"#f0c040"},
          {l:"Qtd. Transações",v:todasVendas.length,i:"🧾",c:"#f0a840"},
          {l:"Ticket Médio",v:fmt(todasVendas.length?totalGeral/todasVendas.length:0),i:"📊",c:"#8aee3a"},
          {l:"Saldo em Caixa",v:fmt(saldoCaixa),i:"💵",c:saldoCaixa>=0?"#8aee3a":"#ff6a6a"},
        ].map(k=>(
          <div key={k.l} style={{...S.card,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>{k.i}</div>
            <div style={{fontSize:18,fontWeight:900,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"#c8a060",marginTop:3}}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={S.grid2}>
        {/* Formas de pagamento */}
        <div style={S.card}>
          <div style={S.sT()}>💳 Vendas por Forma de Pagamento</div>
          {Object.entries(porForma).length===0
            ?<div style={{color:"#5a3a00",textAlign:"center",padding:20}}>Sem vendas no período</div>
            :Object.entries(porForma).map(([forma,valor])=>(
              <div key={forma} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:13,color:"#f5e6c8"}}>{iconeForma[forma]||"💰"} {nomeForma[forma]||forma}</span>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontSize:14,fontWeight:800,color:"#f0c040"}}>{fmt(valor)}</span>
                    <span style={{fontSize:11,color:"#c8a060",marginLeft:8}}>{totalGeral>0?((valor/totalGeral)*100).toFixed(1)+"%":""}</span>
                  </div>
                </div>
                <div style={{background:"#150c00",borderRadius:6,height:10,overflow:"hidden"}}>
                  <div style={{width:totalGeral>0?`${(valor/totalGeral)*100}%`:"0%",height:"100%",background:"linear-gradient(90deg,#c8860a,#f0c040)",borderRadius:6,transition:"width 0.5s"}} />
                </div>
              </div>
            ))
          }
          <div style={{borderTop:"2px solid #c8860a",paddingTop:12,marginTop:8,display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900,color:"#f0c040"}}>
            <span>TOTAL</span><span>{fmt(totalGeral)}</span>
          </div>
        </div>

        {/* Movimentação + sangria/suprimento */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={S.card}>
            <div style={S.sT()}>💵 Controle de Caixa</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <label style={S.lbl}>Suprimento (dinheiro colocado no caixa)</label>
                <input style={S.inp} type="number" step="0.01" placeholder="0,00" value={suprimento} onChange={e=>setSuprimento(e.target.value)} />
              </div>
              <div>
                <label style={S.lbl}>Sangria (dinheiro retirado do caixa)</label>
                <input style={S.inp} type="number" step="0.01" placeholder="0,00" value={sangria} onChange={e=>setSangria(e.target.value)} />
              </div>
              <div style={{background:"#150c00",borderRadius:10,padding:14,border:"1px solid #c8860a"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#c8a060",marginBottom:6}}><span>Vendas dinheiro</span><span style={{color:"#f5e6c8"}}>{fmt(totalDinheiro)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#c8a060",marginBottom:6}}><span>+ Suprimento</span><span style={{color:"#8aee3a"}}>{fmt(suprimentoV)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#c8a060",marginBottom:8}}><span>− Sangria</span><span style={{color:"#ff6a6a"}}>{fmt(sangriaV)}</span></div>
                <div style={{borderTop:"1px solid #3d2200",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900}}>
                  <span style={{color:"#c8a060"}}>Saldo físico</span>
                  <span style={{color:saldoCaixa>=0?"#8aee3a":"#ff6a6a"}}>{fmt(saldoCaixa)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendas hora a hora */}
          <div style={S.card}>
            <div style={S.sT()}>⏰ Vendas por Hora</div>
            {horasArr.length===0
              ?<div style={{color:"#5a3a00",textAlign:"center",padding:16}}>Sem dados no período</div>
              :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                {horasArr.map(([hora,val])=>(
                  <div key={hora}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{color:"#c8a060"}}>{hora}</span>
                      <span style={{color:"#f0c040",fontWeight:700}}>{fmt(val)}</span>
                    </div>
                    <div style={{background:"#150c00",borderRadius:5,height:7,overflow:"hidden"}}>
                      <div style={{width:`${(val/maxHora)*100}%`,height:"100%",background:"linear-gradient(90deg,#c8860a,#f0c040)",borderRadius:5}} />
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Histórico de fechamentos */}
      {caixasFechados.length>0&&(
        <div style={S.card}>
          <div style={S.sT()}>🔒 Histórico de Fechamentos</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[...caixasFechados].reverse().map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:10,background:"#150c00",border:"1px solid #3d2200"}}>
                <div>
                  <div style={{fontWeight:700,color:"#f5e6c8",fontSize:13}}>Fechamento — {c.data} às {c.hora}</div>
                  <div style={{fontSize:11,color:"#c8a060",marginTop:2}}>{c.qtdVendas} vendas · Dinheiro: {fmt(c.totalDinheiro)} · Pix: {fmt(c.totalPix)}</div>
                  {c.obs&&<div style={{fontSize:11,color:"#5a3a00",marginTop:2}}>Obs: {c.obs}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:900,color:"#f0c040"}}>{fmt(c.totalGeral)}</div>
                  <div style={{fontSize:11,color:"#8aee3a"}}>Caixa: {fmt(c.saldoCaixa)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal fechar caixa */}
      {mostrarFechar&&(
        <div style={S.overlay} onClick={()=>setMostrarFechar(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(145deg,#2a1800,#150c00)",border:"2px solid #c8860a",borderRadius:20,padding:32,width:420,boxShadow:"0 20px 60px rgba(0,0,0,0.9)"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:36,marginBottom:8}}>🔒</div>
              <div style={{fontSize:18,fontWeight:800,color:"#f0c040"}}>Fechar Caixa</div>
              <div style={{fontSize:13,color:"#c8a060",marginTop:4}}>{hoje}</div>
            </div>
            <div style={{background:"#150c00",borderRadius:12,padding:16,marginBottom:16,border:"1px solid #c8860a"}}>
              {[["Total de vendas",fmt(totalGeral)],["Dinheiro",fmt(totalDinheiro)],["Pix",fmt(totalPix)],["Débito/Crédito",fmt(totalDebito+totalCredito)],["Saldo físico caixa",fmt(saldoCaixa)]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,paddingBottom:6,borderBottom:"1px solid #3d2200"}}>
                  <span style={{color:"#c8a060"}}>{l}</span>
                  <span style={{color:"#f0c040",fontWeight:700}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <label style={S.lbl}>Observações (opcional)</label>
              <input style={S.inp} placeholder="Ex: caixa conferido, sem divergências" value={obsFechar} onChange={e=>setObsFechar(e.target.value)} />
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btnS,flex:1}} onClick={()=>setMostrarFechar(false)}>Cancelar</button>
              <button style={{...S.btnOk,flex:2}} onClick={fecharCaixa}>✅ Confirmar Fechamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Relatorio({comandas,vendas,produtos}){
  const hoje=today();
  const todasHoje=[
    ...comandas.filter(c=>c.status==="fechada"&&c.data===hoje),
    ...vendas.filter(v=>v.data===hoje)
  ];
  const totalDia=todasHoje.reduce((s,v)=>s+(v.totalFinal||v.total||0),0);
  const pdvHoje=vendas.filter(v=>v.data===hoje);
  const cmdHoje=comandas.filter(c=>c.status==="fechada"&&c.data===hoje);
  const ticketMed=todasHoje.length?totalDia/todasHoje.length:0;
  const totalPDV=pdvHoje.reduce((s,v)=>s+(v.total||0),0);
  const totalCMD=cmdHoje.reduce((s,c)=>s+(c.totalFinal||0),0);

  const ranking={};
  todasHoje.forEach(v=>(v.itens||[]).forEach(i=>{ranking[i.nome]=(ranking[i.nome]||0)+(i.vendaPeso?1:(i.qtd||1));}));
  const rankArr=Object.entries(ranking).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxQ=rankArr[0]?.[1]||1;

  const estBaixo=produtos.filter(p=>p.tipo==="mercado"&&p.estoque!==null&&p.estoque<=5);

  // Totais acumulados (geral)
  const totalGeral=comandas.filter(c=>c.status==="fechada").reduce((s,c)=>s+(c.totalFinal||0),0)
                  +vendas.reduce((s,v)=>s+(v.total||0),0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[{l:"Total Hoje",v:fmt(totalDia),i:"💰",c:"#f0c040"},{l:"PDV Mercado",v:fmt(totalPDV),i:"🛒",c:"#8aee3a"},{l:"Comanda Digital",v:fmt(totalCMD),i:"🥖",c:"#f0a840"},{l:"Total Acumulado",v:fmt(totalGeral),i:"🏆",c:"#c8860a"}].map(k=>(
          <div key={k.l} style={{...S.card,textAlign:"center"}}><div style={{fontSize:26,marginBottom:5}}>{k.i}</div><div style={{fontSize:20,fontWeight:900,color:k.c}}>{k.v}</div><div style={{fontSize:11,color:"#c8a060",marginTop:3}}>{k.l}</div></div>
        ))}
      </div>
      <div style={S.grid2}>
        <div style={S.card}>
          <div style={S.sT()}>🏅 Mais Vendidos Hoje</div>
          {rankArr.length===0?<div style={{color:"#5a3a00",textAlign:"center",padding:20}}>Sem vendas hoje</div>:rankArr.map(([nome,qtd],idx)=>(
            <div key={nome} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"#f0f0f0"}}>{idx+1}. {nome}</span><span style={{color:"#f0c040",fontWeight:700}}>{qtd}×</span></div>
              <div style={{background:"#0d0d1a",borderRadius:5,height:7,overflow:"hidden"}}><div style={{width:`${(qtd/maxQ)*100}%`,height:"100%",background:"linear-gradient(90deg,#c8860a,#f0c040)",borderRadius:5}} /></div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={S.card}>
            <div style={S.sT()}>📅 Últimas Vendas</div>
            {todasHoje.length===0?<div style={{color:"#5a3a00",textAlign:"center",padding:16}}>Sem vendas</div>:[...todasHoje].reverse().slice(0,6).map(v=>(
              <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderRadius:7,background:"#0d0d1a",marginBottom:5}}>
                <span style={{fontSize:12,color:"#f0f0f0"}}>{v.tipo==="mercado"||v.origemTipo==="mercado"?"🛒":"🥖"} {v.nomeCliente||"Consumidor"}</span>
                <span style={{color:"#f0c040",fontWeight:700,fontSize:13}}>{fmt(v.totalFinal||v.total||0)}</span>
              </div>
            ))}
          </div>
          {estBaixo.length>0&&(
            <div style={{...S.cardG,border:"1px solid #5a3a00"}}>
              <div style={S.sT("#f0c040")}>⚠️ Estoque Baixo ({estBaixo.length})</div>
              {estBaixo.map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #3d2200"}}>
                  <span style={{fontSize:12,color:"#f0f0f0"}}>{p.nome}</span>
                  <span style={{color:p.estoque===0?"#ff6a6a":"#f0c040",fontWeight:700,fontSize:13}}>{p.estoque} un.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App(){
  const [aba,setAba]=useState("pdv");
  const [produtos,setProdutos]=useState(PRODUTOS_INICIAIS);
  const [categorias,setCategorias]=useState(CATEGORIAS_INICIAIS);
  const [comandas,setComandas]=useState([]);
  const [vendas,setVendas]=useState([]);
  const [toast,setToast]=useState(null);

  const abertas=comandas.filter(c=>c.status==="aberta").length;
  const estBaixo=produtos.filter(p=>p.tipo==="mercado"&&p.estoque!==null&&p.estoque<=5).length;

  const abas=[
    {key:"pdv",    label:"🛒 PDV Mercado"},
    {key:"comanda",label:"🥖 Comanda"+(abertas>0?" ("+abertas+")":"")},
    {key:"estoque",label:"📦 Estoque"+(estBaixo>0?" ⚠️":"")},
    {key:"cadastro",label:"⚙️ Cadastro"},
    {key:"historico",label:"🧾 Histórico"},
    {key:"caixa",label:"🔒 Caixa"},
    {key:"relatorio",label:"📊 Relatório"},
  ];

  return(
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#150c00;} ::-webkit-scrollbar-thumb{background:#5a3a00;border-radius:3px;}
        select option{background:#150c00;color:#f5e6c8;}
        @keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        button:hover{filter:brightness(1.12);}
      `}</style>
      <header style={S.header}>
        <div style={S.logo}>
          <span style={{background:"linear-gradient(135deg,#c8860a,#e6a020)",borderRadius:8,padding:"3px 8px",fontSize:16}}>🥖🛒</span>
          <span>PadariaSystem <span style={{fontSize:12,color:"#c8a060",fontWeight:400}}>PDV + Comanda Digital</span></span>
        </div>
        <nav style={{display:"flex",gap:4}}>
          {abas.map(n=>(
            <button key={n.key} style={S.navBtn(aba===n.key,n.key==="pdv"?"g":"r")} onClick={()=>setAba(n.key)}>{n.label}</button>
          ))}
        </nav>
        <div style={{fontSize:11,color:"#c8a060"}}>{today()}</div>
      </header>
      <main style={S.main}>
        {aba==="pdv"      &&<PdvMercadoria produtos={produtos} setProdutos={setProdutos} categorias={categorias} setVendas={setVendas} setToast={setToast} />}
        {aba==="comanda"  &&<ComandaDigital produtos={produtos} setProdutos={setProdutos} categorias={categorias} comandas={comandas} setComandas={setComandas} setToast={setToast} />}
        {aba==="estoque"  &&<Estoque produtos={produtos} setProdutos={setProdutos} categorias={categorias} />}
        {aba==="cadastro" &&<Cadastro produtos={produtos} setProdutos={setProdutos} categorias={categorias} setCategorias={setCategorias} />}
        {aba==="historico"&&<Historico comandas={comandas} vendas={vendas} />}
        {aba==="caixa"    &&<FechamentoCaixa comandas={comandas} vendas={vendas} setToast={setToast} />}
        {aba==="relatorio"&&<Relatorio comandas={comandas} vendas={vendas} produtos={produtos} />}
      </main>
      {toast&&<Toast msg={toast.msg} tipo={toast.tipo} onClose={()=>setToast(null)} />}
    </div>
  );
}
