// Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Word list - embedded directly for standalone use
const WORDS = [
  {"word":"not","acceptAs":["knot"]},
  {"word":"just","acceptAs":[]},
  {"word":"your","acceptAs":["youre","you're"]},
  {"word":"out","acceptAs":[]},
  {"word":"by","acceptAs":["buy","bye"]},

  {"word":"on","acceptAs":[]},
  {"word":"to","acceptAs":["too","two"]},
  {"word":"two","acceptAs":["to","too"]},
  {"word":"big","acceptAs":[]},
  {"word":"had","acceptAs":[]},

  {"word":"up","acceptAs":[]},
  {"word":"like","acceptAs":[]},
  {"word":"was","acceptAs":["wuz"]},
  {"word":"did","acceptAs":[]},
  {"word":"we","acceptAs":["wee"]},

  {"word":"my","acceptAs":[]},
  {"word":"what","acceptAs":[]},
  {"word":"for","acceptAs":["four","fore"]},
  {"word":"him","acceptAs":[]},
  {"word":"can","acceptAs":[]},

  {"word":"be","acceptAs":["bee"]},
  {"word":"it","acceptAs":[]},
  {"word":"she","acceptAs":[]},
  {"word":"at","acceptAs":[]},
  {"word":"all","acceptAs":["awl"]},

  {"word":"in","acceptAs":["inn"]},
  {"word":"but","acceptAs":["butt"]},
  {"word":"you","acceptAs":["u"]},
  {"word":"food","acceptAs":[]},
  {"word":"the","acceptAs":["duh"]},

  {"word":"too","acceptAs":["to","two"]},
  {"word":"or","acceptAs":["oar","ore"]},
  {"word":"is","acceptAs":[]},
  {"word":"so","acceptAs":["sew"]},
  {"word":"are","acceptAs":["our","r"]},

  {"word":"will","acceptAs":[]},
  {"word":"he","acceptAs":[]},
  {"word":"some","acceptAs":["sum"]},
  {"word":"me","acceptAs":[]},
  {"word":"if","acceptAs":[]},

  {"word":"a","acceptAs":["uh","aye"]},
  {"word":"day","acceptAs":[]},
  {"word":"have","acceptAs":["hav"]},
  {"word":"one","acceptAs":["won"]},
  {"word":"and","acceptAs":[]},

  {"word":"make","acceptAs":[]},
  {"word":"I","acceptAs":["eye"]},
  {"word":"look","acceptAs":[]},
  {"word":"little","acceptAs":["lil"]},
  {"word":"school","acceptAs":[]}
];

// Application state
const state = {
  words: WORDS,
  currentWord: null,
  lastWord: null,
  isListening: false,
  feedback: null, // 'correct' | 'wrong' | null
  status: '',
  recognition: null,
  timeoutId: null,
  audioContext: null,
  analyser: null,
  animationFrameId: null,
};

// ============================================================================
// Matching Algorithm Functions (ported from SightWordsActivity.tsx)
// ============================================================================

function normalise(str) {
  return str.trim().toLowerCase().replace(/[^a-z]/g, '');
}

function dedupRepeatedWords(phrase) {
  const words = phrase.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return phrase;

  // If all words are identical, return just one
  if (words.every(w => w === words[0])) {
    return words[0];
  }

  return phrase;
}

function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function getPhoneticKey(word) {
  const cleaned = normalise(word);
  if (!cleaned) return '';

  const codes = {
    b: '1',
    f: '1',
    p: '1',
    v: '1',
    c: '2',
    g: '2',
    j: '2',
    k: '2',
    q: '2',
    s: '2',
    x: '2',
    z: '2',
    d: '3',
    t: '3',
    l: '4',
    m: '5',
    n: '5',
    r: '6',
  };

  let phonetic = cleaned[0];
  let lastCode = '';

  for (let i = 1; i < cleaned.length; i++) {
    const code = codes[cleaned[i]] || '';
    if (code && code !== lastCode) {
      phonetic += code;
      lastCode = code;
    } else if (!code) {
      lastCode = '';
    }
  }

  return phonetic.padEnd(4, '0').substring(0, 4);
}

function isCorrectWord(heard, target, confidence = 1) {
  const normHeard = normalise(heard);
  const normTarget = normalise(target);

  if (normHeard.length < 1) return false;
  if (normTarget.length > 3 && normHeard.length < Math.max(2, normTarget.length - 1))
    return false;
  // Exact match always accepted regardless of confidence
  if (normHeard === normTarget) return true;
  // Lower threshold for short words
  const minConfidence = normTarget.length <= 2 ? 0.1 : 0.25;
  if (confidence < minConfidence) return false;

  // For short words (<=3 chars), only accept exact matches
  if (normTarget.length <= 3) return false;

  const distance = editDistance(normHeard, normTarget);
  if (distance === 1 && confidence >= 0.5) return true;

  if (Math.abs(normHeard.length - normTarget.length) <= 2) {
    const heardPhonetic = getPhoneticKey(heard);
    const targetPhonetic = getPhoneticKey(target);
    if (heardPhonetic === targetPhonetic) return true;
    if (heardPhonetic.length > 1 && targetPhonetic.length > 1) {
      if (heardPhonetic.substring(1) === targetPhonetic.substring(1)) return true;
    }
  }

  return false;
}

// Check if target word appears as a standalone word within the heard phrase
function containsWord(phrase, target) {
  const normTarget = normalise(target);
  const words = phrase.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  for (const word of words) {
    if (normalise(word) === normTarget) {
      return true;
    }
  }

  return false;
}

// Check if heard matches word or any of its acceptAs alternatives
function checkWord(heard, wordObj, confidence) {
  if (isCorrectWord(heard, wordObj.word, confidence)) {
    return true;
  }

  // Check if the target word is contained as a word within what was heard
  if (containsWord(heard, wordObj.word)) {
    return true;
  }

  if (wordObj.acceptAs && Array.isArray(wordObj.acceptAs)) {
    for (const alt of wordObj.acceptAs) {
      if (isCorrectWord(heard, alt, confidence)) {
        return true;
      }
      // Also check if alt is contained within the heard phrase
      if (containsWord(heard, alt)) {
        return true;
      }
    }
  }

  return false;
}


// ============================================================================
// Audio Visualization
// ============================================================================

async function startAudioVisualization() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    state.audioContext = audioContext;
    state.analyser = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const micPulse = document.querySelector('.sw-mic-pulse');

    function updateVisualization() {
      if (!state.isListening) {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
          state.animationFrameId = null;
        }
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalized = Math.min(average / 255, 1);

      if (micPulse) {
        // Scale between 0.8 and 1.5 based on audio level, but invert for visual effect
        const scale = 0.8 + (1 - normalized) * 0.7;  // Bigger when quieter (stays visible)
        micPulse.style.transform = `scale(${scale})`;
        micPulse.style.opacity = 1;  // Always fully opaque
      }

      state.animationFrameId = requestAnimationFrame(updateVisualization);
    }

    updateVisualization();
  } catch (error) {
    console.error('Audio visualization setup failed:', error.message);
  }
}

function stopAudioVisualization() {
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
  if (state.audioContext) {
    state.audioContext.close();
    state.audioContext = null;
  }
  state.analyser = null;

  const micPulse = document.querySelector('.sw-mic-pulse');
  if (micPulse) {
    micPulse.style.transform = '';
    micPulse.style.opacity = '';
  }
}

// ============================================================================
// Core App Functions
// ============================================================================


function pickRandomWord() {
  if (state.words.length === 0) return null;
  let word;
  let attempts = 0;
  const maxAttempts = 20; // prevent infinite loop

  do {
    const index = Math.floor(Math.random() * state.words.length);
    word = state.words[index];
    attempts++;
  } while (word === state.lastWord && attempts < maxAttempts);

  return word;
}

function nextWord() {
  state.lastWord = state.currentWord;
  state.currentWord = pickRandomWord();
  state.feedback = null;
  state.status = '';
  updateDOM();
  setTimeout(() => startListening(), 100);
}

function startListening() {
  if (!SpeechRecognition) {
    state.status = 'Speech recognition not available in this browser';
    updateDOM();
    return;
  }

  console.log('[Speech] Starting to listen for:', state.currentWord?.word);
  state.isListening = true;
  updateDOM();

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;

  state.recognition = recognition;

  let resultHandled = false;
  let lastInterim = '';

  recognition.onresult = (event) => {
    console.log(`[Result] onresult fired, resultHandled=${resultHandled}, isFinal=${event.results[event.results.length - 1].isFinal}`);
    if (resultHandled) return;

    // Get the last result (most recent)
    const lastResult = event.results[event.results.length - 1];
    if (!lastResult) return;

    // Only process final results, but log interim ones
    if (!lastResult.isFinal) {
      const interim = lastResult[0]?.transcript || '';
      lastInterim = interim;
      console.log(`[Interim] "${interim}"`);
      return;
    }

    // Process final result
    let bestTranscript = '';
    let bestConfidence = 0;

    for (let i = 0; i < lastResult.length; i++) {
      const confidence = lastResult[i].confidence || 0;
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestTranscript = lastResult[i].transcript;
      }
    }

    console.log(`[Speech] Heard: "${bestTranscript}" (${Math.round(bestConfidence * 100)}%) | Target: "${state.currentWord?.word}"`);
    resultHandled = true;
    if (state.timeoutId) clearTimeout(state.timeoutId);
    handleSpeechResult(bestTranscript, bestConfidence);
  };

  recognition.onerror = (event) => {
    console.log(`[Error] Speech recognition error: ${event.error}`);
    if (resultHandled) return;
    resultHandled = true;
    state.isListening = false;

    // Ignore abort errors (happens when we manually stop recognition)
    if (event.error === 'aborted') return;

    if (event.error === 'not-allowed') {
      state.status = 'Microphone access denied. Please enable microphone permissions and refresh.';
      state.feedback = 'wrong';
    } else if (event.error === 'no-speech') {
      state.status = 'No speech detected. Try again.';
    } else if (event.error === 'network') {
      state.status = 'Network error. Try again.';
    } else {
      state.status = `Error: ${event.error}. Try again.`;
    }

    updateDOM();
    setTimeout(() => startListening(), 500);
  };

  recognition.onend = () => {
    console.log(`[End] Speech recognition ended. resultHandled=${resultHandled}, lastInterim="${lastInterim}"`);
    state.isListening = false;
    // If we got here without a final result, process the interim result if we have one
    if (!resultHandled && state.currentWord) {
      console.log('[End] No final result received, processing interim or restarting...');
      if (lastInterim) {
        // Process the interim result through matching logic with moderate confidence
        resultHandled = true;
        handleSpeechResult(lastInterim, 0.6);
      } else {
        // No interim result - show generic "try again"
        state.status = '🤷 Try again.';
        state.feedback = 'tryagain';
        updateDOM();
        setTimeout(() => {
          state.status = '';
          state.feedback = null;
          lastInterim = '';
          updateDOM();
          setTimeout(() => startListening(), 300);
        }, 1200);
      }
    }
  };

  recognition.start();
  console.log('[Speech] recognition.start() called');

  // 10-second timeout (give user time to respond)
  state.timeoutId = setTimeout(() => {
    console.log('[Timeout] 10 second timeout reached, calling recognition.stop()');
    try {
      recognition.stop();
    } catch (e) {
      // ignore
    }
  }, 10000);
}

function handleSpeechResult(heard, confidence) {
  state.isListening = false;

  try {
    const cleanHeard = dedupRepeatedWords(heard);
    const matched = checkWord(cleanHeard, state.currentWord, confidence);

    console.log(`[Match] "${cleanHeard}" vs "${state.currentWord?.word}": ${matched ? 'CORRECT ✓' : 'WRONG ✗'}`);

    if (matched) {
      state.status = '👍👍👍';
      state.feedback = 'correct';
      updateDOM();
      setTimeout(() => nextWord(), 1500);
    } else {
      state.status = `🤷 Heard: "${cleanHeard}"`;
      state.feedback = 'tryagain';
      console.log('[DOM] Setting feedback to "tryagain", calling updateDOM...');
      updateDOM();

      const wordDisplay = document.getElementById('wordDisplay');
      if (wordDisplay) {
        wordDisplay.classList.add('shake');
        setTimeout(() => wordDisplay.classList.remove('shake'), 400);
      }

      setTimeout(() => {
        state.status = '';
        state.feedback = null;
        updateDOM();
        setTimeout(() => startListening(), 300);
      }, 1500);
    }
  } catch (error) {
    console.error('Error in speech result handling:', error);
    state.status = 'Error processing result. Restarting...';
    state.feedback = null;
    updateDOM();
    setTimeout(() => startListening(), 500);
  }
}


function updateDOM() {
  const wordDisplay = document.getElementById('wordDisplay');
  const listeningIndicator = document.getElementById('listeningIndicator');
  const statusDisplay = document.getElementById('statusDisplay');

  if (wordDisplay && state.currentWord) {
    wordDisplay.textContent = state.currentWord.word;
    wordDisplay.classList.remove('shake');
    if (state.feedback !== 'wrong') {
      wordDisplay.style.color = '#333';
    }
  }

  if (listeningIndicator) {
    if (state.isListening) {
      listeningIndicator.classList.remove('hidden');
    } else {
      listeningIndicator.classList.add('hidden');
    }
  }

  if (statusDisplay) {
    statusDisplay.textContent = state.status;
    statusDisplay.className = 'sw-status';
    if (state.feedback === 'correct') {
      statusDisplay.classList.add('correct');
      statusDisplay.classList.add('visible');
    } else if (state.feedback === 'heard') {
      statusDisplay.classList.add('heard');
      statusDisplay.classList.add('visible');
    } else if (state.feedback === 'tryagain') {
      statusDisplay.classList.add('tryagain');
      statusDisplay.classList.add('visible');
    } else if (state.status) {
      statusDisplay.classList.add('visible');
    }
  }
}

// ============================================================================
// Event Listeners & Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const skipBtn = document.getElementById('skipBtn');

  if (skipBtn) {
    skipBtn.addEventListener('click', nextWord);
  }

  // Start app immediately
  if (state.words.length > 0) {
    nextWord();
  }
});
