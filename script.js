// Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.querySelectorAll('#nav-links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  // Active nav state via IntersectionObserver
  const navAnchors = document.querySelectorAll('a[data-nav]');
  const sections = ['conference','platform','microscribe','ai','sls','ultrasound','about'].map(id => document.getElementById(id));
  const topNavLinks = document.querySelectorAll('nav.nav-links a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        topNavLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, {rootMargin:'-40% 0px -50% 0px'});
  sections.forEach(s => s && io.observe(s));

  // Land directly on the right section when arriving via a QR-coded hash link
  window.addEventListener('load', () => {
    if(location.hash){
      const target = document.querySelector(location.hash);
      if(target) target.scrollIntoView({behavior:'auto', block:'start'});
    }
  });

  // ---------- MEDIA GALLERY ----------
  // Edit this object to add/remove/reorder photos and clips per poster.
  // type: 'image' or 'video'. For video, `thumb` is the grid thumbnail; `src` is the clip itself.
  // `kicker` is an optional small label above the bold `title`.
  const GALLERY = {
    microscribe: [
      { type:'image', src:'images/microscribe-scapula.jpg', title:'Digitised scapula', kicker:'MicroScribe point cloud' },
      { type:'video', src:'videos/coracoid-point-cloud.mp4', thumb:'images/thumbs/coracoid-point-cloud.jpg', title:'Coracoid process', kicker:'Digitising in Rhino' }
    ],
    ai: [
      { type:'image', src:'images/ai-categories-table.jpg', title:'5 Question Categories', kicker:'Reference' },
      { type:'image', src:'images/ai-mod-direct-recall.jpg', title:'Direct Recall', kicker:'Modification example' },
      { type:'image', src:'images/ai-mod-guided-image.jpg', title:'Guided Image Identification', kicker:'Modification example' },
      { type:'image', src:'images/ai-mod-image-reasoning.jpg', title:'Image + Applied Reasoning', kicker:'Modification example' },
      { type:'image', src:'images/ai-mod-multi-text.jpg', title:'Multi-answer (text only)', kicker:'Modification example' },
      { type:'image', src:'images/ai-mod-multi-image.jpg', title:'Multi-answer + Image', kicker:'Modification example' }
    ],
    sls: [
      { type:'image', src:'images/sls-bones-set.jpg', title:'Donor bones', kicker:'Prepared for scanning' },
      { type:'video', src:'videos/leo-scan.mp4', thumb:'images/thumbs/leo-scan.jpg', title:'Artec Leo', kicker:'Scanning process' },
      { type:'video', src:'videos/scanning-foot-process.mp4', thumb:'images/thumbs/scanning-foot-process.jpg', title:'Foot', kicker:'Scanning process' },
      { type:'video', src:'videos/femur-scan-editing.mp4', thumb:'images/thumbs/femur-scan-editing.jpg', title:'Femur scan', kicker:'Cleanup (Artec Spider)' },
      { type:'video', src:'videos/hand-vr.mp4', thumb:'images/thumbs/hand-vr.jpg', title:'Hand model', kicker:'Exploring in VR' }
    ],
    ultrasound: [
      { type:'image', src:'images/ultrasound-device.jpg', title:'Portable probe', kicker:'+ live imaging' }
    ]
  };

  function renderGalleries(){
    document.querySelectorAll('[data-gallery]').forEach(container => {
      const items = GALLERY[container.dataset.gallery] || [];
      if(items.length === 0){
        container.classList.add('empty');
        container.innerHTML = '<div class="gallery-empty-note">Photos and clips for this poster are on the way — check back soon.</div>';
        return;
      }
      container.innerHTML = items.map((item, i) => `
        <div class="gallery-tile" data-gallery-item data-index="${i}" data-group="${container.dataset.gallery}">
          <div class="gt-thumb">
            <img src="${item.type === 'video' ? item.thumb : item.src}" alt="${item.title}" loading="lazy">
            ${item.type === 'video' ? '<div class="gt-play"><span>▶</span></div>' : ''}
          </div>
          <div class="gt-label">
            ${item.kicker ? `<span class="gt-kicker">${item.kicker}</span>` : ''}
            <span class="gt-title">${item.title}</span>
          </div>
        </div>
      `).join('');
    });
    document.querySelectorAll('[data-gallery-item]').forEach(tile => {
      tile.addEventListener('click', () => {
        const group = tile.dataset.group;
        const item = GALLERY[group][parseInt(tile.dataset.index, 10)];
        const caption = item.kicker ? `${item.kicker} — ${item.title}` : item.title;
        openLightbox(item.type, item.src, caption);
      });
    });
  }

  // ---------- LIGHTBOX (poster zoom + gallery playback) ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxCaption = document.getElementById('lightbox-caption');

  function openLightbox(type, src, caption){
    lightboxVideo.pause();
    lightboxImg.classList.remove('active');
    lightboxVideo.classList.remove('active');
    if(type === 'video'){
      lightboxVideo.src = src;
      lightboxVideo.classList.add('active');
      lightboxVideo.play().catch(() => {});
    } else {
      lightboxImg.src = src;
      lightboxImg.classList.add('active');
    }
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
  }

  document.querySelectorAll('[data-zoom]').forEach(img => {
    img.addEventListener('click', () => openLightbox('image', img.src, img.alt));
  });
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });

  renderGalleries();

  // ---------- FEATURED VIDEO EMBEDS ----------
  // To add the platform screen recording, place it in videos/ and set
  // data-platform-video="videos/your-file.mp4" on #platform-demo in index.html.
  const platformDemo = document.getElementById('platform-demo');
  const platformVideoSrc = platformDemo?.dataset.platformVideo?.trim();
  if(platformDemo && platformVideoSrc){
    platformDemo.innerHTML = `<video controls playsinline preload="metadata" aria-label="Interactive anatomy platform screen recording"><source src="${platformVideoSrc}" type="video/mp4">Your browser does not support embedded video.</video>`;
  }

  // For YouTube, paste only the video ID into data-youtube-id on #biceps-video.
  const bicepsVideo = document.getElementById('biceps-video');
  const youtubeId = bicepsVideo?.dataset.youtubeId?.trim();
  if(bicepsVideo && youtubeId){
    bicepsVideo.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}" title="Biceps femoris anatomy video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  // Decorative point-cloud / landmark scan animation in hero
  const canvas = document.getElementById('scan-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, points;
  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function makePoints(){
    const count = Math.max(28, Math.floor((w*h)/26000));
    points = Array.from({length: count}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15
    }));
  }
  function tick(){
    ctx.clearRect(0,0,w,h);
    points.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
    });
    for(let i=0;i<points.length;i++){
      for(let j=i+1;j<points.length;j++){
        const dx = points[i].x-points[j].x, dy = points[i].y-points[j].y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 130){
          ctx.strokeStyle = `rgba(47,216,199,${0.12*(1-dist/130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }
    points.forEach(p => {
      ctx.fillStyle = 'rgba(47,216,199,0.55)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    resize(); makePoints(); tick();
    window.addEventListener('resize', () => { resize(); makePoints(); });
  }
