FROM --platform=linux/amd64 ms609/pandoc:latest

RUN apt-get update -y && apt-get install -y nodejs npm librsvg2-bin inkscape \
    wget ca-certificates fonts-liberation libgbm1 libu2f-udev libvulkan1 \
    && wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    && rm google-chrome-stable_current_amd64.deb

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY *.js package* template.tex .

RUN npm ci

CMD ["/bin/bash"]

