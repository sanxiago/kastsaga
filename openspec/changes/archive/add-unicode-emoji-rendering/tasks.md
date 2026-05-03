# Tasks — add-unicode-emoji-rendering

- [x] Update `world-rendering` spec to allow Unicode/emoji glyphs, keeping determinism and no-leakage requirements.
- [x] Add alignment requirement for Unicode grapheme clusters (width handling, padding) with scenario.
- [x] Update `world-state` spec render metadata to allow Unicode glyphs and optional display-width hints; include scenario.
- [x] Validate change with `openspec validate add-unicode-emoji-rendering --strict`.
- [x] Review against Constitution (P2, P5, P6, P9) to ensure no info leakage or non-determinism is introduced.
