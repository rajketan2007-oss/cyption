/* Cyption Digital static experience: GSAP plugins are registered and used below. */
// InertiaPlugin is a GSAP Club plugin and may be omitted by public CDNs. When a
// licensed copy is present it is registered and powers throw momentum; otherwise
// Draggable remains fully functional with the same rail interface.
const inertiaAvailable = typeof window.InertiaPlugin !== "undefined";
gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin, Flip, TextPlugin, ScrollToPlugin);
if (inertiaAvailable) gsap.registerPlugin(window.InertiaPlugin);

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.body.style.overflow = "hidden";

// Lightweight SplitText alternative: keeps words intact and exposes animated characters.
function splitChars(element) {
  if (element.dataset.split) return element.querySelectorAll(".char");
  element.dataset.split = "true";
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    [...node.textContent].forEach((character) => {
      if (character === " ") { fragment.appendChild(document.createTextNode(" ")); return; }
      const char = document.createElement("span"); char.className = "char"; char.textContent = character; fragment.appendChild(char);
    });
    node.parentNode.replaceChild(fragment, node);
  });
  return element.querySelectorAll(".char");
}

function setTime() {
  const el = document.querySelector("#local-time");
  if (el) el.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());
}
setTime(); setInterval(setTime, 1000);

// Make the supplied raster logo genuinely transparent in the rendered page.
// The dark header version maps its white lettering to ink; the footer preserves it as white.
document.querySelectorAll(".brand-logo img").forEach((image) => {
  const makeTransparent = () => {
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), data = pixels.data;
    const darkTone = image.dataset.logoTone === "dark";
    for (let i = 0; i < data.length; i += 4) {
      const luminance = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (luminance < 32) data[i + 3] = 0;
      else if (darkTone && luminance > 210 && Math.abs(data[i] - data[i + 1]) < 18) { data[i] = 23; data[i + 1] = 23; data[i + 2] = 23; }
    }
    ctx.putImageData(pixels, 0, 0); image.src = canvas.toDataURL("image/png");
  };
  image.complete ? makeTransparent() : image.addEventListener("load", makeTransparent, { once: true });
});

// Smooth scrolling: Lenis is synced to GSAP's ticker.
if (!prefersReduced && window.Lenis) {
  const lenis = new Lenis({ lerp: .085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const loader = gsap.timeline({ onComplete: () => { const pre = document.querySelector(".preloader"); if (pre) pre.remove(); document.body.style.overflow = ""; ScrollTrigger.refresh(); } });
loader.fromTo(".pre-logo i", { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: .45, stagger: .15 })
  .fromTo(".pre-logo span", { yPercent: 110 }, { yPercent: 0, duration: .65, ease: "power4.out" }, "<.08")
  .to(".preloader", { yPercent: -100, duration: .7, ease: "power4.inOut", delay: .35 });

const titleChars = [...document.querySelectorAll(".split-title")].map(splitChars);
if (titleChars.length > 0) {
  loader.fromTo(titleChars[0], { yPercent: 115, opacity: 0, rotate: 4 }, { yPercent: 0, opacity: 1, rotate: 0, stagger: .015, duration: .8, ease: "power4.out" }, "<.35")
    .from(".hero-copy, .type-line, .eyebrow", { opacity: 0, y: 20, stagger: .1, duration: .5 }, "<.35");
}

if (!prefersReduced) {
  const dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring");
  if (dot && ring) {
    const dotX = gsap.quickTo(dot, "x", { duration: .12, ease: "power3" }), dotY = gsap.quickTo(dot, "y", { duration: .12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: .38, ease: "power3" }), ringY = gsap.quickTo(ring, "y", { duration: .38, ease: "power3" });
    window.addEventListener("pointermove", (e) => { dotX(e.clientX - 3.5); dotY(e.clientY - 3.5); ringX(e.clientX); ringY(e.clientY); });
    document.querySelectorAll("a,button,.feature-card").forEach((el) => { el.addEventListener("pointerenter", () => gsap.to(ring, { scale: 1.9, duration: .25 })); el.addEventListener("pointerleave", () => gsap.to(ring, { scale: 1, duration: .25 })); });
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (e) => { const r = button.getBoundingClientRect(); gsap.to(button, { x: (e.clientX-r.left-r.width/2)*.16, y: (e.clientY-r.top-r.height/2)*.16, duration: .35, ease: "power2.out" }); });
      button.addEventListener("pointerleave", () => gsap.to(button, { x: 0, y: 0, duration: .6, ease: "elastic.out(1,.35)" }));
    });
  }
}

ScrollTrigger.create({ start: 20, onUpdate: self => document.querySelector(".site-header")?.classList.toggle("scrolled", self.scroll() > 20) });
gsap.to(".scroll-cue span", { y: 13, duration: .8, repeat: -1, yoyo: true, ease: "sine.inOut" });
const marqueeA = gsap.to(".marquee-a", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
const marqueeB = gsap.fromTo(".marquee-b", { xPercent: -50 }, { xPercent: 0, duration: 24, ease: "none", repeat: -1 });
const marqueePlate = document.querySelector(".marquees");
if (marqueePlate && !prefersReduced) {
  marqueePlate.addEventListener("pointerenter", () => { marqueeA.timeScale(1.5); marqueeB.timeScale(1.5); gsap.to(".marquee", { scaleY: 1.07, duration: .3, ease: "power3.out" }); });
  marqueePlate.addEventListener("pointerleave", () => { marqueeA.timeScale(1); marqueeB.timeScale(1); gsap.to(".marquee", { scaleY: 1, duration: .55, ease: "elastic.out(1,.5)" }); });
}

let keywordIndex = 0; const keywords = ["SEO", "PPC", "SOCIAL", "EMAIL", "CONTENT"];
function cycleKeyword() { keywordIndex = (keywordIndex + 1) % keywords.length; gsap.to("#typed-word", { duration: .45, text: keywords[keywordIndex], ease: "none", delay: 1.05, onComplete: cycleKeyword }); }
setTimeout(cycleKeyword, 1550);

document.querySelectorAll(".section .split-title, .cta .split-title").forEach((title) => {
  gsap.from(splitChars(title), { scrollTrigger: { trigger: title, start: "top 84%" }, yPercent: 105, opacity: 0, rotate: 3, stagger: .012, duration: .7, ease: "power4.out" });
});

const bc = document.querySelector(".breadcrumb");
if (bc) gsap.from(bc, { opacity: 0, y: -10, duration: .5, delay: .9 });

gsap.from(".intro-copy", { scrollTrigger: { trigger: ".features", start: "top 70%" }, opacity: 0, y: 35, duration: .7 });

// Desktop card rail uses both Draggable and InertiaPlugin; mobile retains natural scroll.
if (!prefersReduced && window.innerWidth > 760) {
  const rail = document.querySelector(".feature-rail"), wrap = document.querySelector(".rail-wrap");
  if (rail && wrap) {
    const cards = [...rail.querySelectorAll(".feature-card")];
    const hint = wrap.querySelector(".drag-hint");
    let isDragging = false;
    const maxX = () => Math.min(0, window.innerWidth - rail.scrollWidth - window.innerWidth * .04);
    Draggable.create(rail, { type: "x", bounds: () => ({ minX: maxX(), maxX: 0 }), inertia: inertiaAvailable, edgeResistance: .75, onDrag: updateCards, onThrowUpdate: updateCards, onPress() { isDragging=true; rail.classList.add("is-dragging"); if(hint)hint.innerHTML="Dragging the story <span>⟷</span>"; gsap.to(cards,{y:-7,stagger:.025,duration:.25,ease:"power2.out"}); }, onRelease() { isDragging=false; rail.classList.remove("is-dragging"); if(hint)hint.innerHTML="Drag to explore <span>⟷</span>"; gsap.to(cards,{y:0,stagger:{each:.025,from:"end"},duration:.6,ease:"elastic.out(1,.5)"}); } });
    function updateCards() { const x = gsap.getProperty(rail, "x"); let closest=0,best=Infinity; cards.forEach((card, i) => { const center=x+i*(card.offsetWidth+17)+card.offsetWidth/2,distance=Math.abs(center-window.innerWidth/2)/(window.innerWidth/2); if(distance<best){best=distance;closest=i;} gsap.to(card,{scale:Math.max(.88,1-distance*.13),opacity:Math.max(.45,1-distance*.55),duration:.15,overwrite:"auto"}); }); cards.forEach((card,i)=>card.classList.toggle("is-focused",i===closest)); }
    cards.forEach(card => { const mark=card.querySelector(".card-mark"), heading=card.querySelector("h3"), copy=card.querySelector("p"), link=card.querySelector("a"); card.addEventListener("pointerenter",()=>{if(isDragging)return;gsap.timeline().to(card,{y:-10,rotate:-1,duration:.35,ease:"power3.out"}).to(mark,{scale:1.17,rotate:8,duration:.35,ease:"back.out(2)"},0).to([heading,copy,link],{x:7,stagger:.04,duration:.35,ease:"power3.out"},0);});card.addEventListener("pointerleave",()=>{if(isDragging)return;gsap.to(card,{y:0,rotate:0,duration:.55,ease:"elastic.out(1,.5)"});gsap.to([mark,heading,copy,link],{x:0,scale:1,rotate:0,duration:.35,stagger:.03,ease:"power3.out"});}); });
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", onEnter: updateCards, onUpdate: updateCards });
  }
}

window.addEventListener("load", () => ScrollTrigger.refresh());

const processTL = gsap.timeline({ scrollTrigger: { trigger: ".process", start: "top top", end: "+=1700", pin: true, scrub: 1, anticipatePin: 1 } });
processTL.to(".travel-dot", { motionPath: { path: "#travel-path", align: "#travel-path", alignOrigin: [.5,.5] }, ease: "none", duration: 3 }, 0)
  .to(".step-one", { opacity: 1, duration: .55 }, 0).to(".step-one .ghost", { color: "#383838", scale: 1.05, duration: .5 }, 0)
  .to(".step-two", { opacity: 1, duration: .55 }, 1).to(".step-two .ghost", { color: "#383838", scale: 1.05, duration: .5 }, 1)
  .to(".step-three", { opacity: 1, duration: .55 }, 2).to(".step-three .ghost", { color: "#383838", scale: 1.05, duration: .5 }, 2);

document.querySelectorAll(".faq-item button").forEach((button) => button.addEventListener("click", () => {
  const item = button.parentElement, answer = item.querySelector(".faq-answer"), state = Flip.getState(answer);
  document.querySelectorAll(".faq-item.open").forEach((open) => { if (open !== item) { open.classList.remove("open"); gsap.to(open.querySelector(".faq-answer"), { height: 0, duration: .35 }); } });
  const opening = !item.classList.contains("open"); item.classList.toggle("open", opening); gsap.set(answer, { height: opening ? "auto" : 0 }); Flip.from(state, { duration: .45, ease: "power2.inOut", absolute: false });
}));

const menuToggle = document.querySelector(".menu-toggle"), mobileMenu = document.querySelector(".mobile-menu");
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => { const state = Flip.getState(mobileMenu); const open = !menuToggle.classList.contains("active"); menuToggle.classList.toggle("active", open); mobileMenu.style.visibility = open ? "visible" : "hidden"; gsap.to(mobileMenu, { clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", duration: .6, ease: "power4.inOut" }); Flip.from(state, { duration: .35, ease: "power2.out" }); if(open) gsap.from(".mobile-menu a", { y: 25, opacity: 0, stagger: .06, delay: .22 }); });
  document.querySelectorAll(".mobile-menu a").forEach(a => a.addEventListener("click", () => menuToggle.click()));
}

document.querySelector(".back-top")?.addEventListener("click", () => gsap.to(window, { duration: 1.2, scrollTo: 0, ease: "power3.inOut" }));
document.querySelector(".subscribe form")?.addEventListener("submit", (e) => { e.preventDefault(); const button = e.currentTarget.querySelector("button"); if (button) { button.innerHTML = "Subscribed ✓"; gsap.fromTo(button, { color: "var(--coral)" }, { color: "var(--lime)", duration: .4 }); } });

// Three.js hero layer: low-poly points + icosahedrons, scroll and pointer driven.
if (!prefersReduced && window.THREE && window.innerWidth > 760) {
  const mount = document.querySelector("#three-canvas");
  if (mount) {
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(42, mount.clientWidth/mount.clientHeight, .1, 100), renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(mount.clientWidth, mount.clientHeight); mount.appendChild(renderer.domElement); camera.position.z = 12;
    const group = new THREE.Group(); scene.add(group); const positions = [];
    for(let i=0;i<220;i++){ const radius=4+Math.random()*6, a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1); positions.push(radius*Math.sin(b)*Math.cos(a),radius*Math.sin(b)*Math.sin(a),radius*Math.cos(b)); }
    const particleGeometry = new THREE.BufferGeometry(); particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions,3)); const points = new THREE.Points(particleGeometry,new THREE.PointsMaterial({size:.04,color:0xff725e,transparent:true,opacity:.75})); group.add(points);
    const geo = new THREE.IcosahedronGeometry(.33, 1), material = new THREE.MeshBasicMaterial({ color:0xd8ff3e, wireframe:true, transparent:true, opacity:.55 });
    for(let i=0;i<11;i++){const mesh=new THREE.Mesh(geo,material); const a=i/11*Math.PI*2; mesh.position.set(Math.cos(a)*(3+i%3),Math.sin(a*1.7)*3,(i%4)-2); mesh.scale.setScalar(0); group.add(mesh); gsap.to(mesh.scale,{x:1,y:1,z:1,delay:.9+i*.055,duration:.75,ease:"back.out(1.7)"});}
    const groupX=gsap.quickTo(group.rotation,"x",{duration:.6,ease:"power3"}),groupY=gsap.quickTo(group.rotation,"y",{duration:.6,ease:"power3"}); mount.closest(".hero")?.addEventListener("pointermove",e=>{const r=mount.getBoundingClientRect();groupX((e.clientY-r.top-r.height/2)/r.height*.3);groupY((e.clientX-r.left-r.width/2)/r.width*.45)});
    let running=true; function render(){if(running){points.rotation.y+=.0007; renderer.render(scene,camera);requestAnimationFrame(render);}} render();
    gsap.to(group.rotation,{y:1.3,scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}}); gsap.to(camera.position,{z:7,scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}}); gsap.to(mount,{opacity:0,scrollTrigger:{trigger:".hero",start:"60% top",end:"bottom top",scrub:true,onLeave:()=>{running=false;mount.style.display="none";}}});
    ScrollTrigger.create({trigger:".hero",start:"top bottom",end:"bottom top",onEnter:()=>{running=true;render()},onLeave:()=>running=false,onEnterBack:()=>{mount.style.display="block";running=true;render()},onLeaveBack:()=>running=false});
    addEventListener("resize",()=>{if (mount.clientHeight > 0) { camera.aspect=mount.clientWidth/mount.clientHeight;camera.updateProjectionMatrix();renderer.setSize(mount.clientWidth,mount.clientHeight); }});
  }
}
