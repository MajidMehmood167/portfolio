(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- navigation ---------- */
  var burger = document.getElementById('burger'),
      links  = document.getElementById('navLinks'),
      header = document.getElementById('header');

  burger.addEventListener('click', function(){
    var open = links.classList.toggle('show');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){ links.classList.remove('show'); burger.classList.remove('open'); }
  });
  window.addEventListener('scroll', function(){
    header.classList.toggle('small', window.scrollY > 40);
  });

  /* active link on scroll */
  var navA = Array.prototype.slice.call(links.querySelectorAll('a'));
  var secs = navA.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        navA.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(function(s){ if(s) spy.observe(s); });

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.15});
  document.querySelectorAll('.reveal').forEach(function(el, i){
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  /* ---------- typing role line ---------- */
  var roles = ['Computer Science Graduate | Software Developer',
               'Android Developer — Java, Firebase, SQLite',
               'Web Developer — WordPress, HTML, CSS, JavaScript',
               'Currently learning Kotlin Multiplatform'];
  var el = document.getElementById('typed'), r = 0, c = 0, del = false;
  el.innerHTML = '<span class="txt"></span><span class="caret">&nbsp;</span>';
  var txt = el.querySelector('.txt');
  function type(){
    var word = roles[r];
    c += del ? -1 : 1;
    txt.textContent = word.slice(0, c);
    var wait = del ? 26 : 52;
    if(!del && c === word.length){ del = true; wait = 1900; }
    else if(del && c === 0){ del = false; r = (r + 1) % roles.length; wait = 320; }
    setTimeout(type, wait);
  }
  if(reduced){ txt.textContent = roles[0]; } else { type(); }

  /* ---------- animated counters ---------- */
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var node = en.target, target = +node.dataset.count, start = performance.now();
      function step(now){
        var p = Math.min((now - start) / 1400, 1);
        node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      cio.unobserve(node);
    });
  }, {threshold:.6});
  document.querySelectorAll('[data-count]').forEach(function(n){ cio.observe(n); });

  /* ---------- spotlight on skill cards ---------- */
  document.getElementById('skillsGrid').addEventListener('mousemove', function(e){
    var card = e.target.closest('.skill'); if(!card) return;
    var b = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
    card.style.setProperty('--my', (e.clientY - b.top) + 'px');
  });

  /* ---------- duplicate marquee content for a seamless loop ---------- */
  var track = document.getElementById('mtrack');
  track.innerHTML += track.innerHTML;

  /* ---------- 3D tilt on project cards (desktop only) ---------- */
  if(window.matchMedia('(hover:hover)').matches && !reduced){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var b = card.getBoundingClientRect();
        var rx = ((e.clientY - b.top) / b.height - .5) * -9;
        var ry = ((e.clientX - b.left) / b.width  - .5) * 9;
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });
  }

  /* ---------- particle field ---------- */
  var cv = document.getElementById('particles'), ctx = cv.getContext('2d');
  var parts = [], W, H, mouse = {x:-999, y:-999};
  function sizeCanvas(){
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    var count = Math.min(90, Math.round(W / 16));
    parts = [];
    for(var i = 0; i < count; i++){
      parts.push({x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+.4,
                  vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28});
    }
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  window.addEventListener('mousemove', function(e){ mouse.x = e.clientX; mouse.y = e.clientY; });

  function drawParticles(){
    ctx.clearRect(0,0,W,H);
    for(var i = 0; i < parts.length; i++){
      var p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > W) p.vx *= -1;
      if(p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = 'rgba(140,190,255,.55)'; ctx.fill();
      /* link nearby particles */
      for(var j = i + 1; j < parts.length; j++){
        var q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx*dx + dy*dy;
        if(d < 15000){
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = 'rgba(63,232,255,' + (.12 * (1 - d/15000)) + ')';
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
      /* react to the cursor */
      var mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = mdx*mdx + mdy*mdy;
      if(md < 20000){
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mouse.x,mouse.y);
        ctx.strokeStyle = 'rgba(139,108,255,' + (.22 * (1 - md/20000)) + ')'; ctx.stroke();
      }
    }
    requestAnimationFrame(drawParticles);
  }
  if(!reduced) drawParticles();

  /* ---------- hero 3D object ---------- */
  var stage = document.getElementById('stage'), canvas3d = document.getElementById('three-canvas');
  if(typeof THREE === 'undefined' || reduced){
    stage.setAttribute('data-fallback','1');
    canvas3d.style.display = 'none';
  } else {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
    camera.position.z = 4.2;
    var renderer = new THREE.WebGLRenderer({canvas:canvas3d, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshBasicMaterial({color:0x3fe8ff, wireframe:true, transparent:true, opacity:.55})
    );
    var shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.05, 0),
      new THREE.MeshBasicMaterial({color:0x8b6cff, wireframe:true, transparent:true, opacity:.28})
    );
    scene.add(core); scene.add(shell);

    /* star dust inside the stage */
    var geo = new THREE.BufferGeometry(), pts = [];
    for(var s = 0; s < 420; s++){
      var rr = 2.6 + Math.random() * 1.9, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pts.push(rr*Math.sin(ph)*Math.cos(th), rr*Math.sin(ph)*Math.sin(th), rr*Math.cos(ph));
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    var dust = new THREE.Points(geo, new THREE.PointsMaterial({color:0x9fd8ff, size:.028, transparent:true, opacity:.8}));
    scene.add(dust);

    function resize3d(){
      var w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize3d();
    window.addEventListener('resize', resize3d);

    var tx = 0, ty = 0;
    window.addEventListener('mousemove', function(e){
      tx = (e.clientX / window.innerWidth  - .5);
      ty = (e.clientY / window.innerHeight - .5);
    });

    (function render(){
      core.rotation.y  += .0035; core.rotation.x  += .0016;
      shell.rotation.y -= .0022; shell.rotation.z += .0012;
      dust.rotation.y  += .0006;
      /* ease the whole group toward the pointer */
      camera.position.x += (tx * 1.1 - camera.position.x) * .05;
      camera.position.y += (-ty * 1.1 - camera.position.y) * .05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    })();
  }
})();

/* ============================================================
   PROJECT MEDIA — demo videos + screenshot lightbox
   Added below the original script. Nothing above is modified.
   ============================================================ */
(function(){
  'use strict';

  /* ---------- demo videos ----------
     They autoplay muted and loop (muted is what makes autoplay allowed by
     browsers). They only run while the card is on screen, so the page
     stays light. */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video.media-item'));

  videos.forEach(function(v){
    v.muted = true;              /* required for autoplay */
    v.play().catch(function(){}); /* ignore autoplay rejection on strict browsers */
  });

  if('IntersectionObserver' in window){
    var vio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var v = en.target;
        if(en.isIntersecting){ v.play().catch(function(){}); }
        else { v.pause(); }
      });
    }, {threshold:.25});
    videos.forEach(function(v){ vio.observe(v); });
  }

  /* ---------- screenshot lightbox ---------- */
  var lb    = document.getElementById('lightbox'),
      lbImg = document.getElementById('lbImg'),
      lbCap = document.getElementById('lbCap');
  if(!lb) return;

  var group = [], index = 0, lastFocus = null;

  function show(i){
    if(!group.length) return;
    index = (i + group.length) % group.length;
    var item = group[index];
    lbImg.src = item.getAttribute('data-full');
    lbImg.alt = item.getAttribute('data-cap') || '';
    lbCap.innerHTML = '<b>' + (item.getAttribute('data-cap') || '') + '</b> &nbsp;·&nbsp; ' +
                      (index + 1) + ' / ' + group.length;
  }

  function open(card, item){
    group = Array.prototype.slice.call(card.querySelectorAll('[data-full]'));
    lastFocus = document.activeElement;
    show(group.indexOf(item));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }

  function close(){
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
    if(lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.pcard').forEach(function(card){
    card.querySelectorAll('[data-full]').forEach(function(item){
      item.addEventListener('click', function(e){
        e.preventDefault();
        open(card, item);
      });
    });
  });

  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function(){ show(index - 1); });
  document.getElementById('lbNext').addEventListener('click', function(){ show(index + 1); });
  lb.addEventListener('click', function(e){ if(e.target === lb) close(); });

  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape')     close();
    if(e.key === 'ArrowLeft')  show(index - 1);
    if(e.key === 'ArrowRight') show(index + 1);
  });
})();