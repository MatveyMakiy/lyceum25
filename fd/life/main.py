import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import random

DEFAULT_CELL_SIZE = 15
DEFAULT_GRID_WIDTH = 50
DEFAULT_GRID_HEIGHT = 40
BG_COLOR = 'white'
GRID_COLOR = 'lightgray'
CELL_COLOR = 'black'

class GameOfLife:
    def __init__(self, root):
        self.root = root
        self.root.title("Игра 'Жизнь'")
        
        self.cell_size = DEFAULT_CELL_SIZE
        self.grid_width = DEFAULT_GRID_WIDTH
        self.grid_height = DEFAULT_GRID_HEIGHT
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)]
        self.is_running = False
        self.speed = 100
        
        self.size_frame = tk.Frame(root)
        self.size_frame.pack(pady=5)
        
        tk.Label(self.size_frame, text="Размер поля:").pack(side=tk.LEFT, padx=5)
        
        self.size_var = tk.StringVar(value="50x40")
        size_options = ["30x25", "40x30", "50x40", "60x50", "70x60"]
        size_menu = ttk.Combobox(self.size_frame, textvariable=self.size_var, 
                                values=size_options, width=10, state="readonly")
        size_menu.pack(side=tk.LEFT, padx=5)
        size_menu.bind("<<ComboboxSelected>>", self.change_grid_size)
        
        tk.Button(self.size_frame, text="Применить", command=self.apply_grid_size).pack(side=tk.LEFT, padx=5)
        
        self.mode_frame = tk.Frame(root)
        self.mode_frame.pack(pady=5)
        
        self.mode = tk.IntVar(value=0)
        
        tk.Radiobutton(self.mode_frame, text="Рисовать мышкой", variable=self.mode, value=0, 
                      command=self.change_mode).pack(side=tk.LEFT, padx=5)
        tk.Radiobutton(self.mode_frame, text="Случайно", variable=self.mode, value=1, 
                      command=self.change_mode).pack(side=tk.LEFT, padx=5)
        tk.Radiobutton(self.mode_frame, text="Из файла", variable=self.mode, value=2, 
                      command=self.change_mode).pack(side=tk.LEFT, padx=5)
        
        self.canvas_frame = tk.Frame(root)
        self.canvas_frame.pack()
        
        self.canvas = tk.Canvas(self.canvas_frame, 
                                width=self.cell_size * self.grid_width, 
                                height=self.cell_size * self.grid_height,
                                bg=BG_COLOR)
        self.canvas.pack()
        
        self.canvas.bind("<Button-1>", self.canvas_click)
        self.canvas.bind("<B1-Motion>", self.canvas_drag)
        
        self.control_frame = tk.Frame(root)
        self.control_frame.pack(pady=5)
        
        tk.Button(self.control_frame, text="Очистить", command=self.clear_grid, width=10).pack(side=tk.LEFT, padx=2)
        tk.Button(self.control_frame, text="Шаг", command=self.step, width=10).pack(side=tk.LEFT, padx=2)
        tk.Button(self.control_frame, text="Старт", command=self.start_game, width=10).pack(side=tk.LEFT, padx=2)
        tk.Button(self.control_frame, text="Стоп", command=self.stop_game, width=10).pack(side=tk.LEFT, padx=2)
        
        self.special_frame = tk.Frame(root)
        self.special_frame.pack(pady=5)
        
        self.random_buttons = tk.Frame(self.special_frame)
        tk.Button(self.random_buttons, text="30% заполнить", command=lambda: self.random_fill(0.3)).pack(side=tk.LEFT, padx=2)
        tk.Button(self.random_buttons, text="50% заполнить", command=lambda: self.random_fill(0.5)).pack(side=tk.LEFT, padx=2)
        tk.Button(self.random_buttons, text="70% заполнить", command=lambda: self.random_fill(0.7)).pack(side=tk.LEFT, padx=2)
        
        # Кнопки для файлов
        self.file_buttons = tk.Frame(self.special_frame)
        tk.Button(self.file_buttons, text="Выбрать файл", command=self.load_from_file).pack(side=tk.LEFT, padx=2)
        tk.Button(self.file_buttons, text="Сохранить в файл", command=self.save_to_file).pack(side=tk.LEFT, padx=2)
        
        self.speed_frame = tk.Frame(root)
        self.speed_frame.pack(pady=5)
        
        tk.Label(self.speed_frame, text="Медленно").pack(side=tk.LEFT, padx=5)
        self.speed_scale = tk.Scale(self.speed_frame, from_=500, to=10, orient=tk.HORIZONTAL, 
                                   length=200, command=self.change_speed)
        self.speed_scale.set(self.speed)
        self.speed_scale.pack(side=tk.LEFT, padx=5)
        tk.Label(self.speed_frame, text="Быстро").pack(side=tk.LEFT, padx=5)
        
        self.info_label = tk.Label(root, text="Режим: Рисование мышкой. Кликни на поле чтобы рисовать клетки.")
        self.info_label.pack(pady=5)
        
        self.draw_grid()
        self.change_mode()
    
    def change_grid_size(self, event=None):
        pass
    
    def apply_grid_size(self):
        size_str = self.size_var.get()
        if size_str == "30x25":
            self.grid_width, self.grid_height = 30, 25
            self.cell_size = 20
        elif size_str == "40x30":
            self.grid_width, self.grid_height = 40, 30
            self.cell_size = 18
        elif size_str == "50x40":
            self.grid_width, self.grid_height = 50, 40
            self.cell_size = 15
        elif size_str == "60x50":
            self.grid_width, self.grid_height = 60, 50
            self.cell_size = 13
        elif size_str == "70x60":
            self.grid_width, self.grid_height = 70, 60
            self.cell_size = 11
        
        self.stop_game()
        
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)]
        
        self.canvas.config(width=self.cell_size * self.grid_width, 
                          height=self.cell_size * self.grid_height)
        
        self.redraw_cells()
        self.info_label.config(text=f"Установлен размер поля: {self.grid_width}x{self.grid_height}")
    
    def change_mode(self):
        mode = self.mode.get()
        self.clear_special_frames()
        
        if mode == 0:
            self.info_label.config(text="Режим: Рисование мышкой. Кликни или зажми мышь чтобы рисовать клетки.")
            self.canvas.bind("<Button-1>", self.canvas_click)
            self.canvas.bind("<B1-Motion>", self.canvas_drag)
        elif mode == 1:
            self.info_label.config(text="Режим: Случайное заполнение. Нажми кнопку чтобы заполнить поле.")
            self.random_buttons.pack()
            self.canvas.unbind("<B1-Motion>")
        elif mode == 2:
            self.info_label.config(text="Режим: Загрузка из файла. Нажми 'Выбрать файл' для загрузки.")
            self.file_buttons.pack()
            self.canvas.unbind("<B1-Motion>")
    
    def clear_special_frames(self):
        self.random_buttons.pack_forget()
        self.file_buttons.pack_forget()
    
    def draw_grid(self):
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                x1 = j * self.cell_size
                y1 = i * self.cell_size
                x2 = x1 + self.cell_size
                y2 = y1 + self.cell_size
                self.canvas.create_rectangle(x1, y1, x2, y2, outline=GRID_COLOR, fill=BG_COLOR)
    
    def redraw_cells(self):
        self.canvas.delete("all")
        self.draw_grid()
        
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                if self.grid[i][j] == 1:
                    x1 = j * self.cell_size
                    y1 = i * self.cell_size
                    x2 = x1 + self.cell_size
                    y2 = y1 + self.cell_size
                    self.canvas.create_rectangle(x1, y1, x2, y2, fill=CELL_COLOR, outline=GRID_COLOR)
    
    def canvas_click(self, event):
        if self.mode.get() == 0:
            col = event.x // self.cell_size
            row = event.y // self.cell_size
            
            if 0 <= col < self.grid_width and 0 <= row < self.grid_height:
                self.grid[row][col] = 1 if self.grid[row][col] == 0 else 0
                self.redraw_cells()
    
    def canvas_drag(self, event):
        if self.mode.get() == 0:
            col = event.x // self.cell_size
            row = event.y // self.cell_size
            
            if 0 <= col < self.grid_width and 0 <= row < self.grid_height:
                self.grid[row][col] = 1
                self.redraw_cells()
    
    def random_fill(self, density):
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)]
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                if random.random() < density:
                    self.grid[i][j] = 1
        
        self.redraw_cells()
        self.info_label.config(text=f"Случайно заполнено {density*100:.0f}% клеток")
    
    def load_from_file(self):
        file_path = filedialog.askopenfilename(
            title="Выберите файл с начальной конфигурацией",
            filetypes=[("Текстовые файлы", "*.txt"), ("Все файлы", "*.*")]
        )
        
        if not file_path:
            return
        
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            self.stop_game()
            self.clear_grid()
            
            for i, line in enumerate(lines):
                if i >= self.grid_height:
                    break
                line = line.strip()
                for j, char in enumerate(line):
                    if j >= self.grid_width:
                        break
                    if char in ['1', 'X', '#', '*']:
                        self.grid[i][j] = 1
            
            self.redraw_cells()
            self.info_label.config(text=f"Загружено из файла: {file_path}")
            
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось загрузить файл: {e}")
    
    def save_to_file(self):
        file_path = filedialog.asksaveasfilename(
            title="Сохранить поле в файл",
            defaultextension=".txt",
            filetypes=[("Текстовые файлы", "*.txt"), ("Все файлы", "*.*")]
        )
        
        if not file_path:
            return
        
        try:
            with open(file_path, 'w') as f:
                for i in range(self.grid_height):
                    for j in range(self.grid_width):
                        f.write('1' if self.grid[i][j] == 1 else '0')
                    f.write('\n')
            
            self.info_label.config(text=f"Сохранено в файл: {file_path}")
            
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось сохранить файл: {e}")
    
    def clear_grid(self):
        self.grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)]
        self.redraw_cells()
    
    def count_neighbors(self, row, col):
        count = 0
        for i in range(-1, 2):
            for j in range(-1, 2):
                if i == 0 and j == 0:
                    continue
                r = (row + i) % self.grid_height
                c = (col + j) % self.grid_width
                count += self.grid[r][c]
        return count
    
    def step(self):
        new_grid = [[0 for _ in range(self.grid_width)] for _ in range(self.grid_height)]
        
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                neighbors = self.count_neighbors(i, j)
                
                if self.grid[i][j] == 1:  # Живая клетка
                    if neighbors == 2 or neighbors == 3:
                        new_grid[i][j] = 1
                else:  # Мёртвая клетка
                    if neighbors == 3:
                        new_grid[i][j] = 1
        
        if new_grid == self.grid:
            self.info_label.config(text="Игра завершена: состояние стабилизировалось")
            self.stop_game()
        else:
            self.grid = new_grid
            self.redraw_cells()
            self.info_label.config(text="Сделан один шаг игры")
    
    def game_loop(self):
        if self.is_running:
            self.step()
            self.root.after(self.speed, self.game_loop)
    
    def start_game(self):
        if not self.is_running:
            self.is_running = True
            self.info_label.config(text="Игра запущена (нажми 'Стоп' для остановки)")
            self.game_loop()
    
    def stop_game(self):
        self.is_running = False
        self.info_label.config(text="Игра остановлена")
    
    def change_speed(self, value):
        self.speed = int(value)

if __name__ == "__main__":
    root = tk.Tk()
    game = GameOfLife(root)
    root.mainloop()