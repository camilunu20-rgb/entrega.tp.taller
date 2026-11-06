
// UNM PROYECTA - JAVASCRIPT COMPLETO
/* Demo local: no sustituye autenticación ni base de datos reales. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem('unm_'+k))??d}catch{return d}};
const set=(k,v)=>localStorage.setItem('unm_'+k,JSON.stringify(v));
const estado={cuenta:null,rol:'Estudiante',filtro:'Todas',registro:false,chat:'Comunidad',carpetaActual:null};
const categorias=['Todas','Animación','Sonido','3D','InDesign','Mockup','PJ5S','Videojuegos'];
const leerCuentas=()=>get('cuentas',{});
const cuenta=()=>estado.cuenta||'invitado';
const clave=k=>`${k}_${cuenta()}`;
const escapar=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const intereses=()=>get(clave('perfil'),{}).intereses||[];
const proyectos=()=>get('proyectos',[]);
const avisos=()=>get(clave('avisos'),[]);
const actualizarAvisos=()=>{const n=avisos().filter(a=>!a.leida).length;$('#contador').textContent=n;$('#contador').classList.toggle('oculto',!n)};

function notificarPublicacion(p){
 Object.keys(leerCuentas()).forEach(mail=>{
  if(mail===cuenta())return;
  const pref=get('preferencias_'+mail,{notificaciones:true});
  const perfil=get('perfil_'+mail,{});
  const tags=(perfil.intereses||[]).map(t=>t.toLowerCase());
  if(pref.notificaciones!==false&&p.etiquetas.some(t=>tags.includes(t.toLowerCase()))){
   const k='avisos_'+mail;
   set(k,[{id:crypto.randomUUID(),texto:`${p.autor} publicó “${p.titulo}” sobre ${p.etiquetas.join(', ')}.`,leida:false,fecha:Date.now()},...get(k,[])]);
  }
 });
}

function entrar(mail,rol){
 estado.cuenta=mail.toLowerCase();
 estado.rol=rol;
 const cuentas=leerCuentas();
 cuentas[estado.cuenta]={rol};
 set('cuentas',cuentas);
 sessionStorage.setItem('unm_sesion',JSON.stringify({mail:estado.cuenta,rol}));
 $('#acceso').classList.add('oculto');
 $('#aplicacion').classList.remove('oculto');
 $('#rol').textContent=rol;
 $$('.lateral button[data-vista="crear"]').forEach(b=>b.style.display=rol==='Invitado'?'none':'');
 mostrar(rol==='Invitado'?'explorar':'crear');
 renderTodo();
}

$('#login-form').addEventListener('submit',e=>{
 e.preventDefault();
 const mail=$('#login-email').value.trim().toLowerCase();
 if(!mail||!$('#login-password').value)return;
 entrar(mail,'Estudiante');
});
$('#btn-login-profesor').onclick=()=>entrar('profesor.demo@unm.edu.ar','Profesor');
$('#btn-login-invitado').onclick=()=>entrar(`invitado${Math.floor(Math.random()*900000+100000)}@demo.local`,'Invitado');
$('#salir').onclick=()=>{
 sessionStorage.removeItem('unm_sesion');
 estado.cuenta=null;
 $('#aplicacion').classList.add('oculto');
 $('#acceso').classList.remove('oculto');
};

function mostrar(id){
 $$('.vista').forEach(v=>v.classList.toggle('activa',v.id===id));
 $$('.lateral button').forEach(b=>b.classList.toggle('activo',b.dataset.vista===id));
 if(id==='usuario'||id==='ajustes')cargarPerfil();
 if(id==='mensajes')renderChat();
}
$$('.lateral button').forEach(b=>b.onclick=()=>mostrar(b.dataset.vista));

function renderCategorias(){
 const categoriasPublicadas=proyectos().flatMap(p=>
  Array.isArray(p.etiquetas)?p.etiquetas:[]
 );
 const listaCategorias=[...categorias];
 const yaIncluidas=new Set(categorias.map(t=>t.toLocaleLowerCase('es')));

 categoriasPublicadas.forEach(etiqueta=>{
  const nombre=String(etiqueta||'').trim();
  const clave=nombre.toLocaleLowerCase('es');

  if(nombre&&!yaIncluidas.has(clave)){
   listaCategorias.push(nombre);
   yaIncluidas.add(clave);
  }
 });

 $('#categorias').innerHTML=listaCategorias.map(t=>
  `<button class="${
   estado.filtro.toLocaleLowerCase('es')===t.toLocaleLowerCase('es')
    ?'activo':''
  }" data-tag="${escapar(t)}">${escapar(t)}</button>`
 ).join('');

 $$('[data-tag]').forEach(b=>b.onclick=()=>{
  estado.filtro=b.dataset.tag;
  renderCategorias();
  mostrar('explorar');
  renderProyectos();
 });
}

function renderProyectos(){
 let ps=proyectos();
 const buscar=$('#buscar').value.trim().toLowerCase();
 ps=ps.filter(p=>
  (estado.filtro==='Todas'||(p.etiquetas||[]).some(t=>t.toLowerCase()===estado.filtro.toLowerCase()))&&
  (!buscar||((p.titulo||'')+' '+(p.etiquetas||[]).join(' ')).toLowerCase().includes(buscar))
 );
 $('#filtro-activo').textContent=`Mostrando: ${estado.filtro}`;
 $('#portafolios').innerHTML=ps.length?ps.slice().reverse().map(p=>{
  const esAutor=String(p.autor||'').trim().toLowerCase()===String(cuenta()).trim().toLowerCase();
  return `<article class="proyecto tarjeta">
   ${p.portada?`<img src="${p.portada}" alt="Portada de ${escapar(p.titulo)}">`:'<div class="portada">◈</div>'}
   <div class="detalle">
    <h3>${escapar(p.titulo)}</h3>
    <p>Por ${escapar(p.autor)}</p>
    <p>${escapar(p.descripcion||'')}</p>
    ${(p.etiquetas||[]).map(t=>`<span class="etiqueta">${escapar(t)}</span>`).join('')}
    <div class="acciones-proyecto">
     <button class="secundario" data-contacto="${escapar(p.autor)}">Enviar mensaje</button>
     ${esAutor?`<button class="secundario btn-eliminar-proyecto" data-eliminar-proyecto="${escapar(p.id)}">Eliminar proyecto</button>`:''}
    </div>
   </div>
  </article>`;
 }).join(''):'<p class="vacio">Todavía no hay portafolios con estos filtros.</p>';

 $$('[data-contacto]').forEach(b=>b.onclick=()=>{
  estado.chat=b.dataset.contacto;
  mostrar('mensajes');
 });

 $$('[data-eliminar-proyecto]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.eliminarProyecto;
  const actual=proyectos().find(p=>String(p.id)===String(id));
  if(!actual||String(actual.autor||'').trim().toLowerCase()!==String(cuenta()).trim().toLowerCase()){
   return alert('Solo podés eliminar los proyectos que publicaste vos.');
  }
  if(!confirm(`¿Querés eliminar el proyecto "${actual.titulo}"? Esta acción no se puede deshacer.`))return;
  set('proyectos',proyectos().filter(p=>String(p.id)!==String(id)));
  renderProyectos();
 });
}
$('#buscar').oninput=()=>{mostrar('explorar');renderProyectos()};

function renderCarpetas(){
 const carpetas=get(clave('carpetas'),[]);
 const actual=carpetas.find(c=>c.id===estado.carpetaActual);
 const archivos=get(clave('archivos'),[]);
 $('#ruta-carpetas').textContent=actual?'Inicio / '+actual.nombre:'Inicio / Mis carpetas';
 $('#volver-carpeta').classList.toggle('oculto',!actual);
 $('#adjuntar-archivo').classList.toggle('oculto',!actual);
 const visibles=carpetas.filter(c=>(c.parentId||null)===estado.carpetaActual);
 const documentos=actual?archivos.filter(a=>a.carpetaId===actual.id):[];

 $('#carpetas').innerHTML=(
  visibles.map(c=>`<article class="tarjeta panel carpeta-tarjeta">
   <h3>📁 ${escapar(c.nombre)}</h3><p>Carpeta ${escapar(c.tipo)}</p>
   <div class="acciones">
    <button class="primario" data-abrir="${escapar(c.id)}">Abrir carpeta</button>
    <button class="secundario" data-borrar="${escapar(c.id)}">Eliminar</button>
   </div></article>`).join('')+
  documentos.map(a=>`<article class="tarjeta panel carpeta-tarjeta">
   <h3>📄 ${escapar(a.nombre)}</h3><p>${escapar(a.tipo||'Archivo')}</p>
   <div class="acciones">
    <button class="primario" data-ver-archivo="${escapar(a.id)}">Vista previa</button>
    <button class="secundario" data-borrar-archivo="${escapar(a.id)}">Eliminar</button>
   </div></article>`).join('')
 )||'<p class="vacio">No hay elementos todavía. Creá una carpeta o adjuntá un archivo.</p>';

 $$('[data-abrir]').forEach(b=>b.onclick=()=>{
  estado.carpetaActual=b.dataset.abrir;
  renderCarpetas();
 });

 $$('[data-borrar]').forEach(b=>b.onclick=()=>{
  if(!confirm('¿Eliminar esta carpeta y su contenido?'))return;
  const ids=new Set([b.dataset.borrar]);
  let anterior;
  do{
   anterior=ids.size;
   carpetas.forEach(c=>{if(ids.has(c.parentId))ids.add(c.id)});
  }while(ids.size!==anterior);
  set(clave('carpetas'),carpetas.filter(c=>!ids.has(c.id)));
  set(clave('archivos'),archivos.filter(a=>!ids.has(a.carpetaId)));
  renderCarpetas();
 });

 $$('[data-borrar-archivo]').forEach(b=>b.onclick=()=>{
  if(confirm('¿Eliminar archivo?')){
   set(clave('archivos'),archivos.filter(a=>a.id!==b.dataset.borrarArchivo));
   renderCarpetas();
  }
 });

 $$('[data-ver-archivo]').forEach(b=>b.onclick=()=>{
  const a=archivos.find(x=>x.id===b.dataset.verArchivo);
  if(!a)return;
  const t=a.tipo||'';
  let vista='<p>No se puede previsualizar este tipo de archivo.</p>';
  if(t.startsWith('image/'))vista=`<img class="vista-archivo" src="${a.datos}" alt="${escapar(a.nombre)}">`;
  else if(t.startsWith('video/'))vista=`<video class="vista-archivo" controls src="${a.datos}"></video>`;
  else if(t.startsWith('audio/'))vista=`<audio controls src="${a.datos}"></audio>`;
  else if(t==='application/pdf')vista=`<iframe class="vista-pdf" src="${a.datos}" title="${escapar(a.nombre)}"></iframe>`;
  modal(a.nombre,vista,'Cerrar',cerrar);
 });
}

$('#volver-carpeta').onclick=()=>{
 const c=get(clave('carpetas'),[]).find(x=>x.id===estado.carpetaActual);
 estado.carpetaActual=c?.parentId||null;
 renderCarpetas();
};
$('#adjuntar-archivo').onclick=()=>$('#archivo-carpeta').click();
$('#archivo-carpeta').onchange=async e=>{
 const archivos=get(clave('archivos'),[]);
 for(const file of [...e.target.files]){
  // LÍMITE ACTUALIZADO: 10 MB POR ARCHIVO
  if(file.size>10*1024*1024){
   alert(`El archivo ${file.name} supera el límite máximo de 10 MB.`);
   continue;
  }
  const datos=await new Promise((resolve,reject)=>{
   const r=new FileReader();
   r.onload=()=>resolve(r.result);
   r.onerror=reject;
   r.readAsDataURL(file);
  });
  archivos.push({id:crypto.randomUUID(),carpetaId:estado.carpetaActual,nombre:file.name,tipo:file.type,datos,fecha:Date.now()});
 }
 try{
  set(clave('archivos'),archivos);
 }catch{
  alert('No queda espacio en el almacenamiento local del navegador.');
 }
 e.target.value='';
 renderCarpetas();
};

function modal(titulo,cuerpo,accion,fn){
 $('#dialogo-titulo').textContent=titulo;
 $('#dialogo-cuerpo').innerHTML=cuerpo;
 $('#dialogo-acciones').innerHTML='<button type="button" id="cancelar-modal" class="secundario">Cancelar</button>'+
  (accion?'<button type="button" id="confirmar-modal" class="primario">'+escapar(accion)+'</button>':'');
 $('#cancelar-modal').onclick=()=>$('#dialogo').close();
 if(accion)$('#confirmar-modal').onclick=fn;
 $('#dialogo').showModal();
}
const cerrar=()=>$('#dialogo').close();

$('#nueva-carpeta').onclick=()=>modal(
 'Nueva carpeta',
 '<label>Nombre<input id="nombre-carpeta" maxlength="70" required></label><label>Tipo<select id="tipo-carpeta"><option>Individual</option><option>Equipo</option></select></label>',
 'Crear carpeta',
 ()=>{
  const nombre=$('#nombre-carpeta').value.trim();
  if(!nombre)return alert('Ingresá un nombre');
  set(clave('carpetas'),[...get(clave('carpetas'),[]),{id:crypto.randomUUID(),nombre,tipo:$('#tipo-carpeta').value,parentId:estado.carpetaActual}]);
  cerrar();
  renderCarpetas();
 }
);

$('#publicar').onclick=()=>modal(
 'Publicar portafolio',
 '<label>Título<input id="titulo-proyecto" maxlength="90"></label><label>Descripción<textarea id="descripcion-proyecto" rows="3"></textarea></label><label>Etiquetas (separadas por coma)<input id="tags-proyecto" placeholder="3D, Animación"></label><label>Portada opcional<input id="portada-proyecto" type="file" accept="image/*"></label>',
 'Publicar',
 async()=>{
  const titulo=$('#titulo-proyecto').value.trim();
  const etiquetas=$('#tags-proyecto').value.split(',').map(s=>s.trim()).filter(Boolean);
  if(!titulo||!etiquetas.length)return alert('Completá título y etiquetas.');
  let portada='';
  const file=$('#portada-proyecto').files[0];
  if(file){
   if(file.size>1e6)return alert('Elegí una imagen menor a 1 MB para esta demo.');
   portada=await new Promise(r=>{
    const fr=new FileReader();
    fr.onload=()=>r(fr.result);
    fr.readAsDataURL(file);
   });
  }
  const p={id:crypto.randomUUID(),titulo,descripcion:$('#descripcion-proyecto').value,etiquetas,portada,autor:cuenta(),fecha:Date.now()};
  try{
   set('proyectos',[...proyectos(),p]);
  }catch{
   return alert('Se alcanzó el espacio disponible del navegador.');
  }
 notificarPublicacion(p);
cerrar();
renderCategorias();
renderProyectos();
  mostrar('explorar');
 }
);

function cargarPerfil(){
 const p=get(clave('perfil'),{});
 $('#perfil-nombre').value=p.nombre||'';
 $('#perfil-bio').value=p.bio||'';
 $('#perfil-intereses').value=(p.intereses||[]).join(', ');
 $('#intereses-ajustes').value=(p.intereses||[]).join(', ');
 $('#perfil-disponibilidad').value=p.disponibilidad||'Disponible para colaborar';
 $('#permitir-notis').checked=get(clave('preferencias'),{notificaciones:true}).notificaciones!==false;
}

function guardarPerfil(desde){
 const p=get(clave('perfil'),{});
 p.nombre=$('#perfil-nombre').value;
 p.bio=$('#perfil-bio').value;
 p.disponibilidad=$('#perfil-disponibilidad').value;
 p.intereses=$((desde==='ajustes'?'#intereses-ajustes':'#perfil-intereses')).value.split(',').map(s=>s.trim()).filter(Boolean);
 set(clave('perfil'),p);
 if(desde==='ajustes')set(clave('preferencias'),{notificaciones:$('#permitir-notis').checked});
 cargarPerfil();
 alert('Cambios guardados');
}
$('#guardar-perfil').onclick=()=>guardarPerfil('perfil');
$('#guardar-ajustes').onclick=()=>guardarPerfil('ajustes');

function renderChat(){
 const chats=get(clave('chats'),{});
 const nombres=[...new Set(['Comunidad',estado.chat,...Object.keys(chats)])];
 $('#conversaciones').innerHTML=nombres.map(n=>`<button data-chat="${escapar(n)}">${escapar(n)}</button>`).join('');
 $$('[data-chat]').forEach(b=>b.onclick=()=>{estado.chat=b.dataset.chat;renderChat()});
 $('#chat-titulo').textContent=estado.chat;
 $('#chat-historial').innerHTML=(chats[estado.chat]||[]).map(m=>`<div class="burbuja ${m.autor===cuenta()?'propio':''}"><b>${escapar(m.autor)}</b><p>${escapar(m.texto)}</p></div>`).join('')||'<p class="vacio">Todavía no hay mensajes.</p>';
}
$('#chat-form').onsubmit=e=>{
 e.preventDefault();
 const texto=$('#chat-texto').value.trim();
 if(!texto)return;
 const chats=get(clave('chats'),{});
 chats[estado.chat]=[...(chats[estado.chat]||[]),{autor:cuenta(),texto,fecha:Date.now()}];
 set(clave('chats'),chats);
 $('#chat-texto').value='';
 renderChat();
};

$('#campana').onclick=()=>{
 const lista=avisos();
 modal('Notificaciones',lista.length?lista.map(a=>`<p class="tarjeta" style="padding:12px">${escapar(a.texto)}</p>`).join(''):'<p>No tenés notificaciones nuevas.</p>','Marcar como leídas',()=>{
  set(clave('avisos'),lista.map(a=>({...a,leida:true})));
  actualizarAvisos();
  cerrar();
 });
};
$('#ayuda').onclick=()=>modal(
 '¿Cómo funciona UNM Proyecta?',
 '<p><b>Crear:</b> organizá carpetas y publicá tus trabajos con etiquetas.</p><p><b>Explorar:</b> encontrá portafolios por categoría o buscador.</p><p><b>Mensajes:</b> escribí consultas y conversá dentro de esta demostración.</p><p><b>Mi cuenta:</b> cargá tus intereses, por ejemplo 3D.</p><p><b>Campanita:</b> muestra publicaciones nuevas relacionadas con tus intereses, cuando las publican otras cuentas de este mismo navegador.</p><p><b>Configuración:</b> administrá intereses y avisos.</p><p>¿Tenés dudas? Consultá con el equipo administrador de la plataforma.</p>',
 'Entendido',cerrar
);

/* EQUIPOS: almacenamiento compartido dentro de este navegador */
function cargarEquiposGlobales(){
 let eq=get('equipos',[]);
 let cambio=false;
 const mails=[...new Set([...Object.keys(leerCuentas()),cuenta()])];

 // Compatibilidad con equipos guardados en versiones anteriores.
 for(const mail of mails){
  const antiguos=get(`equipos_${mail}`,[]);
  for(const e of antiguos){
   const legacyKey=`${mail}|${e.nombre||''}`;
   if(!eq.some(x=>x.legacyKey===legacyKey)){
    eq.push({
     id:crypto.randomUUID(),
     legacyKey,
     nombre:e.nombre||'Equipo sin nombre',
     creador:mail,
     miembros:[mail],
     integrantesTexto:e.integrantes||'',
     disponibilidad:e.disponibilidad==='ocupado'?'ocupado':'disponible'
    });
    cambio=true;
   }
  }
 }
 if(cambio)set('equipos',eq);
 return eq;
}

$('#nuevo-equipo').onclick=()=>modal(
 'Crear Nuevo Equipo',
 '<p>Creá un grupo de trabajo y permití que otras personas de la demo se unan.</p><label>Nombre del Equipo:<input id="equipo-nombre" maxlength="40" placeholder="Escribí un nombre"></label><label>Integrantes o invitaciones (opcional):<input id="equipo-integrantes" placeholder="@usuario1, @usuario2"></label><small>Las personas también pueden unirse desde esta lista cuando ingresan a la demo.</small><label>Estado de disponibilidad:<select id="equipo-disponibilidad"><option value="disponible">Disponible (buscando integrantes)</option><option value="ocupado">No disponible / completo</option></select></label>',
 'Crear Equipo',
 ()=>{
  const nombre=$('#equipo-nombre').value.trim();
  if(!nombre)return alert('Ingresá un nombre');
  const eq=cargarEquiposGlobales();
  if(eq.some(e=>String(e.nombre).trim().toLowerCase()===nombre.toLowerCase()))return alert('Ya existe un equipo con ese nombre.');
  eq.push({
   id:crypto.randomUUID(),
   nombre,
   creador:cuenta(),
   miembros:[cuenta()],
   integrantesTexto:$('#equipo-integrantes').value.trim(),
   disponibilidad:$('#equipo-disponibilidad').value,
   fecha:Date.now()
  });
  set('equipos',eq);
  cerrar();
  renderEquipos();
 }
);

function renderEquipos(){
 const eq=cargarEquiposGlobales();
 $('#equipos-lista').innerHTML=eq.length?eq.map(e=>{
  const miembros=Array.isArray(e.miembros)?e.miembros:[];
  const esCreador=String(e.creador||'').toLowerCase()===String(cuenta()).toLowerCase();
  const esMiembro=miembros.some(m=>String(m).toLowerCase()===String(cuenta()).toLowerCase());
  const disponible=e.disponibilidad!=='ocupado';
  const miembrosTexto=miembros.length?miembros.map(escapar).join(', '):'Sin integrantes';
  return `<article class="tarjeta panel equipo-card">
   <h3>${escapar(e.nombre)}</h3>
   <p>Creado por: ${escapar(e.creador||'Cuenta anterior')}</p>
   <p>Integrantes: ${miembrosTexto}</p>
   ${e.integrantesTexto?`<p>Invitaciones: ${escapar(e.integrantesTexto)}</p>`:''}
   <p><strong>Estado:</strong> <span class="estado-equipo ${disponible?'disponible':'no-disponible'}">${disponible?'Disponible · buscando integrantes':'No disponible · completo'}</span></p>
   <div class="acciones-equipo">
    ${esCreador?`<button class="secundario" data-toggle-equipo="${escapar(e.id)}">Cambiar a ${disponible?'No disponible':'Disponible'}</button><button class="secundario" data-borrar-equipo="${escapar(e.id)}">Eliminar equipo</button>`:esMiembro?`<button class="secundario" data-salir-equipo="${escapar(e.id)}">Darme de baja</button>`:disponible?`<button class="primario" data-unir-equipo="${escapar(e.id)}">Unirme al equipo</button>`:`<button class="secundario" disabled>No acepta integrantes</button>`}
   </div>
  </article>`;
 }).join(''):'<p class="vacio">Todavía no hay equipos. Podés crear el primero.</p>';

 $$('[data-unir-equipo]').forEach(b=>b.onclick=()=>{
  const eq=cargarEquiposGlobales();
  const e=eq.find(x=>String(x.id)===b.dataset.unirEquipo);
  if(!e||e.disponibilidad==='ocupado')return alert('Este equipo no está disponible para nuevos integrantes.');
  e.miembros=Array.isArray(e.miembros)?e.miembros:[];
  if(!e.miembros.some(m=>String(m).toLowerCase()===String(cuenta()).toLowerCase()))e.miembros.push(cuenta());
  set('equipos',eq);
  renderEquipos();
 });

 $$('[data-salir-equipo]').forEach(b=>b.onclick=()=>{
  const eq=cargarEquiposGlobales();
  const e=eq.find(x=>String(x.id)===b.dataset.salirEquipo);
  if(!e)return;
  if(!confirm(`¿Querés darte de baja del equipo "${e.nombre}"?`))return;
  e.miembros=(e.miembros||[]).filter(m=>String(m).toLowerCase()!==String(cuenta()).toLowerCase());
  set('equipos',eq);
  renderEquipos();
 });

 $$('[data-toggle-equipo]').forEach(b=>b.onclick=()=>{
  const eq=cargarEquiposGlobales();
  const e=eq.find(x=>String(x.id)===b.dataset.toggleEquipo);
  if(!e||String(e.creador||'').toLowerCase()!==String(cuenta()).toLowerCase())return alert('Solo quien creó el equipo puede cambiar su disponibilidad.');
  e.disponibilidad=e.disponibilidad==='ocupado'?'disponible':'ocupado';
  set('equipos',eq);
  renderEquipos();
 });

 $$('[data-borrar-equipo]').forEach(b=>b.onclick=()=>{
  const eq=cargarEquiposGlobales();
  const e=eq.find(x=>String(x.id)===b.dataset.borrarEquipo);
  if(!e||String(e.creador||'').toLowerCase()!==String(cuenta()).toLowerCase())return alert('Solo quien creó el equipo puede eliminarlo.');
  if(!confirm(`¿Eliminar el equipo "${e.nombre}" para todos sus integrantes?`))return;
  set('equipos',eq.filter(x=>String(x.id)!==String(e.id)));
  renderEquipos();
 });
}

function renderTodo(){
 renderCategorias();
 renderCarpetas();
 renderProyectos();
 renderEquipos();
 renderChat();
 actualizarAvisos();
}

try{
 const s=JSON.parse(sessionStorage.getItem('unm_sesion'));
 if(s?.mail)entrar(s.mail,s.rol);
}catch{}
})();
