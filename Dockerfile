# syntax=docker/dockerfile:1
#
# Built from components rather than a prebuilt pandoc/TeX base image:
#   - pandoc          upstream .deb release (~30 MB)
#   - lualatex        TeX Live scheme-infraonly + only the packages template.tex loads
#   - node            for the mermaid pandoc filter
# Each is assembled in its own stage; the runtime image copies in only the
# finished trees, so no installers, caches or package indexes are committed.

ARG DEBIAN=debian:bookworm-slim
ARG NODE_VERSION=20
ARG PANDOC_VERSION=3.1.11.1

# ---- Stage: pandoc --------------------------------------------------------
FROM ${DEBIAN} AS pandoc
ARG PANDOC_VERSION
ARG TARGETARCH
RUN printf 'Acquire::Retries "8";\nAcquire::http::Timeout "30";' > /etc/apt/apt.conf.d/99retries
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && curl -fsSL -o /tmp/pandoc.deb \
      "https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-1-${TARGETARCH}.deb" \
 && dpkg -x /tmp/pandoc.deb /pandoc-root \
 && rm -rf /tmp/pandoc.deb /var/lib/apt/lists/*

# ---- Stage: texlive -------------------------------------------------------
# scheme-infraonly is the smallest installable scheme; every LaTeX package
# below is one that config/template.tex actually \usepackage's (or is a
# dependency of one). Docs and sources are skipped.
FROM ${DEBIAN} AS texlive
ARG TARGETARCH
RUN printf 'Acquire::Retries "8";\nAcquire::http::Timeout "30";' > /etc/apt/apt.conf.d/99retries
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates curl perl fontconfig xz-utils \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/install-tl
RUN curl -fsSL https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz \
      | tar xz --strip-components=1 \
 && printf '%s\n' \
      'selected_scheme scheme-infraonly' \
      'TEXDIR /opt/texlive' \
      'TEXMFLOCAL /opt/texlive/texmf-local' \
      'TEXMFSYSVAR /opt/texlive/texmf-var' \
      'TEXMFSYSCONFIG /opt/texlive/texmf-config' \
      'TEXMFHOME ~/texmf' \
      'option_doc 0' \
      'option_src 0' \
      > texlive.profile \
 && ./install-tl --profile=texlive.profile \
 && rm -rf /tmp/install-tl

ENV PATH=/opt/texlive/bin/aarch64-linux:/opt/texlive/bin/x86_64-linux:$PATH

RUN tlmgr install \
      latex latex-bin latexconfig tex-ini-files \
      amsfonts amsmath booktabs caption ec etoolbox fancyhdr fancyvrb \
      fvextra geometry graphics graphics-cfg graphics-def grffile \
      hyperref iftex l3kernel l3packages lineno listings lm microtype newunicodechar parskip pdftexcmds pgf pmboxdraw \
      setspace titlesec tools ulem upquote url xcolor xkeyval xurl \
      footnotehyper footmisc infwarerr kvoptions kvsetkeys ltxcmds \
      epstopdf-pkg auxhook bigintcalc bitset etexcmds gettitlestring \
      hycolor intcalc kvdefinekeys letltxmacro pdfescape refcount \
      rerunfilecheck stringenc uniquecounter zapfding symbol \
      luatex luahbtex fontspec unicode-math lualatex-math luaotfload lm-math \
 && fmtutil-sys --byfmt pdflatex \
 && fmtutil-sys --byfmt lualatex \
 && rm -rf /opt/texlive/texmf-dist/doc /opt/texlive/texmf-var/web2c/*.log

# ---- Stage: node dependencies ---------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false
WORKDIR /paper
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit

# ---- Stage: runtime -------------------------------------------------------
FROM ${DEBIAN} AS runtime
ARG NODE_VERSION
# Chromium is only used to rasterise mermaid diagrams and adds ~240 MB. It is
# on by default so every feature works out of the box; build with
# --build-arg WITH_CHROMIUM=0 for a smaller image if you never use mermaid.
ARG WITH_CHROMIUM=1
RUN printf 'Acquire::Retries "8";\nAcquire::http::Timeout "30";' > /etc/apt/apt.conf.d/99retries

# fonts-noto-color-emoji renders emoji directly, replacing the old filter that
# downloaded an SVG per glyph from raw.githubusercontent.com at render time.
# Chromium is only needed for mermaid diagrams; see MERMAID note in README.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates perl fontconfig fonts-noto-color-emoji \
 && if [ "$WITH_CHROMIUM" = "1" ]; then \
      apt-get install -y --no-install-recommends chromium fonts-liberation; \
    fi \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /usr/share/doc/* /usr/share/man/* /root/.npm /tmp/*

# Node comes straight from the official image; the NodeSource apt repo would
# pull gnupg and python into the runtime layer for no benefit.
COPY --from=deps    /usr/local/bin/node                /usr/local/bin/node
COPY --from=pandoc  /pandoc-root/usr/bin/pandoc        /usr/bin/pandoc
COPY --from=texlive /opt/texlive       /opt/texlive
ENV PATH=/opt/texlive/bin/aarch64-linux:/opt/texlive/bin/x86_64-linux:$PATH

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    MERMAID_FILTER_PUPPETEER_CONFIG=/paper/config/puppeteer-config.json \
    MERMAID_FILTER_FORMAT=pdf

WORKDIR /paper
COPY --from=deps /paper/node_modules ./node_modules
COPY config/ config/

LABEL org.opencontainers.image.title="paper" \
      org.opencontainers.image.description="Render Markdown to a styled PDF via pandoc, pdflatex and twemoji" \
      org.opencontainers.image.source="https://github.com/mrsauravsahu/paper" \
      org.opencontainers.image.licenses="MIT"

CMD ["/bin/bash"]
