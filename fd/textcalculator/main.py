class TextCalc:
    def __init__(self):
        self.units = {
            'ноль': 0, 'один': 1, 'два': 2, 'три': 3, 'четыре': 4,
            'пять': 5, 'шесть': 6, 'семь': 7, 'восемь': 8, 'девять': 9,
            'десять': 10, 'одиннадцать': 11, 'двенадцать': 12, 'тринадцать': 13,
            'четырнадцать': 14, 'пятнадцать': 15, 'шестнадцать': 16,
            'семнадцать': 17, 'восемнадцать': 18, 'девятнадцать': 19
        }

        self.tens = {
            'двадцать': 20, 'тридцать': 30, 'сорок': 40, 'пятьдесят': 50,
            'шестьдесят': 60, 'семьдесят': 70, 'восемьдесят': 80,
            'девяносто': 90
        }

        self.all_numbers = {}
        self.all_numbers.update(self.units)
        self.all_numbers.update(self.tens)

        for ten_word, ten_value in self.tens.items():
            for unit_word, unit_value in self.units.items():
                if unit_value < 10:
                    compound_num = f"{ten_word} {unit_word}"
                    self.all_numbers[compound_num] = ten_value + unit_value
        
        self.operations = {
            'плюс': ('+', 1),
            'минус': ('-', 1),
            'умножить на': ('*', 2),
            'поделить на': ('/', 2)
        }

        self.operation_list = sorted(self.operations.keys(), key=len, reverse=True)

    def wordsToNumber(self, words):
        words = words.strip().lower()
        is_negative = False
        if words.startswith('минус '):
            is_negative = True
            words = words[6:]
        
        if words in self.all_numbers:
            result = self.all_numbers[words]
        else:
            parts = words.split()
            if len(parts) == 2:
                num_key = f"{parts[0]} {parts[1]}"
                if num_key in self.all_numbers:
                    result = self.all_numbers[num_key]
                else:
                    raise ValueError(f"Некорректное число: '{words}'")
            else:
                raise ValueError(f"Некорректное число: '{words}'")
        
        if abs(result) > 99:
            raise ValueError(f"Число {result} вне допустимого диапозона (-99 до 99)")
        
        return -result if is_negative else result
    
    def parseExpression(self, expression):
        expression = expression.strip()
        if not expression:
            raise ValueError("Пустое выражение")
        
        tokens = []
        words = expression.lower().split()
        i = 0
        
        while i < len(words):
            if words[i] == 'минус' and i + 1 < len(words):
                number_words = ['минус', words[i + 1]]
                if i + 2 < len(words) and f"{words[i + 1]} {words[i + 2]}" in self.all_numbers:
                    number_words.append(words[i + 2])
                    i += 3
                else:
                    i += 2
                
                number_str = ' '.join(number_words)
                number = self.wordsToNumber(number_str)
                tokens.append(('number', number))
            
            elif words[i] in self.all_numbers:
                number_str = words[i]
                if i + 1 < len(words) and f"{words[i]} {words[i + 1]}" in self.all_numbers:
                    number_str = f"{words[i]} {words[i + 1]}"
                    i += 2
                else:
                    i += 1
                
                number = self.wordsToNumber(number_str)
                tokens.append(('number', number))
            
            elif words[i] == 'умножить' and i + 1 < len(words) and words[i + 1] == 'на':
                tokens.append(('operation', '*', 2))
                i += 2
            
            elif words[i] == 'поделить' and i + 1 < len(words) and words[i + 1] == 'на':
                tokens.append(('operation', '/', 2))
                i += 2
            
            elif words[i] in ['плюс', 'минус']:
                op = words[i]
                op_symbol, priority = self.operations[op]
                tokens.append(('operation', op_symbol, priority))
                i += 1
            
            else:
                raise ValueError(f"Некорректный элемент: '{words[i]}'")
        
        return tokens
    
    def calculate(self, tokens):
        if not tokens or tokens[0][0] != 'number':
            raise ValueError("Выражение должно начинаться с числа")
        
        if tokens[-1][0] != 'number':
            raise ValueError("Выражение должно заканчиваться числом")
        
        for i, token in enumerate(tokens):
            if i % 2 == 0:
                if token[0] != 'number':
                    raise ValueError("Некорректное выражение: ожидалось число")
            else:
                if token[0] != 'operation':
                    raise ValueError("Некорректное выражение: ожидалась операция")
        
        output = []
        stack = []
        
        for token in tokens:
            if token[0] == 'number':
                output.append(token[1])
            elif token[0] == 'operation':
                op_symbol = token[1]
                priority = token[2]
                
                while stack and stack[-1][0] == 'operation' and stack[-1][2] >= priority:
                    output.append(stack.pop()[1])
                
                stack.append(('operation', op_symbol, priority))
        
        while stack:
            output.append(stack.pop()[1])
        
        eval_stack = []
        
        for item in output:
            if isinstance(item, (int, float)):
                eval_stack.append(item)
            elif item in '+-*/':
                if len(eval_stack) < 2:
                    raise ValueError("Некорректное выражение")
                
                b = eval_stack.pop()
                a = eval_stack.pop()
                
                if item == '+':
                    result = a + b
                elif item == '-':
                    result = a - b
                elif item == '*':
                    result = a * b
                elif item == '/':
                    if b == 0:
                        raise ValueError("Деление на ноль")
                    if a % b == 0:
                        result = a // b
                    else:
                        result = a / b
                
                eval_stack.append(result)
        
        if len(eval_stack) != 1:
            raise ValueError("Ошибка вычисления")
        
        return eval_stack[0]
    
    def evaluate(self, expression):
        try:
            if not expression or not expression.strip():
                return "Ошибка: пустое выражение"
            
            tokens = self.parseExpression(expression)
            result = self.calculate(tokens)
            
            return result
            
        except ValueError as e:
            return f"Ошибка: {e}"
        except Exception as e:
            return f"Непредвиденная ошибка: {e}"


def main():
    calculator = TextCalc()
    
    print("=" * 50)
    print("ТЕКСТОВЫЙ КАЛЬКУЛЯТОР")
    print("=" * 50)
    print("Поддерживаемые операции:")
    print("  - сложение: 'плюс'")
    print("  - вычитание: 'минус'")
    print("  - умножение: 'умножить на'")
    print("  - деление: 'поделить на'")
    print("\nЧисла от -99 до 99 (например: 'минус двадцать три')")
    print("Для выхода введите 'выход' или 'exit'")
    print("=" * 50)
    
    examples = [
        "тридцать три поделить на три",
        "два плюс два плюс два",
        "минус два умножить на двадцать",
        "девять минус пять плюс один",
        "ноль плюс десять",
        "минус десять умножить на минус два",
    ]
    
    print("\nПримеры выражений:")
    for example in examples:
        print(f"  {example}")
    
    print("=" * 50)
    
    while True:
        try:
            user_input = input("\nВведите выражение: ").strip()
            
            if user_input.lower() in ['выход', 'exit', 'quit', 'q']:
                print("Выход из программы.")
                break
            
            if not user_input:
                print("Введите выражение или 'выход' для завершения")
                continue
            
            result = calculator.evaluate(user_input)
            print(f"Результат: {result}")
            
        except KeyboardInterrupt:
            print("\n\nВыход из программы.")
            break
        except Exception as e:
            print(f"Произошла ошибка: {e}")


if __name__ == "__main__":
    main()