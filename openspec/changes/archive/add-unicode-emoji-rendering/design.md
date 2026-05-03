# Design — Unicode/Emoji Rendering

- **Rendering model:** Keep the same grid/legend pipeline but allow glyphs to be Unicode grapheme clusters (including emoji). Renderer remains deterministic on the observation input.
- **Alignment:** Renderer must treat glyphs/emotes as grapheme clusters, measuring display width (e.g., using Unicode East Asian Width/emoji width rules) and pad/truncate so grid alignment is stable. Legends mirror exactly the glyphs used in the viewport.
- **World-state metadata:** Observations may include Unicode glyphs; optionally include a `displayWidth` hint per glyph/emote to assist renderers. Render metadata remains non-authoritative.
- **Fallbacks:** ASCII glyphs remain valid; engines may provide fallback glyphs when environment lacks emoji support, but the spec change only requires Unicode-safe handling and deterministic output given the observation and width rules in use.
- **Determinism and no-leakage:** Same observation + width rules ⇒ same output; no new data is exposed by using Unicode.
