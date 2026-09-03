(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover:none)').matches;
  var NAV_BREAK = 900;          /* must match the CSS burger breakpoint */

  /* ---------- navigation ---------- */
  var burger = document.getElementById('burger'),
      links  = document.getElementById('navLinks'),
      header = document.getElementById('header');

  function closeMenu(){
    links.classList.remove('show');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function(e){
    e.stopPropagation();
    var open = links.classList.toggle('show');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){ closeMenu(); }
  });
  /* tapping anywhere outside the panel closes it */
  document.addEventListener('click', function(e){
    if(!links.classList.contains('show')) return;
    if(links.contains(e.target) || burger.contains(e.target)) return;
    closeMenu();
  });
  window.addEventListener('scroll', function(){
    header.classList.toggle('small', window.scrollY > 40);
  });
  /* rotating the phone or resizing past the breakpoint must not
     leave the mobile panel stuck open */
  window.addEventListener('resize', function(){
    if(window.innerWidth > NAV_BREAK && links.classList.contains('show')) closeMenu();
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
  /* on phones the count and the link distance are cut down, so the
     effect looks the same but the battery and frame rate survive */
  var cv = document.getElementById('particles'), ctx = cv.getContext('2d');
  var parts = [], W, H, LINK = 15000, mouse = {x:-999, y:-999};
  function sizeCanvas(){
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    var small = W < 760;
    LINK = small ? 8000 : 15000;
    var count = small ? Math.min(34, Math.round(W / 20)) : Math.min(90, Math.round(W / 16));
    parts = [];
    for(var i = 0; i < count; i++){
      parts.push({x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+.4,
                  vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28});
    }
  }
  sizeCanvas();
  /* only rebuild when the width really changes — mobile browsers fire
     resize every time the address bar hides */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function(){
    if(Math.abs(window.innerWidth - lastW) < 40 && W === window.innerWidth) return;
    lastW = window.innerWidth;
    sizeCanvas();
  });
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
        if(d < LINK){
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = 'rgba(63,232,255,' + (.12 * (1 - d/LINK)) + ')';
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
      /* react to the cursor (pointer devices only) */
      if(!isTouch){
        var mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = mdx*mdx + mdy*mdy;
        if(md < 20000){
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mouse.x,mouse.y);
          ctx.strokeStyle = 'rgba(139,108,255,' + (.22 * (1 - md/20000)) + ')'; ctx.stroke();
        }
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
    /* lighter pixel ratio on phones keeps the hero smooth */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 2));

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshBasicMaterial({color:0x3fe8ff, wireframe:true, transparent:true, opacity:.55})
    );
    var shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.05, 0),
      new THREE.MeshBasicMaterial({color:0x8b6cff, wireframe:true, transparent:true, opacity:.28})
    );
    scene.add(core); scene.add(shell);

    /* ---- skill labels orbiting inside the sphere ---- */
    var SKILLS = ['Java','Android','Kotlin','Firebase','SQLite','XML','REST API',
                  'HTML5','CSS3','JavaScript','PHP','WordPress','WooCommerce',
                  'Python','Figma','Git'];
    var ACCENTS = ['#3fe8ff','#8b6cff','#e8eefb'];
    var R_SKILL = 1.58;

    function skillSprite(text, color){
      var fs = 46, pad = 20, dpr = Math.min(window.devicePixelRatio, 2);
      var cv2 = document.createElement('canvas'), g = cv2.getContext('2d');
      var font = '600 ' + fs + 'px "Space Grotesk", system-ui, sans-serif';
      g.font = font;
      var w = Math.ceil(g.measureText(text).width) + pad * 2, hh = fs + pad * 2;
      cv2.width = w * dpr; cv2.height = hh * dpr;
      g = cv2.getContext('2d');
      g.scale(dpr, dpr);
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = color; g.shadowBlur = 16;
      g.fillStyle = color;
      g.fillText(text, w / 2, hh / 2);

      var tex = new THREE.CanvasTexture(cv2);
      tex.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false
      }));
      var unit = 0.0016;                 /* canvas px -> world units */
      sp.scale.set(w * unit, hh * unit, 1);
      return sp;
    }

    var skillGroup = new THREE.Group();
    SKILLS.forEach(function(name, i){
      var sp = skillSprite(name, ACCENTS[i % ACCENTS.length]);
      /* even spread over a sphere (fibonacci placement) */
      var t = (i + 0.5) / SKILLS.length;
      var phi = Math.acos(1 - 2 * t), theta = Math.PI * (1 + Math.sqrt(5)) * i;
      sp.position.set(R_SKILL * Math.sin(phi) * Math.cos(theta),
                      R_SKILL * Math.cos(phi),
                      R_SKILL * Math.sin(phi) * Math.sin(theta));
      skillGroup.add(sp);
    });
    scene.add(skillGroup);
    var wp = new THREE.Vector3();

    /* star dust inside the stage */
    var geo = new THREE.BufferGeometry(), pts = [];
    var DUST = window.innerWidth < 760 ? 200 : 420;
    for(var s = 0; s < DUST; s++){
      var rr = 2.6 + Math.random() * 1.9, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pts.push(rr*Math.sin(ph)*Math.cos(th), rr*Math.sin(ph)*Math.sin(th), rr*Math.cos(ph));
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    var dust = new THREE.Points(geo, new THREE.PointsMaterial({color:0x9fd8ff, size:.028, transparent:true, opacity:.8}));
    scene.add(dust);

    function resize3d(){
      var w = stage.clientWidth, h = stage.clientHeight;
      if(!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize3d();
    window.addEventListener('resize', resize3d);
    window.addEventListener('orientationchange', function(){ setTimeout(resize3d, 250); });

    var tx = 0, ty = 0;
    window.addEventListener('mousemove', function(e){
      tx = (e.clientX / window.innerWidth  - .5);
      ty = (e.clientY / window.innerHeight - .5);
    });

    /* stop rendering once the hero has scrolled away — saves a lot of
       battery on phones, where the canvas would otherwise run forever */
    var heroVisible = true;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(entries){
        heroVisible = entries[0].isIntersecting;
      }, {threshold:0}).observe(stage);
    }

    (function render(){
      requestAnimationFrame(render);
      if(!heroVisible) return;
      core.rotation.y  += .0035; core.rotation.x  += .0016;
      shell.rotation.y -= .0022; shell.rotation.z += .0012;
      dust.rotation.y  += .0006;
      /* skill cloud turns the other way; labels at the back fade out */
      skillGroup.rotation.y += .0024;
      skillGroup.children.forEach(function(sp){
        sp.getWorldPosition(wp);
        sp.material.opacity = .18 + ((wp.z + R_SKILL) / (2 * R_SKILL)) * .82;
      });
      /* ease the whole group toward the pointer */
      camera.position.x += (tx * 1.1 - camera.position.x) * .05;
      camera.position.y += (-ty * 1.1 - camera.position.y) * .05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
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
    v.setAttribute('playsinline','');       /* iOS: play in place, not fullscreen */
    v.setAttribute('webkit-playsinline','');
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

  var group = [], index = 0, lastFocus = null, scrollY = 0;

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
    /* iOS keeps scrolling the page behind an overlay unless it is pinned */
    scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = -scrollY + 'px';
    document.body.style.width = '100%';
    document.getElementById('lbClose').focus();
  }

  function close(){
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
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

  /* swipe left / right between screenshots on touch screens */
  var sx = 0, sy = 0;
  lb.addEventListener('touchstart', function(e){
    sx = e.changedTouches[0].clientX;
    sy = e.changedTouches[0].clientY;
  }, {passive:true});
  lb.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - sx,
        dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? index + 1 : index - 1);
    else if(dy > 90 && Math.abs(dy) > Math.abs(dx)) close();   /* swipe down to close */
  }, {passive:true});
})();