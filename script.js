(function(){
  const engines = {
    virgil: 'https://virgil.samidy.com/Games/?q=',
    playseek: 'https://playseek.app/search?q=',
    google: 'https://www.google.com/search?q='
  };
  let selectedEngine = localStorage.getItem('sp_selectedEngine') || 'virgil';

  const input = document.getElementById('searchInput');
  const form = document.getElementById('searchForm');
  const engineButtons = document.querySelectorAll('.engine');

  function setActive(id, persist = true){
    selectedEngine = id;
    engineButtons.forEach(b => b.classList.toggle('active', b.dataset.id === id));
    if(persist) localStorage.setItem('sp_selectedEngine', id);
  }

  engineButtons.forEach(btn => {
    btn.addEventListener('click', () => setActive(btn.dataset.id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if(!q) return;
    if(selectedEngine === 'chatgpt'){
      const chatUrl = 'https://chat.openai.com/?prompt=' + encodeURIComponent(q);
      window.open(chatUrl, '_blank');
      return;
    }
    const base = engines[selectedEngine] || engines.google;
    const url = base + encodeURIComponent(q);
    window.open(url, '_blank');
  });

  window.addEventListener('keydown', e => {
    if(e.key === '/'){
      input.focus();
      e.preventDefault();
      return;
    }
  });

  const DEFAULT_BOOKMARKS = [
    {title:'Hacker News', url:'https://news.ycombinator.com', chord:'H N'},
    {title:'GitHub', url:'https://github.com', chord:'G H'},
    {title:'Reddit', url:'https://reddit.com', chord:'R D'},
    {title:'Twitter', url:'https://twitter.com', chord:'T W'},
    {title:'YouTube', url:'https://www.youtube.com', chord:'Y T'},
    {title:'Wikipedia', url:'https://wikipedia.org', chord:'W K'}
  ];

  let bookmarksData = JSON.parse(localStorage.getItem('sp_bookmarks') || 'null') || DEFAULT_BOOKMARKS.slice();

  const bookmarksEl = document.getElementById('bookmarks');
  const btnAdd = document.getElementById('btnAdd');
  const btnSettings = document.getElementById('btnSettings');

  function renderBookmarks(){
    bookmarksEl.innerHTML = '';
    bookmarksData.forEach((bm, idx) => {
      const a = document.createElement('a');
      a.href = bm.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.dataset.chord = bm.chord || '';
      const fav = document.createElement('img');
      fav.className = 'favicon';
      try{
        const u = new URL(bm.url);
        fav.src = 'https://www.google.com/s2/favicons?sz=64&domain_url=' + encodeURIComponent(u.origin);
      }catch(err){ fav.src = ''; }
      const title = document.createElement('span');
      title.innerHTML = escapeHtml(bm.title);
      const small = document.createElement('small');
      small.textContent = bm.chord || '';
      a.appendChild(fav);
      a.appendChild(title);
      a.appendChild(small);
      a.addEventListener('click', e => {
      });
      a.addEventListener('contextmenu', e => {
        e.preventDefault();
        openEditModal(idx);
      });
      a.addEventListener('dblclick', e => {
        e.preventDefault();
        openEditModal(idx);
      });
      bookmarksEl.appendChild(a);
    });
  }

  function saveBookmarks(){
    localStorage.setItem('sp_bookmarks', JSON.stringify(bookmarksData));
    renderBookmarks();
  }

  function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  let modal = document.getElementById('modal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <h4 id="modalTitle">Add / Edit bookmark</h4>
      <form id="bookmarkForm">
        <label>Title<br><input id="bmTitle" required /></label>
        <label>URL<br><input id="bmUrl" required placeholder="https://example.com" /></label>
        <label>Chord (np. H N)<br><input id="bmChord" placeholder="H N" /></label>
        <div class="modal-actions">
          <button type="submit">Save</button>
          <button type="button" id="btnCancel">Cancel</button>
          <button type="button" id="btnDelete" class="danger">Delete</button>
        </div>
      </form>
    </div>`;
    document.body.appendChild(modal);
  }

  const bookmarkForm = document.getElementById('bookmarkForm');
  const bmTitle = document.getElementById('bmTitle');
  const bmUrl = document.getElementById('bmUrl');
  const bmChord = document.getElementById('bmChord');
  const btnCancel = document.getElementById('btnCancel');
  const btnDelete = document.getElementById('btnDelete');

  let editingIndex = -1;

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    modal.classList.add('open');
    bmTitle.focus();
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modal.classList.remove('open');
    editingIndex = -1;
    bmTitle.value = '';
    bmUrl.value = '';
    bmChord.value = '';
  }

  function openEditModal(idx){
    editingIndex = idx;
    const bm = bookmarksData[idx];
    bmTitle.value = bm.title;
    bmUrl.value = bm.url;
    bmChord.value = bm.chord || '';
    btnDelete.style.display = 'inline-block';
    openModal();
  }

  btnAdd.addEventListener('click', () => {
    editingIndex = -1;
    btnDelete.style.display = 'none';
    bmTitle.value = '';
    bmUrl.value = '';
    bmChord.value = '';
    openModal();
  });

  btnCancel.addEventListener('click', closeModal);

  bookmarkForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = bmTitle.value.trim();
    let url = bmUrl.value.trim();
    const chord = bmChord.value.trim().toUpperCase();
    if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
    if(editingIndex >= 0){
      bookmarksData[editingIndex] = {title, url, chord};
    } else {
      bookmarksData.push({title, url, chord});
    }
    saveBookmarks();
    closeModal();
  });

  btnDelete.addEventListener('click', () => {
    if(editingIndex >= 0){
      bookmarksData.splice(editingIndex,1);
      saveBookmarks();
      closeModal();
    }
  });


  function showToast(msg, timeout = 2800){
    let t = document.getElementById('sp_toast');
    if(!t){ t = document.createElement('div'); t.id = 'sp_toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('visible');
    setTimeout(()=> t.classList.remove('visible'), timeout);
  }

  function updateClock(){
    const el = document.getElementById('sp_clock');
    const elTime = document.getElementById('sp_time');
    const elDate = document.getElementById('sp_date');
    if(!elTime || !elDate) return;
    const now = new Date();
    const tf = localStorage.getItem('sp_time_format');
    if(tf === '12'){
      const hh24 = now.getHours();
      const ampm = hh24 < 12 ? 'AM' : 'PM';
      let hh = hh24 % 12; if(hh === 0) hh = 12;
      const mm = String(now.getMinutes()).padStart(2,'0');
      const ss = String(now.getSeconds()).padStart(2,'0');
      elTime.textContent = String(hh).padStart(2,'0') + ':' + mm + ':' + ss + ' ' + ampm;
    } else {
      elTime.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false});
    }
    const weekdays = ['Sunday','Monday','Tuesday','Wenesday','Thursday','Friday','Saturday'];
    const wd = weekdays[now.getDay()];
    elDate.textContent = wd + ', ' + now.toLocaleDateString();
  }
  setInterval(updateClock, 1000);
  updateClock();

  document.addEventListener('click', e => {
    if(e.target && e.target.id === 'sp_time'){
      const now = new Date();
      const weekdays = ['Sunday','Monday','Tuesday','Wenesday','Thursday','Friday','Saturday'];
      const s = weekdays[now.getDay()] + ', ' + now.toLocaleString();
      navigator.clipboard?.writeText(s).then(()=> showToast('Date and hour copied'))
        .catch(()=> showToast('Copy failed'));
    }
  });

  let settingsModal = document.getElementById('settingsModal');
  if(!settingsModal){
    settingsModal = document.createElement('div'); settingsModal.id='settingsModal'; settingsModal.className='modal';
    settingsModal.innerHTML = `<div class="modal-content"><h4>Settings</h4>
      <label>Theme<br><select id="selTheme"><option value="">(Default)</option><option value="dark">dark</option><option value="light">light</option></select></label>
      <label>Time format<br><select id="selTimeFormat"><option value="">(Default)</option><option value="24">24h</option><option value="12">12h</option></select></label>
      <div style="margin-top:10px"><button id="btnSaveSettings">Save</button><button id="btnCloseSettings">Close</button></div></div>`;
    document.body.appendChild(settingsModal);
  }
  const selTheme = document.getElementById('selTheme');
  const selTimeFormat = document.getElementById('selTimeFormat');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  document.getElementById('btnSettings').addEventListener('click', ()=>{
    settingsModal.classList.add('open');
    settingsModal.setAttribute('aria-hidden','false');
    selTheme.value = localStorage.getItem('sp_theme') || '';
    selTimeFormat.value = localStorage.getItem('sp_time_format') || '';
  });
  btnCloseSettings.addEventListener('click', ()=>{ settingsModal.classList.remove('open'); settingsModal.setAttribute('aria-hidden','true'); });
  btnSaveSettings.addEventListener('click', ()=>{
    const v = selTheme.value;
    if(v){ document.documentElement.setAttribute('data-theme', v); localStorage.setItem('sp_theme', v); }
    else { document.documentElement.removeAttribute('data-theme'); localStorage.removeItem('sp_theme'); }
    const tf = selTimeFormat.value;
    if(tf){ localStorage.setItem('sp_time_format', tf); } else { localStorage.removeItem('sp_time_format'); }
    settingsModal.classList.remove('open'); settingsModal.setAttribute('aria-hidden','true');
    showToast('Settings saved');
    updateClock();
  });

  let chordBuffer = '';
  window.addEventListener('keydown', e => {
    if(document.activeElement === input) return;
    if(e.key.length === 1){
      chordBuffer += e.key.toLowerCase();
      setTimeout(()=>{ chordBuffer = '' }, 900);
    }
    const normalized = chordBuffer.replace(/\s+/g,'');
    for(const bm of bookmarksData){
      const bmChord = (bm.chord||'').replace(/\s+/g,'').toLowerCase();
      if(bmChord && normalized.endsWith(bmChord)){
        window.open(bm.url, '_blank');
        chordBuffer = '';
      }
    }
  });

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('sp_theme');
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  setActive(selectedEngine, false);
  renderBookmarks();

  window.__startpage = {bookmarksData, saveBookmarks};
})();
