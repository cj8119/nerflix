# NERflix

> *16 seasons. One system. Endless episodes.*

NERflix is a **political parody** website presenting real Hungarian political news articles in a card-based, drag-to-scroll UI. The streaming-service aesthetic is intentional satire — the drama is real, only the branding is fictional.

---

## What it is

A static, single-page application that categorises hundreds of real Hungarian political articles across five themes:

- **Corruption**
- **Media & Propaganda**
- **Rule of Law**
- **Social Harm**
- **Foreign Policy**

No algorithms, no paywalls, no spin — just the receipts, organised for browsing.

---

## Database

The article database (`db.js`) is sourced from **[nerlist.hu](https://nerlist.hu)** and is released under the [CC0 Public Domain Dedication](https://creativecommons.org/public-domain/cc0/). It is updated manually from that source and intentionally kept as a standalone file to make updates straightforward.

---

## Tech stack

Pure HTML, CSS, and vanilla JavaScript. No build tools, no frameworks, no dependencies.

```
index.html   — markup, SEO meta tags, Schema.org structured data
style.css    — all styles
app.js       — rendering, drag-scroll, keyboard navigation
db.js        — article database (sourced from nerlist.hu, do not edit)
```

## Running locally

Open `index.html` directly in a browser.

---

## License

The **source code** (HTML, CSS, JS) is released under the [MIT License](LICENSE).
The **article database** (`db.js`) is sourced from [nerlist.hu](https://nerlist.hu) under [CC0](https://creativecommons.org/public-domain/cc0/).

You are free to fork, remix, and redeploy this project for any purpose.
