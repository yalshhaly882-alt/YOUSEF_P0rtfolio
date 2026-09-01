const DEFAULT_PASSWORD = 'youssef2026';

function getPassword(){
  return localStorage.getItem('yn_admin_password') || DEFAULT_PASSWORD;
}

function show(id){
  document.getElementById('loginScreen').style.display = (id === 'login') ? '' : 'none';
  document.getElementById('dashboard').style.display = (id === 'dashboard') ? '' : 'none';
}

// Reads/writes the site's live content. Uses Firebase (instant, shared with
// every visitor) when firebase-config.js is set up; falls back to a local
// content.json download otherwise.
function ynGetContent(){
  if(typeof window.db !== 'undefined'){
    return window.db.ref('content').once('value').then(snap => snap.val() || {});
  }
  return fetch('content.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : {})
    .catch(()=> ({}));
}

function ynSaveContent(data){
  if(typeof window.db !== 'undefined'){
    return window.db.ref('content').update(data);
  }
  ynDownloadContent(data);
  return Promise.resolve();
}

function ynDownloadContent(data){
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

if(localStorage.getItem('yn_admin_authed') === '1'){
  initDashboard();
} else {
  show('login');
}

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('loginPass').addEventListener('keydown', e=>{
  if(e.key === 'Enter') doLogin();
});
function doLogin(){
  const pass = document.getElementById('loginPass').value;
  const err = document.getElementById('loginErr');
  if(pass === getPassword()){
    localStorage.setItem('yn_admin_authed', '1');
    initDashboard();
  } else {
    err.textContent = 'الباسورد غلط، جرب تاني.';
  }
}

document.getElementById('logoutBtn').addEventListener('click', ()=>{
  localStorage.removeItem('yn_admin_authed');
  location.reload();
});

document.getElementById('openEditBtn').addEventListener('click', ()=>{
  location.href = 'index.html?edit=1';
});

document.getElementById('changePassBtn').addEventListener('click', ()=>{
  const cur = document.getElementById('curPass').value;
  const next = document.getElementById('newPass').value;
  const err = document.getElementById('passErr');
  err.textContent = '';
  if(cur !== getPassword()){
    err.textContent = 'الباسورد الحالي غلط.';
    return;
  }
  if(next.length < 6){
    err.textContent = 'الباسورد الجديد لازم 6 حروف/أرقام على الأقل.';
    return;
  }
  localStorage.setItem('yn_admin_password', next);
  err.style.color = 'var(--green)';
  err.textContent = 'اتغيّر بنجاح على الجهاز ده ✓';
  document.getElementById('curPass').value = '';
  document.getElementById('newPass').value = '';
});

// ---- Social media accounts ----
document.getElementById('saveSocialsBtn').addEventListener('click', ()=>{
  const msg = document.getElementById('socialsMsg');
  ynGetContent().then(data=>{
    data.socials = {
      instagram: document.getElementById('socialInstagram').value.trim(),
      facebook: document.getElementById('socialFacebook').value.trim(),
      tiktok: document.getElementById('socialTiktok').value.trim()
    };
    ynSaveContent(data);
    msg.style.color = 'var(--green)';
    msg.textContent = (typeof window.db !== 'undefined')
      ? 'اتحفظ وظهر لكل الزوار فورًا ✓'
      : 'اتحفظ محليًا ونزّل content.json — ارفعه على GitHub عشان يظهر لكل الزوار ✓';
  });
});

function loadSocials(){
  ynGetContent().then(data=>{
    const s = data.socials || {};
    document.getElementById('socialInstagram').value = s.instagram || '';
    document.getElementById('socialFacebook').value = s.facebook || '';
    document.getElementById('socialTiktok').value = s.tiktok || '';
  });
}

// ---- Songs / Quran tracks ----
function loadTracks(){
  ynGetContent().then(data=>{
    renderTrackList(data.tracks || []);
  });
}

function renderTrackList(tracks){
  const wrap = document.getElementById('trackList');
  if(!tracks.length){
    wrap.innerHTML = '<div class="msg-empty">لسه مفيش أغاني مضافة.</div>';
    return;
  }
  wrap.innerHTML = '';
  tracks.forEach((t, idx)=>{
    const div = document.createElement('div');
    div.className = 'track-item';
    div.innerHTML = `
      <span class="ti-title">${escapeHtml(t.title || 'بدون اسم')}</span>
      <button class="mi-del" data-idx="${idx}">🗑️ حذف</button>
    `;
    div.querySelector('.mi-del').addEventListener('click', ()=>{
      ynGetContent().then(data=>{
        data.tracks = (data.tracks || []);
        data.tracks.splice(idx, 1);
        ynSaveContent(data);
        renderTrackList(data.tracks);
      });
    });
    wrap.appendChild(div);
  });
}

document.getElementById('addTrackBtn').addEventListener('click', ()=>{
  const titleEl = document.getElementById('trackTitle');
  const urlEl = document.getElementById('trackUrl');
  const title = titleEl.value.trim();
  const url = urlEl.value.trim();
  if(!title || !url) return;
  ynGetContent().then(data=>{
    data.tracks = data.tracks || [];
    data.tracks.push({ title, url });
    ynSaveContent(data);
    renderTrackList(data.tracks);
    titleEl.value = '';
    urlEl.value = '';
  });
});

function initDashboard(){
  show('dashboard');
  loadSocials();
  loadTracks();
  initReactionsAndComments();
}

// ---- Reactions summary + comments with reply (needs firebase-config.js) ----
const EMOJIS = ['🔥', '👏', '❤️', '🚀', '😍'];

function initReactionsAndComments(){
  const reactWrap = document.getElementById('reactionSummary');
  const commentsWrap = document.getElementById('commentsAdminList');
  const visitsSummary = document.getElementById('visitsSummary');
  const visitsList = document.getElementById('visitsList');

  if(typeof window.db === 'undefined'){
    if(reactWrap) reactWrap.innerHTML = '<div class="msg-empty">محتاج تظبط firebase-config.js الأول عشان ده يشتغل.</div>';
    if(commentsWrap) commentsWrap.innerHTML = '<div class="msg-empty">محتاج تظبط firebase-config.js الأول عشان ده يشتغل.</div>';
    if(visitsSummary) visitsSummary.textContent = '—';
    return;
  }
  const db = window.db;

  if(visitsSummary && visitsList){
    db.ref('visits').on('value', snap=>{
      const val = snap.val();
      const items = val ? Object.values(val).sort((a,b)=> (b.ts||0) - (a.ts||0)) : [];
      visitsSummary.textContent = items.length + ' زيارة';
      if(!items.length){
        visitsList.innerHTML = '<div class="msg-empty">لسه مفيش زيارات مسجّلة.</div>';
        return;
      }
      visitsList.innerHTML = '';
      items.slice(0, 50).forEach(v=>{
        const row = document.createElement('div');
        row.className = 'admin-comment-item';
        const date = v.ts ? new Date(v.ts).toLocaleString('ar-EG') : '';
        row.innerHTML = `
          <div class="mi-top">
            <span class="mi-name">${v.device === 'mobile' ? '📱' : '💻'} ${escapeHtml(v.browser || '')}</span>
            <span class="mi-time">${date}</span>
          </div>
          <div class="mi-text" style="font-size:12.5px; color:var(--muted);">من: ${escapeHtml(v.ref || 'مباشر')}</div>
        `;
        visitsList.appendChild(row);
      });
    });
  }

  if(reactWrap){
    reactWrap.innerHTML = '';
    EMOJIS.forEach(emoji=>{
      const box = document.createElement('div');
      box.className = 'reaction-btn';
      box.style.cursor = 'default';
      box.innerHTML = `<span class="e">${emoji}</span><span class="reaction-count" id="count-${emoji}">0</span>`;
      reactWrap.appendChild(box);
      db.ref('reactions/' + emoji).on('value', snap=>{
        document.getElementById('count-' + emoji).textContent = snap.val() || 0;
      });
    });
  }

  if(commentsWrap){
    db.ref('comments').on('value', snap=>{
      const val = snap.val();
      if(!val){
        commentsWrap.innerHTML = '<div class="msg-empty">لسه مفيش تعليقات.</div>';
        return;
      }
      const items = Object.entries(val).sort((a,b)=> (b[1].ts||0) - (a[1].ts||0));
      commentsWrap.innerHTML = '';
      items.forEach(([key, c])=>{
        const div = document.createElement('div');
        div.className = 'admin-comment-item';
        const date = c.ts ? new Date(c.ts).toLocaleString('ar-EG') : '';
        div.innerHTML = `
          <div class="mi-top">
            <span class="mi-name">${escapeHtml(c.name || 'بدون اسم')}</span>
            <span class="mi-time">${date}</span>
          </div>
          <div class="mi-text">${escapeHtml(c.text || '')}</div>
          ${c.reply ? `<div class="existing-reply">✅ ردك: ${escapeHtml(c.reply)}</div>` : ''}
          <div class="reply-row">
            <input type="text" placeholder="اكتب ردك هنا..." class="reply-input" value="${c.reply ? escapeHtml(c.reply) : ''}">
            <button class="admin-btn reply-btn" style="width:auto; padding:9px 16px;">${c.reply ? 'تحديث الرد' : 'رد'}</button>
            <button class="admin-btn del-comment-btn" style="width:auto; padding:9px 16px; background:var(--red); border-color:var(--red);">🗑️</button>
          </div>
        `;
        div.querySelector('.reply-btn').addEventListener('click', ()=>{
          const text = div.querySelector('.reply-input').value.trim();
          db.ref('comments/' + key + '/reply').set(text);
        });
        div.querySelector('.del-comment-btn').addEventListener('click', ()=>{
          db.ref('comments/' + key).remove();
        });
        commentsWrap.appendChild(div);
      });
    });
  }
}
