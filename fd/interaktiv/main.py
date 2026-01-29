import tkinter as tk # импортируем tkinter
import math # импортируем math
import random # импортируем random
import time # импортируем time

W, H = 900, 560 # задаём размеры окна
FPS_MS = 16 # задаём шаг обновления

def clamp(v, a, b): # ограничиваем значение
    return a if v < a else b if v > b else v # возвращаем в диапазоне

def vec_len(x, y): # считаем длину вектора
    return math.hypot(x, y) # длина по гипотенузе

def bbox_intersect(a, b): # проверяем пересечение bbox
    return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3]) # логика пересечения

class Body: # базовый класс тела
    def __init__(self, app, kind, mass=1.0, restitution=0.35, drag=0.995): # создаём тело
        self.app = app # сохраняем приложение
        self.kind = kind # сохраняем тип
        self.mass = mass # сохраняем массу
        self.restitution = restitution # сохраняем упругость
        self.drag = drag # сохраняем затухание
        self.vx = 0.0 # скорость по x
        self.vy = 0.0 # скорость по y
        self.id = None # id фигуры
        self.tag = f"body_{id(self)}" # тег объекта

    def bbox(self): # получаем bbox
        return self.app.canvas.bbox(self.id) # bbox это прямоугольник вокруг фигуры

    def center(self): # получаем центр
        b = self.bbox() # берём bbox
        return (b[0] + b[2]) / 2.0, (b[1] + b[3]) / 2.0 # считаем середину bbox

    def move_to(self, cx, cy): # двигаем к точке
        x0, y0 = self.center() # берём текущий центр
        self.app.canvas.move(self.id, cx - x0, cy - y0) # сдвигаем на разницу

    def step(self, dt): # делаем шаг физики
        self.vx *= self.drag # затухаем по x
        self.vy *= self.drag # затухаем по y
        self.app.canvas.move(self.id, self.vx * dt, self.vy * dt) # двигаем по скорости

    def keep_in_bounds(self): # держим в границах
        b = self.bbox() # берём bbox
        if not b: # проверяем bbox
            return # выходим
        x0, y0, x1, y1 = b # распаковываем bbox
        dx = dy = 0.0 # готовим сдвиг

        if x0 < 0: # вышли влево
            dx = -x0 # возвращаем внутрь
            self.vx = -self.vx * self.restitution # отражаем x
        elif x1 > self.app.cw: # вышли вправо
            dx = self.app.cw - x1 # возвращаем внутрь
            self.vx = -self.vx * self.restitution # отражаем x

        if y0 < 0: # вышли вверх
            dy = -y0 # возвращаем внутрь
            self.vy = -self.vy * self.restitution # отражаем y
        elif y1 > self.app.ch: # вышли вниз
            dy = self.app.ch - y1 # возвращаем внутрь
            self.vy = -self.vy * self.restitution # отражаем y

        if dx or dy: # если нужен сдвиг
            self.app.canvas.move(self.id, dx, dy) # двигаем обратно

class Ball(Body): # класс шара
    def __init__(self, app, x, y, r=18, mass=1.0): # создаём шар
        super().__init__(app, "ball", mass=mass, restitution=0.55, drag=0.992) # инициализируем базу
        self.r = r # сохраняем радиус
        self.id = app.canvas.create_oval(x - r, y - r, x + r, y + r, # рисуем круг
                                         fill="#f2f2f2", outline="#2b2b2b", width=2, # задаём стиль
                                         tags=(self.tag, "body")) # задаём теги
        app.body_by_id[self.id] = self # регистрируем объект

class Box(Body): # класс блока
    def __init__(self, app, x, y, w=56, h=40, mass=3.0): # создаём блок
        super().__init__(app, "box", mass=mass, restitution=0.25, drag=0.994) # инициализируем базу
        self.w = w # сохраняем ширину
        self.h = h # сохраняем высоту
        self.id = app.canvas.create_rectangle(x - w/2, y - h/2, x + w/2, y + h/2, # рисуем прямоугольник
                                              fill="#d9d9d9", outline="#2b2b2b", width=2, # задаём стиль
                                              tags=(self.tag, "body")) # задаём теги
        app.body_by_id[self.id] = self # регистрируем объект

class Poly(Body): # класс многоугольника
    def __init__(self, app, x, y, points, mass=2.0): # создаём многоугольник
        super().__init__(app, "poly", mass=mass, restitution=0.3, drag=0.993) # инициализируем базу
        flat = [] # список координат
        for lx, ly in points: # перебираем точки
            flat.extend([x + lx, y + ly]) # добавляем координаты
        self.id = app.canvas.create_polygon(*flat, fill="#e6e6e6", outline="#2b2b2b", width=2, # рисуем многоугольник
                                            tags=(self.tag, "body")) # задаём теги
        app.body_by_id[self.id] = self # регистрируем объект

    def move_to(self, cx, cy): # двигаем многоугольник
        x0, y0 = self.center() # берём центр
        self.app.canvas.move(self.id, cx - x0, cy - y0) # сдвигаем фигуру

class Magnet(Body): # класс магнита
    def __init__(self, app, x, y, r=18, radius=160, strength=1100): # создаём магнит
        super().__init__(app, "magnet", mass=9999.0, restitution=0.0, drag=1.0) # инициализируем базу
        self.r = r # сохраняем размер
        self.radius = radius # сохраняем радиус поля
        self.strength = strength # сохраняем силу
        pts = [x, y - r, x + r, y, x, y + r, x - r, y] # точки ромба
        self.id = app.canvas.create_polygon(*pts, fill="#cfcfcf", outline="#2b2b2b", width=2, # рисуем магнит
                                            tags=(self.tag, "body", "magnet")) # задаём теги
        self.ring = app.canvas.create_oval(x - radius, y - radius, x + radius, y + radius, # рисуем круг поля
                                           outline="#888888", width=1, dash=(4, 4), # задаём стиль поля
                                           tags=(self.tag, "magnet_ring")) # задаём тег поля
        app.body_by_id[self.id] = self # регистрируем магнит

    def move_to(self, cx, cy): # двигаем магнит и поле
        x0, y0 = self.center() # берём центр магнита
        dx = cx - x0 # считаем сдвиг x
        dy = cy - y0 # считаем сдвиг y
        self.app.canvas.move(self.id, dx, dy) # двигаем магнит
        self.app.canvas.move(self.ring, dx, dy) # двигаем поле

    def step(self, dt): # шаг физики магнита
        self.vx *= self.drag # затухаем x
        self.vy *= self.drag # затухаем y
        dx = self.vx * dt # переводим скорость в сдвиг
        dy = self.vy * dt # переводим скорость в сдвиг
        if dx or dy: # если есть движение
            self.app.canvas.move(self.id, dx, dy) # двигаем магнит
            self.app.canvas.move(self.ring, dx, dy) # двигаем поле

    def keep_in_bounds(self): # удерживаем магнит в границах
        b = self.bbox() # берём bbox магнита
        if not b: # если bbox нет
            return # выходим
        x0, y0, x1, y1 = b # распаковываем bbox
        dx = dy = 0.0 # готовим сдвиг

        if x0 < 0: # вышли влево
            dx = -x0 # возвращаем внутрь
            self.vx = -self.vx * self.restitution # отражаем x
        elif x1 > self.app.cw: # вышли вправо
            dx = self.app.cw - x1 # возвращаем внутрь
            self.vx = -self.vx * self.restitution # отражаем x

        if y0 < 0: # вышли вверх
            dy = -y0 # возвращаем внутрь
            self.vy = -self.vy * self.restitution # отражаем y
        elif y1 > self.app.ch: # вышли вниз
            dy = self.app.ch - y1 # возвращаем внутрь
            self.vy = -self.vy * self.restitution # отражаем y

        if dx or dy: # если нужен сдвиг
            self.app.canvas.move(self.id, dx, dy) # двигаем магнит
            self.app.canvas.move(self.ring, dx, dy) # двигаем поле

class GlueZone: # класс липкой зоны
    def __init__(self, app, x, y, w=170, h=90, viscosity=0.87): # создаём зону
        self.app = app # сохраняем ссылку
        self.w = w # сохраняем ширину
        self.h = h # сохраняем высоту
        self.viscosity = viscosity # сохраняем вязкость
        self.id = app.canvas.create_rectangle(x - w/2, y - h/2, x + w/2, y + h/2, # рисуем зону
                                              fill="#bfbfbf", outline="#7a7a7a", width=2, # задаём стиль
                                              stipple="gray25", # задаём прозрачность
                                              tags=("glue",)) # задаём тег
        app.glues.append(self) # добавляем в список

    def bbox(self): # bbox зоны
        return self.app.canvas.bbox(self.id) # возвращаем bbox зоны

    def contains_point(self, x, y): # проверяем точку
        b = self.bbox() # берём bbox зоны
        return b and (b[0] <= x <= b[2] and b[1] <= y <= b[3]) # проверяем попадание

class App: # класс приложения
    def __init__(self, root): # создаём приложение
        self.root = root # сохраняем окно
        self.root.title("Физический стол (Tkinter)") # задаём заголовок
        self.cw = W # ширина сцены
        self.ch = H # высота сцены

        top = tk.Frame(root) # создаём контейнер
        top.pack(fill="both", expand=True) # размещаем контейнер

        self.canvas = tk.Canvas(top, width=self.cw, height=self.ch, bg="white", highlightthickness=0) # создаём canvas
        self.canvas.pack(side="left", fill="both", expand=True) # размещаем canvas

        panel = tk.Frame(top, padx=10, pady=10) # создаём панель
        panel.pack(side="right", fill="y") # размещаем панель

        self.gravity_on = tk.BooleanVar(value=True) # флаг гравитации
        self.magnet_mode = tk.StringVar(value="attract") # режим магнита

        tk.Button(panel, text="Добавить круг", command=self.add_ball).pack(fill="x", pady=2) # кнопка круга
        tk.Button(panel, text="Добавить блок", command=self.add_box).pack(fill="x", pady=2) # кнопка блока
        tk.Button(panel, text="Добавить треугольник", command=self.add_triangle).pack(fill="x", pady=2) # кнопка треугольника
        tk.Button(panel, text="Добавить пятиугольник", command=self.add_pentagon).pack(fill="x", pady=2) # кнопка пятиугольника
        tk.Button(panel, text="Добавить магнит", command=self.add_magnet).pack(fill="x", pady=2) # кнопка магнита
        tk.Button(panel, text="Добавить липкую зону", command=self.add_glue).pack(fill="x", pady=2) # кнопка зоны

        tk.Checkbutton(panel, text="Гравитация", variable=self.gravity_on).pack(fill="x", pady=(10, 2)) # переключатель гравитации
        tk.Button(panel, text="Порыв ветра", command=self.wind_gust).pack(fill="x", pady=2) # кнопка ветра

        tk.Label(panel, text="Режим магнита:").pack(anchor="w", pady=(10, 0)) # подпись режима
        tk.Radiobutton(panel, text="Притяжение", value="attract", variable=self.magnet_mode).pack(anchor="w") # режим притяжения
        tk.Radiobutton(panel, text="Отталкивание", value="repel", variable=self.magnet_mode).pack(anchor="w") # режим отталкивания

        tk.Button(panel, text="Сброс", command=self.reset).pack(fill="x", pady=(14, 2)) # кнопка сброса

        self.bodies = [] # список тел
        self.magnets = [] # список магнитов
        self.glues = [] # список зон
        self.body_by_id = {} # словарь по id

        self.selected = None # выбранный объект
        self.sel_offset = (0.0, 0.0) # смещение при перетаскивании
        self.mouse_hist = [] # история мыши

        self.canvas.bind("<ButtonPress-1>", self.on_press) # привязка нажатия
        self.canvas.bind("<B1-Motion>", self.on_drag) # привязка движения
        self.canvas.bind("<ButtonRelease-1>", self.on_release) # привязка отпускания

        self.last_t = time.time() # сохраняем время
        self.root.after(FPS_MS, self.update) # запускаем цикл

    def rnd_pos(self): # случайная позиция
        return random.randint(80, self.cw - 80), random.randint(80, self.ch - 120) # возвращаем координаты

    def add_ball(self): # добавляем шар
        x, y = self.rnd_pos() # берём позицию
        r = random.randint(14, 22) # берём радиус
        mass = max(0.8, (r / 18.0)) # вычисляем массу
        b = Ball(self, x, y, r=r, mass=mass) # создаём шар
        self.bodies.append(b) # добавляем в список

    def add_box(self): # добавляем блок
        x, y = self.rnd_pos() # берём позицию
        w = random.randint(46, 72) # берём ширину
        h = random.randint(32, 58) # берём высоту
        mass = max(2.2, (w * h) / 1600.0) # вычисляем массу
        b = Box(self, x, y, w=w, h=h, mass=mass) # создаём блок
        self.bodies.append(b) # добавляем в список

    def add_triangle(self): # добавляем треугольник
        x, y = self.rnd_pos() # берём позицию
        s = random.randint(26, 40) # берём размер
        pts = [(0, -s), (s, s), (-s, s)] # задаём вершины
        p = Poly(self, x, y, pts, mass=2.0) # создаём треугольник
        self.bodies.append(p) # добавляем в список

    def add_pentagon(self): # добавляем пятиугольник
        x, y = self.rnd_pos() # берём позицию
        r = random.randint(24, 38) # берём радиус
        pts = [] # создаём список точек
        for i in range(5): # делаем 5 вершин
            ang = -math.pi/2 + i * (2*math.pi/5) # считаем угол
            pts.append((r * math.cos(ang), r * math.sin(ang))) # добавляем вершину
        p = Poly(self, x, y, pts, mass=2.4) # создаём пятиугольник
        self.bodies.append(p) # добавляем в список

    def add_magnet(self): # добавляем магнит
        x, y = self.rnd_pos() # берём позицию
        m = Magnet(self, x, y, r=18, radius=170, strength=1250) # создаём магнит
        self.magnets.append(m) # добавляем в список магнитов
        self.bodies.append(m) # добавляем в список тел

    def add_glue(self): # добавляем липкую зону
        x, y = self.rnd_pos() # берём позицию
        GlueZone(self, x, y, w=random.randint(140, 210), h=random.randint(70, 120), viscosity=0.86) # создаём зону

    def wind_gust(self): # порыв ветра
        for b in self.bodies: # перебираем тела
            if b.kind == "magnet": # проверяем магнит
                continue # пропускаем магнит
            impulse = 260.0 / max(b.mass, 1e-6) # считаем импульс
            if b.kind == "box": # если это блок
                impulse *= 0.35 # уменьшаем эффект
            b.vx += impulse # добавляем скорость

    def reset(self): # сброс сцены
        self.canvas.delete("all") # очищаем canvas
        self.bodies.clear() # чистим тела
        self.magnets.clear() # чистим магниты
        self.glues.clear() # чистим зоны
        self.body_by_id.clear() # чистим словарь
        self.selected = None # сбрасываем выбор
        self.mouse_hist.clear() # чистим историю

    def find_body_at(self, x, y): # ищем тело под курсором
        items = self.canvas.find_overlapping(x, y, x, y) # ищем объекты canvas
        for it in reversed(items): # идём сверху вниз
            b = self.body_by_id.get(it) # ищем в словаре
            if b is not None: # если нашли тело
                return b # возвращаем тело
        return None # если не нашли

    def on_press(self, e): # обработка нажатия
        b = self.find_body_at(e.x, e.y) # ищем объект
        if b is None: # если пусто
            self.selected = None # снимаем выбор
            self.mouse_hist.clear() # чистим историю
            return # выходим
        self.selected = b # сохраняем выбранный
        cx, cy = b.center() # получаем центр
        self.sel_offset = (cx - e.x, cy - e.y) # сохраняем смещение
        b.vx = 0.0 # обнуляем скорость x
        b.vy = 0.0 # обнуляем скорость y
        self.mouse_hist = [(time.time(), e.x, e.y)] # записываем начало

        self.canvas.tag_raise(b.id) # поднимаем фигуру
        if b.kind == "magnet": # если это магнит
            self.canvas.tag_raise(b.ring) # поднимаем поле

    def on_drag(self, e): # обработка перетаскивания
        if not self.selected: # если ничего не выбрано
            return # выходим
        cx = e.x + self.sel_offset[0] # считаем центр x
        cy = e.y + self.sel_offset[1] # считаем центр y
        cx = clamp(cx, 30, self.cw - 30) # ограничиваем x
        cy = clamp(cy, 30, self.ch - 30) # ограничиваем y
        self.selected.move_to(cx, cy) # двигаем объект
        self.mouse_hist.append((time.time(), e.x, e.y)) # добавляем точку
        if len(self.mouse_hist) > 6: # если точек слишком много
            self.mouse_hist.pop(0) # удаляем старую

    def on_release(self, e): # обработка отпускания
        if not self.selected: # если ничего не выбрано
            return # выходим
        vx = vy = 0.0 # готовим скорости
        if len(self.mouse_hist) >= 2: # если есть история
            t0, x0, y0 = self.mouse_hist[0] # берём первую точку
            t1, x1, y1 = self.mouse_hist[-1] # берём последнюю точку
            dt = max(0.001, t1 - t0) # считаем время
            vx = (x1 - x0) / dt # скорость мыши x
            vy = (y1 - y0) / dt # скорость мыши y
        self.selected.vx = clamp(vx * 0.05, -50, 50) # задаём бросок x
        self.selected.vy = clamp(vy * 0.05, -50, 50) # задаём бросок y
        self.selected = None # снимаем выбор
        self.mouse_hist.clear() # чистим историю

    def apply_gravity(self, b, dt): # применяем гравитацию
        if not self.gravity_on.get(): # если выключено
            return # выходим
        g = 1200.0 # сила гравитации
        b.vy += (g * dt) / max(b.mass, 1e-6) # ускоряем вниз

    def apply_magnets(self, b, dt): # применяем магнит
        if b.kind == "magnet": # если сам магнит
            return # пропускаем
        mode = self.magnet_mode.get() # читаем режим
        sign = 1.0 if mode == "attract" else -1.0 # выбираем знак
        bx, by = b.center() # центр тела
        for m in self.magnets: # перебираем магниты
            mx, my = m.center() # центр магнита
            dx = mx - bx # разница x
            dy = my - by # разница y
            d = vec_len(dx, dy) # расстояние
            if d < 1e-6 or d > m.radius: # проверяем радиус
                continue # пропускаем
            nx = dx / d # нормаль x
            ny = dy / d # нормаль y
            k = (1.0 - d / m.radius) # коэффициент близости
            a = sign * (m.strength * k) / max(b.mass, 1e-6) # ускорение
            a = clamp(a, -2200, 2200) # ограничиваем ускорение
            b.vx += nx * a * dt # добавляем скорость x
            b.vy += ny * a * dt # добавляем скорость y

    def apply_glue(self, b): # применяем липкость
        if b.kind == "magnet": # если магнит
            return # пропускаем
        cx, cy = b.center() # берём центр тела
        for gz in self.glues: # перебираем зоны
            if gz.contains_point(cx, cy): # если в зоне
                b.vx *= gz.viscosity # тормозим x
                b.vy *= gz.viscosity # тормозим y

    def resolve_circle_circle(self, a: Ball, b: Ball): # столкновение кругов
        ax, ay = a.center() # центр первого
        bx, by = b.center() # центр второго
        dx = bx - ax # разница x
        dy = by - ay # разница y
        dist = vec_len(dx, dy) # расстояние
        min_dist = a.r + b.r # сумма радиусов
        if dist <= 1e-6 or dist >= min_dist: # если нет пересечения
            return False # возвращаем ложь
        nx = dx / dist # нормаль x
        ny = dy / dist # нормаль y
        overlap = min_dist - dist # глубина проникновения

        a.move_to(ax - nx * overlap * 0.5, ay - ny * overlap * 0.5) # раздвигаем первый
        b.move_to(bx + nx * overlap * 0.5, by + ny * overlap * 0.5) # раздвигаем второй

        rvx = b.vx - a.vx # относительная скорость x
        rvy = b.vy - a.vy # относительная скорость y
        vel_along_normal = rvx * nx + rvy * ny # скорость вдоль нормали
        if vel_along_normal > 0: # если расходятся
            return True # считаем обработанным

        e = min(a.restitution, b.restitution) # берём упругость
        j = -(1 + e) * vel_along_normal # импульс
        inv_ma = 1.0 / max(a.mass, 1e-6) # обратная масса a
        inv_mb = 1.0 / max(b.mass, 1e-6) # обратная масса b
        j /= (inv_ma + inv_mb) # делим по массам

        ix = j * nx # импульс x
        iy = j * ny # импульс y
        a.vx -= ix * inv_ma # меняем скорость a x
        a.vy -= iy * inv_ma # меняем скорость a y
        b.vx += ix * inv_mb # меняем скорость b x
        b.vy += iy * inv_mb # меняем скорость b y
        return True # возвращаем успех

    def resolve_bbox_bbox(self, a: Body, b: Body): # столкновение bbox
        ba = a.bbox() # bbox объекта a
        bb = b.bbox() # bbox объекта b
        if not ba or not bb or not bbox_intersect(ba, bb): # проверяем пересечение
            return False # если нет пересечения

        ax0, ay0, ax1, ay1 = ba # распаковываем a
        bx0, by0, bx1, by1 = bb # распаковываем b

        overlap_x1 = ax1 - bx0 # перекрытие справа
        overlap_x2 = bx1 - ax0 # перекрытие слева
        overlap_y1 = ay1 - by0 # перекрытие снизу
        overlap_y2 = by1 - ay0 # перекрытие сверху

        min_ox = min(overlap_x1, overlap_x2) # минимальное по x
        min_oy = min(overlap_y1, overlap_y2) # минимальное по y

        acx, acy = a.center() # центр a
        bcx, bcy = b.center() # центр b

        if min_ox < min_oy: # если проще раздвинуть по x
            sep = min_ox # величина раздвига
            direction = -1 if acx < bcx else 1 # направление
            dx = direction * sep # сдвиг x
            a.move_to(acx + dx * 0.5, acy) # двигаем a
            b.move_to(bcx - dx * 0.5, bcy) # двигаем b
            e = min(a.restitution, b.restitution) # берём упругость
            a.vx, b.vx = -a.vx * e, -b.vx * e # отражаем скорости x
        else: # иначе раздвигаем по y
            sep = min_oy # величина раздвига
            direction = -1 if acy < bcy else 1 # направление
            dy = direction * sep # сдвиг y
            a.move_to(acx, acy + dy * 0.5) # двигаем a
            b.move_to(bcx, bcy - dy * 0.5) # двигаем b
            e = min(a.restitution, b.restitution) # берём упругость
            a.vy, b.vy = -a.vy * e, -b.vy * e # отражаем скорости y

        return True # возвращаем успех

    def resolve_collisions(self): # обрабатываем столкновения
        n = len(self.bodies) # количество тел
        for i in range(n): # цикл по i
            for j in range(i + 1, n): # цикл по j
                a = self.bodies[i] # берём тело a
                b = self.bodies[j] # берём тело b
                if a.kind == "magnet" and b.kind == "magnet": # два магнита
                    continue # пропускаем
                if isinstance(a, Ball) and isinstance(b, Ball): # если два шара
                    self.resolve_circle_circle(a, b) # считаем круги
                else: # иначе используем bbox
                    self.resolve_bbox_bbox(a, b) # считаем bbox

    def update(self): # главный цикл
        now = time.time() # текущее время
        dt = now - self.last_t # прошедшее время
        self.last_t = now # обновляем время
        dt = clamp(dt, 0.0, 0.033) # ограничиваем dt

        for b in self.bodies: # перебираем тела
            if b is self.selected: # если перетаскиваем
                continue # пропускаем физику
            self.apply_gravity(b, dt) # применяем гравитацию
            self.apply_magnets(b, dt) # применяем магнит
            self.apply_glue(b) # применяем липкость

        for b in self.bodies: # перебираем тела
            if b is self.selected: # если перетаскиваем
                continue # пропускаем движение
            b.step(dt) # двигаем тело
            b.keep_in_bounds() # проверяем границы

        for _ in range(2): # повторяем для стабильности
            self.resolve_collisions() # считаем столкновения
            for b in self.bodies: # перебираем тела
                if b is self.selected: # если перетаскиваем
                    continue # пропускаем
                b.keep_in_bounds() # ещё раз границы

        self.root.after(FPS_MS, self.update) # планируем следующий кадр

if __name__ == "__main__": # точка входа
    random.seed() # инициализируем случайность
    root = tk.Tk() # создаём окно
    app = App(root) # создаём приложение
    for _ in range(3): # добавляем шары
        app.add_ball() # создаём шар
    for _ in range(2): # добавляем блоки
        app.add_box() # создаём блок
    app.add_triangle() # создаём треугольник
    app.add_pentagon() # создаём пятиугольник
    app.add_magnet() # создаём магнит
    app.add_glue() # создаём липкую зону
    root.mainloop() # запускаем цикл tkinter
