(function(){
  const ASSETS = ['app.js','admin.js','auth.js','styles.css'];
  const CHECK_INTERVAL_MS = 60 * 1000; // 60s
  const STORAGE_KEY = '__asset_etags_v1__';

  const banner = document.getElementById('update-banner');
  const btnReload = document.getElementById('update-reload');
  const btnDismiss = document.getElementById('update-dismiss');

  function showBanner(){
    if (!banner) return;
    banner.style.display = 'flex';
  }
  function hideBanner(){
    if (!banner) return;
    banner.style.display = 'none';
  }

  btnReload && btnReload.addEventListener('click', () => {
    // Forzar recarga de todos los recursos
    location.reload(true);
  });
  btnDismiss && btnDismiss.addEventListener('click', hideBanner);

  async function headMeta(url){
    try{
      const res = await fetch(url + `?v=${Date.now()}`, { method:'HEAD', cache:'no-store' });
      return res.headers.get('etag') || res.headers.get('last-modified') || String(Date.now());
    }catch(err){
      // En caso de error de red, retornar un valor que no dispare recargas
      return null;
    }
  }

  async function getCurrentSignatures(){
    const entries = await Promise.all(ASSETS.map(async (a)=>{
      const sig = await headMeta(a);
      return [a, sig];
    }));
    return Object.fromEntries(entries.filter(([,v]) => !!v));
  }

  function getStored(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }catch{ return {}; }
  }
  function setStored(obj){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }catch{}
  }

  async function check(){
    const latest = await getCurrentSignatures();
    const stored = getStored();

    // Primer arranque: guardar y salir
    if (!stored || Object.keys(stored).length === 0){
      setStored(latest);
      return;
    }

    // Detectar cambios
    const changed = Object.keys(latest).some(k => stored[k] && latest[k] && stored[k] !== latest[k]);
    if (changed){
      showBanner();
    }
  }

  // Iniciar
  check();
  setInterval(check, CHECK_INTERVAL_MS);
})();
