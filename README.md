# CRUDE · Monitor

Interaktives Erdöl & Raffinerie Dashboard — brutalist editorial design, served from a lightweight nginx container.

![Dashboard](https://img.shields.io/badge/style-brutalist%20editorial-black)
![Docker](https://img.shields.io/badge/docker-nginx%201.27--alpine-blue)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-green)

## Features

- **Destillationsturm** — Fraktionen mit Temperaturbereichen und Ausbeuten
- **Rohölsorten** — Brent, WTI, Maya, Arab Heavy u.a. mit API-Grad und Schwefelgehalt
- **Molekulare Zusammensetzung** — Was Rohöl leicht oder schwer macht
- **Katalytisches Cracken** — Schritt-für-Schritt FCC-Prozess
- **Handelsströme** — Globale Import/Export-Beziehungen
- **Barrel Breakdown** — Was aus 159 Litern Rohöl wird
- **Yield Comparison** — Raffinerieausbeute verschiedener Sorten im Vergleich

## Quick Start

### Docker

```bash
# Lokal bauen und starten
docker build -t crude-monitor .
docker run -d -p 8080:80 crude-monitor

# Dann: http://localhost:8080
```

### Docker Compose

```yaml
services:
  crude-monitor:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

### Aus GitHub Container Registry ziehen

```bash
docker pull ghcr.io/<dein-username>/crude-monitor:latest
docker run -d -p 8080:80 ghcr.io/<dein-username>/crude-monitor:latest
```

## CI/CD

Der GitHub Actions Workflow baut automatisch bei jedem Push auf `main`:

1. Baut das Docker Image mit Buildx
2. Pushed zu `ghcr.io/<repo>`
3. Tags: `latest`, Branch-Name, SHA, Semver (bei Tags)

### Setup

Das Repo braucht keine Secrets — `GITHUB_TOKEN` hat automatisch `packages:write` Rechte.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML/CSS/JS, Chart.js |
| Fonts | DM Serif Display, IBM Plex Mono, IBM Plex Sans |
| Server | nginx 1.27 alpine |
| Container | Docker (multi-stage nicht nötig — pure static files) |
| CI | GitHub Actions → ghcr.io |

## Lokal entwickeln

Einfach `app/index.html` im Browser öffnen — keine Build-Tools nötig.

## Lizenz

MIT
