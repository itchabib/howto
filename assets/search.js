// assets/search.js
// Fuzzy client-side search using Fuse.js with accessibility improvements and debounce.

document.addEventListener('DOMContentLoaded', function(){
  const input = document.getElementById('site-search');
  const results = document.getElementById('results');
  if(!input || !results) return;

  let index = [];
  let fuse = null;

  // Try multiple candidate URLs so the search index loads correctly whether the site
  // is served from the repo root or a project subpath (GitHub Pages: /<user>/<repo>/).
  const candidates = [
    new URL('./assets/search-index.json', location.href).href,
    // attempt repo subpath using the repo name; this helps when the page is at /howto/
    new URL('/howto/assets/search-index.json', location.origin).href,
    // absolute site-root fallback
    new URL('/assets/search-index.json', location.origin).href
  ];

  // Ensure Fuse.js is available; if not, dynamically load from a CDN fallback.
  function ensureFuse(){
    if(typeof Fuse !== 'undefined') return Promise.resolve();
    return new Promise((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js';
      s.async = true;
      s.onload = () => { if(typeof Fuse !== 'undefined') resolve(); else reject(new Error('Fuse did not attach')); };
      s.onerror = () => reject(new Error('Failed to load Fuse.js'));
      document.head.appendChild(s);
    });
  }

  async function loadIndex(){
    for(const u of candidates){
      try{
        const r = await fetch(u);
        if(!r.ok) continue;
        const data = await r.json();
        index = data.pages || [];
        const options = {
          keys: ['title','content'],
          threshold: 0.4,
          ignoreLocation: true,
          minMatchCharLength: 2,
        };
        // If Fuse is not available for any reason, fall back to substring matching later.
        if(typeof Fuse !== 'undefined'){
          fuse = new Fuse(index, options);
        }
        return true;
      }catch(e){
        // try next candidate
      }
    }
    return false;
  }

  (async function init(){
    try{
      await ensureFuse().catch(()=>{}); // try to load Fuse but continue even if it fails
      const ok = await loadIndex();
      if(!ok) results.innerHTML = '<p>Search index could not be loaded.</p>';
    }catch(e){
      console.error('Search initialization error', e);
      results.innerHTML = '<p>Search index could not be loaded.</p>';
    }
  })();

  function highlight(text, terms){
    if(!terms || terms.length===0) return escapeHtml(text);
    let out = escapeHtml(text);
    terms.forEach(t=>{
      const re = new RegExp('('+escapeRegExp(t)+')','ig');
      out = out.replace(re,'<mark>$1</mark>');
    });
    return out;
  }

  function escapeHtml(s){
    return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&'); }

  function render(list, terms){
    if(!list || list.length===0) return results.innerHTML = '<p>No results found.</p>';
    results.innerHTML = list.map(item=>{
      const title = escapeHtml(item.title);
      const path = item.path;
      const snippet = item.content.length>200 ? item.content.substring(0,200)+'...' : item.content;
      const snippetHtml = highlight(snippet, terms);
      const img = path.replace(/\.id\.html|\.html$/,'').replace(/\./g,'') ;
      return `<article style="margin-bottom:1rem;padding:1rem;border-radius:8px;background:white;display:flex;gap:1rem;align-items:flex-start"><img src="assets/placeholder-${img}.svg" alt="Illustration for ${title}" width="96" height="72" style="flex:0 0 96px;border-radius:6px;border:1px solid #e6eefc"><div><h3><a href="${path}">${title}</a></h3><p style="color:#6b7280">${snippetHtml}</p></div></article>`;
    }).join('');
  }

  // debounce helper
  function debounce(fn, delay){
    let t = null; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), delay); }
  }

  const onInput = debounce(function(e){
    const q = (e.target.value||'').trim();
    if(!q){
      results.innerHTML = '<p>Type to search tutorials.</p>';
      return;
    }
    const terms = q.split(/\s+/).filter(Boolean);
    if(fuse){
      const f = fuse.search(q, {limit: 10}).map(r=>r.item);
      render(f, terms);
    } else {
      // fallback simple substring match
      const ql = q.toLowerCase();
      const matches = index.filter(p=> (p.title+p.content).toLowerCase().includes(ql));
      render(matches.slice(0,10), terms);
    }
  }, 250);

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter') e.preventDefault();
  });

  // initial state
  results.innerHTML = '<p>Type to search tutorials.</p>';
});
