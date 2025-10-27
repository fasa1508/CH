// app.js - Credihogar catalog
// Funciones principales: administrar productos (localStorage), renderizar catálogo, abrir WhatsApp.

/*
  Data model:
  product = { id, name, desc, price, category, imageBase64 }
  Settings stored in localStorage: { products: [...], settings: { whatsapp, adminPass } }
*/

// Categorías predefinidas (según requerimiento)
const CATEGORIES = [
  'catalogo navideño','accesorios de baño','almohadas y rellenos','cobijas','cojines','cortinas',
  'manteleria','protectores','sabanas','tendidos estandar','tendidos premium','toallas'
];

// Supabase client (inicializa si config.js define keys)
let supabaseClient = null;
try{
  if(window && window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase){
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
  }
}catch(e){ /* ignore if not available */ }

// --- Supabase Auth helpers & UI wiring (inserted if supabaseClient exists) ---
async function getCurrentUser(){
  if(!supabaseClient) return null;
  try{
    const { data } = await supabaseClient.auth.getSession();
    return data?.session?.user || null;
  }catch(e){ return null; }
}

function setupAuthUI(){
  if(!supabaseClient) return;
  // wire handlers if elements exist
  try{
    if(document.getElementById('auth-signup')){
      document.getElementById('auth-signup').addEventListener('click', async ()=>{
        const email = document.getElementById('auth-email-input').value.trim();
        const pass = document.getElementById('auth-pass-input').value;
        if(!email || !pass) return alert('Email y contraseña son requeridos');
        const res = await supabaseClient.auth.signUp({ email, password: pass });
        if(res.error) return alert('Error registro: '+res.error.message);
        alert('Registro enviado. Revisa tu correo para verificar si aplica.');
      });
    }
    if(document.getElementById('auth-signin')){
      document.getElementById('auth-signin').addEventListener('click', async ()=>{
        const email = document.getElementById('auth-email-input').value.trim();
        const pass = document.getElementById('auth-pass-input').value;
        if(!email || !pass) return alert('Email y contraseña son requeridos');
        const res = await supabaseClient.auth.signInWithPassword({ email, password: pass });
        if(res.error) return alert('Error login: '+res.error.message);
        await refreshAuthState();
      });
    }
    if(document.getElementById('auth-signout')){
      document.getElementById('auth-signout').addEventListener('click', async ()=>{
        await supabaseClient.auth.signOut();
        await refreshAuthState();
      });
    }
    // listen auth changes
    supabaseClient.auth.onAuthStateChange(()=>{ refreshAuthState(); });
  }catch(e){ console.warn('Auth UI wiring error', e); }
}

async function refreshAuthState(){
  if(!supabaseClient) return;
  const user = await getCurrentUser();
  const signedEl = document.getElementById('auth-signed');
  const formsEl = document.getElementById('auth-forms');
  const emailLabel = document.getElementById('auth-email');
  if(user){
    if(signedEl) signedEl.classList.remove('hidden');
    if(formsEl) formsEl.classList.add('hidden');
    if(emailLabel) emailLabel.textContent = user.email || user.id;
  }else{
    if(signedEl) signedEl.classList.add('hidden');
    if(formsEl) formsEl.classList.remove('hidden');
  }
}


// Helpers para localStorage
const STORAGE_KEY = 'credihogar_data_v1';
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return { products: [], settings: { whatsapp:'', adminPass:'' } };
  try{ return JSON.parse(raw);}catch(e){return { products: [], settings: { whatsapp:'', adminPass:'' } }}
}
function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// Inicialización
let state = loadState();

// UI referencias
const catalogEl = document.getElementById('catalog');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('search');

const adminToggle = document.getElementById('admin-toggle');
const adminPanel = document.getElementById('admin-panel');
const adminClose = document.getElementById('admin-close');

const productForm = document.getElementById('product-form');
const pName = document.getElementById('p-name');
const pDesc = document.getElementById('p-desc');
const pPrice = document.getElementById('p-price');
const pCategory = document.getElementById('p-category');
const pImage = document.getElementById('p-image');
const clearFormBtn = document.getElementById('clear-form');

const productListEl = document.getElementById('product-list');
const whatsappInput = document.getElementById('whatsapp-number');
const adminPassInput = document.getElementById('admin-pass');
const saveSettingsBtn = document.getElementById('save-settings');

// Modal
const modal = document.getElementById('product-modal');
const modalClose = document.getElementById('modal-close');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const buyWhatsappBtn = document.getElementById('buy-whatsapp');

// Estado UI
let editId = null; // si estamos editando un producto
let currentProductForModal = null;

/* --------------------- UI Setup --------------------- */
function populateCategories(){
  // Filtro general
  CATEGORIES.forEach(cat=>{
    const opt = document.createElement('option'); opt.value = cat; opt.textContent = capitalize(cat);
    categoryFilter.appendChild(opt);
  });
  // Select del form
  CATEGORIES.forEach(cat=>{ const o = document.createElement('option'); o.value=cat; o.textContent = capitalize(cat); pCategory.appendChild(o); });
}

function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function renderCatalog(){
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  catalogEl.innerHTML = '';
  const products = state.products.filter(p=>{
    if(cat !== 'all' && p.category !== cat) return false;
    if(q && !(p.name.toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q))) return false;
    return true;
  });

  if(products.length === 0){
    catalogEl.innerHTML = '<p class="muted" style="padding:12px;color:#6b7280">No hay productos que coincidan.</p>';
    return;
  }

  products.forEach(p=>{
    const card = document.createElement('article'); card.className='card';
    // Contenedor para mantener aspect-ratio consistente
    const imgContainer = document.createElement('div'); imgContainer.className = 'img-container';
    const img = document.createElement('img'); 
    img.src = p.imageBase64 || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"></svg>';
    img.alt = p.name;
    imgContainer.appendChild(img);
    const h3 = document.createElement('h3'); h3.textContent = p.name;
    const desc = document.createElement('p'); desc.className='desc'; desc.textContent = p.desc || '';
    const price = document.createElement('p'); price.className='price'; price.textContent = formatPrice(p.price);
    const actions = document.createElement('div'); actions.className='actions';
    const viewBtn = document.createElement('button'); viewBtn.className='btn'; viewBtn.textContent='Ver';
    viewBtn.addEventListener('click', ()=>openModal(p.id));
    const buyBtn = document.createElement('button'); buyBtn.className='buy'; buyBtn.textContent='Comprar por WhatsApp';
    buyBtn.addEventListener('click', ()=>openWhatsApp(p.name));
    actions.appendChild(viewBtn); actions.appendChild(buyBtn);

    card.appendChild(imgContainer); card.appendChild(h3); card.appendChild(desc); card.appendChild(price); card.appendChild(actions);
    catalogEl.appendChild(card);
  });
}

// If Supabase is configured, load products from DB
async function loadFromSupabase(){
  if(!supabaseClient) return;
  try{
    const { data, error } = await supabaseClient.from('products').select('*').order('created_at',{ ascending: false });
    if(error) { console.error('Supabase fetch error', error); return; }
    // map DB rows to local state structure
    state.products = (data || []).map(r=>({ id: r.id, name: r.name, desc: r.description, price: r.price, category: r.category, imageBase64: r.image_url }));
    renderCatalog();
    renderAdminList();
  }catch(e){ console.error(e); }
}

function formatPrice(v){
  if(!v && v !== 0) return '';
  return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:2}).format(Number(v));
}

/* --------------------- Modal & WhatsApp --------------------- */
function openModal(id){
  const p = state.products.find(x=>x.id===id); if(!p) return;
  currentProductForModal = p;
  modalImage.src = p.imageBase64 || '';
  modalName.textContent = p.name;
  modalDesc.textContent = p.desc || '';
  modalPrice.textContent = formatPrice(p.price);
  modal.classList.remove('hidden');
}
function closeModal(){ modal.classList.add('hidden'); currentProductForModal = null; }

function openWhatsApp(productName){
  // Validar y normalizar número (quitar espacios y caracteres no numéricos)
  const raw = (state.settings && state.settings.whatsapp) ? state.settings.whatsapp : '';
  const num = raw.replace(/\D/g,'');
  const text = `Hola, estoy interesado en el producto ${productName}`;
  if(!num){
    alert('No hay número de WhatsApp configurado. Abre el panel del propietario y agrega el número (ej: 573001234567).');
    return;
  }
  // Usar la URL oficial de WhatsApp que redirige a web o app según dispositivo
  const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(num)}&text=${encodeURIComponent(text)}`;
  // Abrir en nueva pestaña para no cerrar la app
  window.open(url,'_blank');
}

/* --------------------- Admin: add/edit/delete --------------------- */
function resetForm(){ productForm.reset(); editId = null; }

// convierte imagen file -> base64 y devuelve Promise
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve('');
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = ()=> reject(new Error('Error al leer imagen'));
    reader.readAsDataURL(file);
  });
}

productForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  // recolectar datos
  const name = pName.value.trim();
  const desc = pDesc.value.trim();
  const price = pPrice.value.trim();
  const category = pCategory.value;
  let imageBase64 = null;
  const file = (pImage.files && pImage.files[0]) ? pImage.files[0] : null;

  // If Supabase configured, upload to Storage and insert product in DB
  if(supabaseClient){
    try{
      // Require authenticated user
      const user = await getCurrentUser();
      if(!user){
        return alert('Debes iniciar sesión para subir productos. Abre el Panel y regístrate/inicia sesión.');
      }
      let image_url = '';
      if(file){
        const filePath = `${category}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage.from('images').upload(filePath, file);
        if(uploadError){ console.error(uploadError); alert('Error subiendo imagen a Supabase'); }
        const { publicURL } = supabaseClient.storage.from('images').getPublicUrl(filePath);
        image_url = publicURL;
      }
      const insert = { name, description: desc, price, category, image_url, owner_id: user.id };
      const { data: inserted, error: insertError } = await supabaseClient.from('products').insert([insert]);
      if(insertError){ console.error(insertError); alert('Error guardando producto en DB'); }
      // reload from supabase to refresh UI
      await loadFromSupabase();
      resetForm();
      return;
    }catch(err){ console.error(err); alert('Error procesando en Supabase'); }
  }

  if(file){
    try{ imageBase64 = await fileToBase64(file); }catch(err){ alert('Error leyendo la imagen'); }
  }

  if(editId){
    // editar
    const idx = state.products.findIndex(x=>x.id===editId);
    if(idx!==-1){
      state.products[idx] = { ...state.products[idx], name, desc, price, category, imageBase64: imageBase64 || state.products[idx].imageBase64 };
    }
  }else{
    const id = 'p_'+Date.now();
    state.products.push({ id, name, desc, price, category, imageBase64 });
  }
  saveState(state);
  renderCatalog();
  renderAdminList();
  resetForm();
});

clearFormBtn.addEventListener('click', ()=>resetForm());

function renderAdminList(){
  productListEl.innerHTML = '';
  state.products.slice().reverse().forEach(p=>{
    const el = document.createElement('div'); el.className='item';
    const imgContainer = document.createElement('div'); imgContainer.className = 'img-container';
    const img = document.createElement('img'); img.src = p.imageBase64 || ''; img.alt = p.name;
    imgContainer.appendChild(img);
    const name = document.createElement('div'); name.textContent = p.name;
    const controls = document.createElement('div'); controls.style.marginLeft='auto';
    const ebtn = document.createElement('button'); ebtn.textContent='Editar'; ebtn.className='btn';
    ebtn.addEventListener('click', ()=>{ fillFormForEdit(p.id); });
    const del = document.createElement('button'); del.textContent='Eliminar'; del.className='btn ghost';
    del.addEventListener('click', ()=>{ if(confirm('Eliminar producto?')){ deleteProduct(p.id); } });
    controls.appendChild(ebtn); controls.appendChild(del);
    el.appendChild(imgContainer); el.appendChild(name); el.appendChild(controls);
    productListEl.appendChild(el);
  });
}

function fillFormForEdit(id){
  const p = state.products.find(x=>x.id===id); if(!p) return;
  editId = id; pName.value = p.name; pDesc.value = p.desc; pPrice.value = p.price; pCategory.value = p.category;
}

function deleteProduct(id){
  state.products = state.products.filter(x=>x.id!==id);
  saveState(state); renderCatalog(); renderAdminList();
}

/* --------------------- Settings --------------------- */
saveSettingsBtn.addEventListener('click', ()=>{
  const w = whatsappInput.value.trim();
  const pass = adminPassInput.value.trim();
  state.settings = state.settings || {};
  if(w) state.settings.whatsapp = w;
  if(pass) state.settings.adminPass = pass;
  saveState(state);
  alert('Configuración guardada (local). Para más seguridad implemente backend con autenticación.');
});

/* --------------------- Admin toggle (simple client-side unlock) --------------------- */
adminToggle.addEventListener('click', ()=>{
  // Si existe adminPass en settings, solicitar contraseña
  const pass = (state.settings && state.settings.adminPass) ? state.settings.adminPass : '';
  if(pass){
    const input = prompt('Ingrese la contraseña de propietario:');
    if(input !== pass) return alert('Contraseña incorrecta');
  }
  openAdminPanel();
});
adminClose.addEventListener('click', ()=>closeAdminPanel());

function openAdminPanel(){ adminPanel.classList.remove('hidden'); adminPanel.setAttribute('aria-hidden','false'); }
function closeAdminPanel(){ adminPanel.classList.add('hidden'); adminPanel.setAttribute('aria-hidden','true'); }

/* --------------------- Listeners globales --------------------- */
modalClose.addEventListener('click', ()=>closeModal());
buyWhatsappBtn.addEventListener('click', ()=>{ if(currentProductForModal) openWhatsApp(currentProductForModal.name); });
// Cerrar modal si el usuario hace click fuera del contenido (overlay)
modal.addEventListener('click', (e)=>{
  if(e.target === modal) closeModal();
});
// Cerrar modal con click en la propia imagen (útil en móviles)
modalImage.addEventListener('click', ()=>closeModal());
// Cerrar con Escape
document.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') closeModal(); });
categoryFilter.addEventListener('change', ()=>renderCatalog());
searchInput.addEventListener('input', ()=>renderCatalog());

/* --------------------- Inicial render --------------------- */
function init(){
  // asegurar estructura de state
  state = state || { products: [], settings: { whatsapp:'', adminPass:'' } };
  // rellenar opciones de categorías
  populateCategories();
  // volcar settings a UI
  if(state.settings){ whatsappInput.value = state.settings.whatsapp || ''; adminPassInput.value = state.settings.adminPass || ''; }
  // If Supabase is configured, load from it; otherwise use local state
  if(supabaseClient){
    loadFromSupabase();
    // wire auth UI and refresh auth state
    setupAuthUI();
    refreshAuthState();
  }else{
    renderCatalog();
    renderAdminList();
  }
}

init();

// Exponer para debugging en consola
window.credihogar = { state, saveState };
