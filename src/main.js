import './style.css';
import { createLink, remaining, toInstant } from './core.js';
const $ = id => document.getElementById(id);
const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
$('timezone').value = localZone;
const zones = [...new Set([localZone, 'UTC', ...(Intl.supportedValuesOf?.('timeZone') || [])])].sort();
for (const zone of zones) { const option = document.createElement('option'); option.value = zone; $('timezones').append(option); }
const tomorrow = new Date(Date.now() + 86400000);
$('date').value = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
$('time').value = '18:00';
const labels = { paper: 'Papel', midnight: 'Noche', sage: 'Salvia', rose: 'Rosa', electric: 'Eléctrico' };
function updatePreview() {
  try { const values = remaining(Date.parse(toInstant($('date').value, $('time').value, $('timezone').value))); document.querySelectorAll('#preview b').forEach((el, i) => { el.textContent = String(Object.values(values)[i]).padStart(2, '0'); }); } catch { /* Keep the last valid preview while editing. */ }
}
$('creator').addEventListener('input', () => {
  $('result').hidden = true; $('form-error').hidden = true;
  $('char-count').textContent = `${$('message').value.length} / 1500`;
  const theme = document.querySelector('[name="theme"]:checked').value;
  $('preview').dataset.theme = theme; $('theme-label').textContent = labels[theme]; updatePreview();
});
updatePreview(); setInterval(updatePreview, 1000);
$('creator').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const url = createLink(location.href, { date: $('date').value, time: $('time').value, timezone: $('timezone').value.trim(), message: $('message').value, theme: document.querySelector('[name="theme"]:checked').value });
    $('generated-url').value = url; $('open-link').href = url; $('result').hidden = false; $('form-error').hidden = true; $('copy-status').textContent = ''; $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) { $('form-error').textContent = error.message; $('form-error').hidden = false; }
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('generated-url').value); $('copy-status').textContent = '¡Enlace copiado!'; }
  catch { $('generated-url').focus(); $('generated-url').select(); $('copy-status').textContent = 'Seleccionamos el enlace: copialo con el menú o con Ctrl/Cmd + C.'; }
});
