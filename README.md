# Portside AR test

Test site for the Healthpeak Portside "View in your space" AR pilot.

- `index.html` — the page. Buildings with space are gold; tap one (or its label, or its row) for floors, RSF and floor plan PDFs.
- `data/availability.json` — **sample data** from the Portside page, shaped like the planned WordPress REST output. Edit it to test: set a floor's `status` to `"Leased"` and that floor turns back to white.
- `models/portside-campus.glb` — campus model, grouped by building and floor (`1140 Veterans|L2` etc.).
- `models/portside-campus-anchors.json` — where each building's label sits.
- `tools/regroup.mjs` — rebuilds the grouped model from a new Spline export.

On iPhone, the AR model is generated from the page with the gold colours applied.
