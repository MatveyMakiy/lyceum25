import tkinter as tk # импорт библиотеки для создания графического интерфейса
from tkinter import filedialog, messagebox, ttk # импорт диалоговых окон, уведомлений и виджетов
import random # импорт модуля для генерации случайных чисел

DEFAULT_CELL_SIZE = 15 # стандартный размер одной клетки в пикселях
DEFAULT_GRID_WIDTH = 50 # стандартная ширина игрового поля в клетках
DEFAULT_GRID_HEIGHT = 40 # стандартная высота игрового поля в клетках
BG_COLOR = 'white' # цвет фона игрового поля
GRID_COLOR = 'lightgray' # цвет линий сетки
CELL_COLOR = 'black' # цвет живой клетки

class GameOfLife: # объявление класса игры "Жизнь"
    def __init__(self, root): # конструктор класса, инициализация
        self.root = root # сохранение ссылки на главное окно
        self.root.title("Игра 'Жизнь'") # установка заголовка окна
        
        self.cell_size = DEFAULT_CELL_SIZE # текущий размер клетки
        self.grid_width = DEFAULT_GRID_WIDTH # текущая ширина поля
        self.grid_height = DEFAULT_GRID_HEIGHT # текущая высота поля
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)] # создание пустого игрового поля
        self.is_running = False # флаг запуска симуляции
        self.speed = 100 # скорость симуляции в миллисекундах
        
        self.size_frame = tk.Frame(root) # создание фрейма для выбора размера
        self.size_frame.pack(pady=5) # размещение фрейма с отступом
        
        tk.Label(self.size_frame, text="Размер поля:").pack(side=tk.LEFT, padx=5) # создание надписи
        
        self.size_var = tk.StringVar(value="50x40") # переменная для хранения выбранного размера
        size_options = ["30x25", "40x30", "50x40", "60x50", "70x60"] # доступные размеры поля
        size_menu = ttk.Combobox(self.size_frame, textvariable=self.size_var, 
                                values=size_options, width=10, state="readonly") # выпадающий список
        size_menu.pack(side=tk.LEFT, padx=5) # размещение списка
        size_menu.bind("<<ComboboxSelected>>", self.change_grid_size) # привязка события выбора
        
        tk.Button(self.size_frame, text="Применить", command=self.apply_grid_size).pack(side=tk.LEFT, padx=5) # кнопка применения
        
        self.mode_frame = tk.Frame(root) # создание фрейма для выбора режима
        self.mode_frame.pack(pady=5) # размещение фрейма
        
        self.mode = tk.IntVar(value=0) # переменная для хранения выбранного режима
        
        tk.Radiobutton(self.mode_frame, text="Рисовать мышкой", variable=self.mode, value=0, 
                      command=self.change_mode).pack(side=tk.LEFT, padx=5) # переключатель режима рисования
        tk.Radiobutton(self.mode_frame, text="Случайно", variable=self.mode, value=1, 
                      command=self.change_mode).pack(side=tk.LEFT, padx=5) # переключатель случайного заполнения
        tk.Radiobutton(self.mode_frame, text="Из файла", variable=self.mode, value=2, 
                      command=self.change_mode).pack(side=tk.LEFT, padx=5) # переключатель загрузки из файла
        
        self.canvas_frame = tk.Frame(root) # создание фрейма для холста
        self.canvas_frame.pack() # размещение фрейма
        
        self.canvas = tk.Canvas(self.canvas_frame, 
                                width=self.cell_size * self.grid_width, 
                                height=self.cell_size * self.grid_height,
                                bg=BG_COLOR) # создание холста для отрисовки поля
        self.canvas.pack() # размещение холста
        
        self.canvas.bind("<Button-1>", self.canvas_click) # привязка события клика мыши
        self.canvas.bind("<B1-Motion>", self.canvas_drag) # привязка события перетаскивания мыши
        
        self.control_frame = tk.Frame(root) # создание фрейма для кнопок управления
        self.control_frame.pack(pady=5) # размещение фрейма
        
        tk.Button(self.control_frame, text="Очистить", command=self.clear_grid, width=10).pack(side=tk.LEFT, padx=2) # кнопка очистки
        tk.Button(self.control_frame, text="Шаг", command=self.step, width=10).pack(side=tk.LEFT, padx=2) # кнопка одного шага
        tk.Button(self.control_frame, text="Старт", command=self.start_game, width=10).pack(side=tk.LEFT, padx=2) # кнопка запуска
        tk.Button(self.control_frame, text="Стоп", command=self.stop_game, width=10).pack(side=tk.LEFT, padx=2) # кнопка остановки
        
        self.special_frame = tk.Frame(root) # создание фрейма для специальных кнопок
        self.special_frame.pack(pady=5) # размещение фрейма
        
        self.random_buttons = tk.Frame(self.special_frame) # создание фрейма для кнопок случайного заполнения
        tk.Button(self.random_buttons, text="30% заполнить", command=lambda: self.random_fill(0.3)).pack(side=tk.LEFT, padx=2) # кнопка 30%
        tk.Button(self.random_buttons, text="50% заполнить", command=lambda: self.random_fill(0.5)).pack(side=tk.LEFT, padx=2) # кнопка 50%
        tk.Button(self.random_buttons, text="70% заполнить", command=lambda: self.random_fill(0.7)).pack(side=tk.LEFT, padx=2) # кнопка 70%
        
        self.file_buttons = tk.Frame(self.special_frame) # создание фрейма для кнопок работы с файлами
        tk.Button(self.file_buttons, text="Выбрать файл", command=self.load_from_file).pack(side=tk.LEFT, padx=2) # кнопка загрузки
        tk.Button(self.file_buttons, text="Сохранить в файл", command=self.save_to_file).pack(side=tk.LEFT, padx=2) # кнопка сохранения
        
        self.speed_frame = tk.Frame(root) # создание фрейма для управления скоростью
        self.speed_frame.pack(pady=5) # размещение фрейма
        
        tk.Label(self.speed_frame, text="Медленно").pack(side=tk.LEFT, padx=5) # надпись "Медленно"
        self.speed_scale = tk.Scale(self.speed_frame, from_=500, to=10, orient=tk.HORIZONTAL, 
                                   length=200, command=self.change_speed) # создание шкалы скорости
        self.speed_scale.set(self.speed) # установка начального значения
        self.speed_scale.pack(side=tk.LEFT, padx=5) # размещение шкалы
        tk.Label(self.speed_frame, text="Быстро").pack(side=tk.LEFT, padx=5) # надпись "Быстро"
        
        self.info_label = tk.Label(root, text="Режим: Рисование мышкой. Кликни на поле чтобы рисовать клетки.") # создание информационной метки
        self.info_label.pack(pady=5) # размещение метки
        
        self.draw_grid() # отрисовка сетки
        self.change_mode() # инициализация режима работы
    
    def change_grid_size(self, event=None): # метод обработки изменения размера из выпадающего списка
        pass # заглушка для обработки события выбора размера
    
    def apply_grid_size(self): # метод применения выбранного размера поля
        size_str = self.size_var.get() # получение выбранного размера
        if size_str == "30x25": # обработка размера 30x25
            self.grid_width, self.grid_height = 30, 25 # установка размеров
            self.cell_size = 20 # установка размера клетки
        elif size_str == "40x30": # обработка размера 40x30
            self.grid_width, self.grid_height = 40, 30 # установка размеров
            self.cell_size = 18 # установка размера клетки
        elif size_str == "50x40": # обработка размера 50x40
            self.grid_width, self.grid_height = 50, 40 # установка размеров
            self.cell_size = 15 # установка размера клетки
        elif size_str == "60x50": # обработка размера 60x50
            self.grid_width, self.grid_height = 60, 50 # установка размеров
            self.cell_size = 13 # установка размера клетки
        elif size_str == "70x60": # обработка размера 70x60
            self.grid_width, self.grid_height = 70, 60 # установка размеров
            self.cell_size = 11 # установка размера клетки
        
        self.stop_game() # остановка симуляции при изменении размера
        
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)] # создание нового пустого поля
        
        self.canvas.config(width=self.cell_size * self.grid_width, 
                          height=self.cell_size * self.grid_height) # изменение размеров холста
        
        self.redraw_cells() # перерисовка клеток
        self.info_label.config(text=f"Установлен размер поля: {self.grid_width}x{self.grid_height}") # обновление информации
    
    def change_mode(self): # метод изменения режима работы
        mode = self.mode.get() # получение выбранного режима
        self.clear_special_frames() # скрытие специальных фреймов
        
        if mode == 0: # режим рисования мышкой
            self.info_label.config(text="Режим: Рисование мышкой. Кликни или зажми мышь чтобы рисовать клетки.") # обновление информации
            self.canvas.bind("<Button-1>", self.canvas_click) # привязка события клика
            self.canvas.bind("<B1-Motion>", self.canvas_drag) # привязка события перетаскивания
        elif mode == 1: # режим случайного заполнения
            self.info_label.config(text="Режим: Случайное заполнение. Нажми кнопку чтобы заполнить поле.") # обновление информации
            self.random_buttons.pack() # отображение кнопок случайного заполнения
            self.canvas.unbind("<B1-Motion>") # отвязка события перетаскивания
        elif mode == 2: # режим работы с файлами
            self.info_label.config(text="Режим: Загрузка из файла. Нажми 'Выбрать файл' для загрузки.") # обновление информации
            self.file_buttons.pack() # отображение кнопок работы с файлами
            self.canvas.unbind("<B1-Motion>") # отвязка события перетаскивания
    
    def clear_special_frames(self): # метод скрытия специальных фреймов
        self.random_buttons.pack_forget() # скрытие кнопок случайного заполнения
        self.file_buttons.pack_forget() # скрытие кнопок работы с файлами
    
    def draw_grid(self): # метод отрисовки сетки игрового поля
        for i in range(self.grid_height): # перебор всех строк
            for j in range(self.grid_width): # перебор всех столбцов
                x1 = j * self.cell_size # вычисление левой координаты
                y1 = i * self.cell_size # вычисление верхней координаты
                x2 = x1 + self.cell_size # вычисление правой координаты
                y2 = y1 + self.cell_size # вычисление нижней координаты
                self.canvas.create_rectangle(x1, y1, x2, y2, outline=GRID_COLOR, fill=BG_COLOR) # рисование клетки сетки
    
    def redraw_cells(self): # метод перерисовки всех клеток
        self.canvas.delete("all") # очистка холста
        self.draw_grid() # перерисовка сетки
        
        for i in range(self.grid_height): # перебор всех строк
            for j in range(self.grid_width): # перебор всех столбцов
                if self.grid[i][j] == 1: # если клетка живая
                    x1 = j * self.cell_size # вычисление левой координаты
                    y1 = i * self.cell_size # вычисление верхней координаты
                    x2 = x1 + self.cell_size # вычисление правой координаты
                    y2 = y1 + self.cell_size # вычисление нижней координаты
                    self.canvas.create_rectangle(x1, y1, x2, y2, fill=CELL_COLOR, outline=GRID_COLOR) # рисование живой клетки
    
    def canvas_click(self, event): # обработчик клика мыши по холсту
        if self.mode.get() == 0: # только в режиме рисования
            col = event.x // self.cell_size # вычисление столбца клика
            row = event.y // self.cell_size # вычисление строки клика
            
            if 0 <= col < self.grid_width and 0 <= row < self.grid_height: # проверка границ
                self.grid[row][col] = 1 if self.grid[row][col] == 0 else 0 # изменение состояния клетки
                self.redraw_cells() # перерисовка поля
    
    def canvas_drag(self, event): # обработчик перетаскивания мыши по холсту
        if self.mode.get() == 0: # только в режиме рисования
            col = event.x // self.cell_size # вычисление столбца перетаскивания
            row = event.y // self.cell_size # вычисление строки перетаскивания
            
            if 0 <= col < self.grid_width and 0 <= row < self.grid_height: # проверка границ
                self.grid[row][col] = 1 # установка клетки как живой
                self.redraw_cells() # перерисовка поля
    
    def random_fill(self, density): # метод случайного заполнения поля
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)] # очистка поля
        for i in range(self.grid_height): # перебор всех строк
            for j in range(self.grid_width): # перебор всех столбцов
                if random.random() < density: # случайное заполнение
                    self.grid[i][j] = 1 # установка клетки как живой
        
        self.redraw_cells() # перерисовка поля
        self.info_label.config(text=f"Случайно заполнено {density*100:.0f}% клеток") # обновление информации
    
    def load_from_file(self): # метод загрузки конфигурации из файла
        file_path = filedialog.askopenfilename(
            title="Выберите файл с начальной конфигурацией",
            filetypes=[("Текстовые файлы", "*.txt"), ("Все файлы", "*.*")]
        ) # открытие диалога выбора файла
        
        if not file_path: # если файл не выбран
            return
        
        try:
            with open(file_path, 'r') as f: # открытие файла
                lines = f.readlines() # чтение всех строк
            
            self.stop_game() # остановка симуляции
            self.clear_grid() # очистка поля
            
            for i, line in enumerate(lines): # перебор строк файла
                if i >= self.grid_height: # проверка границ по высоте
                    break
                line = line.strip() # удаление пробелов
                for j, char in enumerate(line): # перебор символов строки
                    if j >= self.grid_width: # проверка границ по ширине
                        break
                    if char in ['1', 'X', '#', '*']: # если символ обозначает живую клетку
                        self.grid[i][j] = 1 # установка клетки как живой
            
            self.redraw_cells() # перерисовка поля
            self.info_label.config(text=f"Загружено из файла: {file_path}") # обновление информации
            
        except Exception as e: # обработка исключений
            messagebox.showerror("Ошибка", f"Не удалось загрузить файл: {e}") # вывод сообщения об ошибке
    
    def save_to_file(self): # метод сохранения конфигурации в файл
        file_path = filedialog.asksaveasfilename(
            title="Сохранить поле в файл",
            defaultextension=".txt",
            filetypes=[("Текстовые файлы", "*.txt"), ("Все файлы", "*.*")]
        ) # открытие диалога сохранения файла
        
        if not file_path: # если файл не выбран
            return
        
        try:
            with open(file_path, 'w') as f: # открытие файла для записи
                for i in range(self.grid_height): # перебор всех строк
                    for j in range(self.grid_width): # перебор всех столбцов
                        f.write('1' if self.grid[i][j] == 1 else '0') # запись состояния клетки
                    f.write('\n') # перевод строки
            
            self.info_label.config(text=f"Сохранено в файл: {file_path}") # обновление информации
            
        except Exception as e: # обработка исключений
            messagebox.showerror("Ошибка", f"Не удалось сохранить файл: {e}") # вывод сообщения об ошибке
    
    def clear_grid(self): # метод очистки игрового поля
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)] # создание пустого поля
        self.redraw_cells() # перерисовка поля
    
    def count_neighbors(self, row, col): # метод подсчета живых соседей клетки
        count = 0 # счетчик соседей
        for i in range(-1, 2): # перебор соседних строк (-1, 0, 1)
            for j in range(-1, 2): # перебор соседних столбцов (-1, 0, 1)
                if i == 0 and j == 0: # пропуск текущей клетки
                    continue
                r = (row + i) % self.grid_height # вычисление индекса с учетом границ
                c = (col + j) % self.grid_width # вычисление индекса с учетом границ
                count += self.grid[r][c] # добавление состояния соседней клетки
        return count # возврат количества соседей
    
    def step(self): # метод выполнения одного шага игры
        new_grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)] # создание нового поля
        
        for i in range(self.grid_height): # перебор всех строк
            for j in range(self.grid_width): # перебор всех столбцов
                neighbors = self.count_neighbors(i, j) # подсчет соседей
                
                if self.grid[i][j] == 1: # если клетка живая
                    if neighbors == 2 or neighbors == 3: # условия выживания
                        new_grid[i][j] = 1 # клетка остается живой
                else: # если клетка мертвая
                    if neighbors == 3: # условие рождения
                        new_grid[i][j] = 1 # клетка становится живой
        
        if new_grid == self.grid: # если состояние не изменилось
            self.info_label.config(text="Игра завершена: состояние стабилизировалось") # обновление информации
            self.stop_game() # остановка симуляции
        else: # если состояние изменилось
            self.grid = new_grid # обновление поля
            self.redraw_cells() # перерисовка поля
            self.info_label.config(text="Сделан один шаг игры") # обновление информации
    
    def game_loop(self): # метод игрового цикла
        if self.is_running: # если симуляция запущена
            self.step() # выполнение одного шага
            self.root.after(self.speed, self.game_loop) # планирование следующего шага
    
    def start_game(self): # метод запуска игры
        if not self.is_running: # если симуляция не запущена
            self.is_running = True # установка флага запуска
            self.info_label.config(text="Игра запущена (нажми 'Стоп' для остановки)") # обновление информации
            self.game_loop() # запуск игрового цикла
    
    def stop_game(self): # метод остановки игры
        self.is_running = False # сброс флага запуска
        self.info_label.config(text="Игра остановлена") # обновление информации
    
    def change_speed(self, value): # метод изменения скорости симуляции
        self.speed = int(value) # обновление скорости симуляции

if __name__ == "__main__": # проверка, что скрипт запущен напрямую
    root = tk.Tk() # создание главного окна
    game = GameOfLife(root) # создание экземпляра игры
    root.mainloop() # запуск главного цикла обработки событий