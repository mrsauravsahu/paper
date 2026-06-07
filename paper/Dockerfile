FROM ms609/pandoc:latest

RUN apt-get update -y
RUN apt-get install -y nodejs npm librsvg2-bin inkscape

WORKDIR /app

COPY *.js package* template.tex .

RUN npm ci

CMD ["/bin/bash"]

