import { Temporal } from '@js-temporal/polyfill';
export const themes = ['paper', 'midnight', 'sage', 'rose', 'electric'];
export function encodeMessage(message) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(message))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function decodeMessage(encoded) {
  if (!encoded || encoded.length > 16000 || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error('Mensaje inválido');
  const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
  const message = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  if (!message.trim() || message.length > 1500) throw new Error('Mensaje inválido');
  return message;
}
export function toInstant(date, time, timezone) {
  return Temporal.PlainDateTime.from(`${date}T${time}`).toZonedDateTime(timezone, { disambiguation: 'reject' }).toInstant().toString();
}
export function createLink(base, { date, time, timezone, message, theme }, now = Date.now()) {
  if (!message.trim() || message.length > 1500) throw new Error('Escribí un mensaje de hasta 1500 caracteres.');
  let instant;
  try { instant = toInstant(date, time, timezone); } catch { throw new Error('Revisá la fecha y la zona horaria. Si la hora coincide con un cambio de horario de verano, elegí otra hora.'); }
  if (Temporal.Instant.from(instant).epochMilliseconds <= now) throw new Error('Elegí una fecha y hora futuras.');
  if (!themes.includes(theme)) throw new Error('Elegí un tema válido.');
  const url = new URL('countdown.html', base);
  url.search = new URLSearchParams({ at: instant, tz: timezone, msg: encodeMessage(message), theme });
  return url.href;
}
export function parseLink(search) {
  const params = new URLSearchParams(search);
  const instant = Temporal.Instant.from(params.get('at'));
  const timezone = params.get('tz');
  if (!timezone) throw new Error('Falta zona horaria');
  instant.toZonedDateTimeISO(timezone);
  const message = decodeMessage(params.get('msg'));
  const theme = params.get('theme') || 'paper';
  if (!themes.includes(theme)) throw new Error('Tema inválido');
  return { target: instant.epochMilliseconds, timezone, message, theme };
}
export function remaining(target, now = Date.now()) {
  const seconds = Math.max(0, Math.ceil((target - now) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
}
