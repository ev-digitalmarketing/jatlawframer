import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ------------------------------------------------------------------------------------------------
   Lady Justice, sculpted in code.

   Everything is built from a few surface "lofts" (the draped gown, the head, the limbs) and simple
   primitives (scales, sword, plinth). Vertex colours carry a baked cavity shade, so the recesses
   between folds read darker, like patinated cast bronze.

   Conventions: y is up, the figure faces +z, her raised hand (holding the scales) is on -x, which is
   the viewer's left. The model is roughly 2 units tall and stands on y = -1.
------------------------------------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const bell = (x: number, w: number) => Math.exp(-(x * x) / (w * w));
const wrap = (d: number) => { d = (d + Math.PI) % TAU; if (d < 0) d += TAU; return d - Math.PI; };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Smooth curve through (x, value) keys: cubic Hermite with Catmull-Rom tangents. */
function curve(keys: [number, number][]) {
  const n = keys.length;
  const m = keys.map((_, i) => {
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    return b[0] === a[0] ? 0 : (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (x: number) => {
    if (x <= keys[0][0]) return keys[0][1];
    if (x >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0;
    while (x > keys[i + 1][0]) i++;
    const [x0, y0] = keys[i], [x1, y1] = keys[i + 1];
    const h = x1 - x0, t = (x - x0) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m[i + 1];
  };
}

/* ---------- geometry helpers ---------- */

type Sample = { p: THREE.Vector3; shade: number };

/**
 * A closed-around, open-ended surface. v runs 0 to 1 along the length, u runs 0 to 1 around.
 * Outward normals are (dP/du x dP/dv), so callers must wind their parametrisation accordingly.
 */
function loft(rings: number, segs: number, f: (v: number, u: number, out: Sample) => void): THREE.BufferGeometry {
  const cols = segs + 1;
  const n = (rings + 1) * cols;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  const s: Sample = { p: new THREE.Vector3(), shade: 1 };
  for (let j = 0; j <= rings; j++) {
    for (let i = 0; i <= segs; i++) {
      const v = j / rings, u = (i % segs) / segs;
      s.shade = 1;
      f(v, u, s);
      const k = j * cols + i;
      pos[k * 3] = s.p.x; pos[k * 3 + 1] = s.p.y; pos[k * 3 + 2] = s.p.z;
      col[k * 3] = col[k * 3 + 1] = col[k * 3 + 2] = clamp(s.shade);
      uv[k * 2] = i / segs; uv[k * 2 + 1] = v;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < segs; i++) {
      const a = j * cols + i, b = a + 1, c = a + cols, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // the seam column is a duplicate: average its normals so there is no visible crease
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  for (let j = 0; j <= rings; j++) {
    const a = j * cols, b = j * cols + segs;
    const nx = nrm.getX(a) + nrm.getX(b), ny = nrm.getY(a) + nrm.getY(b), nz = nrm.getZ(a) + nrm.getZ(b);
    const l = Math.hypot(nx, ny, nz) || 1;
    nrm.setXYZ(a, nx / l, ny / l, nz / l); nrm.setXYZ(b, nx / l, ny / l, nz / l);
  }
  return g;
}

/** Tube along a smooth path with a radius profile (t = 0..1) and optional surface ripple. */
function tube(
  pts: THREE.Vector3[], radius: (t: number) => number, opts: { rings?: number; segs?: number; ripple?: (t: number, a: number) => number; shade?: (t: number, a: number) => number } = {},
): THREE.BufferGeometry {
  const rings = opts.rings ?? 40, segs = opts.segs ?? 20;
  const path = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const fr = path.computeFrenetFrames(rings, false);
  return loft(rings, segs, (v, u, out) => {
    const j = Math.round(v * rings);
    const a = u * TAU;
    const r = radius(v) + (opts.ripple ? opts.ripple(v, a) : 0);
    const c = path.getPoint(v);
    out.p.copy(c).addScaledVector(fr.normals[j], Math.cos(a) * r).addScaledVector(fr.binormals[j], Math.sin(a) * r);
    out.shade = opts.shade ? opts.shade(v, a) : 1;
  });
}

function ellipsoid(c: THREE.Vector3, r: THREE.Vector3, rot?: THREE.Euler, detail = 24): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, detail, Math.max(8, Math.round(detail * 0.66)));
  const q = new THREE.Quaternion().setFromEuler(rot ?? new THREE.Euler());
  g.applyMatrix4(new THREE.Matrix4().compose(c, q, r));
  return g;
}

/** Thin cylinder between two points. */
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, r2 = r, radial = 10): THREE.BufferGeometry {
  const d = b.clone().sub(a), len = d.length();
  const g = new THREE.CylinderGeometry(r2, r, len, radial, 1);
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, V(1, 1, 1)));
  return g;
}

/** Make a geometry mergeable: same attribute set as everything else, with a flat shade colour if none. */
function prep(g: THREE.BufferGeometry, shade = 1): THREE.BufferGeometry {
  if (!g.attributes.color) {
    const n = g.attributes.position.count, c = new Float32Array(n * 3).fill(shade);
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  }
  for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv", "color"].includes(k)) g.deleteAttribute(k);
  return g;
}

/* ---------- the gown: one continuous lofted shell from hem to neckline ---------- */

const Y_HEM = -0.88; // top of the plinth
const Y_TOP = 0.625; // neckline

const halfWidth = curve([[-0.89, 0.290], [-0.80, 0.252], [-0.62, 0.214], [-0.40, 0.192], [-0.20, 0.190], [-0.06, 0.196], [0.05, 0.172], [0.14, 0.130], [0.21, 0.108], [0.29, 0.118], [0.37, 0.136], [0.45, 0.160], [0.51, 0.198], [0.54, 0.172], [0.565, 0.128], [0.59, 0.084], [0.608, 0.062], [0.625, 0.047]]);
const halfDepth = curve([[-0.89, 0.236], [-0.80, 0.210], [-0.62, 0.178], [-0.40, 0.160], [-0.20, 0.152], [-0.06, 0.152], [0.05, 0.132], [0.14, 0.098], [0.21, 0.086], [0.29, 0.098], [0.37, 0.116], [0.45, 0.112], [0.51, 0.094], [0.54, 0.086], [0.565, 0.078], [0.59, 0.066], [0.608, 0.056], [0.625, 0.046]]);
const shiftX = curve([[-0.89, 0.00], [-0.40, 0.018], [-0.06, 0.034], [0.20, 0.000], [0.50, -0.022], [0.625, -0.010]]);
const shiftZ = curve([[-0.89, 0.00], [-0.06, 0.012], [0.24, -0.004], [0.50, -0.014], [0.625, 0.006]]);
const tilt = curve([[-0.89, 0.0], [-0.40, 0.04], [-0.06, 0.16], [0.20, 0.02], [0.50, -0.20], [0.625, -0.04]]);

// the free (bent) leg, seen through the cloth on the viewer's left
const legBulge = curve([[-0.90, 0.0], [-0.74, 0.008], [-0.58, 0.04], [-0.42, 0.088], [-0.26, 0.066], [-0.10, 0.032], [0.0, 0.0]]);
const legAngle = curve([[-0.90, -0.38], [-0.58, -0.52], [-0.42, -0.66], [-0.20, -0.46], [0.0, -0.30]]);

const crease = (x: number) => Math.abs(Math.sin(x)) - 0.6366; // sharp valleys, rounded crests, ~zero mean

function gown(v: number, u: number, out: Sample) {
  const y0 = mix(Y_HEM - 0.012, Y_TOP, v);
  const th = u * TAU - Math.PI; // th = 0 is the front, the seam sits at the back
  const s = clamp((0.05 - y0) / 0.93);      // 0 at the hips, 1 at the hem
  const drop = Math.pow(s, 1.1);
  const skirt = 1 - smooth(0.02, 0.2, y0);   // 1 on the skirt, 0 on the bodice

  // skirt drapery: a few deep folds that swirl with height, plus finer creases
  const env = 0.62 + 0.38 * Math.sin(2 * th + 1.3) + 0.1 * Math.sin(3 * th - 0.4);
  const swirl = 2.3 * s + 0.5 * Math.sin(4.5 * s + 2 * th); // 2 * th keeps it continuous across the back seam
  let f = 0.8 * crease(2 * th + 0.9 + swirl) + 0.4 * crease(4 * th + 2.1 - 1.2 * swirl) + 0.13 * crease(9 * th + 0.4 + 3.2 * s);
  f *= env;
  let d = skirt * (0.004 + 0.046 * drop) * f;

  // bodice: soft ruching radiating from the belt
  const ruche = crease(11 * th + 7 * y0 + 1.0) * (1 - skirt);
  d += 0.0035 * ruche * smooth(0.19, 0.24, y0) * (1 - smooth(0.42, 0.5, y0));

  // overfold hanging from the belt, with a defined lower lip
  const lip = smooth(0.03, 0.085, y0) * (1 - smooth(0.15, 0.2, y0));
  d += 0.013 * lip;

  // bent leg: thigh, knee and shin push the cloth forward, which stretches over them
  const dl = wrap(th - legAngle(y0));
  const leg = legBulge(y0) * bell(dl, 0.40);
  d += leg;
  d += 0.005 * Math.sin(15 * dl) * bell(dl, 0.75) * bell(y0 + 0.32, 0.27);
  // straight leg on the weight-bearing side, and the cleft where the two legs meet
  d += 0.018 * bell(wrap(th - 0.52), 0.40) * smooth(-0.85, -0.55, y0) * (1 - smooth(-0.15, 0.02, y0));
  d -= 0.016 * bell(wrap(th - 0.1), 0.11) * smooth(-0.84, -0.5, y0) * (1 - smooth(-0.16, -0.04, y0));
  // bust
  d += 0.028 * bell(wrap(Math.abs(th) - 0.6), 0.34) * bell(y0 - 0.37, 0.062);
  // the cloth sweeps out on the viewer's left at the hem
  d += 0.036 * bell(wrap(th + 1.35), 0.55) * Math.pow(s, 2.2);

  const a = halfWidth(y0) + d, b = halfDepth(y0) + d;
  const x = shiftX(y0) + a * Math.sin(th);
  const z = shiftZ(y0) + b * Math.cos(th);
  const y = y0 + tilt(y0) * (a * Math.sin(th));
  out.p.set(x, y, z);

  let cavity = 0.82 + skirt * (0.9 + 0.5 * drop) * f + 1.2 * (leg / 0.09) + 0.1 * ruche;
  cavity *= 1 - 0.32 * bell(y0 - 0.052, 0.012) * (1 - skirt * 0.0);
  out.shade = clamp(cavity, 0.26, 1) * mix(0.5, 1, smooth(Y_HEM, Y_HEM + 0.14, y0));
}

/* ---------- head ---------- */

const HEAD = V(0, 0.762, 0.018);

/** Skull in unit-sphere coordinates -> position, with face, hair and optional outward offset. */
function skull(x: number, y: number, z: number, out: THREE.Vector3, hair: boolean, push = 0): number {
  const az = Math.atan2(x, z), aaz = Math.abs(az);
  let X = x * 0.082, Y = y * 0.108, Z = z * 0.096;
  const low = smooth(0.1, -1.0, y);
  X *= 1 - 0.20 * low * low; Z *= 1 - 0.08 * low;
  if (z > 0) {
    Z += 0.008 * low * low;                                                  // chin
    Z += 0.022 * Math.exp(-((x / 0.12) ** 2 + ((y + 0.10) / 0.26) ** 2));    // nose
    Z += 0.008 * Math.exp(-((x / 0.34) ** 2 + ((y + 0.52) / 0.075) ** 2));    // lips
    Z += 0.005 * Math.exp(-((x / 0.60) ** 2 + ((y - 0.20) / 0.09) ** 2));    // brow
  }
  let shade = 1;
  if (hair) {
    const hairline = mix(0.52, -0.50, smooth(0.32 * Math.PI, 0.85 * Math.PI, aaz));
    const m = smooth(hairline - 0.04, hairline + 0.2, y);
    const strand = Math.abs(Math.sin(34 * az + 5 * y));
    const t = m * (0.009 + 0.0035 * strand);
    X += x * t; Y += y * t * 0.9; Z += z * t;
    shade = 1 - 0.4 * m * (1 - strand);
  }
  const l = Math.hypot(x, y, z) || 1;
  out.set(X + (x / l) * push, Y + (y / l) * push, Z + (z / l) * push);
  return shade;
}

function head(parts: THREE.BufferGeometry[]) {
  const g = new THREE.SphereGeometry(1, 120, 90);
  const P = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(P.count * 3);
  const o = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) {
    const sh = skull(P.getX(i), P.getY(i), P.getZ(i), o, true);
    P.setXYZ(i, o.x + HEAD.x, o.y + HEAD.y, o.z + HEAD.z);
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = sh;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  parts.push(prep(g));

  // blindfold: a band cut from the same sphere, lifted off the face
  const b = new THREE.SphereGeometry(1, 120, 8, 0, TAU, 1.43, 0.27);
  const BP = b.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < BP.count; i++) {
    skull(BP.getX(i), BP.getY(i), BP.getZ(i), o, false, 0.007);
    BP.setXYZ(i, o.x + HEAD.x, o.y + HEAD.y, o.z + HEAD.z);
  }
  b.computeVertexNormals();
  parts.push(prep(b, 0.92));
  // knot and the two tails that trail down the back
  parts.push(prep(ellipsoid(V(0, HEAD.y - 0.002, HEAD.z - 0.104), V(0.015, 0.013, 0.012))));
  parts.push(prep(tube([V(0.004, HEAD.y - 0.006, HEAD.z - 0.109), V(0.022, HEAD.y - 0.05, HEAD.z - 0.124), V(0.036, HEAD.y - 0.108, HEAD.z - 0.112)], (t) => 0.0085 * (1 - 0.7 * t), { rings: 14, segs: 8 })));
  parts.push(prep(tube([V(-0.004, HEAD.y - 0.006, HEAD.z - 0.109), V(-0.018, HEAD.y - 0.055, HEAD.z - 0.128), V(-0.032, HEAD.y - 0.122, HEAD.z - 0.12)], (t) => 0.0085 * (1 - 0.7 * t), { rings: 14, segs: 8 })));

  // chignon
  const bun = new THREE.SphereGeometry(1, 40, 28);
  const BN = bun.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < BN.count; i++) {
    const x = BN.getX(i), y = BN.getY(i), z = BN.getZ(i);
    const rr = 1 + 0.07 * Math.abs(Math.sin(9 * Math.atan2(x, z) + 5 * y));
    BN.setXYZ(i, HEAD.x + x * 0.042 * rr, HEAD.y + 0.056 + y * 0.040 * rr, HEAD.z - 0.09 + z * 0.036 * rr);
  }
  bun.computeVertexNormals();
  parts.push(prep(bun));

  // laurel wreath: pairs of leaves swept back from the brow
  const leaf = new THREE.Vector3(), nrm = new THREE.Vector3(), tan = new THREE.Vector3();
  const N = 22;
  for (let k = 0; k < N; k++) {
    const psi = (k / N) * TAU - Math.PI;
    const yU = mix(0.42, 0.64, 0.5 + 0.5 * Math.cos(psi));
    const rr = Math.sqrt(1 - yU * yU);
    skull(Math.sin(psi) * rr, yU, Math.cos(psi) * rr, leaf, true, 0.003);
    leaf.add(HEAD);
    nrm.set(Math.sin(psi) * rr * 0.9, yU, Math.cos(psi) * rr * 1.0).normalize();
    tan.set(Math.cos(psi), 0, -Math.sin(psi)).multiplyScalar(Math.sign(psi) || 1).normalize();
    for (const side of [-1, 1]) {
      const dir = tan.clone().applyAxisAngle(nrm, side * 0.62).addScaledVector(nrm, -0.12).normalize();
      const z = new THREE.Vector3().crossVectors(dir, nrm).normalize();
      const y = new THREE.Vector3().crossVectors(z, dir).normalize();
      const m = new THREE.Matrix4().makeBasis(dir, y, z).setPosition(leaf.clone().addScaledVector(nrm, 0.002).addScaledVector(dir, 0.012));
      const e = new THREE.SphereGeometry(1, 10, 6);
      e.applyMatrix4(m.multiply(new THREE.Matrix4().makeScale(0.016, 0.0035, 0.0065)));
      parts.push(prep(e, 1));
    }
  }
}

/* ---------- the figure ---------- */

export function buildLadyJustice(): THREE.Group {
  const bronze: THREE.BufferGeometry[] = [];
  const add = (g: THREE.BufferGeometry, shade = 1) => { bronze.push(prep(g, shade)); return g; };

  // gown, with a few extra primitives that complete the silhouette
  add(loft(260, 170, gown));
  // belt
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 40; i++) {
      const th = (i / 40) * TAU, y = 0.2;
      pts.push(V(shiftX(y) + (halfWidth(y) + 0.004) * Math.sin(th), y + tilt(y) * halfWidth(y) * Math.sin(th), shiftZ(y) + (halfDepth(y) + 0.004) * Math.cos(th)));
    }
    const path = new THREE.CatmullRomCurve3(pts, true);
    add(new THREE.TubeGeometry(path, 120, 0.0105, 10, true));
    add(ellipsoid(V(-0.03, 0.188, halfDepth(0.2) + 0.012), V(0.022, 0.02, 0.014)));
  }
  // neck and shoulders
  add(tube([V(0, 0.54, 0.004), V(0, 0.62, 0.012), V(0, 0.70, 0.018)], (t) => 0.045 + 0.016 * Math.pow(1 - t, 3) - 0.006 * t, { rings: 16, segs: 28 }));
  add(ellipsoid(V(-0.192, 0.512, 0.0), V(0.044, 0.042, 0.046)));
  add(ellipsoid(V(0.192, 0.488, 0.0), V(0.044, 0.042, 0.046)));

  // feet peeking out from the hem
  add(ellipsoid(V(-0.14, -0.872, 0.225), V(0.04, 0.016, 0.092), new THREE.Euler(0, 0.2, 0)), 0.62);

  head(bronze);

  // raised arm (viewer's left), bare, holding the scales aloft
  {
    const S = V(-0.19, 0.515, 0.0), E = V(-0.40, 0.565, 0.15), W = V(-0.37, 0.80, 0.165);
    add(tube([S, E, W], (t) => (t < 0.5 ? mix(0.037, 0.027, t / 0.5) + 0.004 * bell(t - 0.22, 0.14) : mix(0.027, 0.017, (t - 0.5) / 0.5) + 0.0035 * bell(t - 0.66, 0.1)), { rings: 60, segs: 20 }));
    add(ellipsoid(E, V(0.0268, 0.0268, 0.0268)));
    add(ellipsoid(V(-0.368, 0.838, 0.165), V(0.03, 0.037, 0.031)));      // fist
    add(ellipsoid(V(-0.34, 0.835, 0.185), V(0.012, 0.022, 0.012), new THREE.Euler(0.2, 0, 0.3))); // thumb
    // the scales
    const hx = -0.368, hz = 0.165, by = 0.968, half = 0.185;
    add(rod(V(hx, 0.80, hz), V(hx, by + 0.012, hz), 0.0075));
    add(ellipsoid(V(hx, by + 0.026, hz), V(0.012, 0.016, 0.012)));
    add(rod(V(hx - half, by, hz), V(hx + half, by, hz), 0.0065));
    for (const sx of [-1, 1]) {
      const ex = hx + sx * half, py = by - 0.30;
      add(ellipsoid(V(ex, by, hz), V(0.009, 0.009, 0.009)));
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU + 0.5;
        add(rod(V(ex, by - 0.004, hz), V(ex + Math.cos(a) * 0.07, py + 0.012, hz + Math.sin(a) * 0.07), 0.0028, 0.0028, 6));
      }
      const prof = [[0, -0.016], [0.022, -0.014], [0.046, -0.006], [0.066, 0.009], [0.073, 0.017], [0.076, 0.021], [0.072, 0.022], [0.067, 0.013], [0.046, -0.001], [0.022, -0.009], [0, -0.01]].map(([r, y]) => new THREE.Vector2(r, y));
      const pan = new THREE.LatheGeometry(prof, 44);
      pan.translate(ex, py, hz);
      add(pan);
      add(ellipsoid(V(ex, py - 0.02, hz), V(0.012, 0.012, 0.012)));
    }
  }

  // lowered arm (viewer's right): loose sleeve to the elbow, bare forearm, gripping the sword
  {
    const S = V(0.19, 0.49, 0.0), E = V(0.26, 0.215, 0.035), W = V(0.298, -0.035, 0.095);
    // bare upper arm under a short draped cap sleeve
    add(tube([S, V(0.232, 0.36, 0.02), E], (t) => mix(0.036, 0.027, t), { rings: 40, segs: 18 }));
    const crinkle = (t: number, a: number) => Math.abs(Math.sin(5 * a + 2.2 * t + 0.6)) - 0.64;
    add(tube([V(0.192, 0.53, 0.0), V(0.206, 0.46, 0.008), V(0.226, 0.372, 0.018)],
      (t) => (mix(0.05, 0.068, smooth(0, 1, t)) + 0.004 * Math.sin(t * 7)) * (t > 0.9 ? 1 - 0.3 * smooth(0.9, 1, t) : 1), {
      rings: 50, segs: 60,
      ripple: (t, a) => 0.011 * crinkle(t, a) * (0.25 + t),
      shade: (t, a) => 0.8 + 0.7 * crinkle(t, a) * (0.3 + t),
    }));
    add(tube([E, V(0.28, 0.12, 0.06), W], (t) => mix(0.027, 0.0185, t) + 0.003 * bell(t - 0.3, 0.2), { rings: 40, segs: 18 }));
    add(ellipsoid(E, V(0.0275, 0.0275, 0.0275)));
    add(ellipsoid(V(0.302, -0.066, 0.097), V(0.03, 0.036, 0.03)));       // fist
    // sword, point down, resting on the plinth
    const gx = 0.301, gz = 0.097;
    add(ellipsoid(V(gx, 0.034, gz), V(0.017, 0.017, 0.017)));            // pommel
    add(rod(V(gx, 0.03, gz), V(gx + 0.002, -0.15, gz), 0.0095));         // grip
    add(rod(V(gx - 0.075, -0.158, gz), V(gx + 0.075, -0.158, gz), 0.0085));
    add(ellipsoid(V(gx - 0.078, -0.158, gz), V(0.013, 0.013, 0.013)));
    add(ellipsoid(V(gx + 0.078, -0.158, gz), V(0.013, 0.013, 0.013)));
    const top = V(gx + 0.002, -0.16, gz), tip = V(0.345, Y_HEM + 0.004, 0.082);
    const dir = tip.clone().sub(top), len = dir.length(); dir.normalize();
    const side = V(1, 0, 0).addScaledVector(dir, -dir.x).normalize();
    const thick = new THREE.Vector3().crossVectors(dir, side).normalize();
    add(loft(60, 12, (v, u, out) => {
      const w = (0.026 - 0.004 * v) * (v > 0.9 ? Math.max(0, (1 - v) / 0.1) : 1);
      const t = 0.0075 * (v > 0.9 ? Math.max(0.1, (1 - v) / 0.1) : 1);
      const a = u * TAU;
      out.p.copy(top).addScaledVector(dir, len * v).addScaledVector(side, Math.cos(a) * w).addScaledVector(thick, Math.sin(a) * t);
      out.shade = 0.95;
    }));
  }

  const body = new THREE.Mesh(mergeGeometries(bronze, false)!);
  body.name = "bronze";

  // plinth
  const plinthGeo = [
    new RoundedBoxGeometry(1.0, 0.07, 0.74, 3, 0.014).translate(0, -0.965, 0),
    new RoundedBoxGeometry(0.86, 0.05, 0.62, 3, 0.012).translate(0, -0.905, 0),
  ];
  const plinth = new THREE.Mesh(mergeGeometries(plinthGeo, false)!);
  plinth.name = "plinth";

  const g = new THREE.Group();
  g.add(body, plinth);
  return g;
}
