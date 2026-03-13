import"./Firebase-C_lFSCaV.js";import{A as d}from"./Auth-BW2TVjAm.js";import"./config.js_v_2.0-DMxjU1_X.js";import{S as m}from"./Store-CiH9aKNK.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";let c=null,i=[],r="active";d.waitForAuthInit().then(()=>{d.onSessionChange(e=>{e?(c=e,v(e.uid)):(window.Utils.showToast("Acceso denegado: redireccionando a login.","error"),setTimeout(()=>window.location.href="login.html",1500))})});window.handleLogout=()=>d.logout();async function v(e){i=await m.getEvents(e),s()}function s(){const e=document.getElementById("event-grid"),n=i.filter(t=>r==="active"?!t.archived:t.archived);if(n.length===0){e.innerHTML=r==="active"?`
    <div class="empty-state">
        <i class="far fa-calendar-plus"></i>
        <p>Aún no tienes eventos activos. ¡Crea el primero!</p>
    </div>
    `:`
    <div class="empty-state">
        <i class="fas fa-archive"></i>
        <p>No tienes eventos archivados.</p>
    </div>
    `;return}e.innerHTML="",n.sort((t,a)=>(a.createdAt?.toDate?.()||0)-(t.createdAt?.toDate?.()||0)),n.forEach(t=>{const a=document.createElement("div");a.className="m3-card m3-card-elevated";let o="fa-rings-wedding";t.type==="birthday"&&(o="fa-cake-candles"),t.type==="meeting"&&(o="fa-handshake");let l="";r==="active"?l=`
                    <div class="event-actions-minimal">
                        <a href="generator.html?event=${t.id}" class="m3-btn m3-btn-filled action-btn-mini" style="text-decoration: none;">Gestionar</a>
                        <a href="index.html?event=${t.id}" target="_blank" class="icon-btn-mini" title="Ver Invitación"><i class="fas fa-eye"></i></a>
                        <button onclick="handleArchive('${t.id}', true)" class="icon-btn-mini" title="Archivar"><i class="fas fa-archive"></i></button>
                    </div>
                    `:l=`
                    <div class="event-actions-minimal">
                        <button onclick="handleArchive('${t.id}', false)" class="m3-btn m3-btn-filled action-btn-mini">Restaurar</button>
                        <button onclick="handleDelete('${t.id}')" class="icon-btn-mini" style="color: var(--md-sys-color-error); border-color: var(--md-sys-color-error);" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </div>
                    `,a.innerHTML=`
                <div class="event-title-row">
                    <i class="fas ${o}"></i>
                    <h3>${t.eventName||t.id}</h3>
                </div>
                <div class="event-meta-minimal">
                    <i class="far fa-calendar-alt"></i>
                    <span>${t.wedding?.date?new Date(t.wedding.date).toLocaleDateString():"Por definir"}</span>
                </div>
                ${l}
                `,e.appendChild(a)})}window.switchTab=e=>{r=e,document.getElementById("tab-active").className=e==="active"?"m3-btn m3-btn-filled":"m3-btn m3-btn-outlined",document.getElementById("tab-active").style.border=e==="active"?"none":"",document.getElementById("tab-archived").className=e==="archived"?"m3-btn m3-btn-filled":"m3-btn m3-btn-outlined",document.getElementById("tab-archived").style.border=e==="archived"?"none":"",s()};window.handleArchive=async(e,n)=>{if(!(n&&!confirm("¿Estás seguro de archivar este evento? Seguirá existiendo y podrás restaurarlo luego.")))try{await m.archiveEvent(e,n);const t=i.findIndex(a=>a.id===e);t!==-1&&(i[t].archived=n),s(),window.Utils.showToast(n?"Evento archivado":"Evento restaurado","info")}catch{window.Utils.showToast("Error al actualizar el evento.","error")}};window.handleDelete=async e=>{if(confirm("Peligro: Esta acción ELIMINARÁ PERMANENTEMENTE el evento y no se puede deshacer. ¿Deseas continuar?"))try{i=i.filter(n=>n.id!==e),s(),window.Utils.showToast("Evento eliminado","success")}catch{window.Utils.showToast("Error al eliminar el evento.","error")}};window.openCreateModal=()=>document.getElementById("create-modal").style.display="flex";window.closeCreateModal=()=>document.getElementById("create-modal").style.display="none";document.getElementById("create-event-form").addEventListener("submit",async e=>{e.preventDefault();const n=document.getElementById("new-event-id").value.trim().toLowerCase(),t=document.getElementById("new-event-name").value.trim(),a=document.getElementById("new-event-type").value;try{if(!c)throw new Error("No hay sesión activa.");await m.createEvent(n,t,a,c.uid),window.Utils.showToast("Evento creado exitosamente"),setTimeout(()=>location.reload(),1500)}catch{window.Utils.showToast("Error: Es posible que ese ID ya esté en uso o la sesión caducó.","error")}});document.getElementById("new-event-name").addEventListener("input",e=>{const n=document.getElementById("new-event-id");(n.value===""||n.dataset.auto==="true")&&(n.value=e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),n.dataset.auto="true")});
