<div align="center">
  <img src="public/logo.png" alt="OBScure" width="96" />
  <h1>OBScureWeb</h1>
  <p>Marketing site, documentation, and template gallery for <a href="https://github.com/MISQZY/OBScure">OBScure</a>.</p>
</div>

<p align="center">
  <a href="https://obscure.misqzy.net"><b>obscure.misqzy.net</b></a>
  ·
  <a href="https://github.com/MISQZY/OBScure">OBScure desktop app</a>
</p>

---

For what OBScure is and how to use it, see the site itself — this repo is just the Next.js app behind it (fumadocs docs, template gallery, admin panel).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in ADMIN_SESSION_SECRET at least
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # generates fumadocs content, then next build
npm run start   # serve the production build
npm run lint
```

Production deploys are built and shipped by CI as a Docker image (see `docker-compose.yml`, `deploy.sh`) — not something you build locally.

## Related

- [OBScure](https://github.com/MISQZY/OBScure) — the desktop app this site documents
- [obscure.misqzy.net](https://obscure.misqzy.net) — the live site
