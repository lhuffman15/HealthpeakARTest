# Portside availability embed (test)

- `index.html`: mock Portside property page showing the embed in an iframe, plus the WordPress snippet.
- `embed.html?property=portside`: the embed. Site plan view by default; the 3D & AR tab loads only when opened. Add `#3d` to open straight to 3D (the desktop QR does this).
- `ar.html`: the earlier 3D-only page, kept for comparison.
- `siteplans/portside.svg`: site plan from Illustrator. Any layer whose id ends in `ON` (e.g. `_1140ON`) is a building highlight. It shows only when that building has available floors in the data.
- `data/availability.json`: **sample data**, shaped like the planned WordPress REST output. `svg_layer_id` links a building to its ON layer, `model_id` to the 3D model. Set a floor's `status` to `"Leased"` to see it drop out.
- `models/`: 3D model grouped by building and floor, iPhone AR file, label positions.
- `plans/`: floor plan PNGs go here; fill `floor_plan_image` in the data. Until then the popup shows the PDF where the browser can.
