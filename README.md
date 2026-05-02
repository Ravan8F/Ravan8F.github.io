# SITE 1101 - Personal Portfolio Website

This repository contains my SITE 1101 Project 04 site. The layout and styling are based on **Future Imperfect** by [HTML5 UP](https://html5up.net/future-imperfect) (CCA 3.0 — attribution in page footers).

## Pages

- **`index.html`** — Home: profile photo, introduction, sidebar with project mini-posts, GitHub & Codecademy icons in the footer block.
- **`about.html`** — About: background, activities placeholder, snapshot, progress (`body` uses the template’s `single` layout).
- **`projects.html`** — Projects: Project 1 (Lego), Project 2 (Hour of Code), Project 3 (logic gates), each with image, description, and video link where applicable. Anchors: `#lego`, `#hour-of-code`, `#gates`.

## Assets

- **`assets/css/`**, **`assets/js/`**, **`assets/webfonts/`** — Future Imperfect template assets.
- **`assets/images/`** — Your portfolio photos (PNG).
- **`images/`** — Stock images bundled with the template (e.g. `logo.jpg`, `avatar.jpg`, `pic01.jpg` …) if you want to use them elsewhere.

## GitHub Pages

Deploy from the repository root (`index.html` at root). This repo is set up as a **user site** (`username.github.io`): CSS/JS/images use **root-relative** URLs (e.g. `/assets/...`) so they resolve correctly on the live domain.

- A **`.nojekyll`** file is included so GitHub Pages does not run Jekyll on your HTML (avoids odd processing of static files).
- After you push, wait 1–2 minutes and hard-refresh the site (**Cmd+Shift+R**). If it still looks wrong, confirm Pages is building from the **`main`** branch and **root** (or `/docs` only if you moved files there).
- If you ever host this as a **project site** (`username.github.io/repo-name/`), you must switch back to **relative** asset paths (no leading `/`) or add a proper `<base href="...">`.

After publishing, point the GitHub footer link to your **portfolio repository** URL if the rubric requires the repo link, not only your profile.
