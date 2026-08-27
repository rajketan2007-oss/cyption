/* ==========================================================================
   CYPTION DIGITAL — Master GSAP & Three.js Responsive Interaction Engine
   Unified Breakpoint System & Progressive Animation Architecture
   ========================================================================== */

const inertiaAvailable = typeof window.InertiaPlugin !== "undefined";
gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin, Flip, TextPlugin, ScrollToPlugin);
if (inertiaAvailable) gsap.registerPlugin(window.InertiaPlugin);

// Single Source of Truth Breakpoints
const BP = { xs: 360, sm: 480, md: 768, lg: 1024, xl: 1280, xxl: 1600 };
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

document.body.style.overflow = "hidden";

// SplitText Alternative: preserves word wrapping so characters never break vertically
function splitChars(element, byWordOnly = false) {
  if (element.dataset.split) return element.querySelectorAll(byWordOnly ? ".word" : ".char");
  element.dataset.split = "true";
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const text = node.textContent;
    const fragment = document.createDocumentFragment();
    const words = text.split(/(\s+)/);

    words.forEach((chunk) => {
      if (/^\s+$/.test(chunk)) {
        fragment.appendChild(document.createTextNode(chunk));
      } else if (chunk.length > 0) {
        const wordSpan = document.createElement("span");
        wordSpan.className = byWordOnly ? "word" : "word-wrap";
        wordSpan.style.display = "inline-block";
        wordSpan.style.whiteSpace = "nowrap";

        if (byWordOnly) {
          wordSpan.textContent = chunk;
        } else {
          [...chunk].forEach((character) => {
            const charSpan = document.createElement("span");
            charSpan.className = "char";
            charSpan.textContent = character;
            charSpan.style.display = "inline-block";
            charSpan.style.willChange = "transform";
            wordSpan.appendChild(charSpan);
          });
        }
        fragment.appendChild(wordSpan);
      }
    });

    node.parentNode.replaceChild(fragment, node);
  });

  return element.querySelectorAll(byWordOnly ? ".word" : ".char");
}

// Live Kolkata Time in Header
function setTime() {
  const el = document.querySelector("#local-time");
  if (el) {
    el.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());
  }
}
setTime();
setInterval(setTime, 1000);

// Raster Logo Transparency Processing
document.querySelectorAll(".brand-logo img").forEach((image) => {
  const makeTransparent = () => {
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), data = pixels.data;
    const darkTone = image.dataset.logoTone === "dark";
    for (let i = 0; i < data.length; i += 4) {
      const luminance = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (luminance < 32) data[i + 3] = 0;
      else if (darkTone && luminance > 210 && Math.abs(data[i] - data[i + 1]) < 18) {
        data[i] = 23; data[i + 1] = 23; data[i + 2] = 23;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    image.src = canvas.toDataURL("image/png");
  };
  image.complete ? makeTransparent() : image.addEventListener("load", makeTransparent, { once: true });
});

// Smooth Scrolling: Lenis (adaptive lerp across input types)
if (!prefersReduced && window.Lenis) {
  const lenis = new Lenis({
    lerp: isTouchDevice ? 0.12 : (window.innerWidth < 1024 ? 0.10 : 0.085),
    smoothWheel: true,
    syncTouch: false
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Preloader Intro Sequence
const loader = gsap.timeline({
  onComplete: () => {
    const pre = document.querySelector(".preloader");
    if (pre) pre.remove();
    document.body.style.overflow = "";
    ScrollTrigger.refresh();
  }
});

loader.fromTo(".pre-logo i", { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.45, stagger: 0.15 })
  .fromTo(".pre-logo span", { yPercent: 110 }, { yPercent: 0, duration: 0.65, ease: "power4.out" }, "<.08")
  .to(".preloader", { yPercent: -100, duration: 0.7, ease: "power4.inOut", delay: 0.35 });

const titleChars = [...document.querySelectorAll(".split-title")].map(el => splitChars(el, window.innerWidth < 1024));
if (titleChars.length > 0) {
  loader.fromTo(titleChars[0], { yPercent: 115, opacity: 0, rotate: window.innerWidth < 1024 ? 0 : 4 }, { yPercent: 0, opacity: 1, rotate: 0, stagger: window.innerWidth < 1024 ? 0.03 : 0.015, duration: 0.8, ease: "power4.out" }, "<.35")
    .from(".hero-copy, .type-line, .eyebrow", { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, "<.35");
}

// Custom Cursor & Magnetic Listeners (Fine Pointer Only)
if (!prefersReduced && hasFinePointer) {
  const dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring"), cursorText = document.querySelector(".cursor-text");
  if (dot && ring) {
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" }), dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power3" }), ringY = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power3" });
    window.addEventListener("pointermove", (e) => { dotX(e.clientX - 3.5); dotY(e.clientY - 3.5); ringX(e.clientX); ringY(e.clientY); });
    
    const setCursorBadge = (label) => {
      if (cursorText && label) {
        cursorText.textContent = label;
        ring.classList.add("has-badge");
        document.body.classList.add("cursor-badge-active");
      } else {
        ring.classList.remove("has-badge");
        document.body.classList.remove("cursor-badge-active");
      }
    };

    document.querySelectorAll(".feature-card").forEach((card) => {
      card.addEventListener("pointerenter", () => setCursorBadge("Explore ↗"));
      card.addEventListener("pointerleave", () => setCursorBadge(null));
    });

    const railWrapEl = document.querySelector(".rail-wrap");
    if (railWrapEl) {
      railWrapEl.addEventListener("pointerenter", (e) => { if (!e.target.closest(".feature-card")) setCursorBadge("Drag ⟷"); });
      railWrapEl.addEventListener("pointerleave", () => setCursorBadge(null));
    }

    document.querySelectorAll(".faq-item button").forEach((btn) => {
      btn.addEventListener("pointerenter", () => setCursorBadge("Read +"));
      btn.addEventListener("pointerleave", () => setCursorBadge(null));
    });

    document.querySelectorAll(".magnetic, .talk-button, .back-top, .desktop-nav a").forEach((el) => {
      el.addEventListener("pointerenter", () => gsap.to(ring, { scale: 1.45, borderColor: "var(--lime)", duration: 0.25 }));
      el.addEventListener("pointerleave", () => gsap.to(ring, { scale: 1, borderColor: "rgba(255,255,255,0.9)", duration: 0.25 }));
    });

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (e) => {
        const r = button.getBoundingClientRect();
        gsap.to(button, { x: (e.clientX - r.left - r.width / 2) * 0.16, y: (e.clientY - r.top - r.height / 2) * 0.16, duration: 0.35, ease: "power2.out" });
      });
      button.addEventListener("pointerleave", () => gsap.to(button, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.35)" }));
    });
  }
}

// Marquees & Keyword Rotator
gsap.to(".scroll-cue span", { y: 13, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
const marqueeA = gsap.to(".marquee-a", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
const marqueeB = gsap.fromTo(".marquee-b", { xPercent: -50 }, { xPercent: 0, duration: 24, ease: "none", repeat: -1 });

let keywordIndex = 0; const keywords = ["SEO", "PPC", "SOCIAL", "EMAIL", "CONTENT"];
function cycleKeyword() {
  keywordIndex = (keywordIndex + 1) % keywords.length;
  gsap.to("#typed-word", { duration: 0.45, text: keywords[keywordIndex], ease: "none", delay: 1.05, onComplete: cycleKeyword });
}
setTimeout(cycleKeyword, 1550);

// ==========================================================================
// UNIFIED MASTER BREAKPOINT SYSTEM (Single Source of Truth)
// ==========================================================================
let mm = gsap.matchMedia();

mm.add({
  isMobile: `(max-width: ${BP.md - 1}px)`,
  isTablet: `(min-width: ${BP.md}px) and (max-width: ${BP.lg - 1}px)`,
  isDesktop: `(min-width: ${BP.lg}px)`,
  reduceMotion: `(prefers-reduced-motion: reduce)`
}, (context) => {
  let { isMobile, isTablet, isDesktop, reduceMotion } = context.conditions;

  // 1. Sticky Header scroll detection
  ScrollTrigger.create({
    start: isDesktop ? 20 : 15,
    onUpdate: self => document.querySelector(".site-header")?.classList.toggle("scrolled", self.scroll() > (isDesktop ? 20 : 15))
  });

  // 2. Headline SplitText Stagger (Tiered: Character on desktop, Word on tablet/mobile)
  document.querySelectorAll(".section .split-title, .cta .split-title").forEach((title) => {
    if (reduceMotion) {
      gsap.from(title, { scrollTrigger: { trigger: title, start: "top 88%" }, opacity: 0, duration: 0.6 });
    } else if (isDesktop) {
      gsap.from(splitChars(title, false), {
        scrollTrigger: { trigger: title, start: "top 84%" },
        yPercent: 105,
        opacity: 0,
        rotate: 3,
        stagger: 0.012,
        duration: 0.75,
        ease: "power4.out"
      });
    } else {
      gsap.from(splitChars(title, true), {
        scrollTrigger: { trigger: title, start: "top 88%" },
        yPercent: 70,
        opacity: 0,
        stagger: 0.035,
        duration: 0.6,
        ease: "power3.out"
      });
    }
  });

  // 3. Specia1ne-Style Section Label Stagger
  document.querySelectorAll(".section-label, .eyebrow").forEach((label) => {
    const num = label.querySelector(".section-num");
    const name = label.querySelector(".label-name");
    const badge = label.querySelector(".active-badge, em");

    gsap.timeline({ scrollTrigger: { trigger: label, start: isDesktop ? "top 88%" : "top 92%" } })
      .fromTo(num, { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" })
      .fromTo(name, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, "<0.08")
      .fromTo(badge, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "<0.12");
  });

  // 4. Dynamic Scroll Illumination: Text Opacity & Scale Scrub
  document.querySelectorAll(".hero-copy p, .intro-copy p, .process-heading > p, .faq-top p").forEach((paragraph) => {
    gsap.fromTo(paragraph,
      {
        opacity: isMobile ? 0.45 : 0.35,
        scale: isMobile ? 0.97 : 0.955,
        color: "rgba(248, 248, 242, 0.45)",
        y: isMobile ? 10 : 16
      },
      {
        scrollTrigger: {
          trigger: paragraph,
          start: "top 90%",
          end: "top 42%",
          scrub: 0.8
        },
        opacity: 1,
        scale: isMobile ? 1.02 : 1.03,
        color: "#ffffff",
        y: 0,
        ease: "power2.out"
      }
    );
  });

  // 5. Hero Scroll Parallax
  if (!reduceMotion && (isDesktop || isTablet)) {
    gsap.to(".hero .split-title", {
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
      y: isDesktop ? 50 : 30,
      scale: 0.95,
      opacity: 0.85,
      ease: "none"
    });
  }

  // 6. Capability Rail (Desktop Free Drag vs Tablet Snap-assisted vs Mobile Native Momentum Scroll)
  const rail = document.querySelector(".feature-rail"), wrap = document.querySelector(".rail-wrap");
  if (rail && wrap) {
    const cards = [...rail.querySelectorAll(".feature-card")];
    const hint = wrap.querySelector(".drag-hint");

    if (isDesktop || isTablet) {
      let isDragging = false;
      const maxX = () => Math.min(0, window.innerWidth - rail.scrollWidth - window.innerWidth * 0.04);

      Draggable.create(rail, {
        type: "x",
        bounds: () => ({ minX: maxX(), maxX: 0 }),
        inertia: inertiaAvailable,
        edgeResistance: 0.75,
        snap: isTablet ? { x: (endValue) => Math.round(endValue / (cards[0].offsetWidth + 17)) * (cards[0].offsetWidth + 17) } : false,
        onDrag: updateCards,
        onThrowUpdate: updateCards,
        onPress() {
          isDragging = true;
          rail.classList.add("is-dragging");
          if (hint) hint.innerHTML = "Dragging the story <span>⟷</span>";
          gsap.to(cards, { y: -7, stagger: 0.025, duration: 0.25, ease: "power2.out" });
        },
        onRelease() {
          isDragging = false;
          rail.classList.remove("is-dragging");
          if (hint) hint.innerHTML = "Drag to explore <span>⟷</span>";
          gsap.to(cards, { y: 0, stagger: { each: 0.025, from: "end" }, duration: 0.6, ease: "elastic.out(1,.5)" });
        }
      });

      function updateCards() {
        const x = gsap.getProperty(rail, "x");
        let closest = 0, best = Infinity;
        cards.forEach((card, i) => {
          const center = x + i * (card.offsetWidth + 17) + card.offsetWidth / 2;
          const distance = Math.abs(center - window.innerWidth / 2) / (window.innerWidth / 2);
          if (distance < best) { best = distance; closest = i; }
          gsap.to(card, { scale: Math.max(0.88, 1 - distance * 0.13), opacity: Math.max(0.45, 1 - distance * 0.55), duration: 0.15, overwrite: "auto" });
        });
        cards.forEach((card, i) => card.classList.toggle("is-focused", i === closest));
      }

      if (hasFinePointer) {
        cards.forEach(card => {
          const mark = card.querySelector(".card-mark"), heading = card.querySelector("h3"), copy = card.querySelector("p"), link = card.querySelector("a");
          card.addEventListener("pointerenter", () => {
            if (isDragging) return;
            gsap.timeline()
              .to(card, { y: -10, rotate: -1, duration: 0.35, ease: "power3.out" })
              .to(mark, { scale: 1.17, rotate: 8, duration: 0.35, ease: "back.out(2)" }, 0)
              .to([heading, copy, link], { x: 7, stagger: 0.04, duration: 0.35, ease: "power3.out" }, 0);
          });
          card.addEventListener("pointerleave", () => {
            if (isDragging) return;
            gsap.to(card, { y: 0, rotate: 0, duration: 0.55, ease: "elastic.out(1,.5)" });
            gsap.to([mark, heading, copy, link], { x: 0, scale: 1, rotate: 0, duration: 0.35, stagger: 0.03, ease: "power3.out" });
          });
        });
      }

      ScrollTrigger.create({ trigger: wrap, start: "top bottom", onEnter: updateCards, onUpdate: updateCards });
    } else {
      // Mobile native momentum scroll with dot pagination
      const dots = document.querySelectorAll(".rail-pagination .dot");
      const updatePaginationAndCards = () => {
        const wrapRect = wrap.getBoundingClientRect();
        const centerX = wrapRect.left + wrapRect.width / 2;
        let closestIdx = 0, minDistance = Infinity;

        cards.forEach((card, idx) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(centerX - cardCenter);
          if (distance < minDistance) { minDistance = distance; closestIdx = idx; }
          const maxDist = wrapRect.width / 2;
          const ratio = Math.max(0, 1 - distance / maxDist);
          card.classList.toggle("in-view", ratio > 0.65);
        });

        dots.forEach((dot, idx) => dot.classList.toggle("active", idx === closestIdx));
      };

      wrap.addEventListener("scroll", updatePaginationAndCards, { passive: true });
      updatePaginationAndCards();
    }
  }

  // 7. Scrollytelling Process Section (Pinned on Desktop/Tablet vs Unpinned on Mobile)
  if (!reduceMotion && (isDesktop || isTablet)) {
    const processTL = gsap.timeline({
      scrollTrigger: { trigger: ".process", start: "top top", end: "+=1700", pin: true, scrub: 1, anticipatePin: 1 }
    });
    processTL.to(".travel-dot", { motionPath: { path: "#travel-path", align: "#travel-path", alignOrigin: [0.5, 0.5] }, ease: "none", duration: 3 }, 0)
      .to(".step-one", { opacity: 1, duration: 0.55 }, 0).to(".step-one .ghost", { color: "#383838", scale: 1.05, duration: 0.5 }, 0)
      .to(".step-two", { opacity: 1, duration: 0.55 }, 1).to(".step-two .ghost", { color: "#383838", scale: 1.05, duration: 0.5 }, 1)
      .to(".step-three", { opacity: 1, duration: 0.55 }, 2).to(".step-three .ghost", { color: "#383838", scale: 1.05, duration: 0.5 }, 2);
  } else {
    // Unpinned vertical stack with scroll trigger reveals on mobile
    document.querySelectorAll(".process-step").forEach((step) => {
      gsap.from(step, {
        scrollTrigger: { trigger: step, start: "top 85%", toggleActions: "play none none reverse" },
        opacity: 0,
        y: 28,
        duration: 0.55,
        ease: "power2.out"
      });
    });
  }
});

// Interactive FAQ Accordion (Flip + Tap)
document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement, answer = item.querySelector(".faq-answer"), state = Flip.getState(answer);
    document.querySelectorAll(".faq-item.open").forEach((open) => {
      if (open !== item) {
        open.classList.remove("open");
        gsap.to(open.querySelector(".faq-answer"), { height: 0, duration: 0.3 });
      }
    });
    const opening = !item.classList.contains("open");
    item.classList.toggle("open", opening);
    gsap.set(answer, { height: opening ? "auto" : 0 });
    Flip.from(state, { duration: 0.4, ease: "power2.inOut", absolute: false });
  });
});

// Mobile Fullscreen Slide-in Drawer Menu
const menuToggle = document.querySelector(".menu-toggle"), mobileMenu = document.querySelector(".mobile-menu");
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const state = Flip.getState(mobileMenu);
    const open = !menuToggle.classList.contains("active");
    menuToggle.classList.toggle("active", open);
    document.body.style.overflow = open ? "hidden" : "";
    mobileMenu.style.visibility = open ? "visible" : "hidden";
    gsap.to(mobileMenu, { clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", duration: 0.5, ease: "power4.inOut" });
    Flip.from(state, { duration: 0.3, ease: "power2.out" });
    if (open) gsap.from(".mobile-menu a", { y: 24, opacity: 0, stagger: 0.05, delay: 0.18 });
  });
  document.querySelectorAll(".mobile-menu a").forEach(a => a.addEventListener("click", () => {
    if (menuToggle.classList.contains("active")) menuToggle.click();
  }));
}

// Back to top & Newsletter Form
document.querySelector(".back-top")?.addEventListener("click", () => gsap.to(window, { duration: 1.1, scrollTo: 0, ease: "power3.inOut" }));
document.querySelector(".subscribe form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const button = e.currentTarget.querySelector("button");
  if (button) {
    button.innerHTML = "Subscribed ✓";
    gsap.fromTo(button, { color: "var(--coral)" }, { color: "var(--lime)", duration: 0.4 });
  }
});

// ==========================================================================
// Three.js Hero Canvas: Three-Tier Responsive Architecture
// ==========================================================================
if (!prefersReduced && window.THREE) {
  const mount = document.querySelector("#three-canvas");
  if (mount) {
    const isMobile = window.innerWidth < BP.md;
    const isTablet = window.innerWidth >= BP.md && window.innerWidth < BP.lg;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: "high-performance" });

    const maxDpr = isMobile || isTablet ? 1.5 : 2.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    camera.position.z = 12;

    const group = new THREE.Group();
    scene.add(group);

    // Tiered Particle Field Count (200 on Desktop, 80 on Tablet, 45 on Mobile)
    const particleCount = isMobile ? 45 : (isTablet ? 80 : 200);
    const positions = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = 4 + Math.random() * 6, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      positions.push(radius * Math.sin(b) * Math.cos(a), radius * Math.sin(b) * Math.sin(a), radius * Math.cos(b));
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ size: isMobile ? 0.05 : 0.04, color: 0xff725e, transparent: true, opacity: 0.75 }));
    group.add(points);

    // Tiered Geometric Icosahedrons (11 on Desktop, 6 on Tablet, 4 on Mobile)
    const meshCount = isMobile ? 4 : (isTablet ? 6 : 11);
    const geo = new THREE.IcosahedronGeometry(0.33, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xd8ff3e, wireframe: true, transparent: true, opacity: 0.55 });
    for (let i = 0; i < meshCount; i++) {
      const mesh = new THREE.Mesh(geo, material);
      const a = (i / meshCount) * Math.PI * 2;
      mesh.position.set(Math.cos(a) * (3 + (i % 3)), Math.sin(a * 1.7) * 3, (i % 4) - 2);
      mesh.scale.setScalar(0);
      group.add(mesh);
      gsap.to(mesh.scale, { x: 1, y: 1, z: 1, delay: 0.9 + i * 0.055, duration: 0.75, ease: "back.out(1.7)" });
    }

    // Input-aware Interaction: Pointer Tilt on Fine Pointers, Gyroscope on Mobile
    if (hasFinePointer) {
      const groupX = gsap.quickTo(group.rotation, "x", { duration: 0.6, ease: "power3" });
      const groupY = gsap.quickTo(group.rotation, "y", { duration: 0.6, ease: "power3" });
      mount.closest(".hero")?.addEventListener("pointermove", e => {
        const r = mount.getBoundingClientRect();
        groupX(((e.clientY - r.top - r.height / 2) / r.height) * 0.3);
        groupY(((e.clientX - r.left - r.width / 2) / r.width) * 0.45);
      });
    } else if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma !== null && e.beta !== null) {
          group.rotation.y = (e.gamma / 90) * 0.4;
          group.rotation.x = ((e.beta - 45) / 90) * 0.3;
        }
      }, { passive: true });
    }

    let isRunning = true;
    function render() {
      if (isRunning) {
        points.rotation.y += 0.0007;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
      }
    }
    render();

    // Lifecycle Management: Pause on Background & Canvas Off-screen
    document.addEventListener("visibilitychange", () => {
      isRunning = !document.hidden;
      if (isRunning) render();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        isRunning = entry.isIntersecting;
        if (isRunning) render();
      }, { threshold: 0.05 });
      observer.observe(mount);
    }

    if (!isMobile) {
      gsap.to(group.rotation, { y: 1.3, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(camera.position, { z: 7, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(mount, { opacity: 0, scrollTrigger: { trigger: ".hero", start: "60% top", end: "bottom top", scrub: true } });
    }

    window.addEventListener("resize", () => {
      if (mount.clientHeight > 0) {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      }
    });
  }
}

// Orientation change & Debounced ScrollTrigger refresh
let resizeTimer;
window.addEventListener("orientationchange", () => {
  setTimeout(() => ScrollTrigger.refresh(), 250);
});

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
});

window.addEventListener("load", () => ScrollTrigger.refresh());
