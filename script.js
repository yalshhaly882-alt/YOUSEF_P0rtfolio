// Typing effect
  const fullText = "welcome.sh --lang=ar\n> جاري تجهيز البورتفوليو الخاص بيوسف... ✨";
  const typedEl = document.getElementById('typed');
  const barFill = document.getElementById('barFill');
  const barLabel = document.getElementById('barLabel');
  const splash = document.getElementById('splash');
  let i = 0;

  function typeChar(){
    if(i < fullText.length){
      typedEl.textContent += fullText.charAt(i);
      i++;
      setTimeout(typeChar, 22);
    } else {
      setTimeout(()=>{
        barFill.style.width = "100%";
        barLabel.textContent = "تم التحميل بنجاح ✓";
      }, 200);
      setTimeout(()=>{
        document.getElementById('termBox').classList.add('fade-out');
      }, 900);
      setTimeout(()=>{
        document.getElementById('welcomeReveal').classList.add('show');
      }, 1300);
      setTimeout(()=>{
        splash.classList.add('hide');
        document.body.style.overflow = 'auto';
        document.getElementById('tg-badge').classList.add('show');
      }, 2900);
    }
  }
  document.body.style.overflow = 'hidden';
  setTimeout(typeChar, 350);

  // Reveal on scroll — runs first and independently, so a failure anywhere
  // below (e.g. the map library not loading) can never hide page content.
  document.documentElement.classList.add('js');
  const revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.15});
    revealEls.forEach(el=>io.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in'));
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  // Interactive map (Leaflet + OpenStreetMap). The styled fallback above is
  // visible by default, so whether this succeeds or not, the section always
  // looks intentional — this just upgrades it to a live map when it can.
  try {
    const lat = 30.512327, lng = 30.911938;
    const map = L.map('map', { scrollWheelZoom:false }).setView([lat, lng], 15);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:'&copy; OpenStreetMap contributors',
      maxZoom:19
    }).addTo(map);
    const pinIcon = L.divIcon({
      className:'', iconSize:[26,26], iconAnchor:[13,26],
      html:'<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#7c6ff0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.5);"></div>'
    });
    L.marker([lat, lng], { icon:pinIcon }).addTo(map)
      .bindPopup('يوسف ناصر — قرية تتا وغمرين، مركز منوف، المنوفية')
      .openPopup();
    map.on('focus', ()=> map.scrollWheelZoom.enable());
    map.on('blur', ()=> map.scrollWheelZoom.disable());

    let tileLoaded = false;
    tiles.on('load', ()=>{
      tileLoaded = true;
      const fb = document.getElementById('mapFallback');
      if(fb) fb.style.display = 'none';
    });
    // If tiles haven't actually loaded shortly after init (e.g. the network
    // request itself is blocked without throwing a JS error), keep the
    // styled fallback visible instead of an empty map box.
    setTimeout(()=>{
      if(!tileLoaded){
        const mapEl = document.getElementById('map');
        if(mapEl) mapEl.style.visibility = 'hidden';
      }
    }, 3500);
  } catch(err) {
    const mapEl = document.getElementById('map');
    if(mapEl) mapEl.style.visibility = 'hidden';
  }

// ---- Shared helpers: load/save the site's editable content (no backend —
// just a local JSON file you re-upload after editing) ----
const YN_CONTENT_KEY = 'yn_content';

function ynLoadContent(){
  return fetch('content.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : {})
    .catch(()=> ({}));
}

function ynApplyContent(data){
  document.querySelectorAll('[data-edit]').forEach(el=>{
    const key = el.dataset.edit;
    if(data[key] !== undefined && data[key] !== '') el.innerHTML = data[key];
  });
  if(data.photo){
    const img = document.getElementById('profilePhoto');
    if(img) img.src = data.photo;
  }
  if(data.accentColor){
    document.documentElement.style.setProperty('--violet', data.accentColor);
  }
  if(data.socials) ynRenderSocialIcons(data.socials);
  if(data.tracks && data.tracks.length) ynRenderTracks(data.tracks);
}

function ynRenderSocialIcons(socials){
  ['instagram','facebook','tiktok'].forEach(platform=>{
    const url = socials[platform];
    const el = document.getElementById('social-' + platform);
    if(el && url){
      el.href = url;
      el.style.display = 'flex';
    }
  });
}

function ynRenderTracks(tracks){
  const wrap = document.getElementById('tracksWrap');
  if(!wrap) return;
  wrap.innerHTML = '';
  tracks.forEach(t=>{
    const card = document.createElement('div');
    card.className = 'track-card';
    const ytId = ynGetYouTubeId(t.url);
    if(ytId){
      card.innerHTML = `
        <div class="track-title">${ynEscapeHtml(t.title || '')}</div>
        <div class="yt-embed">
          <iframe src="https://www.youtube.com/embed/${ytId}" title="${ynEscapeHtml(t.title || '')}"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="track-title">${ynEscapeHtml(t.title || '')}</div>
        <audio controls src="${t.url}" style="width:100%;"></audio>
      `;
    }
    wrap.appendChild(card);
  });
}

function ynGetYouTubeId(url){
  if(!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function ynEscapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
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

// ---- Public site: load content, wire reactions (per-device only), wire the
// message form (opens Telegram with the message pre-filled) ----
(function(){
  const isEditMode = new URLSearchParams(location.search).get('edit') === '1'
    && localStorage.getItem('yn_admin_authed') === '1';

  // In edit mode we start from the last locally-saved draft (if any) so you
  // keep editing where you left off; regular visitors always get the file
  // that's actually published on the site.
  const saved = localStorage.getItem(YN_CONTENT_KEY);
  const localData = saved ? JSON.parse(saved) : null;

  if(isEditMode && localData){
    ynApplyContent(localData);
  } else {
    ynLoadContent().then(data=>{
      ynApplyContent(data);
      if(isEditMode) localStorage.setItem(YN_CONTENT_KEY, JSON.stringify(data));
    });
  }

  // Reactions — fun per-visitor counter stored on this browser only (no
  // shared backend, so it can't be a live count across every visitor)
  document.querySelectorAll('.reaction-btn').forEach(btn=>{
    const emoji = btn.dataset.emoji;
    const key = 'yn_reaction_' + emoji;
    const countEl = btn.querySelector('.reaction-count');
    countEl.textContent = localStorage.getItem(key) || 0;
    btn.addEventListener('click', ()=>{
      const next = (parseInt(localStorage.getItem(key) || '0', 10)) + 1;
      localStorage.setItem(key, next);
      countEl.textContent = next;
      btn.classList.add('bump');
      setTimeout(()=>btn.classList.remove('bump'), 250);
    });
  });

  // Message form — opens Telegram with the message ready to send to
  // @elshahaly9 (no backend needed; the visitor just taps send in Telegram)
  const msgForm = document.getElementById('msgForm');
  if(msgForm){
    msgForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nameEl = document.getElementById('msgName');
      const textEl = document.getElementById('msgText');
      const statusEl = document.getElementById('msgStatus');
      const name = nameEl.value.trim();
      const text = textEl.value.trim();
      if(!name || !text){
        statusEl.className = 'msg-status err';
        statusEl.textContent = 'من فضلك اكتب اسمك ورسالتك.';
        return;
      }
      const tgText = 'رسالة من الموقع 👋\nالاسم: ' + name + '\nالرسالة: ' + text;
      window.open('https://t.me/elshahaly9?text=' + encodeURIComponent(tgText), '_blank');
      statusEl.className = 'msg-status ok';
      statusEl.textContent = 'هيفتحلك تليجرام — دوس "إرسال" هناك عشان رسالتك توصلني ✓';
      msgForm.reset();
    });
  }
})();

// ---- Admin edit mode (only active after logging in from admin.html) ----
(function(){
  const params = new URLSearchParams(location.search);
  if(params.get('edit') !== '1') return;
  if(localStorage.getItem('yn_admin_authed') !== '1') return;
  document.body.classList.add('admin-mode');

  document.querySelectorAll('[data-edit]').forEach(el=>{
    el.setAttribute('contenteditable', 'true');
  });

  const photoBtn = document.getElementById('photoEditBtn');
  const photoInput = document.getElementById('photoInput');
  let pendingPhoto = null;
  if(photoBtn && photoInput){
    photoBtn.addEventListener('click', ()=> photoInput.click());
    photoInput.addEventListener('change', ()=>{
      const file = photoInput.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        pendingPhoto = reader.result;
        document.getElementById('profilePhoto').src = pendingPhoto;
      };
      reader.readAsDataURL(file);
    });
  }

  // Floating toolbar: bold / accent color / heading-style / save / logout
  const toolbar = document.createElement('div');
  toolbar.id = 'admin-toolbar';
  toolbar.innerHTML = `
    <button data-cmd="bold" title="عريض"><b>B</b></button>
    <button data-cmd="accent" title="لوّن النص المحدد">🎨</button>
    <button data-cmd="heading" title="حوّل لعنوان">H</button>
    <input type="color" id="themeColor" title="لون الموقع الأساسي" value="#7c6ff0">
    <button class="primary" id="saveAllBtn">💾 احفظ ونزّل الملف</button>
    <button id="logoutBtn">🚪 خروج</button>
  `;
  document.body.appendChild(toolbar);

  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  toast.textContent = 'اتحفظ محليًا — نزل content.json وارفعه على GitHub ✓';
  document.body.appendChild(toast);
  function showToast(){
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 3200);
  }

  toolbar.querySelectorAll('button[data-cmd]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cmd = btn.dataset.cmd;
      if(cmd === 'bold'){
        document.execCommand('bold');
      } else if(cmd === 'accent'){
        wrapSelection('accent');
      } else if(cmd === 'heading'){
        wrapSelection('inline-heading');
      }
    });
  });

  function wrapSelection(className){
    const sel = window.getSelection();
    if(!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.className = className;
    range.surroundContents(span);
    sel.removeAllRanges();
  }

  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    localStorage.removeItem('yn_admin_authed');
    location.href = 'admin.html';
  });

  document.getElementById('saveAllBtn').addEventListener('click', ()=>{
    const existing = localStorage.getItem(YN_CONTENT_KEY);
    const data = existing ? JSON.parse(existing) : {};
    document.querySelectorAll('[data-edit]').forEach(el=>{
      data[el.dataset.edit] = el.innerHTML.trim();
    });
    if(pendingPhoto) data.photo = pendingPhoto;
    const themeColor = document.getElementById('themeColor').value;
    if(themeColor) data.accentColor = themeColor;
    localStorage.setItem(YN_CONTENT_KEY, JSON.stringify(data));
    ynDownloadContent(data);
    showToast();
  });
})();


