import './style.css';
import { parseLink, remaining } from './core.js';
const $ = id => document.getElementById(id);
try {
  const { target, message, theme } = parseLink(location.search);
  document.body.dataset.theme = theme;
  let interval;
  function render() {
    if (Date.now() >= target) {
      $('timer').hidden = true;
      if ($('reveal').hidden) { $('reveal').textContent = message; $('reveal').hidden = false; }
      clearInterval(interval); return;
    }
    for (const [key, value] of Object.entries(remaining(target))) $(key).textContent = String(value).padStart(2, '0');
  }
  render();
  if (Date.now() < target) interval = setInterval(render, 250);
  document.addEventListener('visibilitychange', render);
} catch {
  $('timer').hidden = true; $('link-error').hidden = false;
}
