# Audio Mirror

Share Windows audio with your headphones and speakers. The default Windows
output keeps playing, with up to four additional listening devices and an
independent 0–400 ms added-delay control for each one.

[Visit the site](https://dittomao.github.io/) ·
[Download for Windows](https://dittomao.github.io/AudioMirror.exe)

Requires Windows 10 or 11, 64-bit. Bluetooth capacity depends on the adapter,
drivers, and devices. Completely free for everyone, with every feature included.
No account or internet connection is needed to use the app.

This repository contains the static website and downloadable Windows build.
The site includes light/dark appearance, an interactive example, a setup guide,
and responsive layouts with reduced-motion support. Example controls do not
capture or play audio.

## Local preview

Serve this directory with a static HTTP server, for example:

```sh
python -m http.server 8765
```

Then open `http://localhost:8765/`. No website build step is required.

## Deployment

GitHub Pages publishes the root of `main`. The `.nojekyll` file preserves the
static HTML, CSS, JavaScript, images, and fonts without Jekyll processing.
Space Grotesk is self-hosted; its licence is in `assets/fonts/OFL.txt`.
