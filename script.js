(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let selectedTheme = null;
  try { selectedTheme = localStorage.getItem('audioMirror.siteTheme'); } catch { /* Storage is optional. */ }

  function applyTheme(theme, persist = false) {
    root.dataset.theme = theme;
    $('.theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    $('.theme-toggle').setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    $('.theme-toggle').setAttribute('aria-pressed', String(theme === 'dark'));
    $$('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
    $('meta[name="theme-color"]').content = theme === 'dark' ? '#19201D' : '#F5F6F3';
    if (persist) {
      selectedTheme = theme;
      try { localStorage.setItem('audioMirror.siteTheme', theme); } catch { /* Private browsing can deny storage. */ }
    }
  }
  $('.theme-toggle').hidden = false;
  $('.theme-toggle').addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  $$('[data-theme-choice]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => applyTheme(button.dataset.themeChoice, true));
  });
  applyTheme(root.dataset.theme);
  systemTheme.addEventListener('change', event => {
    if (!['light', 'dark'].includes(selectedTheme)) applyTheme(event.matches ? 'dark' : 'light');
  });
  addEventListener('storage', event => {
    if (event.key !== 'audioMirror.siteTheme') return;
    selectedTheme = event.newValue;
    applyTheme(['light', 'dark'].includes(selectedTheme) ? selectedTheme : systemTheme.matches ? 'dark' : 'light');
  });

  const menuButton = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  menuButton.hidden = false;
  function closeMenu(returnFocus = false) {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    menuButton.querySelector('use').setAttribute('href', '#i-menu');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const opening = mobileNav.hidden;
    mobileNav.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    menuButton.querySelector('use').setAttribute('href', opening ? '#i-close' : '#i-menu');
    if (opening && !reducedMotion.matches) mobileNav.animate([{opacity: 0, transform: 'translateY(-6px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 220, easing: 'cubic-bezier(.16,1,.3,1)'});
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });
  document.addEventListener('click', event => { if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 641px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // This is an interactive example, never an audio capture or playback engine.
  const examples = [
    {id: 0, name: 'AirPods Pro', delay: 0, icon: 'headphones'},
    {id: 1, name: 'Sony WH-1000XM5', delay: 45, icon: 'headphones'},
    {id: 2, name: 'USB headphones', delay: 0, icon: 'headphones'},
    {id: 3, name: 'Living room speakers', delay: 80, icon: 'speaker'}
  ];
  let listeners = examples.slice(0, 2).map(device => ({...device}));
  let running = false;
  const list = $('#demo-list');
  const announce = text => { $('#preview-announcement').textContent = text; };
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  function refreshPreview() {
    $('#demo-count').textContent = `${listeners.length} of 4`;
    $('#demo-add').disabled = listeners.length === 4;
    $('#demo-add').querySelector('span').textContent = listeners.length === 4 ? 'All four spots are in use' : 'Add a listening device';
    const available = 4 - listeners.length;
    $('#demo-slots').textContent = available ? `${available} ${available === 1 ? 'spot' : 'spots'} left` : '';
    $('#demo-play').disabled = listeners.length === 0;
    if (!listeners.length) running = false;
    $('.demo').classList.toggle('running', running);
    $('#demo-play').setAttribute('aria-pressed', String(running));
    $('#demo-play-label').textContent = running ? 'Stop preview' : 'Start preview';
    $('#demo-playback-copy').textContent = !listeners.length ? 'Add a listener to start.' : running ? 'Preview is playing.' : 'Ready when you are.';
    $$('.device-status').forEach(status => status.textContent = running ? 'Playing · preview' : 'Ready to listen');
  }
  function renderListeners(addedId = null) {
    const moving = ['#demo-add', '.demo-playback', '.demo-hint', '.preview-caption'];
    const oldPositions = new Map(moving.map(selector => [selector, $(selector).getBoundingClientRect().top]));
    list.querySelectorAll('[data-device]').forEach(element => oldPositions.set(`[data-device="${element.dataset.device}"]`, element.getBoundingClientRect().top));
    list.innerHTML = listeners.length ? listeners.map(device => `<div class="demo-device" data-device="${device.id}"><div class="device-top">${icon(device.icon)}<strong>${device.name}</strong><button class="icon-button remove-device" type="button" aria-label="Remove ${device.name} from preview" data-remove="${device.id}">${icon('close')}</button></div><span class="device-status">Ready to listen</span><div class="delay-control"><label for="delay-${device.id}">Delay</label><input id="delay-${device.id}" type="range" min="0" max="400" step="1" value="${device.delay}" data-delay="${device.id}" aria-describedby="delay-help" aria-valuetext="${device.delay} milliseconds added delay"><output id="delay-value-${device.id}" for="delay-${device.id}">${device.delay} ms</output></div></div>`).join('') : '<p class="demo-empty">A spot for your favourite headphones.<br>Add a device to try the controls.</p>';
    refreshPreview();
    if (!reducedMotion.matches) {
      const shifts = [...oldPositions].map(([selector, top]) => ({element: $(selector), top})).filter(({element}) => element).map(({element, top}) => ({element, distance: top - element.getBoundingClientRect().top}));
      for (const {element, distance} of shifts) if (Math.abs(distance) > 1) element.animate([{transform: `translateY(${distance}px)`}, {transform: 'translateY(0)'}], {duration: 280, easing: 'cubic-bezier(.16,1,.3,1)'});
    }
    if (addedId !== null && !reducedMotion.matches) {
      list.querySelector(`[data-device="${addedId}"]`).animate([{opacity: 0, transform: 'translateY(8px) scale(.98)'}, {opacity: 1, transform: 'translateY(0) scale(1)'}], {duration: 280, easing: 'cubic-bezier(.16,1,.3,1)'});
    }
  }
  list.addEventListener('input', event => {
    const control = event.target.closest('[data-delay]');
    if (!control) return;
    const device = listeners.find(device => device.id === Number(control.dataset.delay));
    device.delay = Number(control.value);
    $(`#delay-value-${device.id}`).textContent = `${device.delay} ms`;
    control.setAttribute('aria-valuetext', `${device.delay} milliseconds added delay`);
  });
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const index = listeners.findIndex(device => device.id === Number(button.dataset.remove));
    const name = listeners[index].name;
    listeners.splice(index, 1);
    renderListeners();
    const nextButton = list.querySelectorAll('[data-remove]')[Math.min(index, listeners.length - 1)];
    (nextButton || $('#demo-add')).focus({preventScroll: true});
    announce(`${name} removed from the example setup. ${listeners.length} listening devices selected.`);
  });
  $('#demo-add').addEventListener('click', () => {
    const device = examples.find(device => !listeners.some(selected => selected.id === device.id));
    if (!device) return;
    listeners.push({...device});
    renderListeners(device.id);
    $(`#delay-${device.id}`).focus({preventScroll: true});
    announce(`${device.name} added to the example setup. ${listeners.length} of four spots in use.`);
  });
  $('#demo-play').addEventListener('click', () => {
    running = !running;
    refreshPreview();
    announce(running ? 'Preview started. Example devices only; no audio is captured or played.' : 'Preview stopped.');
    if (!reducedMotion.matches) $('.demo-playback').animate([{opacity: .6}, {opacity: 1}], {duration: 220});
  });
  renderListeners();
  $('#demo-add').disabled = false;

  const stages = [
    {title: 'Pair your devices.', description: 'Connect your headphones or speakers in Windows Bluetooth & devices settings first.', statuses: ['Available in Windows', 'Available in Windows'], note: 'Example setup · pair in Windows first'},
    {title: 'Pick your listeners.', description: 'Open Audio Mirror and choose up to four additional outputs. Your default Windows output keeps playing, too.', statuses: ['Selected · ready', 'Selected · ready'], note: 'Example setup · two of four listening spots'},
    {title: 'Press play. Settle in.', description: 'Press Start mirroring. No account or internet connection needed. Each listener gets a visible stream status, so you can see what is playing.', statuses: ['Playing', 'Playing'], note: 'Example setup · mirroring to two listeners'},
    {title: 'Find your timing.', description: 'Add 0–400 ms of delay to a faster mirror target to help match a slower device. Bluetooth latency cannot be removed.', statuses: ['0 ms added delay', '45 ms added delay'], note: 'Example setup · independently adjusted delay'}
  ];
  function showStage(index) {
    const stage = stages[index];
    $('#guide-title').textContent = stage.title;
    $('#guide-description').textContent = stage.description;
    $('#guide-progress').value = index;
    $('#guide-progress').setAttribute('aria-valuetext', stage.title);
    $$('[data-step]').forEach(button => {
      if (Number(button.dataset.step) === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    $$('.guide-device-status').forEach((status, position) => {status.textContent = stage.statuses[position];});
    $('#guide-preview-note').textContent = stage.note;
    $('.guide-fragment').dataset.stage = index;
    if (!reducedMotion.matches) {
      $('.guide-current').animate([{opacity: .3, transform: 'translateY(6px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 250, easing: 'cubic-bezier(.16,1,.3,1)'});
      $('.guide-listeners').animate([{opacity: .45}, {opacity: 1}], {duration: 250});
    }
  }
  $('#guide-progress').disabled = false;
  $('#guide-progress').addEventListener('input', event => showStage(Number(event.target.value)));
  $$('[data-step]').forEach(button => {button.disabled = false; button.addEventListener('click', () => showStage(Number(button.dataset.step)));});

  // Visible by default; an enhancement failure cannot leave a blank section.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reducedMotion.matches || entry.target.closest('.hero-copy')) continue;
        entry.target.classList.add(entry.target.matches('figure,.guide-visual') ? 'reveal-picture' : 'reveal-copy');
      }
    }, {threshold: .12});
    $$('[data-reveal]').forEach(element => observer.observe(element));
  }
  reducedMotion.addEventListener('change', event => {
    if (event.matches) document.getAnimations().forEach(animation => animation.cancel());
  });
})();
