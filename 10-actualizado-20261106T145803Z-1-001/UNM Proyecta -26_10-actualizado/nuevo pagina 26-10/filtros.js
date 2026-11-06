/* Filtros y panel lateral aportados por el segundo proyecto, adaptados al HTML base. */
(()=>{'use strict';
const crear=()=>{
 const header=document.querySelector('.cabecera');
 const portafolios=document.getElementById('portafolios');
 if(!header||!portafolios)return;
 const search=document.querySelector('.busqueda');
 const toggle=document.getElementById('btn-filtro-busqueda')||document.getElementById('btn-filtro-panel')||document.createElement('button');
 toggle.type='button';toggle.id='btn-filtro-busqueda';toggle.className='icono boton-filtros-integrado';toggle.title='Más opciones';toggle.setAttribute('aria-label','Más opciones de búsqueda');
 if(!toggle.isConnected){toggle.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M3 5h18v2H3zm3 6h12v2H6zm4 6h4v2h-4z"/></svg>';if(search)search.append(toggle);else header.append(toggle)}
 const panel=document.createElement('aside');panel.id='panel-filtros';panel.className='panel-filtros';panel.setAttribute('aria-label','Filtros de proyectos');
 panel.innerHTML=`<section class="panel-seccion panel-comunidad comunidad-filtro"><button type="button" class="panel-titulo" aria-expanded="false"><span>👥</span> Comunidad <span>▼</span></button><div class="panel-contenido"><label><input type="radio" name="comunidad" value="todos" checked> Todos</label><label><input type="radio" name="comunidad" value="estudiantes"> Estudiantes</label><label><input type="radio" name="comunidad" value="profesores"> Profesores</label><button type="button" class="contactar-filtro">📩 Contactar</button></div></section>
 <section class="panel-seccion"><button type="button" class="panel-titulo" aria-expanded="false"><span>🟢</span> Disponibilidad <span>▼</span></button><div class="panel-contenido"><label><input type="radio" name="disponibilidad" value="todos" checked> Todos</label><label><input type="radio" name="disponibilidad" value="disponible"> Disponible</label><label><input type="radio" name="disponibilidad" value="limitada"> Disponibilidad limitada</label><label><input type="radio" name="disponibilidad" value="ocupado"> Ocupado</label></div></section>
 <section class="panel-seccion"><button type="button" class="panel-titulo"><span>🎓</span> Carreras <span>▼</span></button><div class="panel-contenido"><label><input type="checkbox" value="multimedia"> Multimedia</label><label><input type="checkbox" value="diseño"> Diseño</label><label><input type="checkbox" value="informática"> Informática</label><label><input type="checkbox" value="comunicación"> Comunicación</label></div></section>
 <section class="panel-seccion"><button type="button" class="panel-titulo"><span>🛠️</span> Herramienta <span>▼</span></button><div class="panel-contenido"><label><input type="checkbox" value="photoshop"> Photoshop</label><label><input type="checkbox" value="illustrator"> Illustrator</label><label><input type="checkbox" value="after-effects"> After Effects</label><label><input type="checkbox" value="premiere"> Premiere</label><label><input type="checkbox" value="blender"> Blender</label></div></section>
 <button type="button" class="limpiar-filtros">Limpiar filtros</button>`;
 document.body.append(panel);
 const rolActual=document.getElementById('rol')?.textContent.trim();if(rolActual!=='Profesor')panel.querySelector('.panel-comunidad').hidden=true;
const setAbierto=v=>{panel.classList.toggle('activo',v);toggle.setAttribute('aria-expanded',String(v))};
 toggle.setAttribute('aria-expanded','false');toggle.onclick=()=>{panel.querySelector('.panel-comunidad').hidden=document.getElementById('rol')?.textContent.trim()!=='Profesor';setAbierto(!panel.classList.contains('activo'))};
 panel.querySelectorAll('.panel-titulo').forEach(b=>b.onclick=()=>{const s=b.closest('.panel-seccion');s.classList.toggle('abierta');b.setAttribute('aria-expanded',String(s.classList.contains('abierta'))) });
 panel.querySelector('.contactar-filtro').onclick=()=>{document.querySelector('[data-vista="mensajes"]')?.click();setAbierto(false)};
 const selected=name=>panel.querySelector(`input[name="${name}"]:checked`)?.value||'todos';
 function aplicar(){const checks=[...panel.querySelectorAll(".panel-contenido input[type=checkbox]:checked")].map(x=>x.value.toLowerCase());const avail=selected("disponibilidad");const comunidad=selected("comunidad");portafolios.querySelectorAll(".proyecto").forEach(card=>{const texto=card.innerText.toLowerCase();const autor=(card.querySelector(".detalle p")?.innerText||"").replace(/^Por\s+/i,"").trim().toLowerCase();let perfil={};let cuenta={};try{perfil=JSON.parse(localStorage.getItem("unm_perfil_"+autor)||"{}");cuenta=JSON.parse(localStorage.getItem("unm_cuentas")||"{}")[autor]||{}}catch{}const disponibilidad=(perfil.disponibilidad||"").toLowerCase();const intereses=(perfil.intereses||[]).join(" ").toLowerCase();const tagsOk=checks.length===0||checks.some(x=>texto.includes(x)||intereses.includes(x));const availOk=avail==="todos"|| (avail==="disponible"&&disponibilidad.includes("disponible")) || (avail==="limitada"&&disponibilidad.includes("limitada")) || (avail==="ocupado"&&(disponibilidad.includes("no disponible")||disponibilidad.includes("ocupado")));const rol=(cuenta.rol||"").toLowerCase();const communityOk=comunidad==="todos"||(comunidad==="profesores"&&rol.includes("profesor"))||(comunidad==="estudiantes"&&!rol.includes("profesor"));card.hidden=!(tagsOk&&availOk&&communityOk)})}panel.addEventListener('change',aplicar);panel.querySelector('.limpiar-filtros').onclick=()=>{panel.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=false);panel.querySelectorAll('input[type="radio"]').forEach(x=>x.checked=x.value==='todos');aplicar()};
 new MutationObserver(()=>aplicar()).observe(portafolios,{childList:true});
};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',crear);else crear();
})();





