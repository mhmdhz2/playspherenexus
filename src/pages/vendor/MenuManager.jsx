// src/pages/vendor/MenuManager.jsx
import React, { useState, useEffect } from "react";
import { getVendors, getMenuItems, addMenuItem } from "../../services/firebase";

export default function MenuManager() {
  const [vendor, setVendor] = useState(null);
  const [menu, setMenu] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", category:"Main", price:"", containsAlcohol:false });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const vs = await getVendors();
    if (vs.length) { setVendor(vs[0]); getMenuItems(vs[0].id).then(setMenu); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addMenuItem(vendor.id, { ...form, price: parseFloat(form.price), available: true });
    setMsg("✅ Menu item added!");
    setShowForm(false);
    setForm({ name:"", category:"Main", price:"", containsAlcohol:false });
    load();
  };

  const inp = { width:"100%",padding:11,background:"#1E1E35",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"#F0F0FF",fontSize:14,boxSizing:"border-box",fontFamily:"'Nunito',sans-serif" };

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:800 }}>Menu Manager 🍽️</h2>
        <button onClick={()=>setShowForm(!showForm)}
          style={{ padding:"10px 18px",background:"linear-gradient(135deg,#FF6B35,#e55a24)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>
          + Add Item
        </button>
      </div>
      {msg && <div style={{ background:"rgba(6,214,160,0.12)",border:"1px solid rgba(6,214,160,0.3)",borderRadius:10,padding:12,marginBottom:16,color:"#06D6A0",fontSize:14 }}>{msg}</div>}

      {showForm && (
        <div style={{ background:"#22223A",border:"1px solid rgba(255,107,53,0.3)",borderRadius:16,padding:24,marginBottom:20 }}>
          <div style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>New Menu Item</div>
          <form onSubmit={handleAdd}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:800,color:"#A0A0C0",marginBottom:5,textTransform:"uppercase" }}>Item Name</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inp} placeholder="e.g. Double Burger" required/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:800,color:"#A0A0C0",marginBottom:5,textTransform:"uppercase" }}>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}>
                  {["Main","Side","Drink","Dessert"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:800,color:"#A0A0C0",marginBottom:5,textTransform:"uppercase" }}>Price ($)</label>
                <input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={inp} placeholder="0.00" required/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:10,paddingTop:20 }}>
                <input type="checkbox" id="alc" checked={form.containsAlcohol} onChange={e=>setForm({...form,containsAlcohol:e.target.checked})} style={{ width:16,height:16 }}/>
                <label htmlFor="alc" style={{ fontSize:13,fontWeight:700,cursor:"pointer" }}>Contains Alcohol (21+)</label>
              </div>
            </div>
            <div style={{ display:"flex",gap:10,marginTop:16 }}>
              <button type="submit" style={{ padding:"10px 20px",background:"linear-gradient(135deg,#FF6B35,#e55a24)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>Add Item</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:"10px 20px",background:"#1E1E35",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#A0A0C0",fontSize:13,fontWeight:700,cursor:"pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background:"#22223A",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20 }}>
        {menu.length===0 ? <div style={{ color:"#A0A0C0",textAlign:"center",padding:"40px 0" }}>No menu items. Add your first item!</div> : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr>{["Item","Category","Price","Alcohol","Status"].map(h=><th key={h} style={{ fontSize:11,fontWeight:800,textTransform:"uppercase",color:"#6B6B8A",padding:"10px 12px",textAlign:"left",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{h}</th>)}</tr></thead>
            <tbody>
              {menu.map(item=>(
                <tr key={item.id}>
                  <td style={{ padding:"12px",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:14,fontWeight:700 }}>{item.name}</td>
                  <td style={{ padding:"12px",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:13,color:"#A0A0C0" }}>{item.category}</td>
                  <td style={{ padding:"12px",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:14,color:"#06D6A0",fontWeight:700 }}>${item.price}</td>
                  <td style={{ padding:"12px",borderBottom:"1px solid rgba(255,255,255,0.03)",fontSize:13 }}>{item.containsAlcohol?"🔞 Yes (21+)":"No"}</td>
                  <td style={{ padding:"12px",borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{ background:"rgba(6,214,160,0.15)",color:"#06D6A0",fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20 }}>Available</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
