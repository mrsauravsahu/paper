// Original Source: https://github.com/masbicudo/Pandoc-Emojis-Filter
// Modified by: Saurav Sahu <mrsauravsahu@outlook.com>

const fs = require('fs')
const https = require('https')
const twemoji = require('twemoji')

source = "noto-emoji"
// source = "twemoji"
size = 16

function imageSourceGenerator(icon, options) {
  if (source == "noto-emoji") {
    src = "https://raw.githubusercontent.com/googlefonts/noto-emoji/master/svg/emoji_u"+icon+options.ext
    dirname = "noto-emoji"
  }
  else if (source == "twemoji") {
    src = ''.concat(
      options.base, // by default Twitter Inc. CDN
      // options.size, // by default "72x72" string
      `${size}x${size}`,
      '/',
      icon,         // the found emoji as code point
      options.ext   // by default ".png"
    )
    dirname = "twemoji"
  }
  filename = ''.concat(
    "./",
    dirname, // by default "72x72" string
    '/',
    icon,         // the found emoji as code point
    options.ext   // by default ".png"
  )
  if (!fs.existsSync(dirname))
    fs.mkdirSync(dirname)
  if (!fs.existsSync(filename)) {
    const file = fs.createWriteStream(filename)
    const request = https.get(src, function (response) {
      response.pipe(file)
      file.on('finish', () => {
        file.close();  // close() is async, call cb after close completes.
      })
    })
  }
  return filename
}

async function main() {
  if (process.argv.length < 3) {
    process.exit(0)
  }
  const input = process.argv[2]
  const outputFile = process.argv.length >= 4 ? process.argv[3] : input.replace('.md','.out.md')
  fs.readFile(input, 'utf8', function (err, data) {
    if (err) throw err
    text = twemoji.parse(data, {
      callback: imageSourceGenerator,
      ext: '.svg',
      folder: 'svg'
    })
    text = text.replace(/\<img class="emoji" draggable="false" alt="[^"]+" src="([^"]+)"\/>/g, `![]($1){width=${size}px height=${size}px}`)
    fs.writeFileSync(outputFile, text)
  })
}

main()
