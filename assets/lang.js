// assets/lang.js
// Simple language detection and redirect to Indonesian pages when user's preferred language is Indonesian.
// - Allows manual override via localStorage 'preferredLang' (set to 'en' or 'id')
// - Avoids redirect loops and respects query param '?lang=en' or '?lang=id'

(function(){
  try{
    const supported = ['en','id'];
    const mapToId = (path)=>path.replace(/(index|cleaning|thermal-paste|upgrades)\.html$/,'$1.id.html');
    const mapToEn = (path)=>path.replace(/(index|cleaning|thermal-paste|upgrades)\.id\.html$/,'$1.html');

    const qs = new URLSearchParams(location.search);
    if(qs.get('lang')){
      const v = qs.get('lang');
      if(v==='id' || v==='en'){
        localStorage.setItem('preferredLang', v);
      }
    }

    const preferred = localStorage.getItem('preferredLang');
    if(preferred){
      // user explicitly chose language; do nothing
      return;
    }

    // don't redirect for non-html pages
    if(!location.pathname.endsWith('.html')) return;

    // already on an Indonesian page
    if(location.pathname.endsWith('.id.html')) return;

    const navLangs = navigator.languages || [navigator.language || 'en'];
    const wantsId = navLangs.some(l => l && l.toLowerCase().startsWith('id'));

    if(wantsId){
      // build target path
      const target = mapToId(location.pathname.replace(/^\//,''));
      // ensure target is different and exists on the same host
      if(target && target !== location.pathname.replace(/^\//,'')){
        // Add a query param to avoid caching/loops
        const url = location.origin + location.pathname.replace(/\/$/, '') + '/' ;
        // Try a safe redirect to corresponding file
        location.href = location.origin + '/' + target;
      }
    }
  }catch(e){
    // fail silently
    console.error(e);
  }
})();
