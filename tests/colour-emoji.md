# Colour emoji

Emoji come from the Noto Color Emoji font via luaotfload's fallback, so these
must render without any "Missing character" warning from lualatex.

Plain checkmark: ✅

- rocket 🚀
- keycap 1️⃣
- ZWJ sequence 👨‍👩‍👧
- regional-indicator flag 🇮🇳
- copyright ©
- variation selector ⚠️

The last four are the cases the old SVG-download filter could never resolve:
noto keeps regional-indicator pairs outside `svg/`, and twemoji joins codepoints
with `-` where noto's filenames use `_`, so flags and ZWJ sequences 404'd.

Body text either side of an inline ✅ so baseline alignment stays visible.
