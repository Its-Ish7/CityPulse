/* CityPulse extras: ticker, live desk, cities board, community hub, share card, CSV.
   Loads after the main script and shares its globals (Z, C, CK, D, F, store, FD, UID ...). */
(() => {
  const R = Math.round, av = a => a.reduce((x, y) => x + y, 0) / a.length;
  const hv = (a, b, c, d) => { const r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return R(12742 * Math.asin(Math.sqrt(x))); };
  const J = u => { const c = new AbortController(); setTimeout(() => c.abort(), 9000); return fetch(u, { signal: c.signal }).then(r => { if (!r.ok) throw 0; return r.json(); }); };
  const WMO = c => c == 0 ? 'Clear' : c < 4 ? 'Cloudy' : c < 50 ? 'Fog' : c < 70 ? 'Rain' : c < 80 ? 'Snow' : c < 90 ? 'Showers' : 'Storm';
  const dn = d => new Date(d + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short' });
  const meter = (v, g) => { const p = Math.min(100, v / g * 100); return `<div class="br"><i style="width:${Math.max(3, p)}%;background:${col(p / 110)}"></i></div>`; };
  const X = { key: null, d: {}, w: null };
  const WORLD = [['Jaipur', 26.91, 75.79, 'in', 'India'], ['Delhi', 28.61, 77.21, 'in', 'India'], ['Mumbai', 19.08, 72.88, 'in', 'India'], ['Bengaluru', 12.97, 77.59, 'in', 'India'], ['Kolkata', 22.57, 88.36, 'in', 'India'], ['Chennai', 13.08, 80.27, 'in', 'India'], ['London', 51.51, -.13, 'gb', 'United Kingdom'], ['Paris', 48.86, 2.35, 'fr', 'France'], ['New York', 40.71, -74.01, 'us', 'United States'], ['Tokyo', 35.68, 139.69, 'jp', 'Japan'], ['Sydney', -33.87, 151.21, 'au', 'Australia'], ['Lagos', 6.52, 3.38, 'ng', 'Nigeria']];

  /* ---------- Any city: build a ring of zones around a point ---------- */
  function openCity(n, la, lo, cc, cn) {
    const k = n.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!CT[k] || CT[k].custom) {
      const kx = Math.cos(la * Math.PI / 180), d = .07, z = [['Centre', la, lo, 1.4, 110]];
      [[1, 0, 'North'], [.7, .7, 'North-east'], [0, 1, 'East'], [-.7, .7, 'South-east'], [-1, 0, 'South'], [-.7, -.7, 'South-west'], [0, -1, 'West'], [.7, -.7, 'North-west']].forEach(([a, b, s]) => z.push([s, la + a * d, lo + b * d / kx, .9, 110]));
      CT[k] = { n, cc, cn, custom: 1, b: [[la - .2, lo - .2 / kx], [la + .2, lo + .2 / kx]], poly: ell(la, lo, .12, .12 / kx), z };
    }
    if (!$(`[data-c="${k}"]`)) { const b = document.createElement('button'); b.className = 'c'; b.dataset.c = k; b.textContent = n; $('#cities').appendChild(b); }
    tab('dash'); switchCity(k);
  }

  /* ---------- Cities board (live, one request per API for all cities) ---------- */
  async function world() {
    const q = `latitude=${WORLD.map(c => c[1])}&longitude=${WORLD.map(c => c[2])}`;
    try {
      const [a, w] = await Promise.all([J(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=us_aqi,pm2_5`), J(`https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,precipitation,weather_code`)]);
      X.w = WORLD.map((c, j) => ({ c, aqi: a[j].current.us_aqi, pm: a[j].current.pm2_5, t: w[j].current.temperature_2m, wc: w[j].current.weather_code })).filter(o => o.aqi != null).sort((x, y) => y.aqi - x.aqi);
    } catch (e) { X.w = false; }
    paintWorld();
  }
  function paintWorld() {
    const b = $('#wl'); if (!b) return;
    b.innerHTML = X.w === null ? '<p class="sub">Loading live readings…</p>' : !X.w ? '<p class="sub">Live readings could not be reached. Check your connection and reload.</p>' : X.w.map((o, j) => `<button class="card xb" data-open='${esc(JSON.stringify(o.c))}'><span class="sub">${j + 1}. ${esc(o.c[4])}</span><b class="n" style="color:${col((o.aqi - 60) / 340)}">${R(o.aqi)}</b><b>${esc(o.c[0])}</b>${meter(o.aqi, 300)}<small class="sub">${aq(o.aqi)} · ${R(o.t)}°C, ${WMO(o.wc).toLowerCase()} · PM2.5 ${R(o.pm)}</small></button>`).join('');
  }
  async function search() {
    const v = $('#cs').value.trim(), b = $('#cr'); if (!v) return;
    b.innerHTML = '<p class="sub">Searching…</p>';
    try {
      const r = (await J(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(v)}&count=6&language=en&format=json`)).results || [];
      b.innerHTML = r.length ? r.map(o => `<button class="card xb" data-open='${esc(JSON.stringify([o.name, o.latitude, o.longitude, (o.country_code || '').toLowerCase(), o.country || '']))}'><b>${esc(o.name)}</b><small class="sub">${esc([o.admin1, o.country].filter(Boolean).join(', '))}</small></button>`).join('') : '<p class="sub">No match. Try the full city name.</p>';
    } catch (e) { b.innerHTML = '<p class="sub">Search is unreachable right now.</p>'; }
  }

  /* ---------- Live desk: outlook, air chemistry, hazards, headlines ---------- */
  async function desk() {
    const k = CK, la = av(Z.map(z => z.la)), lo = av(Z.map(z => z.lo)), q = `latitude=${la.toFixed(3)}&longitude=${lo.toFixed(3)}&timezone=auto`;
    const [o, p, e, v, n] = await Promise.allSettled([
      J(`https://api.open-meteo.com/v1/forecast?${q}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&forecast_days=7`),
      J(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide,uv_index`),
      J('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'),
      J('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=80'),
      J('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(`https://news.google.com/rss/search?q=${C.n}+when:2d&hl=en-IN&gl=IN&ceid=IN:en`))
    ]);
    if (k != CK) return;
    const ok = r => r.status == 'fulfilled' ? r.value : null, ev = ok(e), nv = ok(v), nw = ok(n);
    X.d = {
      la, lo, o: ok(o) && ok(o).daily, p: ok(p) && ok(p).current, news: nw && nw.items || null,
      quakes: ev ? ev.features.map(f => ({ m: f.properties.mag, pl: f.properties.place, t: f.properties.time, u: f.properties.url, km: hv(la, lo, f.geometry.coordinates[1], f.geometry.coordinates[0]) })) : null,
      eo: nv ? nv.events.map(x => { const g = x.geometry[x.geometry.length - 1], c = g && g.coordinates; return c && typeof c[0] == 'number' ? { t: x.title, c: x.categories[0].title, u: (x.sources && x.sources[0] && x.sources[0].url) || x.link, km: hv(la, lo, c[1], c[0]) } : null; }).filter(Boolean) : null
    };
    refresh();
  }
  function paintDesk() {
    const b = $('#xd'); if (!b) return; const d = X.d;
    if (!d.la) { b.innerHTML = '<p class="sub">Loading live feeds for ' + esc(C.n) + '…</p>'; return; }
    const o = d.o, p = d.p, sec = (t, s, h) => `<section class="card xs"><h2>${t}</h2><p class="sub">${s}</p>${h}</section>`;
    const G = [['PM2.5', 'pm2_5', 15], ['PM10', 'pm10', 45], ['Nitrogen dioxide', 'nitrogen_dioxide', 25], ['Ozone', 'ozone', 60], ['Sulphur dioxide', 'sulphur_dioxide', 40], ['Carbon monoxide', 'carbon_monoxide', 4000]];
    const q = d.quakes, top = q && q.length ? q.reduce((a, c) => c.m > a.m ? c : a) : null, near = q ? q.filter(x => x.km < 1500).sort((a, c) => a.km - c.km).slice(0, 4) : null, eo = d.eo ? d.eo.filter(x => x.km < 2500).sort((a, c) => a.km - c.km).slice(0, 4) : null;
    b.innerHTML =
      sec('Seven-day outlook', 'Open-Meteo forecast for the centre of ' + esc(C.n) + '.', o ? `<div class="dys">${o.time.map((t, j) => `<div class="dy"><b>${dn(t)}</b><span>${WMO(o.weather_code[j])}</span><em>${R(o.temperature_2m_max[j])}° / ${R(o.temperature_2m_min[j])}°</em><small>${o.precipitation_sum[j].toFixed(1)} mm rain · UV ${R(o.uv_index_max[j])}</small></div>`).join('')}</div>` : '<p class="sub">The forecast feed could not be reached.</p>') +
      sec('What is in the air', 'Open-Meteo air quality, now. Bars compare each pollutant with the WHO guideline level.', p ? `<div class="xg">${G.map(([n, k, g]) => p[k] == null ? '' : `<div><b>${n}</b> <span class="sub">${R(p[k])} µg/m³</span>${meter(p[k], g)}<small class="sub">${(p[k] / g).toFixed(1)}× the guideline</small></div>`).join('')}</div><p class="sub">UV index right now: <b>${p.uv_index == null ? 'n/a' : p.uv_index}</b></p>` : '<p class="sub">The air feed could not be reached.</p>') +
      sec('Natural hazards', 'USGS earthquakes (magnitude 2.5+, past week) and open NASA EONET events.', (q ? (near.length ? near.map(x => `<a class="nw" href="${esc(x.u)}" target="_blank" rel="noopener">M${x.m} ${esc(x.pl)}<small>${x.km} km from ${esc(C.n)} · ${rel(x.t)}</small></a>`).join('') : `<p class="sub">No magnitude 2.5+ earthquakes within 1,500 km of ${esc(C.n)} this week.</p>`) + (top ? `<p class="sub">Strongest anywhere this week: M${top.m}, ${esc(top.pl)}.</p>` : '') : '<p class="sub">The earthquake feed could not be reached.</p>') + (eo ? (eo.length ? eo.map(x => `<a class="nw" href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.t)}<small>${esc(x.c)} · ${x.km} km away</small></a>`).join('') : '<p class="sub">No open NASA events within 2,500 km.</p>') : '')) +
      sec('Local headlines', 'Google News, via the rss2json relay. Headlines link to the publisher.', d.news && d.news.length ? d.news.slice(0, 6).map(x => `<a class="nw" href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.title)}<small>${rel(Date.parse(String(x.pubDate).replace(' ', 'T') + 'Z'))}</small></a>`).join('') : '<p class="sub">Headlines could not be loaded right now.</p>') +
      `<div class="chips"><button class="c" id="csv">Download ${esc(C.n)} data (CSV)</button></div>`;
  }

  /* ---------- Community hub ---------- */
  const CI = [['Fresh air', '🌿'], ['Hazy or smoky', '😷'], ['Waterlogged', '🌧️'], ['Too hot', '🥵'], ['Calm', '😌']], LV = [[0, 'Newcomer'], [20, 'Neighbour'], [60, 'Scout'], [120, 'Guardian'], [250, 'Champion']];
  const mine = () => Object.values(FD).flatMap(S => S.data).filter(p => p.uid == UID), cis = () => store.get('cp-ci') || [], wl = () => store.get('cp-watch') || [];
  function paintHub() {
    if (!$('#xci')) return;
    const ci = cis().filter(x => x.city == CK && Date.now() - x.t < 864e5), n = ci.length, sv = $('#ciz') ? $('#ciz').value : 0;
    $('#xci').innerHTML = `<h2>How does ${esc(C.n)} feel right now?</h2><p class="sub">One tap adds a check-in. Totals show the last 24 hours on this device.</p><select class="k" id="ciz" aria-label="Area" style="margin-top:10px">${Z.map(z => `<option value="${z.i}">${esc(z.n)}</option>`).join('')}</select><div class="chips" style="margin:12px 0">${CI.map(([c, e]) => `<button class="c" data-ci="${c}">${e} ${c}</button>`).join('')}</div>` +
      (n ? CI.map(([c, e]) => { const m = ci.filter(x => x.c == c).length; return `<div class="hz" style="grid-template-columns:140px 1fr 30px"><span>${e} ${c}</span><div class="br" style="margin:0"><i style="width:${m / n * 100}%;background:var(--ac)"></i></div><b>${m}</b></div>`; }).join('') : '<p class="sub">No check-ins yet. Be the first.</p>');
    $('#ciz').value = sv;
    const m = mine(), p = m.length * 10 + m.reduce((a, q) => a + q.up.filter(u => u != UID).length, 0) * 2 + cis().filter(x => x.u == UID).length * 3, lv = LV.filter(x => p >= x[0]).pop(), nx = LV.find(x => x[0] > p);
    const bd = [['First report', m.length > 0], ['Crowd favourite', m.some(q => q.up.length >= 5)], ['Zone watcher', wl().length >= 3], ['Checked in', cis().some(x => x.u == UID)]];
    $('#xpt').innerHTML = `<h2>${lv[1]} · ${p} points</h2><p class="sub">${nx ? `${nx[0] - p} more points to reach ${nx[1]}.` : 'Top level reached.'} Posts earn 10, check-ins 3, upvotes on your posts 2.</p><div class="br"><i style="width:${nx ? (p - lv[0]) / (nx[0] - lv[0]) * 100 : 100}%;background:var(--ac)"></i></div><div class="chips" style="margin-top:12px">${bd.map(([t, e]) => `<span class="tag bdg${e ? ' on' : ''}" style="justify-self:auto">${t}</span>`).join('')}</div><div class="chips" style="margin-top:14px"><button class="c" id="shr">Share today's pulse card</button></div>`;
    const ar = {}; Object.values(FD).flatMap(S => S.data).filter(x => x.city == CK).forEach(x => ar[x.ar] = (ar[x.ar] || 0) + 1 + x.up.length + x.cm.length);
    const tr = Object.entries(ar).sort((a, b) => b[1] - a[1]).slice(0, 5), W = wl(), nn = NOW();
    $('#xtr').innerHTML = `<h2>Most discussed areas</h2>${tr.length ? tr.map(([a, s]) => `<div class="hz" style="grid-template-columns:1fr 50px"><span>${esc(a)}</span><b>${s}</b></div>`).join('') : '<p class="sub">No posts for this city yet.</p>'}<h2 style="margin-top:22px">Your zones</h2><p class="sub">Star the areas you care about.</p><div class="chips">${Z.map(z => `<button class="c" data-w="${z.i}" aria-pressed="${W.includes(CK + ':' + z.n)}">★ ${esc(z.n)}</button>`).join('')}</div>${Z.filter(z => W.includes(CK + ':' + z.n)).map(z => { const s = score(z.i, nn); return `<div class="hz" style="grid-template-columns:1fr 60px"><span>${esc(z.n)}<small>${s == null ? 'No data' : state(s)}</small></span><b>${s == null ? '–' : R(s)}</b></div>`; }).join('')}`;
  }

  /* ---------- Share card and CSV ---------- */
  async function shareCard() {
    await document.fonts.ready;
    const n = NOW(), c = R(city(n) == null ? 0 : city(n)), rows = Z.map(z => ({ z, s: score(z.i, n) })).filter(o => o.s != null).sort((a, b) => a.s - b.s).slice(0, 4), cs = getComputedStyle(document.documentElement), g = k => cs.getPropertyValue(k).trim();
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; const x = cv.getContext('2d'), sf = 'Newsreader,Georgia,serif', sn = '"Libre Franklin",system-ui,sans-serif';
    x.fillStyle = g('--bg'); x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = g('--ink'); x.font = '700 68px ' + sf; x.fillText('CityPulse ' + C.n, 72, 140);
    x.fillStyle = g('--mut'); x.font = '500 30px ' + sn; x.fillText(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), 72, 196);
    const cc = col((100 - c) / 60); x.fillStyle = cc; x.font = '600 440px ' + sf; x.fillText(c, 56, 660);
    x.font = '700 60px ' + sf; x.fillText(state(c), 72, 750);
    rows.forEach((o, j) => { const y = 880 + j * 96; x.fillStyle = g('--ink'); x.font = '600 32px ' + sn; x.fillText(o.z.n, 72, y); x.fillStyle = g('--line'); x.fillRect(400, y - 24, 520, 24); x.fillStyle = col((100 - o.s) / 60); x.fillRect(400, y - 24, 520 * o.s / 100, 24); x.fillStyle = g('--mut'); x.fillText(R(o.s), 950, y); });
    x.fillStyle = g('--mut'); x.font = '500 26px ' + sn; x.fillText((LIVE ? 'Live Open-Meteo weather and air data' : 'Simulated scenario') + '. Lowest-scoring zones shown.', 72, 1270);
    cv.toBlob(bl => { const f = new File([bl], 'citypulse.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'CityPulse ' + C.n }).catch(() => { }); else { const a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'citypulse-' + CK + '.png'; a.click(); toast('Pulse card saved'); } });
  }
  function csv() {
    const r = [['zone', 'time', ...F.map(f => f.k), 'pulse']];
    Z.forEach(z => { for (let j = 0; j < 96; j++) { const s = score(z.i, j); r.push([z.n, new Date(T0 + j * 18e5).toISOString(), ...F.map(f => D[f.k][z.i][j].toFixed(2)), s == null ? '' : s.toFixed(1)]); } });
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.map(l => l.map(v => `"${v}"`).join(',')).join('\n')], { type: 'text/csv' })); a.download = `citypulse-${CK}.csv`; a.click(); toast('CSV downloaded');
  }

  /* ---------- Wiring ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-open],[data-ci],[data-w],#shr,#shb,#cb,#cl,#csv'); if (!t) return;
    if (t.dataset.open) openCity(...JSON.parse(t.dataset.open));
    else if (t.dataset.ci) { const z = Z[$('#ciz').value], a = cis(); a.push({ t: Date.now(), c: t.dataset.ci, city: CK, z: z.n, u: UID }); store.set('cp-ci', a); toast('Check-in added for ' + z.n); paintHub(); }
    else if (t.dataset.w) { const k = CK + ':' + Z[t.dataset.w].n, w = wl(), j = w.indexOf(k); j < 0 ? w.push(k) : w.splice(j, 1); store.set('cp-watch', w); paintHub(); }
    else if (t.id == 'shr' || t.id == 'shb') shareCard();
    else if (t.id == 'cb') search();
    else if (t.id == 'csv') csv();
    else if (t.id == 'cl') navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => openCity('Your location', p.coords.latitude, p.coords.longitude, '', 'your region'), () => toast('Location was not shared.')) : toast('This browser has no location support.');
    setTimeout(paintHub, 50);
  });
  document.addEventListener('submit', () => setTimeout(paintHub, 100));
  document.addEventListener('keydown', e => { if (e.key == 'Enter' && e.target.id == 'cs') search(); });

  function refresh() { if (X.key != CK) { X.key = CK; X.d = {}; desk(); } paintDesk(); paintHub(); ticker(); }
  const rv = refreshViews; refreshViews = () => { rv(); refresh(); };

  const tk = document.createElement('div'); tk.id = 'tk'; tk.setAttribute('aria-label', 'Live headlines'); $('#v-dash header').after(tk);
  $('.hero').insertAdjacentHTML('beforeend', '<div class="chips" style="margin-top:14px"><button class="c" id="shb">Share this pulse</button></div>');
  window.CPX = { X, csv, mine, cis, LV }; // read-only hooks for the guided walkthrough in index.html
  X.w = null; paintWorld(); world(); refresh();
})();
