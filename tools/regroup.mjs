// Regroup the AR model by building and floor so the page can colour and pick them.
// Each building becomes one node named by address; each floor/roof piece gets its own
// material named "<Building>|L1", "<Building>|L2", ... "<Building>|Roof".
// Usage: node regroup.mjs <in.glb> <out.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds, prune } from '@gltf-transform/functions';

const [, , inPath, outPath] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inPath);
let top = doc.getRoot().listScenes()[0].listChildren()[0];
while (top.listChildren().length === 1) top = top.listChildren()[0];

// Loose top-level pieces → building, by the footprint matched against the leasing site plan.
// 1170 and 1180 share their floor slabs in the Spline file, so those slabs go to a shared group.
const LOOSE = {
  0: '1100 Veterans', 20: '1100 Veterans', 21: '1100 Veterans', 22: '1100 Veterans', 23: '1100 Veterans', 25: '1100 Veterans', 26: '1100 Veterans',
  6: '1170 Veterans', 7: '1170 Veterans',
  1: '1180 Veterans', 2: '1180 Veterans', 8: '1180 Veterans',
  3: '1170-1180 Veterans', 4: '1170-1180 Veterans', 5: '1170-1180 Veterans',
  9: '1130 Veterans', 10: '1130 Veterans', 11: '1130 Veterans', 12: '1130 Veterans', 13: '1130 Veterans', 14: '1130 Veterans',
  15: '1150 Veterans', 16: '1150 Veterans', 17: '1150 Veterans', 18: '1150 Veterans', 19: '1150 Veterans',
  29: 'Parking Structure', 30: 'Parking Structure',
};
const RENAME = { '1120 Veterans': '1120 Veterans', '1140 Veterans': '1140 Veterans', '329 Oyster': '329 Oyster Point', '331 Oyster': '331 Oyster Point', '333 Oyster': '333 Oyster Point' };
const DROP = new Set([24, 31, 35 /* site plan handled separately */]);

// Height bands (metres at desk scale): ground sits at 0.018.
function level(node, building) {
  const b = getBounds(node); const y = b.min[1];
  const oyster = building.includes('Oyster');
  if (y < 0.0215) return 'L1';
  if (y < 0.027) return 'L2';
  if (y < 0.0325) return 'L3';
  if (oyster && y < 0.0385) return 'L4';
  return 'Roof';
}

const base = doc.getRoot().listMaterials().find((m) => m.getName() === 'Building');
const mats = new Map();
function materialFor(key) {
  if (!mats.has(key)) mats.set(key, base.clone().setName(key));
  return mats.get(key);
}
function tag(node, building) {
  const lv = level(node, building);
  node.setName(`${building} / ${lv}`);
  const mesh = node.getMesh();
  if (mesh) {
    // Fresh mesh + primitives: dedup shares them between identical pieces on different floors.
    const m = doc.createMesh(`${building} / ${lv}`);
    mesh.listPrimitives().forEach((p) => {
      const q = p.clone();
      if (q.getMaterial() === base) q.setMaterial(materialFor(`${building}|${lv}`));
      m.addPrimitive(q);
    });
    node.setMesh(m);
  }
  node.listChildren().forEach((c) => tag(c, building));
}

const groups = new Map();
const kids = top.listChildren();
kids.forEach((n, i) => {
  if (RENAME[n.getName()]) {
    const name = RENAME[n.getName()]; n.setName(name);
    n.listChildren().forEach((c) => {
      const b = getBounds(c);
      if (b.max[0] - b.min[0] < 1e-4) { c.dispose(); return; } // zero-width leftover
      tag(c, name);
    });
    return;
  }
  if (n.getName() === 'Rectangle') { n.setName('Site Plan'); return; }
  if (DROP.has(i)) { n.dispose(); return; }
  const name = LOOSE[i];
  if (!name) { console.warn('unassigned', i, n.getName()); return; }
  if (!groups.has(name)) { const g = doc.createNode(name); top.addChild(g); groups.set(name, g); }
  top.removeChild(n); groups.get(name).addChild(n);
  if (name === 'Parking Structure') n.setName('Parking Structure'); else tag(n, name);
});

await doc.transform(prune());
await io.write(outPath, doc);
// Label anchor for each building (top centre, model coordinates) for the page's hotspots.
const anchors = {};
for (const n of top.listChildren()) {
  if (n.getName() === 'Site Plan' || n.getName() === 'Parking Structure' || n.getName().includes('-')) continue;
  const b = getBounds(n);
  anchors[n.getName()] = [(b.min[0] + b.max[0]) / 2, b.max[1] + 0.004, (b.min[2] + b.max[2]) / 2].map((v) => +v.toFixed(4));
}
const fs = await import('node:fs');
fs.writeFileSync(outPath.replace(/\.glb$/, '-anchors.json'), JSON.stringify(anchors, null, 1));
console.log('buildings:', top.listChildren().map((n) => n.getName()).join(', '));
console.log('materials:', [...mats.keys()].join(', '));
