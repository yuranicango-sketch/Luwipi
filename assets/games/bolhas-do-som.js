(function soundBubblesBootstrap() {
  "use strict";

  const card = document.getElementById("soundBubblesCard");
  const view = document.getElementById("soundBubblesView");
  const gamesView = document.getElementById("gamesView");
  const back = document.getElementById("soundBubblesBack");
  const stage = document.getElementById("soundBubblesStage");
  const progress = document.getElementById("soundBubblesProgress");
  const animal = document.getElementById("soundBubblesAnimal");
  const silenceLayer = document.getElementById("soundBubblesSilence");
  const startOverlay = document.getElementById("soundBubblesStart");
  const finishOverlay = document.getElementById("soundBubblesFinish");
  const playButton = document.getElementById("soundBubblesPlay");
  const replayButton = document.getElementById("soundBubblesReplay");

  if (!card || !view || !gamesView || !stage || !progress || !animal ||
      !silenceLayer || !startOverlay || !finishOverlay || !playButton || !replayButton) return;

  const HITS_PER_SILENCE = 4;
  const SILENCE_MS = 2700;
  const SPAWN_MS = 860;
  const animals = ["🐘", "🐰", "🐥", "🐼"];
  const bubbleStyles = ["sun", "berry", "sky", "leaf", "grape"];

  // Public-domain children's melodies. Each successful bubble tap advances exactly one note.
  const songs = [
    {
      id: "twinkle",
      melody: [
        "C4","C4","G4","G4","A4","A4","G4",
        "F4","F4","E4","E4","D4","D4","C4",
        "G4","G4","F4","F4","E4","E4","D4",
        "G4","G4","F4","F4","E4","E4","D4",
        "C4","C4","G4","G4","A4","A4","G4",
        "F4","F4","E4","E4","D4","D4","C4"
      ]
    },
    {
      id: "mary",
      melody: [
        "E4","D4","C4","D4","E4","E4","E4",
        "D4","D4","D4","E4","G4","G4",
        "E4","D4","C4","D4","E4","E4","E4","E4",
        "D4","D4","E4","D4","C4",
        "E4","D4","C4","D4","E4","E4","E4",
        "D4","D4","E4","G4","G4"
      ]
    },
    {
      id: "frere",
      melody: [
        "C4","D4","E4","C4","C4","D4","E4","C4",
        "E4","F4","G4","E4","F4","G4",
        "G4","A4","G4","F4","E4","C4",
        "G4","A4","G4","F4","E4","C4",
        "C4","G4","C4","C4","G4","C4"
      ]
    }
  ];

  const semitones = { C4: 0, D4: 2, E4: 4, F4: 5, G4: 7, A4: 9, B4: 11, C5: 12 };

  let audioCtx = null;
  let pianoBuffer = null;
  let running = false;
  let silent = false;
  let score = 0;
  let phaseHits = 0;
  let spawnSerial = 0;
  let spawnTimer = null;
  let silenceTimer = null;
  let currentSong = songs[0];

  function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  // A short piano-like struck-string sample generated once, then pitch-shifted.
  // Intentionally avoids oscillator "beep" feedback.
  function ensurePianoBuffer() {
    const ctx = getAudioContext();
    if (pianoBuffer) return pianoBuffer;

    const duration = 1.25;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    const base = 261.63;

    for (let i = 0; i < data.length; i += 1) {
      const t = i / sampleRate;
      const attack = Math.min(t / 0.008, 1);
      const fundamental = Math.sin(2 * Math.PI * base * t) * Math.exp(-3.0 * t);
      const harmonic2 = 0.34 * Math.sin(2 * Math.PI * base * 2.01 * t) * Math.exp(-6.3 * t);
      const harmonic3 = 0.16 * Math.sin(2 * Math.PI * base * 3.02 * t) * Math.exp(-9.0 * t);
      const harmonic4 = 0.07 * Math.sin(2 * Math.PI * base * 4.04 * t) * Math.exp(-11.5 * t);
      const resonance = 0.03 * Math.sin(2 * Math.PI * (base / 2) * t) * Math.exp(-4.5 * t);
      data[i] = (fundamental + harmonic2 + harmonic3 + harmonic4 + resonance) * attack * 0.42;
    }

    pianoBuffer = buffer;
    return buffer;
  }

  function playPiano(note) {
    if (silent) return;

    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = ensurePianoBuffer();
    source.playbackRate.value = Math.pow(2, (semitones[note] || 0) / 12);
    filter.type = "lowpass";
    filter.frequency.value = 5200;
    filter.Q.value = 0.45;
    gain.gain.value = 0.95;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  function shuffle(values) {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  // Shuffle-bag: all melodies rotate before repeating, and the same song
  // is not selected twice in a row when a fresh bag begins.
  function chooseSong() {
    const bagKey = "luwipi:bolhas-do-som:bag";
    const lastKey = "luwipi:bolhas-do-som:last";
    const ids = songs.map((song) => song.id);
    let bag = [];

    try {
      bag = JSON.parse(localStorage.getItem(bagKey) || "[]");
      if (!Array.isArray(bag) || bag.some((id) => !ids.includes(id))) bag = [];
    } catch (_) {
      bag = [];
    }

    let last = null;
    try {
      last = localStorage.getItem(lastKey);
    } catch (_) {}

    if (!bag.length) {
      bag = shuffle(ids);
      if (bag.length > 1 && bag[0] === last) {
        const first = bag[0];
        bag[0] = bag[1];
        bag[1] = first;
      }
    }

    const nextId = bag.shift();
    try {
      localStorage.setItem(bagKey, JSON.stringify(bag));
      localStorage.setItem(lastKey, nextId);
    } catch (_) {}

    return songs.find((song) => song.id === nextId) || songs[0];
  }

  function setDocumentTitle(title) {
    document.title = title;
  }

  function showView(target) {
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function clearTimers() {
    if (spawnTimer) clearInterval(spawnTimer);
    if (silenceTimer) clearTimeout(silenceTimer);
    spawnTimer = null;
    silenceTimer = null;
  }

  function removeTransient() {
    stage.querySelectorAll(".sb-bubble,.sb-spark").forEach((item) => item.remove());
  }

  function stopGame() {
    running = false;
    silent = false;
    clearTimers();
    removeTransient();
    silenceLayer.classList.remove("show");
  }

  function openGame() {
    stopGame();
    showView(view);
    startOverlay.classList.remove("hidden");
    finishOverlay.classList.add("hidden");
    animal.textContent = animals[0];
    setDocumentTitle("Bolhas do Som | Luwipi");
  }

  function closeGame() {
    stopGame();
    showView(gamesView);
    setDocumentTitle("Jogos | Luwipi");
  }

  function buildProgress() {
    const phases = Math.ceil(currentSong.melody.length / HITS_PER_SILENCE);
    progress.innerHTML = "";
    for (let i = 0; i < phases; i += 1) {
      const dot = document.createElement("span");
      dot.className = "sb-progress-dot";
      progress.appendChild(dot);
    }
  }

  function updateProgress() {
    const completed = Math.floor(score / HITS_PER_SILENCE);
    Array.from(progress.children).forEach((dot, index) => {
      dot.classList.toggle("on", index < completed);
    });
  }

  function bounceAnimal() {
    animal.classList.remove("hit");
    void animal.offsetWidth;
    animal.classList.add("hit");
  }

  function addSparkles(x, y) {
    const glyphs = ["✨", "★", "♪", "✦"];
    for (let i = 0; i < 7; i += 1) {
      const spark = document.createElement("span");
      spark.className = "sb-spark";
      spark.textContent = glyphs[i % glyphs.length];
      spark.style.left = x + "px";
      spark.style.top = y + "px";
      spark.style.setProperty("--sx", ((Math.random() - 0.5) * 120) + "px");
      spark.style.setProperty("--sy", ((Math.random() - 0.5) * 110 - 20) + "px");
      stage.appendChild(spark);
      setTimeout(() => spark.remove(), 620);
    }
  }

  function spawnBubble() {
    if (!running || silent || score >= currentSong.melody.length) return;

    const rect = stage.getBoundingClientRect();
    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "sb-bubble " + bubbleStyles[spawnSerial % bubbleStyles.length];
    bubble.setAttribute("aria-label", "Tocar som");
    bubble.innerHTML = '<span aria-hidden="true">' + (spawnSerial % 2 ? "♫" : "♪") + "</span>";
    bubble.style.left = (rect.width / 2 + (Math.random() * 90 - 45)) + "px";
    bubble.style.top = (rect.height * 0.65) + "px";
    bubble.style.setProperty("--dx", ((Math.random() - 0.5) * rect.width * 0.72) + "px");
    bubble.style.setProperty("--dy", (-rect.height * (0.32 + Math.random() * 0.28)) + "px");
    spawnSerial += 1;

    bubble.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!running || silent || bubble.classList.contains("pop")) return;

      // Melody advances only on a successful child action.
      playPiano(currentSong.melody[score]);
      bounceAnimal();
      bubble.classList.add("pop");

      const bubbleRect = bubble.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      addSparkles(
        bubbleRect.left - stageRect.left + bubbleRect.width / 2,
        bubbleRect.top - stageRect.top + bubbleRect.height / 2
      );

      score += 1;
      phaseHits += 1;
      updateProgress();
      setTimeout(() => bubble.remove(), 210);

      if (score >= currentSong.melody.length) {
        clearTimers();
        setTimeout(finishGame, 650);
        return;
      }

      if (phaseHits === HITS_PER_SILENCE) {
        phaseHits = 0;
        if (spawnTimer) clearInterval(spawnTimer);
        spawnTimer = null;
        setTimeout(beginSilence, 420);
      }
    }, { passive: false });

    stage.appendChild(bubble);
    setTimeout(() => {
      if (bubble.isConnected) bubble.remove();
    }, 4700);
  }

  function beginSilence() {
    if (!running) return;

    silent = true;
    removeTransient();
    silenceLayer.classList.add("show");

    silenceTimer = setTimeout(() => {
      if (!running) return;

      silenceLayer.classList.remove("show");
      silent = false;
      animal.textContent = animals[Math.floor(score / HITS_PER_SILENCE) % animals.length];
      bounceAnimal();

      // Do not play or advance a melody note here.
      setTimeout(spawnBubble, 320);
      spawnTimer = setInterval(spawnBubble, SPAWN_MS);
    }, SILENCE_MS);
  }

  function startGame() {
    getAudioContext();
    stopGame();

    currentSong = chooseSong();
    score = 0;
    phaseHits = 0;
    spawnSerial = 0;
    running = true;
    silent = false;
    animal.textContent = animals[0];

    buildProgress();
    updateProgress();
    startOverlay.classList.add("hidden");
    finishOverlay.classList.add("hidden");
    silenceLayer.classList.remove("show");

    setTimeout(spawnBubble, 260);
    spawnTimer = setInterval(spawnBubble, SPAWN_MS);
  }

  function finishGame() {
    if (!running) return;

    running = false;
    clearTimers();
    removeTransient();
    silenceLayer.classList.remove("show");
    Array.from(progress.children).forEach((dot) => dot.classList.add("on"));
    finishOverlay.classList.remove("hidden");
  }

  silenceLayer.addEventListener("pointerdown", () => {
    const sticker = silenceLayer.querySelector(".sb-shhh-sticker");
    if (!sticker) return;
    sticker.classList.remove("nudge");
    void sticker.offsetWidth;
    sticker.classList.add("nudge");
  });

  card.addEventListener("click", openGame);
  back.addEventListener("click", closeGame);
  playButton.addEventListener("click", startGame);
  replayButton.addEventListener("click", startGame);
  window.addEventListener("pagehide", stopGame);
})();