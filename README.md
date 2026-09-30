# Después ✳

Un contador, un momento y un mensaje que se revela al llegar a cero.

**Sitio:** https://canda.github.io/countdown/

## Uso

La página principal permite escribir un mensaje, seleccionar fecha, hora y zona horaria (detectada del navegador), elegir entre cinco temas y copiar el enlace. La segunda página muestra solamente el contador y después el mensaje. Funciona en celulares y computadoras, sin cuentas, base de datos ni servicios externos.

## Desarrollo

Requiere Node.js 22.12+ (se recomienda 24).

```sh
npm ci
npm run dev
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Vite genera ambas páginas en `docs/`, con rutas relativas para publicar en un subdirectorio o dominio propio. GitHub Pages publica desde `main` → `/docs`. Después de cambiar el código, ejecutar las pruebas y `npm run build`, incluir `docs/` en el commit y hacer push.

En `deployment/github-actions.yml.example` hay una alternativa para probar y desplegar con Actions. Para activarla, moverla a `.github/workflows/deploy.yml` y configurar Pages con origen **GitHub Actions**; subir workflows requiere una credencial con permiso `workflow`.

## Formato del enlace

`countdown.html?at=2030-01-01T15%3A00%3A00Z&tz=America%2FArgentina%2FBuenos_Aires&msg=SG9sYQ&theme=paper`

- `at`: instante ISO 8601 con zona UTC u offset explícito.
- `tz`: zona IANA elegida para interpretar la fecha y hora originales.
- `msg`: mensaje UTF-8 codificado como Base64 URL-safe sin padding; máximo 1500 caracteres JavaScript.
- `theme`: `paper`, `midnight`, `sage`, `rose` o `electric`.

El instante UTC es el mismo para todos los visitantes. Temporal convierte la hora local de la zona seleccionada y rechaza horas inexistentes o ambiguas en cambios de horario de verano. El contador se recalcula con el reloj del dispositivo; no depende de contar ticks. Los enlaces vencidos muestran el mensaje inmediatamente.

Base64 disimula el mensaje, no lo cifra: puede leerse antes de tiempo inspeccionando el enlace. El contenido se inserta como texto, nunca como HTML. No hay analíticas, fuentes remotas ni almacenamiento del mensaje en una base de datos; el enlace puede quedar en el historial y registros normales del alojamiento. La precisión depende del reloj del dispositivo. Los cambios futuros en reglas horarias no modifican el instante que ya quedó fijado en un enlace.

Pruebas unitarias: Unicode, zonas, DST, enlaces malformados y aritmética. Pruebas de navegador: creación y apertura, temas, revelado automático, recarga, texto seguro y diseño móvil.
