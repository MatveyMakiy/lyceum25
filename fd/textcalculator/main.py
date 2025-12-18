class TextCalc: # основной класс текстового калькулятора

    def __init__(self): # инициализация всех словарей и данных
        # словарь чисел от 0 до 19
        self.units = {
            'ноль': 0, 'один': 1, 'два': 2, 'три': 3, 'четыре': 4,
            'пять': 5, 'шесть': 6, 'семь': 7, 'восемь': 8, 'девять': 9,
            'десять': 10, 'одиннадцать': 11, 'двенадцать': 12, 'тринадцать': 13,
            'четырнадцать': 14, 'пятнадцать': 15, 'шестнадцать': 16,
            'семнадцать': 17, 'восемнадцать': 18, 'девятнадцать': 19
        }

        # словарь десятков: 20, 30, ..., 90
        self.tens = {
            'двадцать': 20, 'тридцать': 30, 'сорок': 40, 'пятьдесят': 50,
            'шестьдесят': 60, 'семьдесят': 70, 'восемьдесят': 80,
            'девяносто': 90
        }

        # общий словарь всех чисел (будет пополнен)
        self.all_numbers = {}
        self.all_numbers.update(self.units) # добавляем числа 0–19
        self.all_numbers.update(self.tens) # добавляем десятки 20, 30 и т.д.

        # генерация составных чисел: "двадцать один", "тридцать пять" и т.п.
        for ten_word, ten_value in self.tens.items(): # перебираем десятки
            for unit_word, unit_value in self.units.items(): # перебираем единицы
                if unit_value < 10: # исключаем "десять", "одиннадцать"...
                    compound_num = f"{ten_word} {unit_word}" # формируем строку вроде "двадцать три"
                    self.all_numbers[compound_num] = ten_value + unit_value # добавляем число 23

        # словарь операций: текст → (символ, приоритет)
        self.operations = {
            'плюс': ('+', 1), # сложение, приоритет 1
            'минус': ('-', 1), # вычитание, приоритет 1
            'умножить на': ('*', 2), # умножение, приоритет 2
            'поделить на': ('/', 2) # деление, приоритет 2
        } # завершение словаря операций

        # сортировка операций по длине (сначала длинные, чтобы не было конфликтов)
        self.operation_list = sorted(self.operations.keys(), key=len, reverse=True)


    def wordsToNumber(self, words): # преобразует текст в число
        words = words.strip().lower() # убираем пробелы и делаем строчными
        is_negative = False # флаг: отрицательное ли число
        if words.startswith('минус '): # проверяем, начинается ли с "минус "
            is_negative = True # устанавливаем флаг
            words = words[6:] # убираем первые 6 символов ("минус ")

        if words in self.all_numbers: # если слово есть в словаре
            result = self.all_numbers[words] # получаем значение
        else: # иначе пытаемся разбить на части
            parts = words.split() # разбиваем на слова
            if len(parts) == 2: # ожидаем два слова, например "двадцать три"
                num_key = f"{parts[0]} {parts[1]}" # объединяем в ключ
                if num_key in self.all_numbers: # если составное число существует
                    result = self.all_numbers[num_key] # получаем значение
                else: # если не найдено
                    raise ValueError(f"Некорректное число: '{words}'") # ошибка
            else: # если не два слова
                raise ValueError(f"Некорректное число: '{words}'") # ошибка

        if abs(result) > 99: # проверка диапазона
            raise ValueError(f"Число {result} вне допустимого диапазона (-99 до 99)") # только от -99 до 99

        return -result if is_negative else result # возвращаем отрицательное или положительное число


    def parseExpression(self, expression): # разбирает текст выражения на токены
        expression = expression.strip() # убираем пробелы по краям строки
        if not expression: # если выражение пустое
            raise ValueError("Пустое выражение") # выбрасываем ошибку

        tokens = [] # список токенов выражения
        words = expression.lower().split() # разбиваем выражение на слова
        i = 0 # индекс текущего слова

        while i < len(words): # основной цикл разбора выражения
            if words[i] == 'минус': # встретили слово "минус"
                if i == 0 or tokens[-1][0] == 'operation': # минус как знак отрицательного числа
                    if i + 1 >= len(words): # если после минуса нет слов
                        raise ValueError("После 'минус' ожидалось число") # ошибка

                    if i + 2 < len(words) and f"{words[i + 1]} {words[i + 2]}" in self.all_numbers: # проверяем составное число
                        number = self.wordsToNumber(f"минус {words[i + 1]} {words[i + 2]}") # преобразуем отрицательное число
                        tokens.append(('number', number)) # добавляем число в токены
                        i += 3 # пропускаем три слова
                    elif words[i + 1] in self.all_numbers: # проверяем простое число
                        number = self.wordsToNumber(f"минус {words[i + 1]}") # преобразуем отрицательное число
                        tokens.append(('number', number)) # добавляем число в токены
                        i += 2 # пропускаем два слова
                    else:
                        raise ValueError("Некорректное число после 'минус'") # ошибка некорректного числа
                else:
                    tokens.append(('operation', '-', 1)) # минус как операция вычитания
                    i += 1 # переходим к следующему слову

            elif i + 1 < len(words) and f"{words[i]} {words[i + 1]}" in self.all_numbers: # проверка составного положительного числа
                number = self.wordsToNumber(f"{words[i]} {words[i + 1]}") # преобразуем число
                tokens.append(('number', number)) # добавляем число в токены
                i += 2 # пропускаем два слова

            elif words[i] in self.all_numbers: # проверка простого положительного числа
                number = self.wordsToNumber(words[i]) # преобразуем число
                tokens.append(('number', number)) # добавляем число в токены
                i += 1 # переходим к следующему слову

            elif words[i] == 'умножить' and i + 1 < len(words) and words[i + 1] == 'на': # проверка операции умножения
                tokens.append(('operation', '*', 2)) # добавляем операцию умножения
                i += 2 # пропускаем два слова

            elif words[i] == 'поделить' and i + 1 < len(words) and words[i + 1] == 'на': # проверка операции деления
                tokens.append(('operation', '/', 2)) # добавляем операцию деления
                i += 2 # пропускаем два слова

            elif words[i] == 'плюс': # проверка операции сложения
                tokens.append(('operation', '+', 1)) # добавляем операцию сложения
                i += 1 # переходим к следующему слову

            else:
                raise ValueError(f"Некорректный элемент: '{words[i]}'") # ошибка неизвестного слова

        return tokens # возвращаем список токенов

    def calculate(self, tokens): # вычисляет результат по токенам
        if not tokens or tokens[0][0] != 'number': # проверка: должно начинаться с числа
            raise ValueError("Выражение должно начинаться с числа")
        if tokens[-1][0] != 'number': # проверка: должно заканчиваться числом
            raise ValueError("Выражение должно заканчиваться числом")
        for i, token in enumerate(tokens): # проверка структуры: число, операция, число...
            if i % 2 == 0: # на чётных позициях должны быть числа
                if token[0] != 'number': # если не число
                    raise ValueError("Некорректное выражение: ожидалось число")
            else: # на нечётных — операции
                if token[0] != 'operation': # если не операция
                    raise ValueError("Некорректное выражение: ожидалась операция")

        output = [] # выходная очередь (обратная польская запись)
        stack = [] # стек операций

        for token in tokens: # обход токенов
            if token[0] == 'number': # если токен — число
                output.append(token[1]) # добавляем в выход
            elif token[0] == 'operation': # если токен — операция
                op_symbol = token[1] # символ операции
                priority = token[2] # приоритет
                while stack and stack[-1][0] == 'operation' and stack[-1][2] >= priority: # выталкиваем операции с >= приоритетом
                    output.append(stack.pop()[1]) # перемещаем в выход
                stack.append(('operation', op_symbol, priority)) # добавляем текущую операцию

        while stack: # выталкиваем оставшиеся операции
            output.append(stack.pop()[1]) # добавляем в выход

        eval_stack = [] # стек для вычислений

        for item in output: # обход ОПЗ
            if isinstance(item, (int, float)): # если элемент — число
                eval_stack.append(item) # кладём в стек
            elif item in '+-*/': # если операция
                if len(eval_stack) < 2: # нужно минимум два числа
                    raise ValueError("Некорректное выражение")
                b = eval_stack.pop() # правый операнд
                a = eval_stack.pop() # левый операнд
                if item == '+': # сложение
                    result = a + b
                elif item == '-': # вычитание
                    result = a - b
                elif item == '*': # умножение
                    result = a * b
                elif item == '/': # деление
                    if b == 0: # деление на ноль
                        raise ValueError("Деление на ноль")
                    if a % b == 0: # если делится нацело
                        result = a // b # целочисленное деление
                    else: # иначе — дробное
                        result = a / b
                eval_stack.append(result) # кладём результат обратно

        if len(eval_stack) != 1: # в итоге должно остаться одно число
            raise ValueError("Ошибка вычисления")
        return eval_stack[0] # возвращаем результат


    def evaluate(self, expression): # основной метод: принимает строку, возвращает результат
        try: # обработка исключений
            if not expression or not expression.strip(): # если пусто
                return "Ошибка: пустое выражение"
            tokens = self.parseExpression(expression) # разбираем на токены
            result = self.calculate(tokens) # вычисляем результат
            return result # возвращаем число
        except ValueError as e: # ошибка ввода
            return f"Ошибка: {e}"
        except Exception as e: # любая другая ошибка
            return f"Непредвиденная ошибка: {e}"


def main(): # главная функция — точка входа
    calculator = TextCalc() # создаём экземпляр калькулятора

    print("=" * 50) # заголовок
    print("ТЕКСТОВЫЙ КАЛЬКУЛЯТОР")
    print("=" * 50)
    print("Поддерживаемые операции:") # список операций
    print("  - сложение: 'плюс'")
    print("  - вычитание: 'минус'")
    print("  - умножение: 'умножить на'")
    print("  - деление: 'поделить на'")
    print("\nЧисла от -99 до 99 (например: 'минус двадцать три')") # ограничения
    print("Для выхода введите 'выход' или 'exit'")
    print("=" * 50)

    examples = [ # примеры выражений
        "тридцать три поделить на три",
        "два плюс два плюс два",
        "минус два умножить на двадцать",
        "девять минус пять плюс один",
        "ноль плюс десять",
        "минус десять умножить на минус два",
    ]

    print("\nПримеры выражений:") # вывод примеров
    for example in examples:
        print(f"  {example}")

    print("=" * 50)

    while True: # бесконечный цикл ввода
        user_input = input("\nВведите выражение: ").strip() # ввод от пользователя

        if user_input.lower() in ['выход', 'exit', 'quit', 'q']: # выход
            print("Выход из программы.")
            break

        if not user_input: # пустой ввод
            print("Введите выражение или 'выход' для завершения")
            continue

        result = calculator.evaluate(user_input) # вычисляем результат
        print(f"Результат: {result}") # выводим

if __name__ == "__main__": # точка входа в программу
    main() # запускаем главную функцию
