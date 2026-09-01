const EMOJIS = ['🔥', '👏', '❤️', '🚀', '😍'];

function show(id){
  ['notConfigured','setupScreen','loginScreen','dashboard'].forEach(x=>{
    document.getElementById(x).style.display = (x === id) ? '' : 'none';
  });
}

if(typeof window.db === 'undefined'){
  show('notConfigured');
} else {
  const db = window.db;

  if(localStorage.getItem('yn_admin_authed') === '1'){
    initDashboard();
  } else {
    db.ref('admin/password').once('value').then(snap=>{
      if(!snap.exists()){
        show('setupScreen');
      } else {
        show('loginScreen');
      }
    });
  }

  // ---- First-time setup ----
  document.getElementById('setupBtn')?.addEventListener('click', ()=>{
    const p1 = document.getElementById('setupPass1').value;
    const p2 = document.getElementById('setupPass2').value;
    const err = document.getElementById('setupErr');
    err.textContent = '';
    if(p1.length < 6){ err.textContent = 'الباسورد لازم يكون 6 حروف/أرقام على الأقل.'; return; }
    if(p1 !== p2){ err.textContent = 'الباسوردين مش متطابقين.'; return; }
    db.ref('admin/password').set(p1).then(()=>{
      localStorage.setItem('yn_admin_authed', '1');
      initDashboard();
    }).catch(e=> err.textContent = 'حصل خطأ: ' + e.message);
  });

  // ---- Login ----
  document.getElementById('loginBtn')?.addEventListener('click', doLogin);
  document.getElementById('loginPass')?.addEventListener('keydown', e=>{
    if(e.key === 'Enter') doLogin();
  });
  function doLogin(){
    const pass = document.getElementById('loginPass').value;
    const err = document.getElementById('loginErr');
    err.textContent = '';
    db.ref('admin/password').once('value').then(snap=>{
      if(snap.val() === pass){
        localStorage.setItem('yn_admin_authed', '1');
        initDashboard();
      } else {
        err.textContent = 'الباسورد غلط، جرب تاني.';
      }
    });
  }

  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{
    localStorage.removeItem('yn_admin_authed');
    location.reload();
  });

  document.getElementById('openEditBtn')?.addEventListener('click', ()=>{
    location.href = 'index.html?edit=1';
  });

  // ---- Social media accounts ----
  document.getElementById('saveSocialsBtn')?.addEventListener('click', ()=>{
    const msg = document.getElementById('socialsMsg');
    const socials = {
      instagram: document.getElementById('socialInstagram').value.trim(),
      facebook: document.getElementById('socialFacebook').value.trim(),
      tiktok: document.getElementById('socialTiktok').value.trim()
    };
    db.ref('content/socials').set(socials).then(()=>{
      msg.style.color = 'var(--green)';
      msg.textContent = 'اتحفظ بنجاح ✓ — هيظهر في الموقع على طول.';
    }).catch(e=>{
      msg.style.color = 'var(--red)';
      msg.textContent = 'حصل خطأ: ' + e.message;
    });
  });

  function loadSocials(){
    db.ref('content/socials').once('value').then(snap=>{
      const s = snap.val() || {};
      document.getElementById('socialInstagram').value = s.instagram || '';
      document.getElementById('socialFacebook').value = s.facebook || '';
      document.getElementById('socialTiktok').value = s.tiktok || '';
    });
  }

  // ---- Songs / Quran tracks ----
  let tracks = [];
  function loadTracks(){
    db.ref('content/tracks').once('value').then(snap=>{
      tracks = snap.val() || [];
      renderTrackList();
    });
  }
  function renderTrackList(){
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
        tracks.splice(idx, 1);
        db.ref('content/tracks').set(tracks).then(renderTrackList);
      });
      wrap.appendChild(div);
    });
  }
  document.getElementById('addTrackBtn')?.addEventListener('click', ()=>{
    const titleEl = document.getElementById('trackTitle');
    const urlEl = document.getElementById('trackUrl');
    const title = titleEl.value.trim();
    const url = urlEl.value.trim();
    if(!title || !url) return;
    tracks.push({ title, url });
    db.ref('content/tracks').set(tracks).then(()=>{
      renderTrackList();
      titleEl.value = '';
      urlEl.value = '';
    });
  });

  // ---- Messages inbox ----
  function loadMessages(){
    const list = document.getElementById('msgList');
    db.ref('messages').on('value', snap=>{
      const val = snap.val();
      if(!val){
        list.innerHTML = '<div class="msg-empty">لسه مفيش رسايل.</div>';
        return;
      }
      const items = Object.entries(val).sort((a,b)=> (b[1].ts||0) - (a[1].ts||0));
      list.innerHTML = '';
      items.forEach(([key, m])=>{
        const div = document.createElement('div');
        div.className = 'msg-item';
        const date = m.ts ? new Date(m.ts).toLocaleString('ar-EG') : '';
        div.innerHTML = `
          <div class="mi-top">
            <span class="mi-name">${escapeHtml(m.name || 'بدون اسم')}</span>
            <span class="mi-time">${date}</span>
          </div>
          <div class="mi-text">${escapeHtml(m.text || '')}</div>
          <button class="mi-del" data-key="${key}">🗑️ حذف</button>
        `;
        div.querySelector('.mi-del').addEventListener('click', ()=>{
          db.ref('messages/' + key).remove();
        });
        list.appendChild(div);
      });
    });
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  document.getElementById('changePassBtn')?.addEventListener('click', ()=>{
    const cur = document.getElementById('curPass').value;
    const next = document.getElementById('newPass').value;
    const err = document.getElementById('passErr');
    err.textContent = '';
    if(next.length < 6){ err.textContent = 'الباسورد الجديد لازم 6 حروف/أرقام على الأقل.'; return; }
    db.ref('admin/password').once('value').then(snap=>{
      if(snap.val() !== cur){
        err.textContent = 'الباسورد الحالي غلط.';
        return;
      }
      db.ref('admin/password').set(next).then(()=>{
        err.style.color = 'var(--green)';
        err.textContent = 'اتغيّر بنجاح ✓';
        document.getElementById('curPass').value = '';
        document.getElementById('newPass').value = '';
      });
    });
  });

  function initDashboard(){
    show('dashboard');
    loadSocials();
    loadTracks();
    loadMessages();
    const wrap = document.getElementById('reactionSummary');
    wrap.innerHTML = '';
    EMOJIS.forEach(emoji=>{
      const box = document.createElement('div');
      box.className = 'reaction-btn';
      box.style.cursor = 'default';
      box.innerHTML = `<span class="e">${emoji}</span><span class="reaction-count" id="count-${emoji}">0</span>`;
      wrap.appendChild(box);
      db.ref('reactions/' + emoji).on('value', snap=>{
        document.getElementById('count-' + emoji).textContent = snap.val() || 0;
      });
    });
  }
}
