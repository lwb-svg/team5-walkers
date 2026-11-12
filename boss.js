/* ───────── 보스 습격 이벤트 (테스트 전용: boss-test.html 에서만 불러옴) ─────────
   index.html 의 전역(walkers, W, H, stage, surfaceFeet, BG, K, charH, FOOT, rand, pick, positionBubble)을 그대로 씀 */
(() => {
  /* ── 1. 픽셀 도트 꼬마 악마 (왼쪽 절반만 그리고 좌우 대칭) ── */
  const PAL = {
    K: '#2a1410', B: '#8a4a32', b: '#5e2e1e', L: '#b8744e', H: '#f2e6c8', h: '#a89878',
    W: '#8a3450', w: '#4e1a2c', Y: '#ffd23f', R: '#e8261c', T: '#ffffff', M: '#3a0a0a', C: '#f2e6c8',
  };
  const HALF = [
    '................',
    '.KK.............',
    '.KwK............',
    '.KwwK.....KK....',
    '.KwWwK...KHK....',
    '.KwWWwK..KHhK...',
    '.KwWWWwK..KHhKKK',
    '.KwWWWWwK.KKKBBB',
    '.KwWWWWWwKKBBBBB',
    '.KwWWWWWWwKBBBBB',
    '.KwWWWWWWKBBKKKB',
    '.KwWwWWWKBBKYYKB',
    '.KwKwWWKBBBKYRKB',
    '.KK.KwWKBBBBKKBB',
    '....KwKBBKMMMMMM',
    '.....KKBBKMTMTMT',
    '......KBBBKMMMMM',
    '......KBBBBKKKKK',
    '.....KLLBBBBBBBB',
    '....KLLBBbBBBBBB',
    '...KCKLBBbBBBLLB',
    '...KCCKBBbBBBLLB',
    '....KKKBBBbBBBBB',
    '......KBBBBBBBBB',
    '......KbBBBKKKKK',
    '......KbbBK.....',
    '.....KCCCCK.....',
    '.....KKKKKK.....',
  ];
  const FA = HALF.map(r => r + [...r].reverse().join(''));
  const SW = FA[0].length, SH = FA.length;            // 32 × 28
  const empty = '.'.repeat(SW);
  // 날개를 2칸 내린 프레임 (퍼덕퍼덕)
  const FB = FA.map((row, y) => {
    if (y > 17) return row;
    const src = FA[y - 2] || empty;
    return src.slice(0, 9) + row.slice(9, SW - 9) + src.slice(SW - 9);
  });
  function paint(rows) {
    const c = document.createElement('canvas'); c.width = SW; c.height = SH;
    const g = c.getContext('2d');
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (PAL[ch]) { g.fillStyle = PAL[ch]; g.fillRect(x, y, 1, 1); }
    }));
    return c;
  }
  const FRAMES = [paint(FA), paint(FB)];

  /* ── 2. 스타일 ── */
  const css = document.createElement('style');
  css.textContent = `
  .boss { position: absolute; left: 0; bottom: 0; z-index: 150; pointer-events: auto; cursor: pointer; touch-action: none; }
  .boss canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated; }
  .boss .bb { position: absolute; inset: 0; transform-origin: 50% 100%; }
  .boss .bshadow { position: absolute; left: 15%; right: 15%; bottom: -4px; height: 10px; border-radius: 50%; background: rgba(0,0,0,.3); }
  .boss .bubble { margin-bottom: 4px; }
  .boss.hurt canvas { filter: brightness(2.2) saturate(.3); }
  .warn { position: absolute; inset: 0; z-index: 400; pointer-events: none; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at center, rgba(255,0,0,0) 45%, rgba(200,0,0,.55) 100%);
    animation: warnPulse .5s ease-in-out infinite alternate; }
  .warn span { font-weight: 900; font-size: 20px; color: #fff; letter-spacing: .08em; padding: 5px 16px;
    background: linear-gradient(180deg, rgba(120,0,0,.9), rgba(60,0,0,.9)); border: 2px solid #ffcf3a; border-radius: 4px;
    text-shadow: 0 2px 0 #500; box-shadow: 0 0 18px rgba(255,60,0,.8); }
  @keyframes warnPulse { from { opacity: .55; } to { opacity: 1; } }
  .dmg { position: absolute; left: 0; bottom: 0; z-index: 420; pointer-events: none; white-space: nowrap;
    font-weight: 900; font-size: 18px; font-style: italic; letter-spacing: -1px;
    background: linear-gradient(180deg, #fff27a, #ffae00 55%, #ff6a00); -webkit-background-clip: text; background-clip: text; color: transparent;
    -webkit-text-stroke: 1px #5a1e00; filter: drop-shadow(0 1px 0 #5a1e00); }
  .bang { position: absolute; left: 0; bottom: 0; z-index: 420; pointer-events: none; font-weight: 900; font-size: 16px;
    color: #fff; -webkit-text-stroke: 1px #7a0000; text-shadow: 0 0 6px #ff4a00; }
  .flash { position: absolute; left: 0; bottom: 0; z-index: 405; pointer-events: none; border-radius: 50%;
    background: radial-gradient(circle, #fff 0%, #ffd23f 35%, rgba(255,90,0,.6) 60%, rgba(255,90,0,0) 72%); }
  .fireball { position: absolute; left: 0; bottom: 0; z-index: 300; pointer-events: none; width: 12px; height: 12px; border-radius: 3px;
    background: radial-gradient(circle at 40% 40%, #fff6b0, #ffb000 45%, #ff4a00 80%); box-shadow: 0 0 10px 3px rgba(255,120,0,.85); }
  .slash { position: absolute; left: 0; bottom: 0; z-index: 300; pointer-events: none; border-radius: 50%;
    border: 5px solid transparent; border-top-color: #fff; border-right-color: rgba(255,220,120,.9);
    filter: drop-shadow(0 0 4px #ff8a00); }
  .ko-stars { position: absolute; left: 50%; bottom: 100%; width: 34px; height: 12px; margin-left: -17px; margin-bottom: -6px;
    pointer-events: none; animation: koSpin 0.8s linear infinite; }
  .ko-stars i { position: absolute; top: 0; font-style: normal; font-size: 10px; color: #ffe14f; text-shadow: 0 0 2px #a06000; }
  @keyframes koSpin { from { transform: rotateY(0) } to { transform: rotateY(360deg) } }
  .boss-btn { position: absolute; top: 8px; right: 8px; z-index: 600; font: 800 12px sans-serif; color: #fff; cursor: pointer;
    background: linear-gradient(180deg, #c0392b, #7a1010); border: 2px solid #ffcf3a; border-radius: 5px; padding: 5px 10px;
    box-shadow: 0 2px 0 #400; }
  .boss-btn:disabled { opacity: .5; cursor: default; }
  .test-badge { position: absolute; top: 8px; left: 8px; z-index: 600; font: 700 11px sans-serif; color: #fff;
    background: rgba(0,0,0,.45); padding: 3px 8px; border-radius: 4px; }
  `;
  document.head.appendChild(css);

  /* ── 3. 효과들 ── */
  const G = 900;                                   // 중력 px/s²
  const at = (el, x, y) => { el.style.transform = `translate(${x}px, ${-y}px)`; };
  function fx(cls, html, x, y, keyframes, dur) {
    const el = document.createElement('div'); el.className = cls; el.innerHTML = html;
    stage.appendChild(el); at(el, x, y);
    const a = el.animate(keyframes(el), { duration: dur, easing: 'ease-out', fill: 'forwards' });
    a.onfinish = () => el.remove();
    return el;
  }
  function damageNumber(x, y) {
    const n = String(Math.floor(rand(1000, 99999)));
    fx('dmg', n, x - n.length * 5, y, () => [
      { transform: `translate(${x - n.length * 5}px, ${-y}px) scale(.6)`, opacity: 1 },
      { transform: `translate(${x - n.length * 5}px, ${-y - 14}px) scale(1.15)`, opacity: 1, offset: .2 },
      { transform: `translate(${x - n.length * 5}px, ${-y - 34}px) scale(1)`, opacity: 0 },
    ], 1100);
  }
  function flash(x, y, size) {
    fx('flash', '', x, y, el => {
      el.style.width = el.style.height = size + 'px';
      return [
        { transform: `translate(${x - size / 2}px, ${-y + size / 2}px) scale(.3)`, opacity: 1 },
        { transform: `translate(${x - size / 2}px, ${-y + size / 2}px) scale(1.2)`, opacity: 0 },
      ];
    }, 380);
  }
  function bang(x, y, text) {
    fx('bang', text, x, y, () => [
      { transform: `translate(${x - 14}px, ${-y}px) scale(.5) rotate(-12deg)`, opacity: 1 },
      { transform: `translate(${x - 14}px, ${-y - 6}px) scale(1.3) rotate(-8deg)`, opacity: 1, offset: .25 },
      { transform: `translate(${x - 14}px, ${-y - 12}px) scale(1.1) rotate(-8deg)`, opacity: 0 },
    ], 700);
  }
  function shake(power = 5, dur = 350) {
    const k = [];
    for (let i = 0; i <= 8; i++) {
      const p = power * (1 - i / 8);
      k.push({ transform: `translate(${rand(-p, p)}px, ${rand(-p, p)}px)` });
    }
    stage.animate(k, { duration: dur });
  }
  function speak(w, text, dur = 1.8) {
    w.bubble.textContent = text;
    w.talking = dur;
    positionBubble(w);
    w.bubble.classList.add('show');
  }
  const feetOf = w => w.state === 'ko' ? w.ko.feet : w.state === 'walk' ? surfaceFeet(w, w.surf) : w.fb;

  /* ── 4. 맞아서 날아가기 ── */
  const PANIC = ['헉 뭐야?!', '보스다!!', '도망쳐!!', '저거 뭐예요?!', '살려줘요~', '결재 받으러 온 건가?', '엄마…!', '팀장님 뒤로!'];
  const HURT = ['으아악!', '꺄악!', '살려줘~', '왜 나야!!', '퇴사할래!!', '아파요!!', '산재다!!'];
  const RELIEF = ['살았다…', '산재 처리 되나요?', '다들 괜찮아요?', '휴… 무서웠다', '오늘 야근 확정…', '보험 들어놔야지', '머리 아직 돌아요…'];

  function knock(w, dir, power) {
    if (w.state === 'drag') return;
    const feet = feetOf(w);
    if (w.state !== 'ko') {
      w.state = 'ko';
      w.ko = { feet, vx: 0, vy: 0, rot: 0, spin: 0, phase: 'air', t: 0, bounces: 0, stars: null };
      w.shadow.style.opacity = 0;
      w.el.style.zIndex = 210;
    }
    const k = w.ko;
    if (k.stars) { k.stars.remove(); k.stars = null; }
    k.phase = 'air'; k.bounces = 0;
    k.vx = dir * power * rand(.85, 1.15);
    k.vy = power * rand(.75, .95) + 140;
    k.spin = dir * rand(600, 950);
    damageNumber(w.x + w.w / 2, feet + w.h);
    flash(w.x + w.w / 2, feet + w.h / 2, w.h * 1.1);
    speak(w, pick(HURT), 99);
  }
  function stepKO(w, dt) {
    const k = w.ko;
    k.t += dt;
    if (k.phase === 'air') {
      const prevFeet = k.feet;
      k.vy -= G * dt;
      w.x += k.vx * dt; k.feet += k.vy * dt; k.rot += k.spin * dt;
      // 벽 쾅!
      const hitWall = side => {
        if (Math.abs(k.vx) > 90) {
          bang(side < 0 ? 2 : W - 30, k.feet + w.h * .6, '쾅!');
          flash(side < 0 ? 0 : W, k.feet + w.h / 2, w.h * 1.4);
          shake(4, 260);
        }
        k.vx = -k.vx * .4; k.spin = -k.spin * .6;
      };
      if (w.x < 0) { w.x = 0; hitWall(-1); }
      if (w.x > W - w.w) { w.x = W - w.w; hitWall(1); }
      if (k.feet + w.h > H) { k.feet = H - w.h; k.vy = -Math.abs(k.vy) * .3; }
      // 착지할 땅: 발판(위에서 떨어질 때만) → 바닥
      if (k.vy < 0) {
        const cx = w.x + w.w / 2;
        let land = -1, lf = 0;
        BG.platforms.forEach((p, i) => {
          const pf = (BG.h - p.y) * K;
          if (cx > p.x0 * K && cx < p.x1 * K && prevFeet >= pf && k.feet <= pf && pf > lf) { land = i + 1; lf = pf; }
        });
        if (land < 0) { const gf = surfaceFeet(w, 0); if (k.feet <= gf) { land = 0; lf = gf; } }
        if (land >= 0) {
          k.feet = lf;
          if (k.bounces < 1 && k.vy < -260) {           // 한 번 통 튕기고
            k.vy = -k.vy * .35; k.vx *= .55; k.bounces++;
          } else {                                      // 대자로 뻗기
            k.phase = 'down'; k.t = 0; w.surf = land;
            k.rot = (Math.round(k.rot / 360) * 360) + (k.spin >= 0 ? 90 : -90);
            const st = document.createElement('div'); st.className = 'ko-stars';
            st.innerHTML = '<i style="left:0">★</i><i style="left:12px">★</i><i style="left:24px">★</i>';
            st.style.bottom = (w.h * .35) + 'px';
            w.el.appendChild(st); k.stars = st;
            w.bubble.classList.remove('show'); w.talking = 0;
          }
        }
      }
    } else if (k.phase === 'down') {
      if (k.t > 1.6) { k.phase = 'up'; k.t = 0; k.from = k.rot; if (k.stars) { k.stars.remove(); k.stars = null; } }
    } else if (k.phase === 'up') {
      const q = Math.min(1, k.t / .35);
      const target = Math.round(k.from / 360) * 360;
      k.rot = k.from + (target - k.from) * q;
      if (q >= 1) {
        w.state = 'walk'; w.pause = rand(.6, 1.4); w.dir = Math.random() < .5 ? -1 : 1;
        w.shadow.style.opacity = 1; w.body.style.transform = '';
        if (Math.random() < .5) speak(w, pick(['아야…', '어지러워…', '무슨 일이야…', '내 커피…']), 1.8);
        return;
      }
    }
    w.fb = k.feet;                                   // 날아가는 중에 잡아도 그 높이에서 잡히게
    w.el.style.transform = `translate(${w.x}px, ${-(k.feet - FOOT)}px)`;
    w.body.style.transform = `rotate(${k.rot}deg) scaleX(${w.dir * w.native})`;
    if (w.bubble.classList.contains('show')) positionBubble(w);
  }

  /* ── 5. 보스 ── */
  const boss = { el: null, x: 0, feet: 0, vy: 0, dir: -1, phase: 'off', t: 0, atkT: 0, frame: 0, frameT: 0, lunge: 0 };
  const fireballs = [];
  const bossH = () => Math.max(70, charH * 2.2);
  const bossW = () => bossH() * SW / SH;
  const groundFeet = () => groundBack + (groundFront - groundBack) * .9;

  function makeBoss() {
    const el = document.createElement('div'); el.className = 'boss';
    el.innerHTML = `<div class="bshadow"></div><div class="bubble"></div><div class="bb"></div>`;
    const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
    el.querySelector('.bb').appendChild(cv);
    boss.cv = cv; boss.g = cv.getContext('2d'); boss.g.imageSmoothingEnabled = false;
    boss.bubble = el.querySelector('.bubble');
    // 보스를 클릭하면 반격!
    el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (boss.phase === 'off' || boss.phase === 'leave') return;
      damageNumber(boss.x + bossW() / 2, boss.feet + bossH());
      flash(boss.x + bossW() / 2, boss.feet + bossH() * .5, bossH() * .8);
      el.classList.add('hurt'); setTimeout(() => el.classList.remove('hurt'), 120);
      boss.hits = (boss.hits || 0) + 1;
      bossSay(pick(['끄억!', '크윽…', '아프다!!', '감히?!']), 1);
      if (boss.hits >= 6) { bossSay('크윽… 오늘은 이만!!', 1.6); boss.phase = 'leave'; boss.t = 0; }
    });
    stage.appendChild(el);
    boss.el = el;
  }
  function bossSay(text, dur) {
    const b = boss.bubble; b.textContent = text; b.classList.add('show');
    b.style.setProperty('--bx', '-50%'); b.style.setProperty('--tail', '50%');
    clearTimeout(boss.sayTimer); boss.sayTimer = setTimeout(() => b.classList.remove('show'), dur * 1000);
  }

  let warnEl = null;
  function startRaid() {
    if (boss.phase !== 'off') return;
    if (!boss.el) makeBoss();
    btn.disabled = true;
    boss.phase = 'warn'; boss.t = 0; boss.hits = 0;
    boss.el.style.display = 'none';
    warnEl = document.createElement('div'); warnEl.className = 'warn';
    warnEl.innerHTML = '<span>⚠ WARNING · 보스 출현! ⚠</span>';
    stage.appendChild(warnEl);
    walkers.filter(w => w.state === 'walk').sort(() => Math.random() - .5).slice(0, 5)
      .forEach((w, i) => setTimeout(() => { if (w.state === 'walk') { speak(w, pick(PANIC), 2); w.pause = 2; } }, i * 220));
  }
  function endRaid() {
    boss.phase = 'off'; boss.el.style.display = 'none'; btn.disabled = false;
    walkers.filter(w => w.state === 'walk').sort(() => Math.random() - .5).slice(0, 3)
      .forEach((w, i) => setTimeout(() => speak(w, pick(RELIEF), 2.2), 400 + i * 700));
  }

  function slash() {
    const bw = bossW(), bh = bossH();
    const cx = boss.x + bw / 2 + boss.dir * bw * .45, cy = boss.feet + bh * .45, r = bh * .9;
    fx('slash', '', cx, cy, el => {
      el.style.width = el.style.height = r + 'px';
      const sx = boss.dir > 0 ? 1 : -1;
      return [
        { transform: `translate(${cx - r / 2}px, ${-cy - r / 2}px) scaleX(${sx}) rotate(-60deg)`, opacity: 1 },
        { transform: `translate(${cx - r / 2}px, ${-cy - r / 2}px) scaleX(${sx}) rotate(80deg)`, opacity: 0 },
      ];
    }, 300);
    let hit = 0;
    walkers.forEach(w => {
      if (w.state !== 'walk' || w.surf !== 0) return;
      const wx = w.x + w.w / 2, dx = wx - (boss.x + bw / 2);
      if (Math.sign(dx) === boss.dir && Math.abs(dx) < bw * .95) { knock(w, boss.dir, rand(380, 520)); hit++; }
    });
    if (hit) shake(5, 300);
  }
  function fire() {
    const bw = bossW(), bh = bossH();
    const sx = boss.x + bw / 2 + boss.dir * bw * .15, sy = boss.feet + bh * .45;
    const targets = walkers.filter(w => (w.state === 'walk') && Math.sign(w.x + w.w / 2 - sx) === boss.dir);
    const tg = targets.length ? pick(targets) : pick(walkers);
    const tx = tg.x + tg.w / 2, ty = feetOf(tg) + tg.h * .5;
    const d = Math.hypot(tx - sx, ty - sy) || 1, sp = 240;
    const el = document.createElement('div'); el.className = 'fireball'; stage.appendChild(el);
    fireballs.push({ el, x: sx, y: sy, vx: (tx - sx) / d * sp, vy: (ty - sy) / d * sp, life: 3 });
    bossSay(pick(['불맛 좀 봐라!', '크아앙!', '마감 폭탄이다!']), .9);
  }
  function stepFireballs(dt) {
    for (let i = fireballs.length - 1; i >= 0; i--) {
      const f = fireballs[i];
      f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt;
      at(f.el, f.x - 6, f.y + 6);
      let hitW = null;
      for (const w of walkers) {
        if (w.state === 'drag') continue;
        const fe = feetOf(w);
        if (f.x > w.x && f.x < w.x + w.w && f.y > fe && f.y < fe + w.h) { hitW = w; break; }
      }
      if (hitW || f.life <= 0 || f.x < -20 || f.x > W + 20 || f.y < 0) {
        if (hitW) { knock(hitW, Math.sign(f.vx) || 1, rand(330, 450)); shake(3, 220); }
        else flash(f.x, f.y, 30);
        f.el.remove(); fireballs.splice(i, 1);
      }
    }
  }

  function stepBoss(dt) {
    if (boss.phase === 'off') return;
    boss.t += dt;
    const bw = bossW(), bh = bossH(), gf = groundFeet();
    if (boss.phase === 'warn') {
      if (boss.t > 1.8) {
        warnEl.remove(); warnEl = null;
        boss.dir = Math.random() < .5 ? -1 : 1;
        boss.x = boss.dir < 0 ? W * .78 - bw / 2 : W * .22 - bw / 2;
        boss.feet = H + 20; boss.vy = -200;
        boss.el.style.display = '';
        boss.el.style.width = bw + 'px'; boss.el.style.height = bh + 'px';
        boss.phase = 'drop'; boss.t = 0;
      }
    } else if (boss.phase === 'drop') {
      boss.vy -= G * 1.4 * dt; boss.feet += boss.vy * dt;
      if (boss.feet <= gf) {
        boss.feet = gf; boss.phase = 'walk'; boss.t = 0; boss.atkT = 1.2;
        shake(9, 500); flash(boss.x + bw / 2, gf + 6, bw * 1.6);
        bang(boss.x + bw / 2 - 10, gf + bh + 10, '쿠웅!!');
        bossSay('크르르… 마감은 끝났나?!', 1.8);
        // 착지 충격파: 가까운 사람 살짝 튕겨내기
        walkers.forEach(w => {
          if (w.state !== 'walk' || w.surf !== 0) return;
          const dx = w.x + w.w / 2 - (boss.x + bw / 2);
          if (Math.abs(dx) < bw * 1.3) knock(w, Math.sign(dx) || 1, rand(200, 280));
        });
      }
    } else if (boss.phase === 'walk') {
      if (boss.lunge <= 0) boss.x += boss.dir * 42 * dt;
      boss.atkT -= dt;
      if (boss.atkT <= 0) {
        const near = walkers.some(w => w.state === 'walk' && w.surf === 0 &&
          Math.sign(w.x + w.w / 2 - (boss.x + bw / 2)) === boss.dir && Math.abs(w.x + w.w / 2 - (boss.x + bw / 2)) < bw * .95);
        if (near || Math.random() < .35) { boss.lunge = .35; setTimeout(slash, 150); }
        else fire();
        boss.atkT = rand(.9, 1.5);
      }
      const done = boss.dir > 0 ? boss.x > W * .9 - bw : boss.x < W * .1;
      if (done || boss.t > 16) { boss.phase = 'leave'; boss.t = 0; bossSay('크하하하! 내일 또 온다!', 1.8); }
    } else if (boss.phase === 'leave') {
      if (boss.t > 1.4) {
        boss.feet += (boss.t - 1.4) * 520 * dt * 3;
        if (boss.feet > H + 30) endRaid();
      }
    }
    // 그리기: 날갯짓, 몸 출렁, 공격 돌진
    boss.frameT += dt;
    const flap = boss.phase === 'drop' || boss.phase === 'leave' ? .09 : .22;
    if (boss.frameT > flap) { boss.frameT = 0; boss.frame ^= 1; }
    boss.g.clearRect(0, 0, SW, SH); boss.g.drawImage(FRAMES[boss.frame], 0, 0);
    let lx = 0, rot = 0;
    if (boss.lunge > 0) { boss.lunge -= dt; const q = Math.sin((1 - boss.lunge / .35) * Math.PI); lx = boss.dir * q * bw * .18; rot = boss.dir * q * 10; }
    const bob = boss.phase === 'walk' ? Math.abs(Math.sin(boss.t * 5)) * 3 : 0;
    boss.el.querySelector('.bb').style.transform = `translate(${lx}px, ${-bob}px) rotate(${rot}deg)`;
    boss.el.querySelector('.bshadow').style.opacity = boss.phase === 'walk' ? 1 : 0;
    boss.el.style.transform = `translate(${boss.x}px, ${-boss.feet}px)`;
  }

  /* ── 6. 루프 + 버튼 + 시간 예약 ── */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    stepBoss(dt);
    stepFireballs(dt);
    walkers.forEach(w => {
      if (w.state === 'ko') stepKO(w, dt);
      else if (w.ko && w.ko.stars) { w.ko.stars.remove(); w.ko.stars = null; }   // 뻗어 있다가 드래그로 구출된 경우
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const btn = document.createElement('button');
  btn.className = 'boss-btn'; btn.textContent = '👹 보스 소환';
  btn.addEventListener('pointerdown', e => e.stopPropagation());
  btn.addEventListener('click', startRaid);
  stage.appendChild(btn);
  const badge = document.createElement('div'); badge.className = 'test-badge'; badge.textContent = 'TEST · 보스 습격';
  stage.appendChild(badge);

  // 실제 적용 시엔 정해진 시각에 등장 (예: ['13:30', '16:00'])
  const BOSS_TIMES = [];
  let lastFired = '';
  setInterval(() => {
    const t = new Date(), hm = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    if (BOSS_TIMES.includes(hm) && lastFired !== hm) { lastFired = hm; startRaid(); }
  }, 15000);

  setTimeout(startRaid, 2500);                     // 테스트 페이지는 열면 바로 한 번
  window.startRaid = startRaid;
})();
