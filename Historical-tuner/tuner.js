function initTuner(config) {
    const baseCents = config.cents.slice();
    const noteNames = config.noteNames.slice();
    const enharmonicConfig = (config.enharmonic || []).map(g => ({
        idx: g.idx,
        options: g.options.map(o => ({ ...o }))
    }));

    let audioCtx, analyser, micStream;
    let activeOscs = {};
    let noteOctaves = new Array(noteNames.length).fill(3);

    // Analog flow-mode variables and needle physics
    let currentNeedleAngle = 0;
    let targetCents = 0;
    let closestIdx = 0;
    let lastFrameTime = performance.now();

    // Automation and filtering
    let lowPassFilter = null;
    let highPassFilter = null;
    let noiseFloor = 0.0015;
    let silenceMs = 0;
    let idleShown = true;

    // Note-name display hysteresis — requires a few consecutive frames to agree
    // before switching the big letter, so a pitch hovering near a boundary
    // between two notes doesn't flicker
    let displayedIdx = 0;
    let idxCandidate = 0;
    let idxAgreeCount = 0;

    let pitchHistory = new Array(5).fill(null);
    let pitchHistIdx = 0;
    let smoothedTarget = 0;

    const els = {
        aRef: document.getElementById('a-ref'),
        waveType: document.getElementById('wave-type'),
        kb: document.getElementById('kb'),
        micBtn: document.getElementById('mic-btn'),
        markers: document.getElementById('markers'),
        needle: document.getElementById('needle'),
        note: document.getElementById('note-name'),
        cents: document.getElementById('cents-display'),
        hz: document.getElementById('hz-display'),
        enharmonic: document.getElementById('enharmonic-container'),
        refreshBtn: document.getElementById('refresh-btn'),
        expandBtn: document.getElementById('expand-btn'),
        panel: document.querySelector('.panel')
    };

    function initMarkers() {
        for (let i = -50; i <= 50; i += 10) {
            const m = document.createElement('div');
            m.className = 'marker' + (i === 0 ? ' zero' : '');
            m.style.transform = `translateX(-50%) rotate(${i}deg) translateY(-165px)`;
            els.markers.appendChild(m);

            const l = document.createElement('div');
            l.className = 'marker-label';
            l.innerText = i === 0 ? "0" : (i > 0 ? "+" + i : i);
            l.style.transform = `translateX(-50%) rotate(${i}deg) translateY(-135px)`;
            els.markers.appendChild(l);
        }
    }

    function renderEnharmonic() {
        if (!els.enharmonic) return;
        if (!enharmonicConfig.length) {
            els.enharmonic.style.display = 'none';
            return;
        }
        els.enharmonic.innerHTML = '<div class="enharmonic-grid"></div>';
        const grid = els.enharmonic.querySelector('.enharmonic-grid');
        enharmonicConfig.forEach(group => {
            const wrap = document.createElement('div');
            wrap.className = 'toggle-group';
            group.options.forEach((opt, oi) => {
                const btn = document.createElement('button');
                btn.className = 'enh-btn' + (oi === 0 ? ' active' : '');
                btn.id = `e${group.idx}-${oi}`;
                btn.innerText = opt.label;
                btn.onclick = () => setEnh(group.idx, oi);
                wrap.appendChild(btn);
            });
            grid.appendChild(wrap);
        });
    }

    function setEnh(idx, optIdx) {
        const group = enharmonicConfig.find(g => g.idx === idx);
        if (!group) return;
        const opt = group.options[optIdx];

        noteNames[idx] = opt.label;
        baseCents[idx] = opt.cents;

        group.options.forEach((o, oi) => {
            document.getElementById(`e${idx}-${oi}`).classList.toggle('active', oi === optIdx);
        });

        renderKeyboard();

        if (activeOscs[idx] && audioCtx) {
            activeOscs[idx].osc.frequency.setTargetAtTime(getFreq(idx), audioCtx.currentTime, 0.03);
        }
    }

    function getNoteFrequencies() {
        const aRef = Math.min(560, Math.max(350, parseFloat(els.aRef.value) || 415));
        const aCents = baseCents[9];
        return baseCents.map(cents => aRef * Math.pow(2, (cents - aCents) / 1200));
    }

    function changeNoteOctave(idx, dir, event) {
        if (event) event.stopPropagation();
        noteOctaves[idx] = Math.max(1, Math.min(6, noteOctaves[idx] + dir));

        document.getElementById(`oct-val-${idx}`).innerText = noteOctaves[idx];

        if (activeOscs[idx]) {
            activeOscs[idx].osc.frequency.setTargetAtTime(getFreq(idx), audioCtx.currentTime, 0.03);
        }
    }

    function renderKeyboard() {
        els.kb.innerHTML = '';
        noteNames.forEach((name, i) => {
            const btn = document.createElement('button');
            btn.className = 'key' + (activeOscs[i] ? ' playing' : '');
            btn.id = 'key-' + i;
            btn.onclick = () => toggleTone(i);

            btn.innerHTML = `
                <div>${name}</div>
                <div class="oct-ctrl">
                    <span class="oct-arrow" data-idx="${i}" data-dir="-1">▼</span>
                    <span id="oct-val-${i}" style="font-family: monospace; font-weight: bold;">${noteOctaves[i]}</span>
                    <span class="oct-arrow" data-idx="${i}" data-dir="1">▲</span>
                </div>
            `;
            els.kb.appendChild(btn);
        });

        els.kb.querySelectorAll('.oct-arrow').forEach(el => {
            el.addEventListener('click', (event) => {
                changeNoteOctave(parseInt(el.dataset.idx, 10), parseInt(el.dataset.dir, 10), event);
            });
        });
    }

    function getFreq(idx) {
        return getNoteFrequencies()[idx] * Math.pow(2, noteOctaves[idx] - 3);
    }

    function updateAll() {
        if (!audioCtx) return;
        const wType = els.waveType.value;
        Object.keys(activeOscs).forEach(idx => {
            activeOscs[idx].osc.frequency.setTargetAtTime(getFreq(idx), audioCtx.currentTime, 0.03);
            activeOscs[idx].osc.type = wType;
        });
    }

    function toggleTone(idx) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        if (activeOscs[idx]) {
            activeOscs[idx].gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
            activeOscs[idx].osc.stop(audioCtx.currentTime + 0.1);
            delete activeOscs[idx];
            document.getElementById('key-' + idx).classList.remove('playing');
        } else {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = els.waveType.value;
            osc.frequency.setValueAtTime(getFreq(idx), audioCtx.currentTime);
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start();
            activeOscs[idx] = { osc, gain };
            document.getElementById('key-' + idx).classList.add('playing');
        }
    }

    async function toggleMic() {
        if (analyser) {
            analyser = null;
            if (lowPassFilter) { lowPassFilter.disconnect(); lowPassFilter = null; }
            if (highPassFilter) { highPassFilter.disconnect(); highPassFilter = null; }
            if (micStream) micStream.getTracks().forEach(t => t.stop());
            els.micBtn.innerText = "TURN ON MIC"; return;
        }
        if (!window.isSecureContext) {
            alert("Microphone access requires a secure connection (HTTPS). Please open this page over HTTPS.");
            return;
        }
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(micStream);

            // Highpass first — removes sub-40Hz rumble (handling noise, HVAC,
            // footsteps) well below the lowest note of any instrument this tuner
            // targets, before the signal reaches the pitch detector
            highPassFilter = audioCtx.createBiquadFilter();
            highPassFilter.type = "highpass";
            highPassFilter.frequency.setValueAtTime(40, audioCtx.currentTime);

            lowPassFilter = audioCtx.createBiquadFilter();
            lowPassFilter.type = "lowpass";
            lowPassFilter.frequency.setValueAtTime(3500, audioCtx.currentTime);

            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 8192;

            source.connect(highPassFilter);
            highPassFilter.connect(lowPassFilter);
            lowPassFilter.connect(analyser);

            els.micBtn.innerText = "TURN OFF MIC";
            draw();
        } catch (e) {
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                alert("Microphone access was denied. Please allow microphone access in your browser's site settings and try again.");
            } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                alert("No microphone was found on this device.");
            } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                alert("The microphone is already in use by another application or browser tab.");
            } else {
                alert("Microphone not available: " + e.message);
            }
        }
    }

    function autoCorrelate(buf, sampleRate) {
        let rms = 0;
        for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
        rms = Math.sqrt(rms / buf.length);

        // Track the room's ambient noise level from quiet frames only, so a
        // noisy environment (traffic, HVAC, other players in the distance)
        // needs a proportionally stronger signal, while a quiet room stays
        // sensitive enough for soft instruments like the clavichord
        if (rms < noiseFloor * 2.5) {
            noiseFloor += (rms - noiseFloor) * 0.02;
        }
        const gate = Math.max(0.004, noiseFloor * 3.5);

        if (rms < gate) {
            return -1;
        }

        // No pluck/attack detection — wind instruments have no transient attack

        const n = buf.length;
        const correlations = new Float32Array(n);

        for (let offset = 0; offset < n; offset++) {
            for (let i = 0; i < n - offset; i++) {
                correlations[offset] += buf[i] * buf[i + offset];
            }
        }

        let d = 0;
        while (d < n - 1 && correlations[d] > correlations[d + 1]) d++;

        let maxV = -1, maxP = -1;
        for (let i = d; i < Math.floor(n / 2); i++) {
            if (correlations[i] > maxV) { maxV = correlations[i]; maxP = i; }
        }

        if (maxP <= 0 || maxP >= n - 1) return -1;

        // Octave correction — instruments with a strong 2nd harmonic (harpsichord,
        // oboe, cornetto) can make the algorithm lock onto the harmonic's period
        // instead of the true fundamental. If the period at double the lag (half
        // the frequency) is nearly as strong, it is almost certainly the real
        // fundamental, so prefer it.
        const fundamentalP = maxP * 2;
        if (fundamentalP < n - 1 && correlations[fundamentalP] > maxV * 0.90) {
            maxP = fundamentalP;
            maxV = correlations[fundamentalP];
        }

        // Require sufficient confidence — rejects noise and harmonic aliases
        if (correlations[0] === 0 || maxV / correlations[0] < 0.4) return -1;

        // Parabolic interpolation for sub-1 Hz accuracy
        let x0 = correlations[maxP - 1];
        let x1 = correlations[maxP];
        let x2 = correlations[maxP + 1];
        let a = (x0 + x2 - 2 * x1) / 2;
        let b = (x2 - x0) / 2;
        let exactPos = (a === 0) ? maxP : maxP - b / (2 * a);

        return sampleRate / exactPos;
    }

    function draw() {
        if (!analyser) return;

        const now = performance.now();
        const dt = Math.min(2, (now - lastFrameTime) / 16.666);
        lastFrameTime = now;

        const buffer = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buffer);

        let freq = autoCorrelate(buffer, audioCtx.sampleRate);

        if (freq > 0 && isFinite(freq)) {
            silenceMs = 0;
            idleShown = false;

            const freqs = getNoteFrequencies();
            let minDiff = Infinity;

            for (let i = 0; i < noteNames.length; i++) {
                for (let oct = -3; oct <= 3; oct++) {
                    let target = freqs[i] * Math.pow(2, oct);
                    let diff = Math.abs(freq - target);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIdx = i;
                        targetCents = 1200 * Math.log2(freq / target);
                    }
                }
            }

            pitchHistory[pitchHistIdx % pitchHistory.length] = targetCents;
            pitchHistIdx++;
            let valid = pitchHistory.filter(v => v !== null);
            if (valid.length > 0) {
                let sorted = [...valid].sort((a, b) => a - b);
                targetCents = sorted[Math.floor(sorted.length / 2)];
            }

            // Only switch the displayed letter once the same note has won for a
            // few consecutive frames — avoids flicker when the pitch hovers near
            // the boundary between two adjacent notes
            if (closestIdx === idxCandidate) {
                idxAgreeCount++;
            } else {
                idxCandidate = closestIdx;
                idxAgreeCount = 1;
            }
            if (idxAgreeCount >= 3) displayedIdx = closestIdx;

            els.hz.textContent = freq.toFixed(2) + " Hz";
            els.note.textContent = noteNames[displayedIdx];

        } else if (freq === -1) {
            pitchHistory.fill(null);
            pitchHistIdx = 0;

            // After a short grace period (breathing between notes, bow changes),
            // ease the needle back to center and clear the readout so a stale
            // reading doesn't linger once the player has actually stopped
            silenceMs += dt * 16.666;
            if (silenceMs > 10000) {
                targetCents = 0;
                if (!idleShown) {
                    els.note.textContent = '--';
                    els.hz.textContent = '0.00 Hz';
                    idleShown = true;
                }
            }
        }

        let diff = Math.abs(targetCents - smoothedTarget);
        let speed = diff > 15 ? 0.35 : 0.10;
        smoothedTarget += (targetCents - smoothedTarget) * speed * dt;
        currentNeedleAngle += (smoothedTarget - currentNeedleAngle) * 0.60 * dt;

        if (Math.abs(currentNeedleAngle) < 0.05) currentNeedleAngle = 0;

        let displayAngle = Math.max(-50, Math.min(50, currentNeedleAngle));
        els.needle.style.transform = `translateX(-50%) rotate(${displayAngle}deg)`;

        if (Math.abs(currentNeedleAngle) <= 2.0) {
            els.note.style.color = "var(--green)";
            els.needle.style.background = "var(--green)";
            els.needle.style.boxShadow = "0 0 15px var(--green)";
        } else {
            els.note.style.color = "var(--amber)";
            els.needle.style.background = "var(--amber)";
            els.needle.style.boxShadow = "0 0 10px var(--amber)";
        }

        els.cents.textContent =
            (currentNeedleAngle > 0 ? "+" : "") + currentNeedleAngle.toFixed(1) + " ¢";

        requestAnimationFrame(draw);
    }

    els.aRef.addEventListener('input', updateAll);
    els.waveType.addEventListener('change', updateAll);
    els.micBtn.addEventListener('click', toggleMic);
    if (els.refreshBtn) els.refreshBtn.addEventListener('click', updateAll);
    if (els.expandBtn && els.panel) {
        els.expandBtn.addEventListener('click', () => {
            const isExpanded = els.panel.classList.toggle('kb-expanded');
            els.expandBtn.innerText = isExpanded ? 'Collapse' : 'Expand';
        });
    }

    initMarkers();
    renderEnharmonic();
    renderKeyboard();
}
