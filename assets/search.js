// assets/search.js
// Simple client-side search for the static tutorials site.
// Loads assets/search-index.json and performs a case-insensitive substring match.

document.addEventListener('DOMContentLoaded', function(){
  const input = document.getElementById('site-search');
  const results = document.getElementById('results');
  if(!input) return; // search only present on tutorials page

  let index = null;
  fetch('/howto/assets/search-index.json').then(r=>{
    if(!r.ok) return fetch('/assets/search-index.json');
    return r;
  }).then(r=>r.json()).then(data=>{
    index = data.pages;
  }).catch(()=>{
    console.warn('Could not load search index');
  });

  function renderMatches(q){
    if(!index) return results.innerHTML = '<p>Search index not loaded.</p>';
    const ql = q.trim().toLowerCase();
    if(!ql) return results.innerHTML = '<p>Type to search tutorials.</p>';
    const terms = ql.split(/\s+/).filter(Boolean);
    const matches = index.map(p=>{
      const text = (p.title + ' ' + p.content).toLowerCase();
      let score = 0;
      terms.forEach(t=>{ if(text.includes(t)) score += 1; });
      return {page:p,score}
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);

    if(matches.length===0) return results.innerHTML = '<p>No results found.</p>';

    results.innerHTML = matches.map(m=>{
      const title = m.page.title;
      const path = m.page.path;
      // create a simple snippet
      const idx = m.page.content.toLowerCase().indexOf(terms[0]);
      let snippet = m.page.content.substring(0,140);
      if(idx>=0){
        const start = Math.max(0, idx-40);
        snippet = m.page.content.substring(start, start+180);
        if(start>0) snippet = '...' + snippet;
        if(start+180 < m.page.content.length) snippet = snippet + '...';
      }
      return `<article style="margin-bottom:1rem;padding:1rem;border-radius:8px;background:white"><h3><a href="${path}">${title}</a></h3><p style="color:#6b7280">${snippet}</p></article>`;
    }).join('');
  }

  input.addEventListener('input', (e)=>{
    renderMatches(e.target.value);
  });

  // initial message
  results.innerHTML = '<p>Type to search tutorials.</p>';
});
