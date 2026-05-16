import { useState, useEffect, useRef } from "react";

const CATEGORIES = ["ทั้งหมด","อาหารไทย","อาหารญี่ปุ่น","อาหารฝรั่ง","ของหวาน","เครื่องดื่ม","อาหารจีน","อาหารเกาหลี","อื่นๆ"];
const FORM_CATS = CATEGORIES.slice(1);
const EMOJI = {"อาหารไทย":"🍜","อาหารญี่ปุ่น":"🍱","อาหารฝรั่ง":"🍔","ของหวาน":"🧁","เครื่องดื่ม":"🧋","อาหารจีน":"🥟","อาหารเกาหลี":"🍲","อื่นๆ":"🍽️"};
const mkIngr = (name) => ({ id: Date.now() + Math.random() + "", name, checked: false });

const SAMPLES = [
  { id:"s1", name:"ผัดไทยกุ้งสด", description:"ผัดไทยสูตรโบราณ หน้ากุ้งสด เส้นนุ่ม รสชาติกลมกล่อม", image:null, tags:["ผัดไทย","กุ้ง","เส้น"], category:"อาหารไทย", source:"Wongnai", sourceUrl:"", aiAnalysis:"",
    ingredients:["เส้นจันท์","กุ้งสด","ไข่ไก่","เต้าหู้แข็ง","ถั่วงอก","ต้นหอม","น้ำตาลปี๊บ","น้ำปลา","น้ำมะขามเปียก","พริกป่น","ถั่วลิสงป่น","มะนาว"].map(mkIngr), createdAt:new Date().toISOString() },
  { id:"s2", name:"ราเมนหมูชาชู", description:"น้ำซุปสีทองเข้มข้น เนื้อหมูนุ่มหอม ไข่ต้มยางมะตูม", image:null, tags:["ราเมน","หมู","ซุปเข้มข้น"], category:"อาหารญี่ปุ่น", source:"Google Maps", sourceUrl:"", aiAnalysis:"",
    ingredients:["เส้นราเมน","หมูสามชั้น","ไข่ไก่","ซีอิ๊วดำ","ซอสมิริน","สาเก","น้ำซุปกระดูก","หัวหอม","ขิง","กระเทียม","สาหร่ายนอริ","ต้นหอม"].map(mkIngr), createdAt:new Date().toISOString() },
];

const S = {
  app:    { fontFamily:"'Nunito',sans-serif", background:"#FFFBF5", minHeight:"100vh", maxWidth:430, margin:"0 auto", paddingBottom:90 },
  hdr:    { padding:"20px 20px 0", background:"#FFFBF5", position:"sticky", top:0, zIndex:10 },
  ttl:    { fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:700, color:"#1A0A00", margin:0 },
  sub:    { fontSize:12, color:"#8A7060", margin:"2px 0 14px" },
  srch:   { display:"flex", alignItems:"center", background:"#FFF3E8", borderRadius:14, padding:"10px 14px", gap:8, marginBottom:14 },
  srchIn: { flex:1, border:"none", background:"transparent", fontSize:14, color:"#2C1A0E", outline:"none", fontFamily:"'Nunito',sans-serif" },
  cats:   { display:"flex", gap:8, overflowX:"auto", paddingBottom:14, scrollbarWidth:"none" },
  cat: a=>({ flexShrink:0, padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", background:a?"#C8622A":"#FFF3E8", color:a?"#fff":"#8A7060", fontSize:12, fontWeight:a?700:500, fontFamily:"'Nunito',sans-serif", transition:"all .2s" }),
  grid:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"0 16px" },
  card:   { background:"#fff", borderRadius:18, overflow:"hidden", cursor:"pointer", boxShadow:"0 2px 14px rgba(200,98,42,.09)", transition:"transform .15s, box-shadow .15s" },
  cImg:   { width:"100%", height:130, objectFit:"cover", display:"block" },
  cNImg:  { width:"100%", height:130, display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#FFF3E8,#FFE4C4)", fontSize:42 },
  cBdy:   { padding:"10px 12px 12px" },
  cCat:   { fontSize:10, color:"#C8622A", fontWeight:700, margin:"0 0 3px", textTransform:"uppercase", letterSpacing:.5 },
  cNm:    { fontFamily:"'Cormorant Garamond',serif", fontSize:15, fontWeight:600, color:"#1A0A00", margin:"0 0 6px", lineHeight:1.3 },
  tagRow: { display:"flex", flexWrap:"wrap", gap:3 },
  tag:    { background:"#FFF3E8", color:"#A06840", fontSize:10, padding:"2px 7px", borderRadius:8 },
  fab:    { position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#C8622A,#E07840)", color:"#fff", border:"none", borderRadius:32, padding:"14px 36px", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 24px rgba(200,98,42,.45)", fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center", gap:10, zIndex:100, whiteSpace:"nowrap" },
  overlay:{ position:"fixed", inset:0, background:"rgba(26,10,0,.55)", zIndex:200, display:"flex", alignItems:"flex-end" },
  sheet:  { background:"#FFFBF5", borderRadius:"24px 24px 0 0", width:"100%", maxHeight:"92vh", overflowY:"auto", paddingBottom:40 },
  hdl:    { width:40, height:4, background:"#E4CDB8", borderRadius:2, margin:"12px auto 0" },
  mTtl:  { fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#1A0A00", padding:"16px 20px 14px" },
  tabs:   { display:"flex", borderBottom:"1px solid #F0E0D0", margin:"0 0 20px" },
  tab: a=>({ flex:1, padding:"10px 4px", border:"none", borderBottom:a?"2.5px solid #C8622A":"2.5px solid transparent", background:"transparent", color:a?"#C8622A":"#8A7060", fontSize:13, fontWeight:a?700:500, cursor:"pointer", fontFamily:"'Nunito',sans-serif", marginBottom:-1 }),
  fld:    { marginBottom:14, padding:"0 20px" },
  lbl:    { display:"block", fontSize:11, fontWeight:700, color:"#A09080", marginBottom:5, textTransform:"uppercase", letterSpacing:.6 },
  inp:    { width:"100%", padding:"11px 14px", borderRadius:12, border:"1.5px solid #EDD9C8", background:"#fff", fontSize:14, color:"#2C1A0E", fontFamily:"'Nunito',sans-serif", outline:"none", boxSizing:"border-box" },
  ta:     { width:"100%", padding:"11px 14px", borderRadius:12, border:"1.5px solid #EDD9C8", background:"#fff", fontSize:14, color:"#2C1A0E", fontFamily:"'Nunito',sans-serif", outline:"none", boxSizing:"border-box", resize:"none", minHeight:80, lineHeight:1.5 },
  sel:    { width:"100%", padding:"11px 14px", borderRadius:12, border:"1.5px solid #EDD9C8", background:"#fff", fontSize:14, color:"#2C1A0E", fontFamily:"'Nunito',sans-serif", outline:"none", boxSizing:"border-box" },
  dropZ:  { border:"2px dashed #EDCAAA", borderRadius:16, padding:"24px 20px", textAlign:"center", cursor:"pointer", background:"#FFFAF5" },
  aiBt:   { width:"100%", padding:"12px 0", background:"linear-gradient(135deg,#4A8FA4,#5AAFC8)", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", marginTop:10 },
  savBt:  { margin:"0 20px", padding:"14px 0", background:"linear-gradient(135deg,#C8622A,#E07840)", color:"#fff", border:"none", borderRadius:14, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", width:"calc(100% - 40px)" },
  aiBox:  { margin:"0 20px 14px", background:"#F2F8F4", borderRadius:12, padding:"12px 14px", borderLeft:"3px solid #8BAF6A" },
  empty:  { textAlign:"center", padding:"48px 20px", gridColumn:"1/-1" },
};

/* ════════ IngredientList Component ════════ */
function IngredientList({ items, onToggle, onDelete, onAdd, loadingAI, onAskAI, menuName, compact }) {
  const [newItem, setNewItem] = useState("");
  const checked = items.filter(i => i.checked).length;
  const total = items.length;
  const pct = total ? Math.round((checked / total) * 100) : 0;
  const allDone = total > 0 && checked === total;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd(newItem.trim()); setNewItem("");
  };

  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #EDD9C8", overflow:"hidden" }}>
      {/* Header bar */}
      <div style={{ padding:"12px 14px 8px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #F8EEE4" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:14 }}>🛒</span>
          <span style={{ fontSize:13, fontWeight:700, color:"#1A0A00" }}>วัตถุดิบ</span>
          {total > 0 && <span style={{ fontSize:11, color:"#8A7060" }}>({checked}/{total})</span>}
        </div>
        {total > 0 && (
          <span style={{ fontSize:12, fontWeight:700, color: allDone ? "#5A9A5A" : "#C8622A",
            background: allDone ? "#EEF8EE" : "#FFF3E8", padding:"2px 10px", borderRadius:12 }}>
            {allDone ? "✓ พร้อมครบ!" : `${pct}%`}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ height:3, background:"#F8EEE4" }}>
          <div style={{ height:"100%", width:`${pct}%`, borderRadius:2, transition:"width .4s",
            background: allDone ? "linear-gradient(90deg,#6BAF6A,#8BCE8A)" : "linear-gradient(90deg,#C8622A,#E07840)" }} />
        </div>
      )}

      {/* Items */}
      <div style={{ maxHeight: compact ? 170 : 260, overflowY:"auto", padding:"4px 0" }}>
        {total === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 14px" }}>
            <p style={{ fontSize:12, color:"#C0B0A0", margin:0, lineHeight:1.6 }}>
              ยังไม่มีวัตถุดิบ<br/>กด "✨ AI วิเคราะห์" หรือเพิ่มเองด้านล่าง
            </p>
          </div>
        ) : items.map(item => (
          <div key={item.id}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px",
              background: item.checked ? "#F7FCF6" : "transparent",
              borderBottom:"1px solid #FAF2EA", transition:"background .2s" }}>
            {/* Custom checkbox */}
            <div onClick={() => onToggle(item.id)}
              style={{ width:22, height:22, borderRadius:7, flexShrink:0, cursor:"pointer",
                border: item.checked ? "none" : "2px solid #DDD0C0",
                background: item.checked ? "linear-gradient(135deg,#6BAF6A,#7EC87A)" : "#fff",
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s",
                boxShadow: item.checked ? "0 2px 6px rgba(100,170,100,.3)" : "none" }}>
              {item.checked && <span style={{ color:"#fff", fontSize:13, fontWeight:700, lineHeight:1 }}>✓</span>}
            </div>
            <span style={{ flex:1, fontSize:13, lineHeight:1.4, transition:"all .2s",
              color: item.checked ? "#98B090" : "#2C1A0E",
              textDecoration: item.checked ? "line-through" : "none" }}>
              {item.name}
            </span>
            {onDelete && (
              <span onClick={() => onDelete(item.id)}
                style={{ color:"#D8C8B8", fontSize:18, cursor:"pointer", lineHeight:1, padding:"0 2px", flexShrink:0 }}>×</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div style={{ borderTop:"1px solid #F8EEE4", padding:"10px 14px", display:"flex", flexDirection:"column", gap:8 }}>
        <button onClick={onAskAI} disabled={loadingAI || !menuName?.trim()}
          style={{ width:"100%", padding:"10px 0", border:"none", borderRadius:10, fontSize:13, fontWeight:700,
            fontFamily:"'Nunito',sans-serif", cursor: (loadingAI||!menuName?.trim()) ? "not-allowed" : "pointer",
            background: loadingAI ? "#E8DDD4" : "linear-gradient(135deg,#4A8FA4,#5AAFC8)",
            color: loadingAI ? "#A09080" : "#fff", transition:"all .2s" }}>
          {loadingAI ? "⏳ AI กำลังวิเคราะห์วัตถุดิบ..." : "✨ ให้ AI วิเคราะห์วัตถุดิบ"}
        </button>

        <div style={{ display:"flex", gap:8 }}>
          <input value={newItem} onChange={e=>setNewItem(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleAdd()}
            placeholder="เพิ่มวัตถุดิบเอง..."
            style={{ flex:1, padding:"9px 12px", borderRadius:10, border:"1.5px solid #EDD9C8",
              background:"#FFFBF5", fontSize:13, color:"#2C1A0E", fontFamily:"'Nunito',sans-serif", outline:"none" }} />
          <button onClick={handleAdd}
            style={{ padding:"0 14px", background:"#FFF3E8", color:"#C8622A", border:"none", borderRadius:10,
              fontWeight:700, cursor:"pointer", fontSize:20, flexShrink:0 }}>+</button>
        </div>

        {total > 0 && checked > 0 && (
          <button onClick={() => items.filter(i=>i.checked).forEach(i=>onToggle(i.id))}
            style={{ background:"none", border:"none", color:"#B0A090", fontSize:11, cursor:"pointer",
              textAlign:"right", padding:0, fontFamily:"'Nunito',sans-serif" }}>
            รีเซ็ต ✓ ที่เลือกไว้
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════ Mini progress badge for card ════════ */
function IngrBadge({ ingredients }) {
  if (!ingredients?.length) return null;
  const checked = ingredients.filter(i=>i.checked).length;
  const pct = Math.round((checked / ingredients.length) * 100);
  const done = pct === 100;
  return (
    <div style={{ marginTop:7, display:"flex", alignItems:"center", gap:5 }}>
      <div style={{ flex:1, height:3, background:"#F0E8E0", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, borderRadius:2, transition:"width .3s",
          background: done ? "#6BAF6A" : "#C8622A" }} />
      </div>
      <span style={{ fontSize:9, color: done?"#6BAF6A":"#8A7060", fontWeight:600, flexShrink:0 }}>
        {done ? "✓ ครบ" : `${checked}/${ingredients.length}`}
      </span>
    </div>
  );
}

/* ════════════════════ MAIN APP ════════════════════ */
export default function MenuBook() {
  const [menus, setMenus]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [cat, setCat]             = useState("ทั้งหมด");
  const [showAdd, setShowAdd]     = useState(false);
  const [detail, setDetail]       = useState(null);
  const [tab, setTab]             = useState("photo");
  const [form, setForm]           = useState({ name:"", desc:"", image:null, tags:[], category:"อาหารไทย", source:"", url:"", ai:"", ingredients:[] });
  const [tagIn, setTagIn]         = useState("");
  const [analyzing, setAnalyzing] = useState(false);   // photo analysis
  const [formIngrAI, setFormIngrAI]     = useState(false); // ingredient AI in add-form
  const [detailIngrAI, setDetailIngrAI] = useState(false); // ingredient AI in detail
  const fileRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Nunito:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("menubook-v2");
        setMenus(r?.value ? JSON.parse(r.value) : SAMPLES);
      } catch { setMenus(SAMPLES); }
      setLoading(false);
    })();
  }, []);

  const persist = async (data) => { try { await window.storage.set("menubook-v2", JSON.stringify(data)); } catch {} };

  const filtered = menus.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.name.toLowerCase().includes(q) || m.tags.some(t=>t.toLowerCase().includes(q)) || (m.source||"").toLowerCase().includes(q) || (m.ingredients||[]).some(i=>i.name.toLowerCase().includes(q)))
      && (cat==="ทั้งหมด" || m.category===cat);
  });

  const onImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(p => ({ ...p, image: ev.target.result }));
    r.readAsDataURL(f);
  };

  /* AI: analyze photo → metadata + ingredients */
  const analyzePhoto = async () => {
    if (!form.image) return;
    setAnalyzing(true);
    try {
      const [meta, b64] = form.image.split(",");
      const mime = meta.split(":")[1].split(";")[0];
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1200,
          messages:[{ role:"user", content:[
            { type:"image", source:{ type:"base64", media_type:mime, data:b64 } },
            { type:"text", text:`วิเคราะห์อาหารในรูปนี้ ตอบ JSON เท่านั้น ห้ามมี markdown backticks:
{"name":"ชื่ออาหาร (ภาษาไทย)","desc":"คำอธิบาย 1-2 ประโยค","category":"อาหารไทย/อาหารญี่ปุ่น/อาหารฝรั่ง/ของหวาน/เครื่องดื่ม/อาหารจีน/อาหารเกาหลี/อื่นๆ","tags":["แท็ก1","แท็ก2","แท็ก3"],"ai":"ข้อมูลเพิ่มเติม รสชาติ ส่วนผสม","ingredients":["วัตถุดิบ1","วัตถุดิบ2","..."]}
ใส่วัตถุดิบหลักทุกอย่างที่ใช้ทำเมนูนี้ใน ingredients (ภาษาไทย, 8-15 รายการ)` }
          ]}]
        })
      });
      const d = await res.json();
      const p = JSON.parse(d.content[0].text.trim());
      setForm(prev => ({
        ...prev,
        name:        p.name        || prev.name,
        desc:        p.desc        || prev.desc,
        category:    p.category    || prev.category,
        tags:        p.tags        || prev.tags,
        ai:          p.ai          || "",
        ingredients: p.ingredients ? p.ingredients.map(mkIngr) : prev.ingredients,
      }));
    } catch(e) { console.error(e); }
    setAnalyzing(false);
  };

  /* AI: analyze ingredients by menu name */
  const fetchIngredients = async (menuName, setAILoading, onResult) => {
    if (!menuName?.trim()) return;
    setAILoading(true);
    try {
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:600,
          messages:[{ role:"user", content:`รายการวัตถุดิบทั้งหมดที่ใช้ทำ "${menuName}" ตอบ JSON เท่านั้น ห้ามมี markdown:
{"ingredients":["วัตถุดิบ1","วัตถุดิบ2","..."]}
ใส่วัตถุดิบสำคัญให้ครบ 8-14 รายการ (ภาษาไทย)` }]
        })
      });
      const d = await res.json();
      const p = JSON.parse(d.content[0].text.trim());
      if (p.ingredients?.length) onResult(p.ingredients.map(mkIngr));
    } catch(e) { console.error(e); }
    setAILoading(false);
  };

  const addMenu = () => {
    if (!form.name.trim()) return;
    const m = { id:Date.now()+"", name:form.name, description:form.desc, image:form.image, tags:form.tags, category:form.category, source:form.source, sourceUrl:form.url, aiAnalysis:form.ai, ingredients:form.ingredients, createdAt:new Date().toISOString() };
    const u = [m, ...menus];
    setMenus(u); persist(u); setShowAdd(false); reset();
  };

  const delMenu = (id) => {
    const u = menus.filter(m=>m.id!==id);
    setMenus(u); persist(u); setDetail(null);
  };

  const updateDetail = (upd) => {
    const u = menus.map(m=>m.id===upd.id?upd:m);
    setMenus(u); persist(u); setDetail(upd);
  };

  /* Ingredient ops in detail */
  const toggleIngr = (id) => updateDetail({ ...detail, ingredients: detail.ingredients.map(i=>i.id===id?{...i,checked:!i.checked}:i) });
  const deleteIngr = (id) => updateDetail({ ...detail, ingredients: detail.ingredients.filter(i=>i.id!==id) });
  const addIngr    = (name) => updateDetail({ ...detail, ingredients:[...(detail.ingredients||[]), mkIngr(name)] });

  const reset = () => {
    setForm({ name:"", desc:"", image:null, tags:[], category:"อาหารไทย", source:"", url:"", ai:"", ingredients:[] });
    setTagIn(""); setTab("photo");
  };

  const pushTag = (e) => {
    if ((e.key==="Enter"||e.type==="click") && tagIn.trim()) {
      setForm(p=>({...p,tags:[...new Set([...p.tags,tagIn.trim()])]})); setTagIn("");
    }
  };

  if (loading) return (
    <div style={{...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:52}}>🍴</div><p style={{color:"#8A7060",fontFamily:"'Nunito',sans-serif",marginTop:12}}>กำลังโหลด...</p></div>
    </div>
  );

  return (
    <div style={S.app}>

      {/* ── HEADER ── */}
      <div style={S.hdr}>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}>
          <h1 style={S.ttl}>Menu Book</h1><span style={{fontSize:20}}>🍴</span>
        </div>
        <p style={S.sub}>{menus.length} เมนูในคลัง</p>
        <div style={S.srch}>
          <span style={{fontSize:16,color:"#C8622A"}}>🔍</span>
          <input style={S.srchIn} placeholder="ค้นหาเมนู, แท็ก, วัตถุดิบ..." value={search} onChange={e=>setSearch(e.target.value)} />
          {search&&<span onClick={()=>setSearch("")} style={{cursor:"pointer",color:"#C8B8A8",fontSize:20,lineHeight:1}}>×</span>}
        </div>
        <div style={S.cats}>
          {CATEGORIES.map(c=><button key={c} style={S.cat(cat===c)} onClick={()=>setCat(c)}>{c!=="ทั้งหมด"&&EMOJI[c]} {c}</button>)}
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={S.grid}>
        {filtered.length===0 ? (
          <div style={S.empty}><div style={{fontSize:52,marginBottom:12}}>🥢</div><p style={{color:"#8A7060",fontSize:14}}>ยังไม่มีเมนูที่ค้นพบ</p></div>
        ) : filtered.map(m=>(
          <div key={m.id} style={S.card} onClick={()=>setDetail(m)}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(200,98,42,.16)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 14px rgba(200,98,42,.09)"}}>
            {m.image?<img src={m.image} style={S.cImg} alt={m.name}/>:<div style={S.cNImg}>{EMOJI[m.category]||"🍽️"}</div>}
            <div style={S.cBdy}>
              <p style={S.cCat}>{m.category}</p>
              <p style={S.cNm}>{m.name}</p>
              <div style={S.tagRow}>{m.tags.slice(0,2).map(t=><span key={t} style={S.tag}>#{t}</span>)}</div>
              <IngrBadge ingredients={m.ingredients} />
            </div>
          </div>
        ))}
      </div>

      <button style={S.fab} onClick={()=>setShowAdd(true)}><span style={{fontSize:20,lineHeight:1}}>+</span> เพิ่มเมนู</button>

      {/* ══════ ADD MODAL ══════ */}
      {showAdd&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setShowAdd(false),reset())}>
          <div style={S.sheet}>
            <div style={S.hdl}/>
            <p style={S.mTtl}>เพิ่มเมนูใหม่ 🍽️</p>

            <div style={S.tabs}>
              {[["photo","📷 รูปภาพ"],["link","🔗 ลิงก์"],["manual","✏️ พิมพ์เอง"]].map(([k,v])=>(
                <button key={k} style={S.tab(tab===k)} onClick={()=>setTab(k)}>{v}</button>
              ))}
            </div>

            {/* Photo */}
            {tab==="photo"&&(
              <div style={S.fld}>
                <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={onImg}/>
                {!form.image?(
                  <div style={S.dropZ} onClick={()=>fileRef.current?.click()}>
                    <div style={{fontSize:40,marginBottom:8}}>📷</div>
                    <p style={{color:"#C8622A",fontWeight:700,fontSize:14,margin:0}}>แตะเพื่ออัปโหลดรูปภาพ</p>
                    <p style={{color:"#8A7060",fontSize:12,margin:"6px 0 0"}}>AI วิเคราะห์ชื่อ + วัตถุดิบให้อัตโนมัติ</p>
                  </div>
                ):(
                  <div style={{position:"relative",marginBottom:10}}>
                    <img src={form.image} style={{width:"100%",borderRadius:14,maxHeight:180,objectFit:"cover",display:"block"}} alt=""/>
                    <button onClick={()=>setForm(p=>({...p,image:null}))} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.5)",color:"#fff",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
                  </div>
                )}
                {form.image&&(
                  <button style={S.aiBt} onClick={analyzePhoto} disabled={analyzing}>
                    {analyzing?"⏳ กำลังวิเคราะห์รูป...":"✨ วิเคราะห์ชื่อ + วัตถุดิบด้วย AI"}
                  </button>
                )}
              </div>
            )}

            {/* Link */}
            {tab==="link"&&(
              <div>
                <div style={S.fld}>
                  <label style={S.lbl}>ลิงก์แหล่งที่มา</label>
                  <input style={S.inp} placeholder="https://www.wongnai.com/..." value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))}/>
                </div>
                <div style={S.fld}>
                  <label style={S.lbl}>แพลตฟอร์ม</label>
                  <input style={S.inp} placeholder="Wongnai / Google Maps / Foodpanda..." value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))}/>
                </div>
              </div>
            )}

            {/* Common fields */}
            <div style={S.fld}>
              <label style={S.lbl}>ชื่อเมนู *</label>
              <input style={S.inp} placeholder="เช่น ข้าวมันไก่ โบราณ, ราเมนซุปขาว..." value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
            </div>

            <div style={S.fld}>
              <label style={S.lbl}>หมวดหมู่</label>
              <select style={S.sel} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {FORM_CATS.map(c=><option key={c} value={c}>{EMOJI[c]} {c}</option>)}
              </select>
            </div>

            <div style={S.fld}>
              <label style={S.lbl}>คำอธิบาย</label>
              <textarea style={S.ta} placeholder="รสชาติ ความอร่อย บรรยากาศ ราคา..." value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/>
            </div>

            <div style={S.fld}>
              <label style={S.lbl}>แท็ก</label>
              <div style={{display:"flex",gap:8}}>
                <input style={{...S.inp,flex:1}} placeholder="เช่น เผ็ด, มังสวิรัติ..." value={tagIn} onChange={e=>setTagIn(e.target.value)} onKeyDown={pushTag}/>
                <button onClick={pushTag} style={{padding:"0 14px",background:"#FFF3E8",color:"#C8622A",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer",fontSize:18}}>+</button>
              </div>
              {form.tags.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  {form.tags.map(t=>(
                    <span key={t} style={{...S.tag,display:"flex",alignItems:"center",gap:4,padding:"4px 10px",fontSize:12}}>
                      #{t} <span onClick={()=>setForm(p=>({...p,tags:p.tags.filter(x=>x!==t)}))} style={{cursor:"pointer",fontWeight:700}}>×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {tab!=="link"&&(
              <div style={S.fld}>
                <label style={S.lbl}>แหล่งที่มา</label>
                <input style={S.inp} placeholder="Wongnai / ชื่อร้าน / Instagram..." value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))}/>
              </div>
            )}

            {/* ── INGREDIENT CHECKLIST in form ── */}
            <div style={S.fld}>
              <label style={S.lbl}>วัตถุดิบ 🛒</label>
              <IngredientList
                items={form.ingredients}
                menuName={form.name}
                loadingAI={formIngrAI}
                compact
                onToggle={id=>setForm(p=>({...p,ingredients:p.ingredients.map(i=>i.id===id?{...i,checked:!i.checked}:i)}))}
                onDelete={id=>setForm(p=>({...p,ingredients:p.ingredients.filter(i=>i.id!==id)}))}
                onAdd={name=>setForm(p=>({...p,ingredients:[...p.ingredients,mkIngr(name)]}))}
                onAskAI={()=>fetchIngredients(form.name, setFormIngrAI, items=>setForm(p=>({...p,ingredients:items})))}
              />
            </div>

            {form.ai&&(
              <div style={S.aiBox}>
                <p style={{fontSize:11,fontWeight:700,color:"#8BAF6A",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>✨ AI วิเคราะห์</p>
                <p style={{fontSize:13,color:"#2C1A0E",margin:0,lineHeight:1.6}}>{form.ai}</p>
              </div>
            )}

            <button style={{...S.savBt,opacity:form.name.trim()?1:.5}} onClick={addMenu}>บันทึกเมนู 🍴</button>
          </div>
        </div>
      )}

      {/* ══════ DETAIL MODAL ══════ */}
      {detail&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setDetail(null)}>
          <div style={{...S.sheet,paddingBottom:60}}>
            <div style={S.hdl}/>
            {detail.image
              ?<img src={detail.image} style={{width:"100%",height:200,objectFit:"cover",display:"block"}} alt={detail.name}/>
              :<div style={{height:130,background:"linear-gradient(135deg,#FFF3E8,#FFE4C4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:70}}>{EMOJI[detail.category]||"🍽️"}</div>}

            <div style={{padding:"20px 20px 0"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:700,color:"#C8622A",textTransform:"uppercase",letterSpacing:.5}}>{detail.category}</span>
                {detail.source&&<span style={{fontSize:11,color:"#8A7060",background:"#F0E8E0",padding:"3px 10px",borderRadius:10}}>📍 {detail.source}</span>}
              </div>

              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#1A0A00",margin:"0 0 8px",lineHeight:1.2}}>{detail.name}</h2>

              {detail.description&&<p style={{fontSize:14,color:"#5A4030",lineHeight:1.65,margin:"0 0 12px"}}>{detail.description}</p>}

              {detail.tags?.length>0&&(
                <div style={{...S.tagRow,marginBottom:16}}>
                  {detail.tags.map(t=><span key={t} style={{...S.tag,fontSize:12,padding:"4px 10px"}}>#{t}</span>)}
                </div>
              )}

              {/* ── INGREDIENT CHECKLIST in detail ── */}
              <div style={{marginBottom:16}}>
                <IngredientList
                  items={detail.ingredients||[]}
                  menuName={detail.name}
                  loadingAI={detailIngrAI}
                  onToggle={toggleIngr}
                  onDelete={deleteIngr}
                  onAdd={addIngr}
                  onAskAI={()=>fetchIngredients(detail.name, setDetailIngrAI, items=>updateDetail({...detail,ingredients:items}))}
                />
              </div>

              {detail.aiAnalysis&&(
                <div style={{...S.aiBox,margin:"0 0 16px"}}>
                  <p style={{fontSize:11,fontWeight:700,color:"#8BAF6A",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:.5}}>✨ AI วิเคราะห์</p>
                  <p style={{fontSize:13,color:"#2C1A0E",margin:0,lineHeight:1.6}}>{detail.aiAnalysis}</p>
                </div>
              )}

              {detail.sourceUrl&&(
                <a href={detail.sourceUrl} target="_blank" rel="noreferrer"
                  style={{display:"block",textAlign:"center",padding:"12px",background:"#FFF3E8",borderRadius:12,color:"#C8622A",fontSize:13,fontWeight:700,marginBottom:14,textDecoration:"none"}}>
                  🔗 ดูแหล่งที่มา
                </a>
              )}

              <p style={{fontSize:11,color:"#C0B0A0",textAlign:"right",marginBottom:14}}>
                บันทึกเมื่อ {new Date(detail.createdAt).toLocaleDateString("th-TH",{year:"numeric",month:"short",day:"numeric"})}
              </p>

              <button onClick={()=>delMenu(detail.id)}
                style={{width:"100%",padding:12,background:"#FFF0EE",color:"#C83020",border:"none",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
                🗑️ ลบเมนูนี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
