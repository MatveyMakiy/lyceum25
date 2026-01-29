import tkinter as tk
import math
import random
import time

W, H = 900, 560
FPS_MS = 16

def clamp(v, a, b):
    return a if v < a else b if v > b else v

def vec_len(x, y):
    return math.hypot(x, y)

def bbox_intersect(a, b):
    return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])

class Body:
    def __init__(self, app, kind, mass=1.0, restitution=0.35, drag=0.995):
        self.app = app
        self.kind = kind
        self.mass = mass
        self.restitution = restitution
        self.drag = drag
        self.vx = 0.0
        self.vy = 0.0
        self.id = None
        self.tag = f"body_{id(self)}"

    def bbox(self):
        return self.app.canvas.bbox(self.id)

    def center(self):
        b = self.bbox()
        return (b[0] + b[2]) / 2.0, (b[1] + b[3]) / 2.0

    def move_to(self, cx, cy):
        x0, y0 = self.center()
        self.app.canvas.move(self.id, cx - x0, cy - y0)

    def step(self, dt):
        self.vx *= self.drag
        self.vy *= self.drag
        self.app.canvas.move(self.id, self.vx * dt, self.vy * dt)

    def keep_in_bounds(self):
        b = self.bbox()
        if not b:
            return
        x0, y0, x1, y1 = b
        dx = dy = 0.0

        if x0 < 0:
            dx = -x0
            self.vx = -self.vx * self.restitution
        elif x1 > self.app.cw:
            dx = self.app.cw - x1
            self.vx = -self.vx * self.restitution

        if y0 < 0:
            dy = -y0
            self.vy = -self.vy * self.restitution
        elif y1 > self.app.ch:
            dy = self.app.ch - y1
            self.vy = -self.vy * self.restitution

        if dx or dy:
            self.app.canvas.move(self.id, dx, dy)

class Ball(Body):
    def __init__(self, app, x, y, r=18, mass=1.0):
        super().__init__(app, "ball", mass=mass, restitution=0.55, drag=0.992)
        self.r = r
        self.id = app.canvas.create_oval(x - r, y - r, x + r, y + r,
                                         fill="#f2f2f2", outline="#2b2b2b", width=2,
                                         tags=(self.tag, "body"))
        app.body_by_id[self.id] = self

class Box(Body):
    def __init__(self, app, x, y, w=56, h=40, mass=3.0):
        super().__init__(app, "box", mass=mass, restitution=0.25, drag=0.994)
        self.w = w
        self.h = h
        self.id = app.canvas.create_rectangle(x - w/2, y - h/2, x + w/2, y + h/2,
                                              fill="#d9d9d9", outline="#2b2b2b", width=2,
                                              tags=(self.tag, "body"))
        app.body_by_id[self.id] = self

class Poly(Body):
    def __init__(self, app, x, y, points, mass=2.0):
        super().__init__(app, "poly", mass=mass, restitution=0.3, drag=0.993)
        flat = []
        for lx, ly in points:
            flat.extend([x + lx, y + ly])
        self.id = app.canvas.create_polygon(*flat, fill="#e6e6e6", outline="#2b2b2b", width=2,
                                            tags=(self.tag, "body"))
        app.body_by_id[self.id] = self

    def move_to(self, cx, cy):
        x0, y0 = self.center()
        self.app.canvas.move(self.id, cx - x0, cy - y0)

class Magnet(Body):
    def __init__(self, app, x, y, r=18, radius=160, strength=1100):
        super().__init__(app, "magnet", mass=9999.0, restitution=0.0, drag=1.0)
        self.r = r
        self.radius = radius
        self.strength = strength
        pts = [x, y - r, x + r, y, x, y + r, x - r, y]
        self.id = app.canvas.create_polygon(*pts, fill="#cfcfcf", outline="#2b2b2b", width=2,
                                            tags=(self.tag, "body", "magnet"))
        self.ring = app.canvas.create_oval(x - radius, y - radius, x + radius, y + radius,
                                           outline="#888888", width=1, dash=(4, 4),
                                           tags=(self.tag, "magnet_ring"))
        app.body_by_id[self.id] = self

    def move_to(self, cx, cy):
        x0, y0 = self.center()
        dx = cx - x0
        dy = cy - y0
        self.app.canvas.move(self.id, dx, dy)
        self.app.canvas.move(self.ring, dx, dy)

    def step(self, dt):
        self.vx *= self.drag
        self.vy *= self.drag
        dx = self.vx * dt
        dy = self.vy * dt
        if dx or dy:
            self.app.canvas.move(self.id, dx, dy)
            self.app.canvas.move(self.ring, dx, dy)

    def keep_in_bounds(self):
        b = self.bbox()
        if not b:
            return
        x0, y0, x1, y1 = b
        dx = dy = 0.0

        if x0 < 0:
            dx = -x0
            self.vx = -self.vx * self.restitution
        elif x1 > self.app.cw:
            dx = self.app.cw - x1
            self.vx = -self.vx * self.restitution

        if y0 < 0:
            dy = -y0
            self.vy = -self.vy * self.restitution
        elif y1 > self.app.ch:
            dy = self.app.ch - y1
            self.vy = -self.vy * self.restitution

        if dx or dy:
            self.app.canvas.move(self.id, dx, dy)
            self.app.canvas.move(self.ring, dx, dy)

class GlueZone:
    def __init__(self, app, x, y, w=170, h=90, viscosity=0.87):
        self.app = app
        self.w = w
        self.h = h
        self.viscosity = viscosity
        self.id = app.canvas.create_rectangle(x - w/2, y - h/2, x + w/2, y + h/2,
                                              fill="#bfbfbf", outline="#7a7a7a", width=2,
                                              stipple="gray25",
                                              tags=("glue",))
        app.glues.append(self)

    def bbox(self):
        return self.app.canvas.bbox(self.id)

    def contains_point(self, x, y):
        b = self.bbox()
        return b and (b[0] <= x <= b[2] and b[1] <= y <= b[3])

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Физический стол (Tkinter)")
        self.cw = W
        self.ch = H

        top = tk.Frame(root)
        top.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(top, width=self.cw, height=self.ch, bg="white", highlightthickness=0)
        self.canvas.pack(side="left", fill="both", expand=True)

        panel = tk.Frame(top, padx=10, pady=10)
        panel.pack(side="right", fill="y")

        self.gravity_on = tk.BooleanVar(value=True)
        self.magnet_mode = tk.StringVar(value="attract")

        tk.Button(panel, text="Добавить круг", command=self.add_ball).pack(fill="x", pady=2)
        tk.Button(panel, text="Добавить блок", command=self.add_box).pack(fill="x", pady=2)
        tk.Button(panel, text="Добавить треугольник", command=self.add_triangle).pack(fill="x", pady=2)
        tk.Button(panel, text="Добавить пятиугольник", command=self.add_pentagon).pack(fill="x", pady=2)
        tk.Button(panel, text="Добавить магнит", command=self.add_magnet).pack(fill="x", pady=2)
        tk.Button(panel, text="Добавить липкую зону", command=self.add_glue).pack(fill="x", pady=2)

        tk.Checkbutton(panel, text="Гравитация", variable=self.gravity_on).pack(fill="x", pady=(10, 2))
        tk.Button(panel, text="Порыв ветра", command=self.wind_gust).pack(fill="x", pady=2)

        tk.Label(panel, text="Режим магнита:").pack(anchor="w", pady=(10, 0))
        tk.Radiobutton(panel, text="Притяжение", value="attract", variable=self.magnet_mode).pack(anchor="w")
        tk.Radiobutton(panel, text="Отталкивание", value="repel", variable=self.magnet_mode).pack(anchor="w")

        tk.Button(panel, text="Сброс", command=self.reset).pack(fill="x", pady=(14, 2))

        self.bodies = []
        self.magnets = []
        self.glues = []
        self.body_by_id = {}

        self.selected = None
        self.sel_offset = (0.0, 0.0)
        self.mouse_hist = []

        self.canvas.bind("<ButtonPress-1>", self.on_press)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_release)

        self.last_t = time.time()
        self.root.after(FPS_MS, self.update)

    def rnd_pos(self):
        return random.randint(80, self.cw - 80), random.randint(80, self.ch - 120)

    def add_ball(self):
        x, y = self.rnd_pos()
        r = random.randint(14, 22)
        mass = max(0.8, (r / 18.0))
        b = Ball(self, x, y, r=r, mass=mass)
        self.bodies.append(b)

    def add_box(self):
        x, y = self.rnd_pos()
        w = random.randint(46, 72)
        h = random.randint(32, 58)
        mass = max(2.2, (w * h) / 1600.0)
        b = Box(self, x, y, w=w, h=h, mass=mass)
        self.bodies.append(b)

    def add_triangle(self):
        x, y = self.rnd_pos()
        s = random.randint(26, 40)
        pts = [(0, -s), (s, s), (-s, s)]
        p = Poly(self, x, y, pts, mass=2.0)
        self.bodies.append(p)

    def add_pentagon(self):
        x, y = self.rnd_pos()
        r = random.randint(24, 38)
        pts = []
        for i in range(5):
            ang = -math.pi/2 + i * (2*math.pi/5)
            pts.append((r * math.cos(ang), r * math.sin(ang)))
        p = Poly(self, x, y, pts, mass=2.4)
        self.bodies.append(p)

    def add_magnet(self):
        x, y = self.rnd_pos()
        m = Magnet(self, x, y, r=18, radius=170, strength=1250)
        self.magnets.append(m)
        self.bodies.append(m)

    def add_glue(self):
        x, y = self.rnd_pos()
        GlueZone(self, x, y, w=random.randint(140, 210), h=random.randint(70, 120), viscosity=0.86)

    def wind_gust(self):
        for b in self.bodies:
            if b.kind == "magnet":
                continue
            impulse = 260.0 / max(b.mass, 1e-6)
            if b.kind == "box":
                impulse *= 0.35
            b.vx += impulse

    def reset(self):
        self.canvas.delete("all")
        self.bodies.clear()
        self.magnets.clear()
        self.glues.clear()
        self.body_by_id.clear()
        self.selected = None
        self.mouse_hist.clear()

    def find_body_at(self, x, y):
        items = self.canvas.find_overlapping(x, y, x, y)
        for it in reversed(items):
            b = self.body_by_id.get(it)
            if b is not None:
                return b
        return None

    def on_press(self, e):
        b = self.find_body_at(e.x, e.y)
        if b is None:
            self.selected = None
            self.mouse_hist.clear()
            return
        self.selected = b
        cx, cy = b.center()
        self.sel_offset = (cx - e.x, cy - e.y)
        b.vx = 0.0
        b.vy = 0.0
        self.mouse_hist = [(time.time(), e.x, e.y)]

        self.canvas.tag_raise(b.id)
        if b.kind == "magnet":
            self.canvas.tag_raise(b.ring)

    def on_drag(self, e):
        if not self.selected:
            return
        cx = e.x + self.sel_offset[0]
        cy = e.y + self.sel_offset[1]
        cx = clamp(cx, 30, self.cw - 30)
        cy = clamp(cy, 30, self.ch - 30)
        self.selected.move_to(cx, cy)
        self.mouse_hist.append((time.time(), e.x, e.y))
        if len(self.mouse_hist) > 6:
            self.mouse_hist.pop(0)

    def on_release(self, e):
        if not self.selected:
            return
        vx = vy = 0.0
        if len(self.mouse_hist) >= 2:
            t0, x0, y0 = self.mouse_hist[0]
            t1, x1, y1 = self.mouse_hist[-1]
            dt = max(0.001, t1 - t0)
            vx = (x1 - x0) / dt
            vy = (y1 - y0) / dt
        self.selected.vx = clamp(vx * 0.05, -50, 50)
        self.selected.vy = clamp(vy * 0.05, -50, 50)
        self.selected = None
        self.mouse_hist.clear()

    def apply_gravity(self, b, dt):
        if not self.gravity_on.get():
            return
        g = 1200.0
        b.vy += (g * dt) / max(b.mass, 1e-6)

    def apply_magnets(self, b, dt):
        if b.kind == "magnet":
            return
        mode = self.magnet_mode.get()
        sign = 1.0 if mode == "attract" else -1.0
        bx, by = b.center()
        for m in self.magnets:
            mx, my = m.center()
            dx = mx - bx
            dy = my - by
            d = vec_len(dx, dy)
            if d < 1e-6 or d > m.radius:
                continue
            nx = dx / d
            ny = dy / d
            k = (1.0 - d / m.radius)
            a = sign * (m.strength * k) / max(b.mass, 1e-6)
            a = clamp(a, -2200, 2200)
            b.vx += nx * a * dt
            b.vy += ny * a * dt

    def apply_glue(self, b):
        if b.kind == "magnet":
            return
        cx, cy = b.center()
        for gz in self.glues:
            if gz.contains_point(cx, cy):
                b.vx *= gz.viscosity
                b.vy *= gz.viscosity

    def resolve_circle_circle(self, a: Ball, b: Ball):
        ax, ay = a.center()
        bx, by = b.center()
        dx = bx - ax
        dy = by - ay
        dist = vec_len(dx, dy)
        min_dist = a.r + b.r
        if dist <= 1e-6 or dist >= min_dist:
            return False
        nx = dx / dist
        ny = dy / dist
        overlap = min_dist - dist

        a.move_to(ax - nx * overlap * 0.5, ay - ny * overlap * 0.5)
        b.move_to(bx + nx * overlap * 0.5, by + ny * overlap * 0.5)

        rvx = b.vx - a.vx
        rvy = b.vy - a.vy
        vel_along_normal = rvx * nx + rvy * ny
        if vel_along_normal > 0:
            return True

        e = min(a.restitution, b.restitution)
        j = -(1 + e) * vel_along_normal
        inv_ma = 1.0 / max(a.mass, 1e-6)
        inv_mb = 1.0 / max(b.mass, 1e-6)
        j /= (inv_ma + inv_mb)

        ix = j * nx
        iy = j * ny
        a.vx -= ix * inv_ma
        a.vy -= iy * inv_ma
        b.vx += ix * inv_mb
        b.vy += iy * inv_mb
        return True

    def resolve_bbox_bbox(self, a: Body, b: Body):
        ba = a.bbox()
        bb = b.bbox()
        if not ba or not bb or not bbox_intersect(ba, bb):
            return False

        ax0, ay0, ax1, ay1 = ba
        bx0, by0, bx1, by1 = bb

        overlap_x1 = ax1 - bx0
        overlap_x2 = bx1 - ax0
        overlap_y1 = ay1 - by0
        overlap_y2 = by1 - ay0

        min_ox = min(overlap_x1, overlap_x2)
        min_oy = min(overlap_y1, overlap_y2)

        acx, acy = a.center()
        bcx, bcy = b.center()

        if min_ox < min_oy:
            sep = min_ox
            direction = -1 if acx < bcx else 1
            dx = direction * sep
            a.move_to(acx + dx * 0.5, acy)
            b.move_to(bcx - dx * 0.5, bcy)
            e = min(a.restitution, b.restitution)
            a.vx, b.vx = -a.vx * e, -b.vx * e
        else:
            sep = min_oy
            direction = -1 if acy < bcy else 1
            dy = direction * sep
            a.move_to(acx, acy + dy * 0.5)
            b.move_to(bcx, bcy - dy * 0.5)
            e = min(a.restitution, b.restitution)
            a.vy, b.vy = -a.vy * e, -b.vy * e

        return True

    def resolve_collisions(self):
        n = len(self.bodies)
        for i in range(n):
            for j in range(i + 1, n):
                a = self.bodies[i]
                b = self.bodies[j]
                if a.kind == "magnet" and b.kind == "magnet":
                    continue
                if isinstance(a, Ball) and isinstance(b, Ball):
                    self.resolve_circle_circle(a, b)
                else:
                    self.resolve_bbox_bbox(a, b)

    def update(self):
        now = time.time()
        dt = now - self.last_t
        self.last_t = now
        dt = clamp(dt, 0.0, 0.033)

        for b in self.bodies:
            if b is self.selected:
                continue
            self.apply_gravity(b, dt)
            self.apply_magnets(b, dt)
            self.apply_glue(b)

        for b in self.bodies:
            if b is self.selected:
                continue
            b.step(dt)
            b.keep_in_bounds()

        for _ in range(2):
            self.resolve_collisions()
            for b in self.bodies:
                if b is self.selected:
                    continue
                b.keep_in_bounds()

        self.root.after(FPS_MS, self.update)

if __name__ == "__main__":
    random.seed()
    root = tk.Tk()
    app = App(root)
    for _ in range(3):
        app.add_ball()
    for _ in range(2):
        app.add_box()
    app.add_triangle()
    app.add_pentagon()
    app.add_magnet()
    app.add_glue()
    root.mainloop()
