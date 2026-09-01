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

// ---- Shared helpers: load/save the site's editable content. Lives in
// Firebase (instant, live for every visitor) when firebase-config.js is set
// up; falls back to the static content.json file otherwise. ----
function ynLoadContent(){
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

// ---- Public site: load content, wire reactions, comments, visit log ----
(function(){
  const isEditMode = new URLSearchParams(location.search).get('edit') === '1'
    && localStorage.getItem('yn_admin_authed') === '1';

  ynLoadContent().then(data=> ynApplyContent(data));

  // Visit log — coarse, non-personal info only (time, device type, referrer).
  // No names, no IP, nothing that identifies a specific person — just so you
  // know roughly how many people are visiting and when. Skipped while you're
  // in edit mode so your own visits don't get counted.
  if(typeof window.db !== 'undefined' && !isEditMode){
    const ua = navigator.userAgent || '';
    const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
    let browser = 'other';
    if(ua.includes('Edg/')) browser = 'Edge';
    else if(ua.includes('Chrome/')) browser = 'Chrome';
    else if(ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    else if(ua.includes('Firefox/')) browser = 'Firefox';
    let refHost = 'مباشر';
    try{ if(document.referrer) refHost = new URL(document.referrer).hostname; }catch(e){}
    window.db.ref('visits').push({
      ts: Date.now(),
      device,
      browser,
      ref: refHost
    }).catch(()=>{});
  }

  // Reactions — shared live count across every visitor (needs firebase-config.js;
  // falls back to a per-device counter automatically if it isn't set up yet)
  document.querySelectorAll('.reaction-btn').forEach(btn=>{
    const emoji = btn.dataset.emoji;
    const countEl = btn.querySelector('.reaction-count');
    if(typeof window.db !== 'undefined'){
      const ref = window.db.ref('reactions/' + emoji);
      ref.on('value', snap=>{ countEl.textContent = snap.val() || 0; });
      btn.addEventListener('click', ()=>{
        ref.transaction(current => (current || 0) + 1);
        btn.classList.add('bump');
        setTimeout(()=>btn.classList.remove('bump'), 250);
      });
    } else {
      const key = 'yn_reaction_' + emoji;
      countEl.textContent = localStorage.getItem(key) || 0;
      btn.addEventListener('click', ()=>{
        const next = (parseInt(localStorage.getItem(key) || '0', 10)) + 1;
        localStorage.setItem(key, next);
        countEl.textContent = next;
        btn.classList.add('bump');
        setTimeout(()=>btn.classList.remove('bump'), 250);
      });
    }
  });

  // Public comments — visible to every visitor, and Youssef can reply from
  // the admin panel (needs firebase-config.js to actually be shared/public)
  const msgForm = document.getElementById('msgForm');
  const commentsWrap = document.getElementById('commentsWrap');

  function renderComments(items){
    if(!commentsWrap) return;
    if(!items.length){
      commentsWrap.innerHTML = '<div class="msg-empty">لسه مفيش تعليقات — كن أول واحد يعلّق 👋</div>';
      return;
    }
    commentsWrap.innerHTML = '';
    items.forEach(c=>{
      const div = document.createElement('div');
      div.className = 'comment-item';
      const date = c.ts ? new Date(c.ts).toLocaleString('ar-EG') : '';
      div.innerHTML = `
        <div class="mi-top">
          <span class="mi-name">${ynEscapeHtml(c.name || 'بدون اسم')}</span>
          <span class="mi-time">${date}</span>
        </div>
        <div class="mi-text">${ynEscapeHtml(c.text || '')}</div>
        ${c.reply ? `<div class="comment-reply"><span class="cr-tag">رد يوسف:</span> ${ynEscapeHtml(c.reply)}</div>` : ''}
      `;
      commentsWrap.appendChild(div);
    });
  }

  if(typeof window.db !== 'undefined'){
    window.db.ref('comments').on('value', snap=>{
      const val = snap.val();
      const items = val ? Object.values(val).sort((a,b)=> (b.ts||0) - (a.ts||0)) : [];
      renderComments(items);
    });
  } else if(commentsWrap){
    commentsWrap.innerHTML = '<div class="msg-empty">التعليقات مش شغالة لسه — لازم إعداد firebase-config.js الأول.</div>';
  }

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
        statusEl.textContent = 'من فضلك اكتب اسمك وتعليقك.';
        return;
      }
      if(typeof window.db === 'undefined'){
        statusEl.className = 'msg-status err';
        statusEl.textContent = 'التعليقات مش شغالة لسه — لازم إعداد firebase-config.js الأول.';
        return;
      }
      const submitBtn = document.getElementById('msgSubmit');
      submitBtn.disabled = true;
      window.db.ref('comments').push({ name, text, ts: Date.now() })
        .then(()=>{
          statusEl.className = 'msg-status ok';
          statusEl.textContent = 'اتنشر تعليقك بنجاح، شكرًا ليك ✓';
          msgForm.reset();
        })
        .catch(()=>{
          statusEl.className = 'msg-status err';
          statusEl.textContent = 'حصل خطأ، جرب تاني.';
        })
        .finally(()=>{ submitBtn.disabled = false; });
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
    <button class="primary" id="saveAllBtn">💾 حفظ (يظهر فورًا)</button>
    <button id="logoutBtn">🚪 خروج</button>
  `;
  document.body.appendChild(toolbar);

  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  document.body.appendChild(toast);
  function showToast(){
    toast.textContent = (typeof window.db !== 'undefined')
      ? 'اتحفظ وظهر لكل الزوار فورًا ✓'
      : 'اتحفظ محليًا — نزل content.json وارفعه على GitHub ✓';
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
    const data = {};
    document.querySelectorAll('[data-edit]').forEach(el=>{
      data[el.dataset.edit] = el.innerHTML.trim();
    });
    if(pendingPhoto) data.photo = pendingPhoto;
    const themeColor = document.getElementById('themeColor').value;
    if(themeColor) data.accentColor = themeColor;
    ynSaveContent(data).then(showToast).catch(err=>{
      alert('حصل خطأ في الحفظ: ' + err.message);
    });
  });
})();


