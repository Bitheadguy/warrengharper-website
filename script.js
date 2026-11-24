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

const wait = (fn, ms) => {
  const id = window.setTimeout(fn, ms);
  timers.push(id);
};

function clearTimers(){
  timers.forEach(clearTimeout);
  timers = [];
}

function stopAudio(){
  Object.values(tracks).forEach(track => {
    track.pause();
    track.currentTime = 0;
  });
}

async function playTrack(name){
  if(!soundOn) return;
  stopAudio();
  const track = tracks[name];
  track.currentTime = 0;
  try { await track.play(); } catch(e) {}
}

function typingClick(character){
  if(!soundOn || character === " " || character === "\n") return;
  if(!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * .065), audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*.14));
  const source = audioContext.createBufferSource(); source.buffer=buffer;
  const clickGain = audioContext.createGain();
  clickGain.gain.setValueAtTime(.0001,now);
  clickGain.gain.exponentialRampToValueAtTime(.18,now+.002);
  clickGain.gain.exponentialRampToValueAtTime(.0001,now+.065);
  source.connect(clickGain); clickGain.connect(audioContext.destination);
  const tone = audioContext.createOscillator();
  const toneGain = audioContext.createGain();
  tone.type = "triangle";
  tone.frequency.setValueAtTime(1650 + Math.random()*180,now);
  tone.frequency.exponentialRampToValueAtTime(720,now+.09);
  toneGain.gain.setValueAtTime(.0001,now);
  toneGain.gain.exponentialRampToValueAtTime(.084,now+.004);
  toneGain.gain.exponentialRampToValueAtTime(.0001,now+.09);
  tone.connect(toneGain); toneGain.connect(audioContext.destination);
  source.start(now); tone.start(now); tone.stop(now+.1);
}

function terminalLetterClick(){
  typingClick("letter");
}

function typeText(el,text,speed,callback,letterSound=typingClick){
  el.textContent="";
  let i=0;
  function next(){
    if(i<text.length){
      const ch=text[i++];
      el.textContent+=ch;
      letterSound(ch);
      wait(next,speed+Math.random()*24);
    } else if(callback) callback();
  }
  next();
}

function hideScenes(){
  [terminalScene,codeScene,wormyScene,insightsScene].forEach(s=>s.classList.remove("on"));
  question.textContent="";
  answer.textContent="";
  promptOne.classList.remove("show");
  promptTwo.classList.remove("show");
  terminalScene.classList.remove("hard-glitch");
  iamFlash.classList.remove("show");
}

function finishIntro(){
  clearTimers();
  stopAudio();
  hideScenes();
  intro.classList.add("hidden");
  intro.setAttribute("aria-hidden","true");
  localStorage.setItem("projectLaunchIntroSeen","yes");
}

function playIntro(withSound=soundOn){
  clearTimers();
  stopAudio();
  soundOn=withSound;
  soundToggle.textContent=`Sound: ${soundOn ? "On" : "Off"}`;
  soundToggle.setAttribute("aria-pressed",String(soundOn));
  intro.classList.remove("hidden");
  intro.setAttribute("aria-hidden","false");
  entryChoice.classList.add("off");
  hideScenes();

  // Terminal: explicit two-line question.
  terminalScene.classList.add("on");
  playTrack("terminal");
  wait(()=>{
    promptOne.classList.add("show");
    typeText(question,"WHO IS THIS?\nARE YOU ONLINE?",92);
  },650);

  // Pause, then interrupted response.
  wait(()=>{
    promptTwo.classList.add("show");
    typeText(answer,"I A",340,()=>{
      // The response stops after "I A"; the unexplained visual interruption follows.
      wait(()=>{
        terminalScene.classList.add("hard-glitch");
        iamFlash.classList.add("show");
        wait(()=>iamFlash.classList.remove("show"),5000);
      },180);
      wait(()=>{
        terminalScene.classList.remove("on");
        codeScene.classList.add("on");
        playTrack("code");
      },5250);
    },terminalLetterClick);
  },5600);

  // Code reveal.
  wait(()=>{
    codeScene.classList.remove("on");
    wormyScene.classList.add("on");
    playTrack("wormy");
  },11200);

  // Wormy: brief, clean, cheerful, absolutely no glitch.
  wait(()=>{
    wormyScene.classList.remove("on");
    insightsScene.classList.add("on");
    playTrack("insights");
  },15100);

  // Insights: brief animated close, then homepage.
  wait(()=>finishIntro(),19000);
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
  if(!soundOn) stopAudio();
  soundToggle.textContent=`Sound: ${soundOn ? "On" : "Off"}`;
  soundToggle.setAttribute("aria-pressed",String(soundOn));
});

soundToggle.textContent=`Sound: ${soundOn ? "On" : "Off"}`;
soundToggle.setAttribute("aria-pressed",String(soundOn));
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
