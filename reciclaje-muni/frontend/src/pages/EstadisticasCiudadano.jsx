import { useEffect, useState } from "react";
import { getEstadisticasPublicas } from "../services/reciclaje.service";
import { useNavigate } from "react-router-dom";

export default function EstadisticasCiudadano(){

const navigate = useNavigate();

const [data,setData]=useState(null);
const load = async()=>{
try{
const r = await getEstadisticasPublicas();
setData(r.data);
}catch(e){
console.log(e);
}
}


useEffect(()=>{
    

    const t = setInterval(() => load(true), 5000);
    return () => clearInterval(t);
},[]);

if(!data){
return <div style={{color:"white"}}>Cargando estadísticas...</div>
}

return(

<div style={{padding:30,color:"white",background:"#0f172a",minHeight:"100vh"}}>

<h1>Estadísticas públicas</h1>

<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginTop:30}}>

<Card titulo="Puntos verdes" valor={data.puntos_verdes} icono="♻️"/>

<Card titulo="Rutas registradas" valor={data.rutas} icono="🚛"/>

<Card titulo="Denuncias ciudadanas" valor={data.denuncias} icono="📢"/>

<Card titulo="Denuncias atendidas" valor={data.denuncias_atendidas} icono="✅"/>

<Card titulo="Material reciclado (kg)" valor={data.reciclado_total} icono="📦"/>

<Card titulo="Materiales registrados" valor={data.materiales.length} icono="🧪"/>

</div>

<div style={{marginTop:40}}>

<h2>Materiales más reciclados</h2>

<div style={{marginTop:20}}>

{data.materiales.map((m,i)=>(
<div key={i} style={item}>

<div>{m.nombre_tipo}</div>

<div>{m.total} kg</div>

</div>
))}

</div>

</div>

<button style={btn} onClick={()=>navigate("/ciudadano/dashboard")}>
Volver al panel
</button>

</div>

)

}

function Card({titulo,valor,icono}){
return(
<div style={card}>

<div style={{fontSize:40}}>{icono}</div>

<h3>{titulo}</h3>

<h1>{valor}</h1>

</div>
)
}

const card={
background:"rgba(255,255,255,0.05)",
border:"1px solid rgba(222, 17, 17, 0.87)",
padding:20,
borderRadius:12,
textAlign:"center"
}

const item={
display:"flex",
justifyContent:"space-between",
padding:12,
borderBottom:"1px solid rgba(149, 224, 10, 0.9)"
}

const btn={
marginTop:40,
padding:"12px 20px",
background:"#22c55e",
border:"none",
borderRadius:10,
color:"white",
fontWeight:"bold",
cursor:"pointer"
}