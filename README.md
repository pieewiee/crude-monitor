# CRUDE · Monitor

Interactive crude oil & refinery dashboard — brutalist editorial design, live EIA data, served from a lightweight nginx container.

**[oil.tillniederauer.de](https://oil.tillniederauer.de)**

![Dashboard](https://img.shields.io/badge/style-brutalist%20editorial-black)
![Docker](https://img.shields.io/badge/docker-nginx%201.27--alpine-blue)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-green)

## Features

### Live Data (US EIA API)
- **Historical Benchmark Prices** — Brent & WTI weekly spot prices since 1987 with 10w/40w moving averages
- **Brent–WTI Spread** — price differential chart
- **US Crude Oil Inventories** — weekly commercial stocks
- **Henry Hub Natural Gas** — live spot price in ticker
- **Geopolitical Incident Markers** — Gulf War, 9/11, Financial Crisis, COVID, Russia-Ukraine, Iran 2026, and more annotated on the price timeline

### Analytics
- **Monthly Returns Heatmap** — Brent % change by month/year
- **Seasonal Pattern** — average monthly return since 1987
- **12-Week Rolling Volatility** — annualized %
- **Weekly Returns Distribution** — histogram of Brent price changes

### Reference Data
- **Atmospheric Distillation** — fractions with temperature ranges and yields
- **Benchmark Crude Oils** — Brent, WTI, Maya, Arab Heavy with API gravity and sulfur content
- **Global Oil Fields Map** — interactive D3 world map with major production regions
- **Catalytic Cracking (FCC)** — step-by-step process with molecular breakdown
- **Major Trade Flows** — global import/export relationships
- **Barrel Breakdown** — what one barrel of crude oil yields
- **Refinery Yield Comparison** — output by crude grade

### Performance
- **nginx reverse proxy** with 6h server-side cache for EIA API responses
- **localStorage cache** with 6h TTL for instant repeat page loads
- **Weekly frequency** data — ~2k rows per series instead of ~10k daily

## Quick Start

### Docker

```bash
docker build -t crude-monitor .
docker run -d -p 8080:80 -e EIA_API_KEY=your_key_here crude-monitor
# → http://localhost:8080
```

### Docker Compose

```yaml
services:
  crude-monitor:
    build: .
    ports:
      - "8080:80"
    environment:
      - EIA_API_KEY=your_key_here
    restart: unless-stopped
```

### GitHub Container Registry

```bash
docker pull ghcr.io/pieewiee/crude-monitor:latest
docker run -d -p 8080:80 -e EIA_API_KEY=your_key_here ghcr.io/pieewiee/crude-monitor:latest
```

> Get a free EIA API key at [eia.gov/opendata](https://www.eia.gov/opendata/)

## Architecture

```
Browser (index.html)
  → nginx reverse proxy (/api/eia/)
    → api.eia.gov (API key injected server-side, cached 6h)
```

The EIA API key is **never exposed to the browser**. The nginx entrypoint script writes the key from the `EIA_API_KEY` environment variable into an nginx config snippet at container startup, which injects it into proxied requests via URL rewrite.

## CI/CD

GitHub Actions builds and pushes to `ghcr.io` on every push to `main`:

1. Builds Docker image with Buildx
2. Pushes to `ghcr.io/<repo>`
3. Tags: `latest`, branch name, SHA, semver (on tags)

No secrets needed — `GITHUB_TOKEN` has `packages:write` permissions automatically.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML/CSS/JS, Chart.js, D3.js |
| Fonts | DM Serif Display, JetBrains Mono, Instrument Sans |
| Data | US EIA Open Data API v2 |
| Server | nginx 1.27 alpine (reverse proxy + cache) |
| Container | Docker |
| CI | GitHub Actions → ghcr.io |

## Local Development

Open `app/index.html` in a browser — no build tools needed. Live EIA data requires the nginx proxy (run via Docker).

## License

MIT
