"""Courtroom scene -> JSON of simple primitives (boxes / cylinders / spheres).
+y up, the room runs along -z (entrance doors at z=+10, judge's bench at z=-50). Units ~ metres."""
import json, math, sys

P = []   # primitives
def box(p, s, c, m="wood", ry=0.0):
    P.append(dict(t="box", p=[round(v, 3) for v in p], s=[round(v, 3) for v in s], c=c, m=m, **({"ry": ry} if ry else {})))
def cyl(p, r, h, c, m="wood", rx=0.0, rz=0.0):
    d = dict(t="cyl", p=[round(v, 3) for v in p], r=r, h=h, c=c, m=m)
    if rx: d["rx"] = rx
    if rz: d["rz"] = rz
    P.append(d)
def sph(p, r, c, m="gold"):
    P.append(dict(t="sph", p=[round(v, 3) for v in p], r=r, c=c, m=m))

WALNUT, WALNUT_D, WALNUT_L = "#4b2e1a", "#2f1b0d", "#6b4426"
WALL, CEIL, CREAM, GOLD, NAVY = "#1a3a66", "#0d1d38", "#d9cfae", "#c9a227", "#16315a"
GLOW = "#ffe3a6"
Z_FRONT, Z_BACK = 10.0, -58.0
X = 11.0

# ---------------------------------------------------------------- shell
box((0, 5.75, -23.7), (22, 11.5, 68.6), CEIL, "plaster")          # (hidden) volume reference – replaced below
P.pop()
box((0, 11.5, -23.7), (26, 1.0, 68.6), CEIL, "plaster")             # ceiling
for sx in (-1, 1):
    box((sx * 11.6, 5.75, -23.7), (1.2, 11.5, 68.6), WALL, "plaster")  # side walls
box((0, 5.75, Z_BACK - 0.5), (24, 11.5, 1.0), WALL, "plaster")      # judge wall
# entrance wall with a 5m door opening
box((-8.25, 5.75, Z_FRONT + 0.3), (11.5 + 5.5, 11.5, 0.6), WALL, "plaster")  # x -16..-2.5
P.pop()
box((-9.25, 5.75, Z_FRONT + 0.3), (13.5, 11.5, 0.6), WALL, "plaster")   # x -16..-2.5
box((9.25, 5.75, Z_FRONT + 0.3), (13.5, 11.5, 0.6), WALL, "plaster")
box((0, 9.8, Z_FRONT + 0.3), (5.0, 3.4, 0.6), WALL, "plaster")         # lintel (y 8.1..11.5)
box((0, 8.2, Z_FRONT + 0.1), (5.6, 0.25, 1.0), GOLD, "gold")           # gold architrave
for sx in (-1, 1):
    box((sx * 2.65, 4.1, Z_FRONT + 0.05), (0.4, 8.2, 0.9), WALNUT_L, "wood")  # door jambs

# ---------------------------------------------------------------- wainscot, pilasters, windows
for sx in (-1, 1):
    box((sx * 10.85, 1.6, -23.7), (0.3, 3.2, 68.6), WALNUT_D, "wood")
    box((sx * 10.78, 3.3, -23.7), (0.2, 0.12, 68.6), GOLD, "gold")
    zs = [6 - 8 * k for k in range(9)]            # pilaster centres
    for z in zs:
        box((sx * 10.7, 5.35, z), (0.6, 10.7, 1.0), CREAM, "plaster")
        box((sx * 10.62, 10.6, z), (0.85, 0.35, 1.5), GOLD, "gold")       # capital
        box((sx * 10.62, 0.3, z), (0.85, 0.6, 1.4), WALNUT, "wood")       # base
    for k in range(8):
        zc = 2 - 8 * k
        if zc < -50: continue
        box((sx * 10.9, 1.7, zc), (0.1, 2.2, 5.6), WALNUT_L, "wood")       # raised wainscot panel
        if zc > -48:
            # tall window
            box((sx * 10.95, 7.0, zc), (0.1, 4.4, 3.6), GLOW, "glow")
            for dz in (-1.85, 1.85): box((sx * 10.85, 7.0, zc + dz), (0.25, 4.8, 0.2), GOLD, "gold")
            for dy in (-2.3, 2.3): box((sx * 10.85, 7.0 + dy, zc), (0.25, 0.2, 3.9), GOLD, "gold")
            box((sx * 10.85, 7.0, zc), (0.25, 4.4, 0.1), GOLD, "gold")
            box((sx * 10.85, 7.0, zc), (0.25, 0.1, 3.6), GOLD, "gold")

# ---------------------------------------------------------------- ceiling beams + chandeliers
for k in range(0, 17):
    z = 8 - 4 * k
    box((0, 10.7, z), (22, 0.55, 0.6), WALNUT_D, "wood")
for sx in (-1, 1):
    box((sx * 5.5, 10.7, -23.7), (0.7, 0.55, 68.6), WALNUT_D, "wood")
lights = []
for zc in (2, -18, -38):
    cyl((0, 10.0, zc), 0.03, 2.0, GOLD, "gold")
    cyl((0, 8.6, zc), 1.7, 0.12, GOLD, "gold")
    cyl((0, 9.0, zc), 0.95, 0.1, GOLD, "gold")
    for i in range(10):
        a = i * math.tau / 10
        sph((1.7 * math.cos(a), 8.8, zc + 1.7 * math.sin(a)), 0.14, GLOW, "glow")
    sph((0, 8.35, zc), 0.3, GLOW, "glow")
    lights.append(dict(p=[0, 8.0, zc], i=110, c="#ffd9a0"))

# ---------------------------------------------------------------- carpet runner
box((0, 0.012, -24), (3.4, 0.024, 68), NAVY, "fabric")
for sx in (-1, 1):
    box((sx * 1.55, 0.02, -24), (0.14, 0.03, 68), GOLD, "gold")

# ---------------------------------------------------------------- gallery pews
for zr in (-2, -5.5, -9, -12.5, -16, -19.5):
    for sx in (-1, 1):
        xc = sx * 6.5
        box((xc, 0.28, zr), (6.6, 0.56, 0.95), WALNUT_D, "wood")                 # base
        box((xc, 0.6, zr), (6.6, 0.1, 1.0), "#1a3a66", "fabric")                   # cushion
        box((xc, 1.25, zr + 0.52), (6.6, 1.5, 0.14), WALNUT, "wood")               # back
        box((xc, 2.05, zr + 0.52), (6.6, 0.12, 0.2), WALNUT_L, "wood")             # top rail
        for ex in (-3.3, 3.3):
            box((xc + ex, 0.9, zr + 0.1), (0.14, 1.8, 1.3), WALNUT_L, "wood")      # end panel

# ---------------------------------------------------------------- the bar (railing + gate)
for sx in (-1, 1):
    xc = sx * 6.4
    box((xc, 1.18, -24.5), (9.0, 0.12, 0.34), WALNUT_L, "wood")
    box((xc, 0.2, -24.5), (9.0, 0.3, 0.34), WALNUT, "wood")
    for i in range(16):
        cyl((sx * (2.1 + i * 0.58), 0.7, -24.5), 0.05, 0.9, WALNUT_D, "wood")
for sx in (-1, 1):
    cyl((sx * 1.9, 0.75, -24.5), 0.12, 1.5, WALNUT_L, "wood")
    sph((sx * 1.9, 1.6, -24.5), 0.16, GOLD, "gold")

# ---------------------------------------------------------------- the well: counsel tables, lectern
for sx in (-1, 1):
    tx = sx * 4.0
    box((tx, 0.43, -33), (4.2, 0.86, 1.3), WALNUT_D, "wood")
    box((tx, 0.92, -33), (4.5, 0.12, 1.6), WALNUT_L, "wood")
    box((tx, 0.97, -33), (4.0, 0.02, 1.2), "#1a3a66", "fabric")
    for dx in (-1.3, 0, 1.3):
        cx = tx + dx
        box((cx, 0.5, -31.6), (0.8, 0.1, 0.8), "#1a3a66", "fabric")
        box((cx, 0.25, -31.6), (0.6, 0.5, 0.6), WALNUT_D, "wood")
        box((cx, 1.0, -31.15), (0.8, 1.0, 0.1), WALNUT, "wood")
box((0, 0.7, -39.5), (1.0, 1.4, 0.7), WALNUT, "wood")
box((0, 1.45, -39.6), (1.3, 0.12, 0.9), GOLD, "gold")

# witness stand (left), jury box (right), clerk's desk
box((-8.0, 0.7, -43.5), (2.6, 1.4, 2.2), WALNUT, "wood")
box((-8.0, 1.45, -43.5), (2.8, 0.1, 2.4), WALNUT_L, "wood")
box((-8.0, 1.15, -42.3), (2.6, 0.9, 0.12), WALNUT_L, "wood")
box((-3.6, 0.65, -46.5), (3.4, 1.3, 1.4), WALNUT, "wood")
box((-3.6, 1.35, -46.5), (3.7, 0.12, 1.7), WALNUT_L, "wood")
box((8.2, 0.2, -40), (5.6, 0.4, 9.4), WALNUT_D, "wood")                      # jury dais
box((5.5, 0.95, -40), (0.2, 1.1, 9.4), WALNUT, "wood")                       # box wall
box((5.5, 1.55, -40), (0.35, 0.12, 9.6), WALNUT_L, "wood")
for row, xr, yb in ((0, 7.2, 0.4), (1, 9.4, 0.85)):
    if row == 1: box((9.4, 0.62, -40), (2.2, 0.45, 9.0), WALNUT_D, "wood")
    for i in range(6):
        zc = -43.4 + i * 1.4
        box((xr, yb + 0.5, zc), (0.9, 0.12, 0.9), "#1a3a66", "fabric")
        box((xr + 0.5, yb + 1.1, zc), (0.12, 1.1, 0.9), WALNUT, "wood")

# ---------------------------------------------------------------- the judge's bench
box((0, 0.25, -51), (19, 0.5, 8.4), WALNUT_D, "wood")
box((0, 0.75, -51.5), (16.5, 0.5, 6.6), WALNUT, "wood")
box((0, 2.35, -50.3), (12.5, 2.7, 2.0), WALNUT, "wood")                      # bench body
for i in range(5):
    box((-4.8 + i * 2.4, 2.35, -49.25), (1.9, 2.0, 0.08), WALNUT_L, "wood")  # raised panels
box((0, 3.75, -50.2), (13.0, 0.18, 2.5), WALNUT_L, "wood")                   # top
box((0, 3.62, -49.0), (13.2, 0.1, 0.12), GOLD, "gold")
box((0, 1.05, -49.2), (12.6, 0.1, 0.3), GOLD, "gold")
# judge's chair
box((0, 2.0, -52.6), (2.0, 0.3, 1.6), "#16315a", "fabric")
box((0, 3.9, -53.3), (2.2, 3.8, 0.4), "#16315a", "fabric")
box((0, 6.0, -53.3), (2.5, 0.35, 0.55), GOLD, "gold")
for sx in (-1, 1):
    box((sx * 1.15, 2.7, -52.6), (0.14, 0.9, 1.5), WALNUT, "wood")
# wall behind the bench: panelling + emblem
box((0, 3.4, -57.6), (22, 6.8, 0.4), WALNUT, "wood")
for i in range(7):
    box((-9 + i * 3.0, 3.4, -57.35), (2.4, 5.6, 0.1), WALNUT_L, "wood")
box((0, 6.9, -57.45), (22, 0.18, 0.5), GOLD, "gold")
cyl((0, 8.9, -57.5), 2.1, 0.2, GOLD, "gold", rx=math.pi / 2)
cyl((0, 8.9, -57.38), 1.75, 0.2, "#16315a", "fabric", rx=math.pi / 2)
box((0, 8.7, -57.2), (0.14, 2.4, 0.12), GOLD, "gold")
box((0, 9.85, -57.2), (2.8, 0.12, 0.12), GOLD, "gold")
for sx in (-1, 1):
    cyl((sx * 1.4, 8.85, -57.2), 0.5, 0.06, GOLD, "gold", rx=math.pi / 2)
    for dx in (-0.4, 0.4):
        box((sx * 1.4 + dx * 0.0, 9.35, -57.2), (0.02, 0.9, 0.02), GOLD, "gold")
lights.append(dict(p=[0, 7.5, -53], i=90, c="#ffe2a8"))

json.dump(dict(prims=P, lights=lights), open(sys.argv[1] if len(sys.argv) > 1 else "courtroom.json", "w"), separators=(",", ":"))
print("prims", len(P), "lights", len(lights))
