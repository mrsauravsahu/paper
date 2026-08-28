# syntax=docker/dockerfile:1

# ---- Stage 1: node dependencies ------------------------------------------
# Built separately so npm's cache, lockfile and dev tooling never reach the
# runtime image — only the resolved node_modules tree is copied forward.
FROM --platform=linux/amd64 node:20-bookworm-slim AS deps

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

WORKDIR /paper
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit

# ---- Stage 2: runtime -----------------------------------------------------
FROM --platform=linux/amd64 ms609/pandoc:latest AS runtime

ARG CHROME_DEB=https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Node runtime, SVG/PDF converters and headless Chrome for mermaid diagrams.
# Single layer, --no-install-recommends, apt lists and the .deb removed in the
# same layer so none of it is committed to the image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates wget \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends \
        nodejs \
        librsvg2-bin \
        inkscape \
        fonts-liberation \
        libgbm1 \
        libu2f-udev \
        libvulkan1 \
    && wget -q -O /tmp/chrome.deb "$CHROME_DEB" \
    && apt-get install -y --no-install-recommends /tmp/chrome.deb \
    && rm -f /tmp/chrome.deb \
    && apt-get purge -y --auto-remove wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*.deb \
              /usr/share/doc/* /usr/share/man/* /root/.npm /tmp/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    MERMAID_FILTER_PUPPETEER_CONFIG=/paper/config/puppeteer-config.json \
    MERMAID_FILTER_FORMAT=pdf

WORKDIR /paper

COPY --from=deps /paper/node_modules ./node_modules
COPY config/ config/
COPY src/ src/

LABEL org.opencontainers.image.title="paper" \
      org.opencontainers.image.description="Render Markdown to a styled PDF via pandoc, LaTeX, mermaid and twemoji" \
      org.opencontainers.image.source="https://github.com/mrsauravsahu/paper" \
      org.opencontainers.image.licenses="MIT"

CMD ["/bin/bash"]
