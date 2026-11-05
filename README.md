# Portside AR test

Test site for the Healthpeak Portside "View in your space" AR pilot.

- `index.html` — the page. Buildings with space are gold; tap one (or its label, or its row) for floors, RSF and floor plan PDFs.
- `data/availability.json` — **sample data** from the Portside page, shaped like the planned WordPress REST output. Edit it to test: set a floor's `status` to `"Leased"` and that floor turns back to white.
- `models/portside-campus.glb` — campus model, grouped by building and floor (`1140 Veterans|L2` etc.).
- `models/portside-campus-anchors.json` — where each building's label sits.
- `tools/regroup.mjs` — rebuilds the grouped model from a new Spline export.

Inside Android AR (Chrome), tapping a gold label or gold floor opens a floor plan card. It shows the plan image from `floor_plan_image` in the data (PNG/JPG in `plans/`) and an Open PDF button.

On iPhone, AR uses `models/portside-campus.usdz`, made with the gold colours from the sample data. Re-export it when the data changes (the WordPress version will do this differently).

In iPhone AR, a "See floor plans" banner at the bottom brings people back to the page with the availability list open.
