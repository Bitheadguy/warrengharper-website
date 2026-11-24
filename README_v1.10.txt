WARRENGHARPER.COM — COMPLETE WEBSITE FILES — VERSION 1.10

This package contains the complete website pages and assets from the supplied
latest website archive, with the latest homepage intro changes included.

INSTALLATION
1. Back up the current website files.
2. Upload the contents of this folder to the website root.
3. Preserve the assets/ and assets/audio/ folders.
4. Replace the existing website files when prompted.
5. Force-refresh the browser to clear cached CSS and JavaScript.

LATEST INTRO CHANGES
- Increased per-character typing sound level.
- Extended the crosshair flash to 5 seconds.
- Delayed the terminal-to-code scene transition until after the full crosshair
  display, so the terminal scene remains visible throughout the flash.

The website pages, scripts, styles, and assets are included in this package.

INTRO REVISION (Nov 24, 2026)
- Fixed a timing bug that brought Wormy in on top of the crosshair and started
  The Code Redeemer sound during Wormy. The three parts now play strictly in order.
- Each part has its own sound, and every new sound stops the previous one:
  The Code Redeemer: terminal (typing) -> glitch hit at "I A" -> code (crosshair and cover)
  Worm Jokes: wormy.  Discoveries: insights.
- Typing clicks are louder, play on iPhone even with the ringer switch on silent
  (Safari 16.4+), and the slow "I A" keys have a heavier click.
- The crosshair is redrawn to match the glint on the book cover and is placed
  exactly where the cover's glint appears. It holds about 6 seconds, then the
  cover fades in around it and the crosshair melts into the cover's own glint,
  with no black gap before Wormy.
- The LUCI whisper Easter egg waits until the intro has finished.
- All intro timings can be adjusted in the "Timing" block at the top of script.js.
