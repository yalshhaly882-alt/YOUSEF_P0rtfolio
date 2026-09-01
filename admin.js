const DEFAULT_PASSWORD = 'yousef1411';
const YN_CONTENT_KEY = 'yn_content';

function getPassword(){
  return localStorage.getItem('yn_admin_password') || DEFAULT_PASSWORD;
}

function show(id){
  document.getElementById('loginScreen').style.display = (id === 'login') ? '' : 'none';
  document.getElementById('dashboard').style.display = (id === 'dashboard') ? '' : 'none';
}

// Loads the current published content.json, falling back to whatever is
// saved locally, falling back to empty — this seeds the editor so social
// links / tracks you already added don't disappear between visits.
function ynGetContent(){
  const saved = localStorage.getItem(YN_CONTENT_KEY);
  if(saved) return Promise.resolve(JSON.parse(saved));
  return fetch('content.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : {})
    .catch(()=> ({}));
}

function ynSaveContent(data){
  localStorage.setItem(YN_CONTENT_KEY, JSON.stringify(data));
  ynDownloadContent(data);
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
    msg.textContent = 'اتحفظ محليًا ونزّل content.json — ارفعه على GitHub عشان يظهر لكل الزوار ✓';
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
}
