/**
 * MODULAR BENTO SEARCH HUB & ENGINE
 * Precise geometric circles, centered search console, custom shortcuts,
 * calculator, scratchpad, clocks, weather, and Web Audio synthesizers.
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    currentEngine: 'google',
    currentMode: 'web',
    soundEnabled: true,
    tempUnit: 'C',
    weatherData: null,
    audioPlaying: false,
    timerSeconds: 25 * 60,
    timerRunning: false,
    timerInterval: null,
    activeSuggestionIdx: -1,
    audioCtx: null,
    audioSource: null,
    calcValue: '0',
    calcOp: null,
    calcWaitingForSecond: false
  };

  // Search Engine Configurations
  const SEARCH_ENGINES = {
    google: {
      name: 'Google',
      icon: 'https://www.google.com/favicon.ico',
      label: 'GOOGLE SEARCH',
      webUrl: 'https://www.google.com/search?q=',
      imagesUrl: 'https://www.google.com/search?tbm=isch&q=',
      aiUrl: 'https://www.google.com/search?q=',
      placeholder: 'Search Google or type a URL...'
    },
    bing: {
      name: 'Bing',
      icon: 'https://www.bing.com/favicon.ico',
      label: 'MICROSOFT BING',
      webUrl: 'https://www.bing.com/search?q=',
      imagesUrl: 'https://www.bing.com/images/search?q=',
      aiUrl: 'https://www.bing.com/chat?q=',
      placeholder: 'Search Bing or ask Copilot...'
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      icon: 'https://duckduckgo.com/favicon.ico',
      label: 'DUCKDUCKGO PRIVATE',
      webUrl: 'https://duckduckgo.com/?q=',
      imagesUrl: 'https://duckduckgo.com/?iar=images&iax=images&ia=images&q=',
      aiUrl: 'https://duckduckgo.com/?q=',
      placeholder: 'Search DuckDuckGo privately...'
    },
    ecosia: {
      name: 'Ecosia',
      icon: 'https://www.ecosia.org/favicon.ico',
      label: 'ECOSIA TREES',
      webUrl: 'https://www.ecosia.org/search?q=',
      imagesUrl: 'https://www.ecosia.org/images?q=',
      aiUrl: 'https://www.ecosia.org/search?q=',
      placeholder: 'Search Ecosia...'
    },
    brave: {
      name: 'Brave',
      icon: 'https://brave.com/static-assets/images/brave-favicon.png',
      label: 'BRAVE SEARCH',
      webUrl: 'https://search.brave.com/search?q=',
      imagesUrl: 'https://search.brave.com/images?q=',
      aiUrl: 'https://search.brave.com/search?source=llm&q=',
      placeholder: 'Search Brave...'
    }
  };

  // DEFAULT SHORTCUTS IN VARIED SIZES (Matching reference aesthetic)
  const DEFAULT_SHORTCUTS = [
    {
      id: 'sc-1',
      title: 'ChatGPT',
      url: 'https://chatgpt.com',
      size: '2x1',
      icon: 'https://chatgpt.com/favicon.ico'
    },
    {
      id: 'sc-2',
      title: 'Steam Games',
      url: 'https://store.steampowered.com',
      size: '2x1',
      icon: 'https://store.steampowered.com/favicon.ico'
    },
    {
      id: 'sc-3',
      title: 'X / Twitter',
      url: 'https://x.com',
      size: '1x1',
      icon: 'https://abs.twimg.com/favicons/twitter.3.ico'
    },
    {
      id: 'sc-4',
      title: 'Gmail',
      url: 'https://mail.google.com',
      size: '1x1',
      icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico'
    },
    {
      id: 'sc-5',
      title: 'Cyberpunk Portrait',
      url: 'https://unsplash.com',
      size: '2x2',
      icon: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'sc-6',
      title: 'Tokyo Night',
      url: 'https://unsplash.com',
      size: '2x2',
      icon: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'sc-7',
      title: 'Netflix',
      url: 'https://www.netflix.com',
      size: '2x1',
      icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico'
    },
    {
      id: 'sc-8',
      title: 'Creative Hub',
      url: 'https://unsplash.com',
      size: '2x1',
      icon: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500'
    },
    {
      id: 'sc-9',
      title: 'YouTube',
      url: 'https://www.youtube.com',
      size: '2x1',
      icon: 'https://www.youtube.com/favicon.ico'
    },
    {
      id: 'sc-10',
      title: 'Discord',
      url: 'https://discord.com',
      size: '1x1c', // True Circle!
      icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'
    },
    {
      id: 'sc-11',
      title: 'Reddit',
      url: 'https://www.reddit.com',
      size: '1x1',
      icon: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png'
    },
    {
      id: 'sc-12',
      title: 'GitHub',
      url: 'https://github.com',
      size: '1x1',
      icon: 'https://github.githubassets.com/favicons/favicon.png'
    },
    {
      id: 'sc-13',
      title: 'Wikipedia',
      url: 'https://www.wikipedia.org',
      size: '1x1',
      icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
    },
    {
      id: 'sc-14',
      title: 'Google Maps',
      url: 'https://maps.google.com',
      size: '1x1',
      icon: 'https://www.google.com/images/branding/product/ico/maps15_bnu.ico'
    }
  ];

  // --- AUDIO SYNTHESIZER (Tactile Click & Lo-Fi Generator) ---
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  function playClick() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) { }
  }

  function startLoFiAudio() {
    stopLoFiAudio();
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.0;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    oscGain.gain.setValueAtTime(0.03, ctx.currentTime);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(gain);

    noiseSrc.start();
    osc.start();

    state.audioSource = { noiseSrc, osc, gain };
  }

  function stopLoFiAudio() {
    if (state.audioSource) {
      try {
        state.audioSource.noiseSrc.stop();
        state.audioSource.osc.stop();
      } catch (e) { }
      state.audioSource = null;
    }
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(msg, icon = '●') {
    const bar = document.getElementById('toastBar');
    const txt = document.getElementById('toastMsg');
    const ico = document.getElementById('toastIcon');
    if (!bar) return;

    if (toastTimer) clearTimeout(toastTimer);
    txt.textContent = msg;
    ico.textContent = icon;
    bar.classList.add('show');
    toastTimer = setTimeout(() => bar.classList.remove('show'), 2400);
  }

  // --- SEARCH CONTROLLER ---
  function initSearch() {
    const form = document.getElementById('searchBarForm');
    const input = document.getElementById('searchQueryInput');
    const clearBtn = document.getElementById('clearQueryBtn');
    const engineBtn = document.getElementById('engineSwitchBtn');
    const engineMenu = document.getElementById('engineMenu');
    const curEngineIco = document.getElementById('curEngineIco');
    const curEngineTxt = document.getElementById('curEngineTxt');
    const activeEngineLabel = document.getElementById('activeEngineLabel');
    const engineItems = document.querySelectorAll('.engine-menu-item');
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    const suggestDropdown = document.getElementById('suggestDropdown');
    const voiceBtn = document.getElementById('voiceTriggerBtn');
    const recCard = document.getElementById('recVoiceCard');
    const chips = document.querySelectorAll('.hot-tag');

    // Saved engine
    const saved = localStorage.getItem('hub_engine');
    if (saved && SEARCH_ENGINES[saved]) setEngine(saved);

    function setEngine(key) {
      if (!SEARCH_ENGINES[key]) return;
      state.currentEngine = key;
      const eng = SEARCH_ENGINES[key];

      curEngineTxt.textContent = eng.name;
      curEngineIco.src = eng.icon;
      activeEngineLabel.textContent = eng.label;
      input.placeholder = eng.placeholder;

      engineItems.forEach(item => {
        item.classList.toggle('selected', item.getAttribute('data-engine') === key);
      });

      localStorage.setItem('hub_engine', key);
    }

    // Engine dropdown toggle
    engineBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playClick();
      engineMenu.classList.toggle('show');
    });

    engineItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        playClick();
        const key = item.getAttribute('data-engine');
        setEngine(key);
        engineMenu.classList.remove('show');
        showToast(`Engine set to ${SEARCH_ENGINES[key].name}`);
        input.focus();
      });
    });

    document.addEventListener('click', (e) => {
      if (!engineBtn.contains(e.target) && !engineMenu.contains(e.target)) {
        engineMenu.classList.remove('show');
      }
      if (!form.contains(e.target)) {
        suggestDropdown.classList.remove('show');
      }
    });

    // Mode tabs
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        playClick();
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentMode = tab.getAttribute('data-mode');

        if (state.currentMode === 'images') {
          input.placeholder = `Search images with ${SEARCH_ENGINES[state.currentEngine].name}...`;
        } else if (state.currentMode === 'ai') {
          input.placeholder = `Ask AI anything (smart search)...`;
        } else {
          input.placeholder = SEARCH_ENGINES[state.currentEngine].placeholder;
        }
        input.focus();
      });
    });

    // Input changes
    input.addEventListener('input', () => {
      clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
      fetchSuggestions(input.value.trim());
    });

    clearBtn.addEventListener('click', () => {
      playClick();
      input.value = '';
      clearBtn.style.display = 'none';
      suggestDropdown.classList.remove('show');
      input.focus();
    });

    // Chips
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        playClick();
        const q = chip.getAttribute('data-q');
        input.value = q;
        clearBtn.style.display = 'flex';
        executeSearch(q);
      });
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      const rows = suggestDropdown.querySelectorAll('.suggest-row');
      if (suggestDropdown.classList.contains('show') && rows.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          state.activeSuggestionIdx = (state.activeSuggestionIdx + 1) % rows.length;
          updateSuggestActive(rows);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          state.activeSuggestionIdx = (state.activeSuggestionIdx - 1 + rows.length) % rows.length;
          updateSuggestActive(rows);
        } else if (e.key === 'Escape') {
          suggestDropdown.classList.remove('show');
        }
      }
    });

    function updateSuggestActive(rows) {
      rows.forEach((row, idx) => {
        if (idx === state.activeSuggestionIdx) {
          row.classList.add('active');
          input.value = row.getAttribute('data-q');
        } else {
          row.classList.remove('active');
        }
      });
    }

    // Submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch(input.value.trim());
    });

    function executeSearch(query) {
      if (!query) return;
      playClick();
      suggestDropdown.classList.remove('show');

      const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(query);
      if (isUrl && !query.includes(' ')) {
        const dest = query.startsWith('http') ? query : `https://${query}`;
        window.location.href = dest;
        return;
      }

      const eng = SEARCH_ENGINES[state.currentEngine];
      let url = '';

      if (state.currentMode === 'images') {
        url = `${eng.imagesUrl}${encodeURIComponent(query)}`;
      } else if (state.currentMode === 'ai') {
        if (state.currentEngine === 'google') {
          url = `https://www.google.com/search?q=${encodeURIComponent(query)}+AI+overview`;
        } else {
          url = `${eng.aiUrl}${encodeURIComponent(query)}`;
        }
      } else {
        url = `${eng.webUrl}${encodeURIComponent(query)}`;
      }

      window.location.href = url;
    }

    // "/" Shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== input && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        input.focus();
      }
    });

    // Voice search
    function triggerVoice() {
      playClick();
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Voice search not supported in this browser', '⚠️');
        return;
      }
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      voiceBtn.classList.add('recording');
      showToast('Listening... Speak your query', '🎙️');

      rec.onresult = (evt) => {
        const text = evt.results[0][0].transcript;
        input.value = text;
        clearBtn.style.display = 'flex';
        executeSearch(text);
      };
      rec.onerror = () => {
        voiceBtn.classList.remove('recording');
        showToast('Voice search cancelled');
      };
      rec.onend = () => voiceBtn.classList.remove('recording');
      rec.start();
    }

    voiceBtn.addEventListener('click', triggerVoice);
    if (recCard) recCard.addEventListener('click', triggerVoice);
  }

  // --- AUTO-SUGGESTIONS ---
  let suggestTimer = null;
  function fetchSuggestions(query) {
    const box = document.getElementById('suggestDropdown');
    if (!query) {
      box.classList.remove('show');
      return;
    }

    if (suggestTimer) clearTimeout(suggestTimer);
    suggestTimer = setTimeout(() => {
      const cb = 'suggestCb_' + Math.floor(Math.random() * 1000000);
      window[cb] = (data) => {
        try {
          if (data && data[1] && data[1].length > 0) {
            renderSuggestions(data[1].slice(0, 5));
          } else {
            box.classList.remove('show');
          }
        } finally {
          delete window[cb];
          const s = document.getElementById(cb);
          if (s) s.remove();
        }
      };

      const s = document.createElement('script');
      s.id = cb;
      s.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=${cb}`;
      document.body.appendChild(s);
    }, 180);
  }

  function renderSuggestions(list) {
    const box = document.getElementById('suggestDropdown');
    const input = document.getElementById('searchQueryInput');
    box.innerHTML = '';
    state.activeSuggestionIdx = -1;

    list.forEach(txt => {
      const row = document.createElement('div');
      row.className = 'suggest-row';
      row.setAttribute('data-q', txt);
      row.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>${escapeHtml(txt)}</span>
      `;
      row.addEventListener('click', () => {
        playClick();
        input.value = txt;
        box.classList.remove('show');
        document.getElementById('searchBarForm').dispatchEvent(new Event('submit'));
      });
      box.appendChild(row);
    });

    box.classList.add('show');
  }

  // --- CLOCKS & CALENDAR ---
  function initClocks() {
    const hHand = document.getElementById('hourHand');
    const mHand = document.getElementById('minHand');
    const sHand = document.getElementById('secHand');
    const dial = document.querySelector('.analog-dial-box');

    const calDayName = document.getElementById('calDayName');
    const calMonthName = document.getElementById('calMonthName');
    const calDayNum = document.getElementById('calDayNum');
    const calYearText = document.getElementById('calYearText');

    const digitalTimeVal = document.getElementById('digitalTimeVal');
    const digitalTimeGmt = document.getElementById('digitalTimeGmt');

    // 12 hour dot markers
    for (let i = 0; i < 12; i++) {
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.width = '3px';
      dot.style.height = '3px';
      dot.style.backgroundColor = (i % 3 === 0) ? 'var(--accent-red)' : '#777';
      dot.style.borderRadius = '50%';
      dot.style.top = '50%';
      dot.style.left = '50%';
      dot.style.transform = `rotate(${i * 30}deg) translate(0, -56px)`;
      dial.appendChild(dot);
    }

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    function tick() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      const sDeg = (s + ms / 1000) * 6;
      const mDeg = (m + s / 60) * 6;
      const hDeg = ((h % 12) + m / 60) * 30;

      hHand.style.transform = `rotate(${hDeg}deg)`;
      mHand.style.transform = `rotate(${mDeg}deg)`;
      if (hHand) hHand.style.transform = `rotate(${hDeg}deg)`;
      if (mHand) mHand.style.transform = `rotate(${mDeg}deg)`;
      if (sHand) sHand.style.transform = `rotate(${sDeg}deg)`;

      if (calDayName) calDayName.textContent = days[now.getDay()];
      if (calMonthName) calMonthName.textContent = months[now.getMonth()];
      if (calDayNum) calDayNum.textContent = now.getDate();
      if (calYearText) calYearText.textContent = now.getFullYear();

      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const ss = String(s).padStart(2, '0');
      if (digitalTimeVal) digitalTimeVal.textContent = `${hh}:${mm}:${ss}`;

      const watchDayEl = document.getElementById('watchDayName');
      if (watchDayEl) watchDayEl.textContent = days[now.getDay()];

      const offset = -now.getTimezoneOffset() / 60;
      if (digitalTimeGmt) digitalTimeGmt.textContent = `GMT${offset >= 0 ? '+' : ''}${offset}`;
    }

    tick();
    setInterval(tick, 1000);
  }

  // --- WEATHER WIDGET ---
  function initWeather() {
    const cityEl = document.getElementById('weatherCityText');
    const descEl = document.getElementById('weatherDescText');
    const tempEl = document.getElementById('weatherTempText');
    const unitBtn = document.getElementById('weatherUnitBtn');

    const savedUnit = localStorage.getItem('hub_temp_unit');
    if (savedUnit) state.tempUnit = savedUnit;
    if (unitBtn) unitBtn.textContent = `°${state.tempUnit}`;

    if (unitBtn) {
      unitBtn.addEventListener('click', () => {
        playClick();
        state.tempUnit = state.tempUnit === 'C' ? 'F' : 'C';
        unitBtn.textContent = `°${state.tempUnit}`;
        localStorage.setItem('hub_temp_unit', state.tempUnit);
        if (state.weatherData) renderWeather(state.weatherData);
      });
    }

    let defaultWeather = {
      city: 'LONDON',
      desc: 'Partly Cloudy',
      tempC: 18
    };

    function renderWeather(data) {
      state.weatherData = data;
      if (cityEl) cityEl.textContent = data.city;
      if (descEl) descEl.textContent = data.desc;

      const isF = state.tempUnit === 'F';
      const val = isF ? Math.round((data.tempC * 9) / 5 + 32) : Math.round(data.tempC);
      if (tempEl) tempEl.textContent = `${val}°`;
    }

    renderWeather(defaultWeather);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          if (res.ok) {
            const json = await res.json();
            renderWeather({
              city: 'LOCAL',
              desc: 'Clear Sky',
              tempC: json.current_weather.temperature
            });
          }
        } catch (e) { }
      }, () => { }, { timeout: 5000 });
    }
  }

  // --- FOCUS SESSION TIMER (40MIN OVER LIMIT Style) ---
  function initFocusTimer() {
    const digits = document.getElementById('timerDigits');
    const btn = document.getElementById('timerActionBtn');
    const label = document.getElementById('timerLabel');
    const card = document.getElementById('focusSessionCard');

    function update() {
      const m = Math.floor(state.timerSeconds / 60);
      const s = state.timerSeconds % 60;
      if (digits) digits.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function toggleTimer() {
      playClick();
      if (state.timerRunning) {
        state.timerRunning = false;
        clearInterval(state.timerInterval);
        if (btn) btn.textContent = 'START';
        if (label) label.textContent = 'PAUSED';
      } else {
        state.timerRunning = true;
        if (btn) btn.textContent = 'PAUSE';
        if (label) label.textContent = 'FOCUSING...';
        state.timerInterval = setInterval(() => {
          if (state.timerSeconds > 0) {
            state.timerSeconds--;
            update();
          } else {
            clearInterval(state.timerInterval);
            state.timerRunning = false;
            if (btn) btn.textContent = 'RESTART';
            if (label) label.textContent = 'COMPLETED';
            showToast('Focus session complete!');
          }
        }, 1000);
      }
    }

    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTimer();
      });
    }

    if (card) card.addEventListener('click', toggleTimer);
  }

  // --- AUDIO / LO-FI PLAYER ---
  function initAudioPlayer() {
    const card = document.getElementById('audioPlayerCard');
    const playBtn = document.getElementById('audioPlayToggle');
    const icon = document.getElementById('audioIcon');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        playClick();
        state.audioPlaying = !state.audioPlaying;

        if (state.audioPlaying) {
          if (card) card.classList.add('playing');
          if (icon) {
            icon.innerHTML = `
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            `;
          }
          startLoFiAudio();
          showToast('Lo-Fi focus soundscape playing');
        } else {
          if (card) card.classList.remove('playing');
          if (icon) icon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
          stopLoFiAudio();
          showToast('Audio paused');
        }
      });
    }
  }

  // --- SCRATCHPAD QUICK NOTES ---
  function initScratchpad() {
    const textarea = document.getElementById('scratchpadArea');
    if (!textarea) return;

    const saved = localStorage.getItem('hub_scratchpad');
    if (saved) textarea.value = saved;

    textarea.addEventListener('input', () => {
      localStorage.setItem('hub_scratchpad', textarea.value);
    });
  }

  // --- CALCULATOR MODAL & LOGIC ---
  function initCalculator() {
    const card = document.getElementById('calcToggleCard');
    const modal = document.getElementById('calcModal');
    const closeBtn = document.getElementById('closeCalcModal');
    const display = document.getElementById('calcDisplay');
    const keys = document.querySelectorAll('.calc-btn');

    if (card) {
      card.addEventListener('click', () => {
        playClick();
        if (modal) modal.classList.add('open');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        playClick();
        if (modal) modal.classList.remove('open');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    keys.forEach(btn => {
      btn.addEventListener('click', () => {
        playClick();
        const action = btn.dataset.action;
        const val = btn.dataset.val;

        if (action === 'clear') {
          state.calcValue = '0';
          state.calcOp = null;
          state.calcWaitingForSecond = false;
        } else if (action === 'sign') {
          state.calcValue = String(-parseFloat(state.calcValue || 0));
        } else if (action === 'percent') {
          state.calcValue = String(parseFloat(state.calcValue || 0) / 100);
        } else if (action === 'op') {
          state.calcOp = val;
          state.calcFirstVal = parseFloat(state.calcValue || 0);
          state.calcWaitingForSecond = true;
        } else if (action === 'equals') {
          if (state.calcOp && state.calcFirstVal !== undefined) {
            const second = parseFloat(state.calcValue || 0);
            let res = 0;
            if (state.calcOp === '+') res = state.calcFirstVal + second;
            else if (state.calcOp === '-') res = state.calcFirstVal - second;
            else if (state.calcOp === '*') res = state.calcFirstVal * second;
            else if (state.calcOp === '/') res = second !== 0 ? state.calcFirstVal / second : 'Error';
            state.calcValue = String(res);
            state.calcOp = null;
            state.calcWaitingForSecond = false;
          }
        } else if (val === '.') {
          if (!state.calcValue.includes('.')) state.calcValue += '.';
        } else {
          // Numbers 0-9
          if (state.calcValue === '0' || state.calcWaitingForSecond) {
            state.calcValue = val;
            state.calcWaitingForSecond = false;
          } else {
            state.calcValue += val;
          }
        }
        if (display) display.textContent = state.calcValue;
      });
    });
  }

  // --- DYNAMIC SHORTCUTS & WIDGETS MANAGER ---
  function initShortcuts() {
    const grid = document.getElementById('bentoGrid');
    const modal = document.getElementById('shortcutModal');
    const closeBtn = document.getElementById('closeShortcutModal');
    const cancelBtn = document.getElementById('cancelShortcutModal');
    const form = document.getElementById('shortcutForm');
    const nameInput = document.getElementById('shortcutNameInput');
    const urlInput = document.getElementById('shortcutUrlInput');
    const iconInput = document.getElementById('shortcutIconInput');
    const sizeLabels = document.querySelectorAll('.size-pill-option');

    let shortcuts = [];
    const saved = localStorage.getItem('hub_shortcuts');
    if (saved) {
      try {
        shortcuts = JSON.parse(saved);
      } catch (e) {
        shortcuts = [...DEFAULT_SHORTCUTS];
      }
    } else {
      shortcuts = [...DEFAULT_SHORTCUTS];
    }

    function save() {
      localStorage.setItem('hub_shortcuts', JSON.stringify(shortcuts));
      render();
    }

    function render() {
      if (!grid) return;
      document.querySelectorAll('.dynamic-card, .add-shortcut-card').forEach(el => el.remove());

      shortcuts.forEach((sc, index) => {
        const card = document.createElement('a');
        card.className = 'b-card shortcut-item dynamic-card';
        card.href = sc.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.title = `${sc.title} (${sc.url})`;

        // Size classes with True Circle guarantee
        if (sc.size === '1x1c') {
          card.classList.add('col-1-row-1', 'circle-true');
        } else if (sc.size === '2x1') {
          card.classList.add('col-2-row-1', 'pill-true');
        } else if (sc.size === '2x2') {
          card.classList.add('col-2-row-2', 'card-photo-box');
        } else {
          card.classList.add('col-1-row-1');
        }

        let iconSrc = sc.icon;
        if (!iconSrc) {
          try {
            const domain = new URL(sc.url).hostname;
            iconSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
          } catch (e) {
            iconSrc = 'https://www.google.com/favicon.ico';
          }
        }

        if (sc.size === '2x2') {
          card.innerHTML = `
            <img src="${iconSrc}" class="sc-cover-img" alt="${escapeHtml(sc.title)}" onerror="this.src='https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500'">
            <div class="sc-cover-overlay">
              <span class="sc-cover-title">${escapeHtml(sc.title)}</span>
              <span class="sc-cover-sub">${escapeHtml(new URL(sc.url).hostname || '')}</span>
            </div>
            <button type="button" class="sc-del-btn" title="Remove">&times;</button>
          `;
        } else if (sc.size === '2x1') {
          card.innerHTML = `
            <div class="sc-icon-1x1">
              <img src="${iconSrc}" alt="${escapeHtml(sc.title)}" onerror="this.src='https://www.google.com/favicon.ico'">
            </div>
            <div class="sc-info-2x1">
              <span class="sc-title-2x1">${escapeHtml(sc.title)}</span>
              <span class="sc-domain-2x1">${escapeHtml(new URL(sc.url).hostname || '')}</span>
            </div>
            <button type="button" class="sc-del-btn" title="Remove">&times;</button>
          `;
        } else {
          card.innerHTML = `
            <div class="sc-icon-1x1">
              <img src="${iconSrc}" alt="${escapeHtml(sc.title)}" onerror="this.src='https://www.google.com/favicon.ico'">
            </div>
            <span class="sc-title-1x1">${escapeHtml(sc.title)}</span>
            <button type="button" class="sc-del-btn" title="Remove">&times;</button>
          `;
        }

        const delBtn = card.querySelector('.sc-del-btn');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            playClick();
            if (confirm(`Remove "${sc.title}"?`)) {
              shortcuts.splice(index, 1);
              save();
              showToast(`Removed "${sc.title}"`);
            }
          });
        }

        card.addEventListener('click', () => playClick());
        grid.appendChild(card);
      });

      // ADD SHORTCUT CARD IN THE GRID
      const addCard = document.createElement('div');
      addCard.className = 'b-card col-1-row-1 add-shortcut-card';
      addCard.title = 'Add Shortcut or Widget';
      addCard.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>ADD</span>
      `;
      addCard.addEventListener('click', () => {
        playClick();
        openModal();
      });
      grid.appendChild(addCard);
    }

    function openModal() {
      if (form) form.reset();
      const editIdEl = document.getElementById('editShortcutId');
      if (editIdEl) editIdEl.value = '';
      const modalTitleEl = document.getElementById('shortcutModalTitle');
      if (modalTitleEl) modalTitleEl.textContent = 'ADD SHORTCUT';
      sizeLabels.forEach(l => l.classList.remove('active-size'));
      const defaultRadio = document.querySelector('input[name="shortcutCardSize"][value="1x1"]');
      if (defaultRadio) {
        defaultRadio.checked = true;
        const parent = defaultRadio.closest('.size-pill-option');
        if (parent) parent.classList.add('active-size');
      }
      if (modal) modal.classList.add('open');
      if (nameInput) nameInput.focus();
    }

    sizeLabels.forEach(label => {
      label.addEventListener('click', () => {
        playClick();
        sizeLabels.forEach(l => l.classList.remove('active-size'));
        label.classList.add('active-size');
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal && modal.classList.remove('open'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal && modal.classList.remove('open'));
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        playClick();
        let url = urlInput ? urlInput.value.trim() : '';
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        const checkedSize = document.querySelector('input[name="shortcutCardSize"]:checked');
        const size = checkedSize ? checkedSize.value : '1x1';

        const newShortcut = {
          id: 'sc-' + Date.now(),
          title: nameInput ? (nameInput.value.trim() || 'Shortcut') : 'Shortcut',
          url: url,
          size: size,
          icon: iconInput ? iconInput.value.trim() : ''
        };

        shortcuts.push(newShortcut);
        save();
        if (modal) modal.classList.remove('open');
        showToast(`Added "${newShortcut.title}"`);
      });
    }

    render();
  }

  // --- IMAGE SEARCH (Google Lens Drag & Drop) ---
  function initImageSearch() {
    const trigger = document.getElementById('lensTriggerBtn');
    const modal = document.getElementById('lensModal');
    const closeBtn = document.getElementById('closeLensModal');
    const dropZone = document.getElementById('lensDropZone');
    const fileInput = document.getElementById('lensFileInput');

    if (trigger) {
      trigger.addEventListener('click', () => {
        playClick();
        if (modal) modal.classList.add('open');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        playClick();
        if (modal) modal.classList.remove('open');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-red)';
      });
      dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = 'var(--border-dashed)');
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-dashed)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          showToast('Redirecting to Google Lens...');
          setTimeout(() => window.location.href = 'https://lens.google.com/', 1000);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          showToast('Redirecting to Google Lens...');
          setTimeout(() => window.location.href = 'https://lens.google.com/', 1000);
        }
      });
    }
  }

  // --- SYSTEM TOGGLES (Theme, Sound, Fullscreen, Battery, Torch, Rotate) ---
  function initSystem() {
    const themeCard = document.getElementById('themeWidgetCard') || document.getElementById('themeToggleBtn');
    const soundCard = document.getElementById('soundWidgetCard') || document.getElementById('soundToggleBtn');
    const fullCard = document.getElementById('fullscreenWidgetCard') || document.getElementById('fullscreenBtn');
    const batteryCard = document.getElementById('batteryWidgetCard');
    const battEl = document.getElementById('batteryPercentVal') || document.getElementById('batteryPercent');
    const torchCard = document.getElementById('torchCard');
    const rotateCard = document.getElementById('rotateCard');
    const bluetoothCard = document.getElementById('bluetoothCard');
    const hotspotCard = document.getElementById('hotspotCard');
    const batteryShareCard = document.getElementById('batteryShareCard');
    const extraDimCard = document.getElementById('extraDimCard');
    const aeroplaneCard = document.getElementById('aeroplaneCard');
    const locCard = document.getElementById('locCard');

    // Theme
    const savedTheme = localStorage.getItem('hub_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeCard) {
      themeCard.addEventListener('click', () => {
        playClick();
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('hub_theme', next);
        showToast(`Switched to ${next.toUpperCase()} mode`);
      });
    }

    // Sound
    const savedSound = localStorage.getItem('hub_sound');
    if (savedSound !== null) state.soundEnabled = savedSound === 'true';
    if (soundCard) soundCard.classList.toggle('card-red', !state.soundEnabled);

    if (soundCard) {
      soundCard.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        soundCard.classList.toggle('card-red', !state.soundEnabled);
        localStorage.setItem('hub_sound', state.soundEnabled);
        if (state.soundEnabled) playClick();
        showToast(`Audio FX ${state.soundEnabled ? 'Enabled' : 'Muted'}`);
      });
    }

    // Fullscreen
    if (fullCard) {
      fullCard.addEventListener('click', () => {
        playClick();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => { });
          showToast('Fullscreen enabled');
        } else {
          document.exitFullscreen().catch(() => { });
          showToast('Fullscreen exited');
        }
      });
    }

    // Battery
    if (batteryCard) {
      batteryCard.addEventListener('click', () => {
        playClick();
        const status = document.getElementById('batteryStatusText');
        showToast(`Battery: ${battEl ? battEl.textContent : '96%'} ${status ? status.textContent : 'CHARGED'}`);
      });
    }

    if (navigator.getBattery && battEl) {
      navigator.getBattery().then(b => {
        const updateB = () => {
          battEl.textContent = `${Math.round(b.level * 100)}%`;
          const status = document.getElementById('batteryStatusText');
          if (status) status.textContent = b.charging ? 'CHARGING' : 'BATTERY';
        };
        updateB();
        b.addEventListener('levelchange', updateB);
        b.addEventListener('chargingchange', updateB);
      }).catch(() => { });
    }

    // Toggle widgets
    function setupToggle(el, name) {
      if (!el) return;
      el.addEventListener('click', () => {
        playClick();
        const active = el.classList.toggle('card-red');
        showToast(`${name} ${active ? 'ON' : 'OFF'}`);
      });
    }

    setupToggle(torchCard, 'Torch');
    setupToggle(rotateCard, 'Auto-Rotate');
    setupToggle(bluetoothCard, 'Bluetooth');
    setupToggle(hotspotCard, 'Hotspot');
    setupToggle(batteryShareCard, 'Battery Share');
    setupToggle(extraDimCard, 'Extra Dim');
    setupToggle(aeroplaneCard, 'Aeroplane Mode');
    setupToggle(locCard, 'GPS Location');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initializer
  document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initClocks();
    initWeather();
    initFocusTimer();
    initAudioPlayer();
    initScratchpad();
    initCalculator();
    initShortcuts();
    initImageSearch();
    initSystem();
  });

})();
