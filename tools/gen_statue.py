"""Procedural Lady Justice statue -> mesh (numpy) -> GLB.
Units ~cm. +y up, figure faces +z, figure's right arm (scales) is on -x."""
import numpy as np, json, struct, sys
from scipy.interpolate import PchipInterpolator, CubicSpline

TAU = 2 * np.pi
LOD = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
def L(n): return max(6, int(n * LOD))

# ---------------------------------------------------------------- mesh utils
def vertex_normals(V, F):
    V = V.astype(np.float64)
    a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    fn = np.cross(b - a, c - a)
    N = np.zeros_like(V)
    for k in range(3):
        np.add.at(N, F[:, k], fn)
    ln = np.linalg.norm(N, axis=1, keepdims=True)
    ln[ln < 1e-12] = 1
    return N / ln

class Mesh:
    def __init__(self):
        self.V, self.N, self.F, self.n = [], [], [], 0
    def add(self, V, F, N=None, center=None, flip=False):
        V = np.asarray(V, np.float64).reshape(-1, 3); F = np.asarray(F, np.int64).reshape(-1, 3)
        if center is not None:  # make winding point away from center
            a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
            fn = np.cross(b - a, c - a); cen = (a + b + c) / 3
            if np.sum(np.einsum('ij,ij->i', fn, cen - np.asarray(center))) < 0: F = F[:, ::-1]
        if flip: F = F[:, ::-1]
        if N is None: N = vertex_normals(V, F)
        self.V.append(V.astype(np.float32)); self.N.append(np.asarray(N, np.float32))
        self.F.append((F + self.n).astype(np.uint32)); self.n += len(V)
    def grid(self, P, wrap=True, center=None, flip=False):
        nu, nv = P.shape[:2]
        idx = lambda i, j: i * nv + j
        F = []
        jr = range(nv) if wrap else range(nv - 1)
        for i in range(nu - 1):
            for j in jr:
                j2 = (j + 1) % nv
                F.append((idx(i, j), idx(i, j2), idx(i + 1, j2)))
                F.append((idx(i, j), idx(i + 1, j2), idx(i + 1, j)))
        self.add(P.reshape(-1, 3), np.array(F), center=center, flip=flip)
    def grid_fast(self, P, wrap=True, center=None, flip=False):
        nu, nv = P.shape[:2]
        I = np.arange(nu * nv).reshape(nu, nv)
        j2 = np.roll(I, -1, axis=1) if wrap else I[:, 1:]
        a = I[:-1, :] if wrap else I[:-1, :-1]
        b = j2[:-1, :]
        c = j2[1:, :]
        d = (I[1:, :] if wrap else I[1:, :-1])
        F = np.concatenate([np.stack([a.ravel(), b.ravel(), c.ravel()], 1), np.stack([a.ravel(), c.ravel(), d.ravel()], 1)])
        self.add(P.reshape(-1, 3), F, center=center, flip=flip)
    def flat_box(self, c, size, bevel=0.0):
        """axis aligned box with flat shading"""
        x, y, z = [s / 2 for s in size]
        V, N, F = [], [], []
        faces = [((1, 0, 0), [(x, -y, -z), (x, y, -z), (x, y, z), (x, -y, z)]),
                 ((-1, 0, 0), [(-x, -y, z), (-x, y, z), (-x, y, -z), (-x, -y, -z)]),
                 ((0, 1, 0), [(-x, y, -z), (-x, y, z), (x, y, z), (x, y, -z)]),
                 ((0, -1, 0), [(-x, -y, z), (-x, -y, -z), (x, -y, -z), (x, -y, z)]),
                 ((0, 0, 1), [(-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]),
                 ((0, 0, -1), [(x, -y, -z), (-x, -y, -z), (-x, y, -z), (x, y, -z)])]
        for n, vs in faces:
            b0 = len(V)
            V += [np.add(v, c) for v in vs]; N += [n] * 4
            F += [(b0, b0 + 1, b0 + 2), (b0, b0 + 2, b0 + 3)]
        self.add(np.array(V), np.array(F), N=np.array(N, float))
    def finish(self):
        return np.concatenate(self.V), np.concatenate(self.N), np.concatenate(self.F)

M = Mesh()

# ---------------------------------------------------------------- primitives
def ellipsoid(c, r, nu=24, nv=40, rotz=0.0, rotx=0.0):
    nu, nv = L(nu), L(nv)
    ph = np.linspace(0, np.pi, nu)[:, None]; th = np.linspace(0, TAU, nv, endpoint=False)[None, :]
    P = np.stack([np.broadcast_to(r[0] * np.sin(ph) * np.sin(th), (nu, nv)),
                  np.broadcast_to(r[1] * np.cos(ph) + 0 * th, (nu, nv)),
                  np.broadcast_to(r[2] * np.sin(ph) * np.cos(th), (nu, nv))], -1)
    if rotx:
        cx, sx = np.cos(rotx), np.sin(rotx)
        P = np.stack([P[..., 0], P[..., 1] * cx - P[..., 2] * sx, P[..., 1] * sx + P[..., 2] * cx], -1)
    if rotz:
        cz, sz = np.cos(rotz), np.sin(rotz)
        P = np.stack([P[..., 0] * cz - P[..., 1] * sz, P[..., 0] * sz + P[..., 1] * cz, P[..., 2]], -1)
    P = P + np.asarray(c)
    M.grid_fast(P, wrap=True, center=c)

def frames_along(path):
    T = np.gradient(path, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True)
    ref = np.array([0, 0, 1.0]) if abs(T[0, 2]) < 0.9 else np.array([1.0, 0, 0])
    U = np.cross(T[0], ref); U /= np.linalg.norm(U)
    Us, Vs = [], []
    for t in T:
        U = U - np.dot(U, t) * t; U /= np.linalg.norm(U)
        Us.append(U.copy()); Vs.append(np.cross(t, U))
    return T, np.array(Us), np.array(Vs)

def tube(points, radii, n_path=40, n_ang=18, ex=None, round_ends=True, aspect=None):
    """swept tube along a smooth path through `points`; radii per control point; aspect=(a,b) elliptical per-point scale"""
    points = np.asarray(points, float); k = len(points)
    s = np.linspace(0, 1, k)
    cs = CubicSpline(s, points, bc_type='natural')
    t = np.linspace(0, 1, L(n_path)); path = cs(t)
    rad = PchipInterpolator(s, radii)(t)
    if round_ends:
        e = 0.06
        rad = rad * np.where(t < e, np.sqrt(np.clip(1 - ((e - t) / e) ** 2, 0.0001, 1)), 1) \
                  * np.where(t > 1 - e, np.sqrt(np.clip(1 - ((t - (1 - e)) / e) ** 2, 0.0001, 1)), 1)
    T, U, V = frames_along(path)
    a = np.linspace(0, TAU, L(n_ang), endpoint=False)
    asp = np.ones((len(t), 2))
    if aspect is not None:
        asp = np.stack([PchipInterpolator(s, [q[0] for q in aspect])(t), PchipInterpolator(s, [q[1] for q in aspect])(t)], 1)
    P = path[:, None, :] + rad[:, None, None] * (np.cos(a)[None, :, None] * U[:, None, :] * asp[:, 0, None, None]
                                                 + np.sin(a)[None, :, None] * V[:, None, :] * asp[:, 1, None, None])
    M.grid_fast(P, wrap=True, center=path.mean(0))
    return path

def lathe(profile, c=(0, 0, 0), n_ang=40, closed_profile=False, scale=(1, 1)):
    """profile: list of (radius, y)"""
    prof = np.asarray(profile, float)
    th = np.linspace(0, TAU, L(n_ang), endpoint=False)
    P = np.stack([prof[:, None, 0] * np.sin(th)[None] * scale[0], np.repeat(prof[:, None, 1], len(th), 1),
                  prof[:, None, 0] * np.cos(th)[None] * scale[1]], -1) + np.asarray(c)
    M.grid_fast(P, wrap=True, center=None if not closed_profile else np.asarray(c) + [0, prof[:, 1].mean(), 0])

def sm(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ---------------------------------------------------------------- the gown
GY = np.array([10.5, 16, 26, 36, 46, 52, 56, 62, 66, 70, 74, 78, 82, 84, 85.6, 86.6, 87.1])
GRX = np.array([19.2, 17.8, 15.6, 13.6, 11.8, 10.4, 8.6, 7.2, 7.4, 8.2, 9.0, 9.0, 8.6, 6.4, 3.2, 2.4, 0.4])
GRZ = np.array([14.4, 13.6, 11.8, 10.2, 8.6, 7.6, 6.6, 5.6, 5.8, 7.0, 7.9, 7.2, 5.6, 4.4, 3.0, 2.4, 0.4])
CX = PchipInterpolator([10, 30, 50, 66, 82, 88], [0, -0.7, -1.3, 0.1, 0.8, 0.8])
CZ = PchipInterpolator([10, 50, 88], [0, 0.6, -0.3])
RX = PchipInterpolator(GY, GRX); RZ = PchipInterpolator(GY, GRZ)

def sharp(x): return np.sign(x) * np.abs(x) ** 0.62

def gown_m(theta, y):
    """radial multiplier: classical pleats, bent knee, belt"""
    A = np.interp(y, [10, 28, 46, 62, 90], [0.115, 0.095, 0.05, 0.016, 0.004])
    p1 = np.abs(np.sin(5 * theta + 0.5 + (y - 40) / 60 + 0.35 * np.sin(theta * 2 + y / 30))) ** 0.7 - 0.62
    p2 = np.abs(np.sin(9 * theta + 1.7 - (y - 40) / 42 + 0.25 * np.sin(theta * 3))) ** 0.8 - 0.6
    p3 = np.cos(3 * theta - 0.6 + (y - 40) / 70)
    g = 0.9 * p1 + 0.45 * p2 + 0.35 * p3
    m = 1 + A * g
    dth = (theta - 0.5 + np.pi) % TAU - np.pi           # free (bent) leg: viewer-right, forward
    m += 0.10 * np.exp(-(dth / 0.42) ** 2 - ((y - 33) / 11) ** 2)
    dth2 = (theta + 0.32 + np.pi) % TAU - np.pi         # standing leg: a long soft vertical fold
    m += 0.03 * np.exp(-(dth2 / 0.16) ** 2) * sm(y, 14, 30) * (1 - sm(y, 50, 64))
    m += 0.07 * np.exp(-((y - 69.4) / 1.15) ** 2)       # empire belt
    m += 0.02 * np.exp(-((y - 12.5) / 1.4) ** 2)        # hem roll
    return m

def gown_pt(theta, y, lift=0.0):
    m = gown_m(theta, y) + lift
    return np.stack([CX(y) + RX(y) * m * np.sin(theta), y + 0 * theta, CZ(y) + RZ(y) * m * np.cos(theta)], -1)

def build_gown():
    ys = np.linspace(10.5, 87.1, L(170)); th = np.linspace(0, TAU, L(220), endpoint=False)
    Y, T = np.meshgrid(ys, th, indexing='ij')
    P = gown_pt(T, Y)
    M.grid_fast(P, wrap=True, center=(0, 48, 0))

def build_sash():
    s = np.linspace(0, 1, L(70)); w = np.linspace(-1, 1, L(14)); hw = 2.1
    S, W = np.meshgrid(s, w, indexing='ij')
    yc = 81.6 - 29.0 * S; thc = -1.18 + 1.62 * S + 0.12 * np.sin(S * 6)
    perp_th = 0.92 / np.maximum(RX(yc), 5) ; perp_y = 0.40
    th = thc + W * hw * perp_th; y = yc + W * hw * perp_y
    lift = 0.032 + 0.05 * np.sqrt(np.clip(1 - W ** 2, 0, 1)) * (0.8 + 0.2 * np.sin(S * 9))
    P = gown_pt(th, y, lift)
    M.grid_fast(P, wrap=False, flip=False, center=(0, 60, 0))

# ---------------------------------------------------------------- body parts
def build_body():
    # bust & shoulders
    for sx in (-1, 1):
        ellipsoid((sx * 3.4, 75.2, 4.4), (3.6, 3.0, 2.5), 20, 30)
        ellipsoid((sx * 9.0, 80.6, 0.0), (3.1, 2.8, 3.2), 18, 28)
    # neck (slightly forward)
    tube([(0, 84, 0), (0, 87.5, 0.5), (0, 90.5, 1.0)], [2.9, 2.2, 2.1], 14, 22)
    # head
    hc = np.array([0, 94.4, 0.7])
    ellipsoid(hc, (4.45, 5.9, 5.1), 40, 60)
    ellipsoid((0, 89.7, 3.0), (2.3, 1.6, 2.0), 16, 24)             # jaw / chin
    ellipsoid((0, 92.7, 5.5), (0.62, 1.35, 0.95), 14, 20, rotx=-0.25)  # nose
    ellipsoid((0, 90.6, 5.0), (1.2, 0.32, 0.45), 10, 18)            # lips
    ellipsoid((-4.3, 93.2, 0.6), (0.35, 1.3, 0.8), 8, 14)           # ears (flat, tucked)
    ellipsoid((4.3, 93.2, 0.6), (0.35, 1.3, 0.8), 8, 14)

    # hair cap
    nu, nv = L(44), L(80)
    ph = np.linspace(0, 1, nu)[:, None]; th = np.linspace(0, TAU, nv, endpoint=False)[None, :]
    ad = np.abs((th + np.pi) % TAU - np.pi)
    y_rim = 97.7 - 6.6 * sm(ad, 0.75, 2.3) - 0.0 * th
    phi_top = np.arccos(np.clip((y_rim - hc[1]) / 5.9, -1, 1))        # polar angle of rim on the unit ellipsoid
    phi = ph * phi_top
    wave = 1 + 0.018 * np.sin(11 * th + 6 * phi) * sm(phi, 0.15, 0.6)
    k = 1.055 * wave
    P = np.stack([hc[0] + 4.45 * k * np.sin(phi) * np.sin(th), hc[1] + 5.9 * k * np.cos(phi),
                  hc[2] + 5.1 * k * np.sin(phi) * np.cos(th) * np.ones_like(th)], -1)
    M.grid_fast(P, wrap=True, center=hc)
    # bun + braid
    ellipsoid((0, 99.4, -3.7), (3.3, 2.7, 3.0), 22, 34)
    for i in range(3):
        ellipsoid((0, 99.4, -3.7), (3.55 - i * .15, 0.7, 3.25 - i * .15), 8, 28, rotx=0.0)
    # diadem at the hairline
    ang = np.linspace(-1.9, 1.9, L(50)); wv = np.linspace(-1, 1, L(8))
    A, W = np.meshgrid(ang, wv, indexing='ij')
    yy = 98.0 + 0.6 * W - 0.35 * np.abs(A) ** 1.5 * 0.5
    kk = 1.092 * np.sqrt(np.clip(1 - ((yy - hc[1]) / 5.9) ** 2, 0.02, 1)) + 0.02 * np.sqrt(np.clip(1 - W ** 2, 0, 1))
    P = np.stack([hc[0] + 4.45 * kk * np.sin(A), yy, hc[2] + 5.1 * kk * np.cos(A)], -1)
    M.grid_fast(P, wrap=False, center=hc)

    # blindfold (band sits on top of the hair, around the eyes)
    th = np.linspace(0, TAU, L(100), endpoint=False); t = np.linspace(-1, 1, L(12))
    TH, T = np.meshgrid(th, t, indexing='ij')
    yb = 95.35 + 1.45 * T
    base = np.sqrt(np.clip(1 - ((yb - hc[1]) / 5.9) ** 2, 0.01, 1))
    off = 0.38 + 0.22 * np.sqrt(np.clip(1 - T ** 2, 0, 1))
    P = np.stack([hc[0] + (4.45 * base + off) * np.sin(TH), yb, hc[2] + (5.1 * base + off) * np.cos(TH)], -1)
    M.grid_fast(P, wrap=True, center=hc)
    # knot + tails at the back
    ellipsoid((0, 95.35, -4.9), (1.3, 1.1, 1.0), 12, 18)
    for sx, sw in ((-1, 1), (1, -1)):
        s = np.linspace(0, 1, L(30)); w = np.linspace(-1, 1, 5)
        S, W = np.meshgrid(s, w, indexing='ij')
        x = sx * (0.8 + 3.0 * S ** 1.4 + 0.6 * np.sin(S * 5 + sx))
        y = 95.0 - 12.5 * S
        z = -5.5 - 2.4 * S - 0.8 * np.sin(S * 7)
        wd = (0.75 + 0.35 * S) * W
        P = np.stack([x + wd * 0.9, y, z + wd * 0.35 * sx], -1)
        M.grid_fast(P, wrap=False, flip=(sx > 0))

    # RIGHT arm (viewer-left): raised, holding the scales
    sh = np.array([-9.2, 80.8, 0.0]); el = np.array([-20.2, 73.2, 2.2]); wr = np.array([-23.2, 84.2, 5.0])
    ua = [sh, (sh * .66 + el * .34) + [-0.4, 0.2, 0.4], (sh * .33 + el * .67), el]
    tube(ua, [2.9, 2.7, 2.2, 1.95], 28, 22)
    fa = [el, (el + wr) / 2 + [-0.6, 0.3, 0.8], wr]
    tube(fa, [2.0, 1.75, 1.25], 24, 20)
    # soft cap sleeve
    tube([sh + [0.4, 0.3, 0], (sh * .55 + el * .45) + [0, 0.2, 0.2]], [3.5, 3.2], 16, 24)
    # hand around the stem
    hand_r = np.array([-23.4, 86.6, 5.6])
    ellipsoid(hand_r, (1.7, 2.3, 1.6), 14, 20)
    ellipsoid(hand_r + [0, -0.2, 1.2], (1.3, 1.7, 0.9), 10, 16)

    # LEFT arm (viewer-right): relaxed, holding the sword
    sh2 = np.array([9.2, 80.8, 0.0]); el2 = np.array([13.8, 67.6, 3.0]); wr2 = np.array([18.0, 59.8, 9.0])
    tube([sh2, (sh2 * .66 + el2 * .34) + [0.4, 0, 0.4], (sh2 * .33 + el2 * .67) + [0.3, 0, 0.3], el2],
         [3.0, 2.8, 2.35, 2.05], 28, 22)
    tube([el2, (el2 + wr2) / 2 + [0.6, 0, 0.5], wr2], [2.0, 1.7, 1.2], 24, 20)
    tube([sh2 + [-0.4, 0.3, 0], (sh2 * .55 + el2 * .45)], [3.5, 3.2], 16, 24)

    # feet peeking out from the hem
    ellipsoid((-5.6, 11.2, 15.8), (2.4, 1.2, 4.2), 10, 18)
    ellipsoid((6.0, 11.2, 17.6), (2.4, 1.2, 4.2), 10, 18)

# ---------------------------------------------------------------- sword
SW_TOP = np.array([17.4, 68.6, 9.4]); SW_TIP = np.array([23.6, 10.6, 13.4])

def sword_frame():
    d = SW_TIP - SW_TOP; L_ = np.linalg.norm(d); y = -d / L_   # local +y = up towards pommel
    x = np.array([1.0, 0, 0]); x = x - np.dot(x, y) * y; x /= np.linalg.norm(x); z = np.cross(x, y)
    return L_, x, y, z

def build_sword():
    Ls, ex, ey, ez = sword_frame()
    def W(lx, ly, lz): return SW_TOP + ex * lx + ey * (ly - 0) + ez * lz     # ly measured from pommel top (negative = down)
    # blade
    u = np.linspace(0, 1, L(60)); a = np.linspace(0, TAU, L(18), endpoint=False)
    guard = -13.0; length = Ls - 13.0
    hw = 2.1 * (1 - u ** 7) + 0.04; ht = 0.52 * (1 - u ** 5) + 0.04
    ridge = 1 + 0.35 * np.cos(2 * a)[None, :] * 0   # keep clean
    P = np.zeros((len(u), len(a), 3))
    for i, uu in enumerate(u):
        ly = guard - uu * length
        for j, aa in enumerate(a):
            lx = hw[i] * np.cos(aa); lz = ht[i] * np.sin(aa) * (1.0 + 0.0)
            # fuller: dip along the middle of the flat faces
            lz += np.sign(np.sin(aa)) * 0.16 * (1 - u[i] ** 2) * np.exp(-(lx / 0.7) ** 2) * -1
            P[i, j] = W(lx, ly, lz)
    M.grid_fast(P, wrap=True, center=W(0, guard - length / 2, 0))
    # cross-guard
    gp = [W(-5.4, -13.2, 0), W(0, -13.0, 0), W(5.4, -13.2, 0)]
    tube(gp, [0.75, 0.9, 0.75], 12, 14, round_ends=True)
    for sx in (-1, 1): ellipsoid(W(sx * 5.9, -13.25, 0), (1.05, 1.05, 1.05), 10, 14)
    ellipsoid(W(0, -12.3, 0), (1.5, 1.0, 1.1), 10, 14)
    # grip with wraps
    s = np.linspace(0, 1, L(30)); th = np.linspace(0, TAU, L(14), endpoint=False)
    ly = -1.4 - s * 10.4; r = 0.68 + 0.09 * np.sin(s * 26)
    P = np.zeros((len(s), len(th), 3))
    for i in range(len(s)):
        for j, t in enumerate(th): P[i, j] = W(r[i] * np.cos(t), ly[i], r[i] * np.sin(t))
    M.grid_fast(P, wrap=True, center=W(0, -6.5, 0))
    # pommel
    ellipsoid(W(0, -0.6, 0), (1.7, 1.5, 1.7), 14, 20)
    ellipsoid(W(0, 1.0, 0), (0.8, 0.8, 0.8), 8, 12)
    # the hand wrapped around the grip
    hp = SW_TOP + ey * -6.5 + ex * 0.2 + ez * 0.9
    ellipsoid(hp, (1.7, 2.5, 1.9), 14, 20)
    for k in range(4):
        ellipsoid(W(0.0, -4.3 - k * 1.45, 1.35), (1.25, 0.62, 0.62), 8, 14)

# ---------------------------------------------------------------- scales
def build_scales():
    cxs = -23.4; beam_y = 101.0
    # stem from the hand up to the beam
    tube([(cxs, 83.8, 5.6), (cxs, 92, 5.6), (cxs, beam_y, 5.6)], [0.5, 0.45, 0.55], 20, 14)
    ellipsoid((cxs, 90.2, 5.6), (1.0, 0.9, 1.0), 8, 14)
    # beam + ornaments
    half = 10.8
    tube([(cxs - half, beam_y, 5.6), (cxs, beam_y + 0.3, 5.6), (cxs + half, beam_y, 5.6)], [0.38, 0.62, 0.38], 20, 14)
    ellipsoid((cxs, beam_y + 1.0, 5.6), (1.25, 1.25, 1.25), 12, 18)
    ellipsoid((cxs, beam_y + 2.6, 5.6), (0.6, 1.0, 0.6), 8, 12)
    for sx in (-1, 1):
        ex_ = cxs + sx * half
        ellipsoid((ex_, beam_y, 5.6), (0.85, 0.85, 0.85), 10, 14)
        # pan
        py = 90.0
        prof = [(0.0, -2.1), (1.5, -2.0), (3.0, -1.5), (4.4, -0.7), (5.2, 0.0), (5.55, 0.25), (5.3, 0.3), (4.9, 0.15),
                (4.1, -0.45), (2.8, -1.25), (1.4, -1.75), (0.0, -1.85)]
        lathe(prof, c=(ex_, py, 5.6), n_ang=40, closed_profile=True)
        # chains
        for k in range(3):
            ang = k * TAU / 3 + 0.5
            rim = np.array([ex_ + 5.0 * np.sin(ang), py + 0.2, 5.6 + 5.0 * np.cos(ang)])
            top = np.array([ex_, beam_y - 0.5, 5.6])
            n = 12
            pts = [top + (rim - top) * t for t in np.linspace(0, 1, 3)]
            tube(pts, [0.13, 0.13, 0.13], 8, 6, round_ends=False)

# ---------------------------------------------------------------- plinth
def build_plinth():
    M.flat_box((0, 1.75, 0), (64, 3.5, 50))
    M.flat_box((0, 4.9, 0), (57, 2.8, 43))
    M.flat_box((0, 6.9, 0), (52, 1.2, 38))
    M.flat_box((0, 8.7, 0), (49, 2.4, 36))
    M.flat_box((0, 9.95, 0), (51, 0.5, 38))

def build_all():
    build_plinth(); build_gown(); build_body(); build_scales(); build_sword()
    return M.finish()

# ---------------------------------------------------------------- GLB export
def write_glb(path, V, N, F):
    V = V.astype(np.float32); N = N.astype(np.float32); F = F.astype(np.uint32)
    vb, nb, ib = V.tobytes(), N.tobytes(), F.tobytes()
    bin_ = vb + nb + ib
    pad = (4 - len(bin_) % 4) % 4; bin_ += b'\0' * pad
    js = {"asset": {"version": "2.0", "generator": "jat-law procedural statue"},
          "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0, "name": "LadyJustice"}],
          "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1}, "indices": 2, "material": 0}]}],
          "materials": [{"name": "gold", "pbrMetallicRoughness": {"baseColorFactor": [0.85, 0.66, 0.25, 1], "metallicFactor": 1, "roughnessFactor": 0.3}}],
          "buffers": [{"byteLength": len(bin_)}],
          "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": len(vb), "target": 34962},
                          {"buffer": 0, "byteOffset": len(vb), "byteLength": len(nb), "target": 34962},
                          {"buffer": 0, "byteOffset": len(vb) + len(nb), "byteLength": len(ib), "target": 34963}],
          "accessors": [{"bufferView": 0, "componentType": 5126, "count": len(V), "type": "VEC3",
                         "min": V.min(0).tolist(), "max": V.max(0).tolist()},
                        {"bufferView": 1, "componentType": 5126, "count": len(N), "type": "VEC3"},
                        {"bufferView": 2, "componentType": 5125, "count": int(F.size), "type": "SCALAR"}]}
    j = json.dumps(js, separators=(',', ':')).encode(); j += b' ' * ((4 - len(j) % 4) % 4)
    total = 12 + 8 + len(j) + 8 + len(bin_)
    with open(path, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total))
        f.write(struct.pack('<I4s', len(j), b'JSON')); f.write(j)
        f.write(struct.pack('<I4s', len(bin_), b'BIN\0')); f.write(bin_)

if __name__ == '__main__':
    V, N, F = build_all()
    print('verts', len(V), 'tris', len(F), 'bbox', V.min(0), V.max(0))
    np.savez('/home/claude/statue_mesh.npz', V=V, N=N, F=F)
    if len(sys.argv) > 2: write_glb(sys.argv[2], V, N, F); print('wrote', sys.argv[2])
