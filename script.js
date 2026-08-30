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
