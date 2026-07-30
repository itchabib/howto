// assets/ui-enhancements.js
// Injects a skip-link and an accessible language selector into pages that use the `.site-header .container` pattern.
// - Adds a visible "Skip to content" link as the first focusable element
// - Adds an accessible <select> language chooser that toggles between available pages
// - Persists user preference to localStorage 'preferredLang'

(function(){
  try{
    // Add skip link
    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';
    skip.style.cssText = 'position:absolute;left:-999px;top:auto;width:1px;height:1px;overflow:hidden;';
    // show on focus
    skip.addEventListener('focus', ()=>{ skip.style.left='1rem'; skip.style.top='1rem'; skip.style.width='auto'; skip.style.height='auto'; skip.style.background='#000'; skip.style.color='#fff'; skip.style.padding='8px'; skip.style.zIndex='9999'; skip.style.borderRadius='6px'; });
    skip.addEventListener('blur', ()=>{ skip.style.left='-999px'; skip.style.top='auto'; skip.style.width='1px'; skip.style.height='1px'; skip.style.padding='0'; skip.style.background='none'; skip.style.zIndex='auto'; });
    document.body.insertBefore(skip, document.body.firstChild);

    // ensure main has id for skip target
    const main = document.querySelector('main.container');
    if(main) main.id = 'main-content';

    // Language selector injection
    const headerContainer = document.querySelector('.site-header .container');
    if(!headerContainer) return;

    const sel = document.createElement('select');
    sel.setAttribute('aria-label','Choose language');
    sel.className = 'lang-select';
    sel.style.marginLeft = '1rem';
    const optEn = document.createElement('option'); optEn.value='en'; optEn.textContent='English';
    const optId = document.createElement('option'); optId.value='id'; optId.textContent='Bahasa';
    sel.appendChild(optEn); sel.appendChild(optId);

    // read current page and set default
    const path = location.pathname.split('/').pop() || 'index.html';
    const isId = path.endsWith('.id.html');
    const preferred = localStorage.getItem('preferredLang');
    if(preferred) sel.value = preferred; else sel.value = (isId? 'id':'en');

    sel.addEventListener('change', function(e){
      const v = e.target.value;
      localStorage.setItem('preferredLang', v);
      // map current path to target
      let target = path;
      if(v==='id' && !path.endsWith('.id.html')){
        target = path.replace(/(index|cleaning|thermal-paste|upgrades|tutorials|battery|keyboard|screen|fan-replacement|bios|data-recovery)\.html$/,'$1.id.html');
      } else if(v==='en' && path.endsWith('.id.html')){
        target = path.replace(/\.id\.html$/,'.html');
      }
      // navigate to target if different
      if(target && target !== path){
        location.href = location.origin + '/' + target;
      }
    });

    const langDiv = document.createElement('div');
    langDiv.className = 'lang-select-wrap';
    langDiv.style.float = 'right';
    langDiv.appendChild(sel);
    headerContainer.appendChild(langDiv);

  }catch(e){ console.error('UI enhancements failed', e); }
})();
