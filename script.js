/* ==========================================================================
   Homepage intro — three parts, played strictly in sequence:
     1. THE CODE REDEEMER  terminal typing → "I A" cut → crosshair → cover
     2. WORM JOKES         Wormy cartoon
     3. DISCOVERIES        gold title card
   Each part has its own sound. A new sound always stops the previous one
   first, so no two tracks ever play at the same time.
   ========================================================================== */
const intro = document.getElementById("intro");
const entryChoice = document.getElementById("entryChoice");
const terminalScene = document.getElementById("terminalScene");
const codeScene = document.getElementById("codeScene");
const wormyScene = document.getElementById("wormyScene");
const insightsScene = document.getElementById("insightsScene");
const question = document.getElementById("terminalQuestion");
const answer = document.getElementById("terminalAnswer");
const promptOne = document.getElementById("systemPromptOne");
const promptTwo = document.getElementById("systemPromptTwo");
const soundToggle = document.getElementById("soundToggle");
const iamFlash = document.getElementById("iamFlash");

/* ---------- Timing (milliseconds) — adjust here ---------- */
const T = {
  firstPrompt: 600,        // black screen before "< SYS: >" appears
  questionSpeed: 95,       // per letter, "WHO IS THIS? / ARE YOU ONLINE?"
  pauseBeforeAnswer: 900,  // after the question finishes typing
  answerSpeed: 380,        // per letter, "I A"
  holdOnAnswer: 300,       // "I A" stays on screen before the cut
  codeSoundDelay: 1000,    // after the cut; lets the glitch hit finish first
  crosshairAlone: 4800,    // crosshair on black before the cover fades in
  coverFadeIn: 1400,       // cover fades in beneath the crosshair
  crosshairFadeOut: 1200,  // crosshair melts into the cover's own glint
  coverHold: 2000,         // cover alone before Wormy
  wormy: 5200,             // length of the Worm Jokes part (matches wormy.wav)
  discoveries: 5000,       // length of the Discoveries part
  crossfade: 900           // scene-to-scene dissolve
};

/* ---------- Sound ---------- */
const tracks = {
  terminal: document.getElementById("terminalAudio"),
  glitch: document.getElementById("glitchAudio"),
  code: document.getElementById("codeAudio"),
  wormy: document.getElementById("wormyAudio"),
  insights: document.getElementById("insightsAudio")
};

let soundOn = localStorage.getItem("projectLaunchSound") !== "off";
let timers = [];
let audioContext = null;
let clickBus = null;
let noiseBuffer = null;
let tracksUnlocked = false;

const wait = (fn, ms) => {
  const id = window.setTimeout(fn, ms);
  timers.push(id);
  return id;
};

function clearTimers(){
  timers.forEach(clearTimeout);
  timers = [];
}

function stopAudio(){
  Object.values(tracks).forEach(track => {
    if(!track) return;
    track.pause();
    try { track.currentTime = 0; } catch(e) {}
  });
}

// Must run inside the visitor's tap/click. Browsers (and iPhones in
// particular) only allow sound that was started or "unlocked" by a tap.
function unlockAudio(){
  // Let the typing clicks play even when an iPhone's ringer switch is on silent
  // (Safari 16.4+). Without this, iOS mutes generated sounds on silent.
  try { if(navigator.audioSession) navigator.audioSession.type = "playback"; } catch(e) {}

  const AC = window.AudioContext || window.webkitAudioContext;
  if(AC && !audioContext){
    audioContext = new AC();
    // A light compressor keeps the clicks punchy and prevents distortion.
    const comp = audioContext.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .001; comp.release.value = .08;
    clickBus = audioContext.createGain();
    clickBus.gain.value = 1;
    clickBus.connect(comp); comp.connect(audioContext.destination);
    // Reusable burst of noise for the key "tick".
    const len = Math.floor(audioContext.sampleRate * .05);
    noiseBuffer = audioContext.createBuffer(1, len, audioContext.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
  }
  if(audioContext){
    if(audioContext.state !== "running") audioContext.resume().catch(()=>{});
    // A silent blip completes the unlock on older iPhones.
    const s = audioContext.createBufferSource();
    s.buffer = audioContext.createBuffer(1, 1, 22050);
    s.connect(audioContext.destination); s.start(0);
  }

  // iPhones only allow an <audio> element to play later if it was started
  // once during a tap, so briefly start-and-stop each later track (muted).
  if(!tracksUnlocked){
    tracksUnlocked = true;
    ["glitch","code","wormy","insights"].forEach(name => {
      const t = tracks[name];
      if(!t) return;
      t.muted = true;
      const p = t.play();
      const reset = () => { t.pause(); try{ t.currentTime = 0; }catch(e){} t.muted = false; };
      if(p && p.then) p.then(reset).catch(()=>{ t.muted = false; }); else reset();
    });
  }
}

function playTrack(name){
  stopAudio();                 // never let two tracks overlap
  if(!soundOn) return;
  const track = tracks[name];
  if(!track) return;
  track.muted = false;
  try { track.currentTime = 0; } catch(e) {}
  const p = track.play();
  if(p && p.catch) p.catch(()=>{});
}

// One audible keystroke. "heavy" is used for the slow "I A".
function typingClick(character, heavy=false){
  if(!soundOn || !audioContext || character === " " || character === "\n") return;
  if(audioContext.state !== "running") audioContext.resume().catch(()=>{});
  const now = audioContext.currentTime;
  const level = heavy ? .7 : 1;   // heavy filter passes more energy, so less gain keeps it from distorting

  // Bright tick: filtered noise burst.
  const tick = audioContext.createBufferSource();
  tick.buffer = noiseBuffer;
  tick.playbackRate.value = .9 + Math.random()*.2;
  const hp = audioContext.createBiquadFilter();
  hp.type = "bandpass"; hp.frequency.value = heavy ? 2200 : 2800 + Math.random()*500; hp.Q.value = .9;
  const tickGain = audioContext.createGain();
  tickGain.gain.setValueAtTime(.0001, now);
  tickGain.gain.exponentialRampToValueAtTime(2.4*level, now+.002);
  tickGain.gain.exponentialRampToValueAtTime(.0001, now+.045);
  tick.connect(hp); hp.connect(tickGain); tickGain.connect(clickBus);

  // Body: short low "thock" so it reads as a key, not static.
  const body = audioContext.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(heavy ? 150 : 210, now);
  body.frequency.exponentialRampToValueAtTime(heavy ? 70 : 110, now+.05);
  const bodyGain = audioContext.createGain();
  bodyGain.gain.setValueAtTime(.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(.75*level, now+.003);
  bodyGain.gain.exponentialRampToValueAtTime(.0001, now+.06);
  body.connect(bodyGain); bodyGain.connect(clickBus);

  tick.start(now); tick.stop(now+.05);
  body.start(now); body.stop(now+.07);
}

function typeText(el, text, speed, callback, heavy=false){
  el.textContent = "";
  let i = 0;
  function next(){
    if(i < text.length){
      const ch = text[i++];
      el.textContent += ch;
      typingClick(ch, heavy);
      wait(next, speed + Math.random()*20);
    } else if(callback) callback();
  }
  next();
}

/* ---------- Crosshair placement ----------
   The book cover is shown centered and scaled to fit the screen. The glint on
   the cover sits at 49.8% across and 40.0% down the image (1365 × 2048 px).
   The crosshair is drawn at exactly that spot and at the same size, so when the
   cover fades in its own glint lands precisely under the crosshair. */
const COVER = { w:1365, h:2048, gx:.4982, gy:.3999 };
function placeCrosshair(){
  const box = intro.getBoundingClientRect();
  const scale = Math.min(box.width / COVER.w, box.height / COVER.h);
  const cw = COVER.w * scale, ch = COVER.h * scale;
  const left = (box.width - cw) / 2, top = (box.height - ch) / 2;
  iamFlash.style.setProperty("--cw", cw + "px");
  iamFlash.style.setProperty("--gx", (left + COVER.gx * cw) + "px");
  iamFlash.style.setProperty("--gy", (top + COVER.gy * ch) + "px");
}
window.addEventListener("resize", placeCrosshair);

/* ---------- Scenes ---------- */
const scenes = [terminalScene, codeScene, wormyScene, insightsScene];

// Bring a scene in on top of the current one, then drop the old one once the
// new one has fully faded in — so there is never a flash of black between them.
function showScene(next){
  next.classList.add("on");
  wait(() => scenes.forEach(s => { if(s !== next) s.classList.remove("on"); }), T.crossfade);
}

function resetScenes(){
  scenes.forEach(s => s.classList.remove("on"));
  question.textContent = "";
  answer.textContent = "";
  promptOne.classList.remove("show");
  promptTwo.classList.remove("show");
  terminalScene.classList.remove("hard-glitch");
  iamFlash.classList.remove("show","reveal","settle","melt");
}

function finishIntro(){
  clearTimers();
  stopAudio();
  resetScenes();
  intro.classList.add("hidden");
  intro.setAttribute("aria-hidden","true");
  localStorage.setItem("projectLaunchIntroSeen","yes");
}

function updateSoundButton(){
  soundToggle.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
  soundToggle.setAttribute("aria-pressed", String(soundOn));
}

function playIntro(withSound=soundOn){
  clearTimers();
  stopAudio();
  soundOn = withSound;
  updateSoundButton();
  intro.classList.remove("hidden");
  intro.setAttribute("aria-hidden","false");
  entryChoice.classList.add("off");
  resetScenes();
  placeCrosshair();

  /* ===== Part 1: THE CODE REDEEMER ===== */
  terminalScene.classList.add("on");
  playTrack("terminal");
  if(soundOn) unlockAudio();   // still inside the tap, after the first track starts

  wait(() => {
    promptOne.classList.add("show");
    typeText(question, "WHO IS THIS?\nARE YOU ONLINE?", T.questionSpeed, () => {
      wait(() => {
        promptTwo.classList.add("show");
        typeText(answer, "I A", T.answerSpeed, () => wait(cutToCrosshair, T.holdOnAnswer), true);
      }, T.pauseBeforeAnswer);
    });
  }, T.firstPrompt);
}

function cutToCrosshair(){
  // The reply is cut off after "I A": terminal sound stops, glitch hit, crosshair.
  playTrack("glitch");
  terminalScene.classList.add("hard-glitch");
  iamFlash.classList.add("show");
  wait(() => playTrack("code"), T.codeSoundDelay);

  // The cover fades in beneath the crosshair; the crosshair settles onto the
  // cover's own glint and melts away, leaving the cover.
  wait(() => {
    codeScene.classList.add("on");
    iamFlash.classList.add("reveal", "settle");
    wait(() => {
      iamFlash.classList.add("melt");
      terminalScene.classList.remove("on", "hard-glitch");
    }, T.coverFadeIn);
    wait(() => iamFlash.classList.remove("show","reveal","settle","melt"), T.coverFadeIn + T.crosshairFadeOut);

    /* ===== Part 2: WORM JOKES ===== */
    wait(() => {
      showScene(wormyScene);
      playTrack("wormy");

      /* ===== Part 3: DISCOVERIES ===== */
      wait(() => {
        showScene(insightsScene);
        playTrack("insights");
        wait(finishIntro, T.discoveries);
      }, T.wormy);
    }, T.coverFadeIn + T.crosshairFadeOut + T.coverHold);
  }, T.crosshairAlone);
}

document.getElementById("enterSound").addEventListener("click",()=>playIntro(true));
// Silent entry is the fast route directly to the site.
document.getElementById("enterSilent").addEventListener("click",()=>{
  soundOn=false;
  localStorage.setItem("projectLaunchSound","off");
  finishIntro();
});
document.getElementById("skipIntro").addEventListener("click",finishIntro);
document.getElementById("watchIntro").addEventListener("click",()=>playIntro(soundOn));
document.getElementById("watchIntroBottom")?.addEventListener("click",()=>playIntro(soundOn));
soundToggle.addEventListener("click",()=>{
  soundOn=!soundOn;
  localStorage.setItem("projectLaunchSound", soundOn ? "on" : "off");
  if(soundOn) unlockAudio(); else stopAudio();
  updateSoundButton();
});

updateSoundButton();
if(localStorage.getItem("projectLaunchIntroSeen")==="yes"){
  intro.classList.add("hidden");
  intro.setAttribute("aria-hidden","true");
}
document.getElementById("year").textContent=new Date().getFullYear();

const menu=document.querySelector(".menu-toggle");
const nav=document.getElementById("mainNav");
menu.addEventListener("click",()=>{
  const open=nav.classList.toggle("open");
  menu.setAttribute("aria-expanded",String(open));
});
