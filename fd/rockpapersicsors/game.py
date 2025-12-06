import random # импортируем модуль random для генерации случайных ходов и вероятностей
from collections import Counter # импортируем Counter для подсчёта частоты ходов игрока

def findNextAfterPattern(player_history, target): # функция ищет, какой ход чаще всего следует после заданного паттерна
    next_moves = [] # список для хранения ходов, идущих после найденных совпадений
    for i in range(len(player_history) - len(target)): # перебираем все возможные начальные позиции для поиска паттерна
        if player_history[i:i + len(target)] == list(target): # проверяем, совпадает ли текущая подпоследовательность с целевым паттерном
            if i + len(target) < len(player_history): # проверяем, что после паттерна есть ход (не вышли за пределы истории)
                next_moves.append(player_history[i + len(target)]) # добавляем следующий ход после паттерна в список
    return Counter(next_moves).most_common(1)[0][0] if next_moves else None # возвращаем самый частый следующий ход, если есть данные; иначе None

def classifyPlayer(player_history, computer_history): # функция определяет тип игрока по его поведению в предыдущих раундах
    if len(player_history) < 3: # если сыграно меньше 3 раундов
        return "новичок" # возвращаем тип "новичок" — недостаточно данных для анализа
    total_wins = 0 # счётчик общего количества побед игрока
    total_losses = 0 # счётчик общего количества поражений игрока
    repeats_after_win = 0 # сколько раз игрок повторил ход после своей победы
    changes_after_loss = 0 # сколько раз игрок сменил ход после своего поражения
    for i in range(1, len(player_history)): # проходим по истории, начиная со второго раунда
        player_move = player_history[i-1] # ход игрока в предыдущем раунде
        bot_move = computer_history[i-1] # ход бота в предыдущем раунде
        player_won = (player_move == "камень" and bot_move == "ножницы") or \
                     (player_move == "ножницы" and bot_move == "бумага") or \
                     (player_move == "бумага" and bot_move == "камень") # проверяем, победил ли игрок в предыдущем раунде
        player_lost = (player_move == "камень" and bot_move == "бумага") or \
                      (player_move == "ножницы" and bot_move == "камень") or \
                      (player_move == "бумага" and bot_move == "ножницы") # проверяем, проиграл ли игрок в предыдущем раунде
        if player_won: # если игрок победил
            total_wins += 1 # увеличиваем счётчик побед
            if i < len(player_history) and player_history[i] == player_history[i-1]: # если текущий ход совпадает с предыдущим (повтор)
                repeats_after_win += 1 # увеличиваем счётчик повторов после победы
        elif player_lost: # если игрок проиграл
            total_losses += 1 # увеличиваем счётчик поражений
            if i < len(player_history) and player_history[i] != player_history[i-1]: # если текущий ход отличается от предыдущего (смена)
                changes_after_loss += 1 # увеличиваем счётчик смен после поражений
    win_repeat_rate = repeats_after_win / total_wins if total_wins > 0 else 0 # доля повторов после побед
    loss_change_rate = changes_after_loss / total_losses if total_losses > 0 else 0 # доля смен после поражений
    if win_repeat_rate > 0.7: # если повторяет ход после победы чаще 70%
        return "консерватор" # игрок склонен к стабильности — "консерватор"
    elif loss_change_rate > 0.7: # если меняет ход после поражения чаще 70%
        return "адаптив" # игрок быстро адаптируется — "адаптив"
    elif len(set(player_history[-3:])) == 1: # если последние 3 хода одинаковы
        return "зациклен" # игрок повторяет — "зацикленный"
    else: # иначе поведение непредсказуемо
        return "хаотичный" # тип — "хаотичный"

def hardBotChoice(player_history, computer_history, round_number): # функция выбора хода для сложного уровня бота
    if round_number <= 3 or len(player_history) < 3: # если сыграно меньше 3 раундов
        return random.choice(["камень", "ножницы", "бумага"]) # возвращаем случайный ход — слишком мало данных
    counter_moves = { # словарь контр-ходов: что побеждает каждый ход
        "камень": "бумага", # бумага побеждает камень
        "ножницы": "камень", # камень побеждает ножницы
        "бумага": "ножницы" # ножницы побеждают бумагу
    }
    last_move = player_history[-1] # последний ход игрока
    freq = Counter(player_history) # частота всех ходов игрока
    most_common = freq.most_common(1)[0][0] # самый частый ход игрока
    strategies = [] # список подходящих стратегий для текущего раунда
    player_type = classifyPlayer(player_history, computer_history) # определяем тип игрока: консерватор, адаптив и т.д.
    if len(player_history) >= 3: # если есть хотя бы 3 хода
        recent_pattern = tuple(player_history[-3:]) # последние 3 хода игрока
        predicted_next = findNextAfterPattern(player_history, recent_pattern) # предсказываем, какой ход будет следующим
        if predicted_next: # если удалось найти закономерность
            strategies.append(("pattern", counter_moves[predicted_next])) # добавляем контр-ход к предсказанному ходу
    if freq[most_common] / len(player_history) > 0.35: # если самый частый ход встречается более чем в 35% случаев
        strategies.append(("freq", counter_moves[most_common])) # добавляем контр-ход к самому частому ходу
    if len(player_history) >= 4: # если сыграно хотя бы 4 раунда
        total_wins = 0 # сброс счётчика побед
        total_losses = 0 # сброс счётчика поражений
        repeats_after_win = 0 # сброс счётчика повторов после побед
        changes_after_loss = 0 # сброс счётчика смен после поражений
        for i in range(1, len(player_history)): # анализируем каждый раунд, начиная со второго
            player_move = player_history[i-1] # ход игрока в предыдущем раунде
            bot_move = computer_history[i-1] # ход бота в предыдущем раунде
            player_won = (player_move == "камень" and bot_move == "ножницы") or \
                         (player_move == "ножницы" and bot_move == "бумага") or \
                         (player_move == "бумага" and bot_move == "камень") # определяем, победил ли игрок
            player_lost = (player_move == "камень" and bot_move == "бумага") or \
                          (player_move == "ножницы" and bot_move == "камень") or \
                          (player_move == "бумага" and bot_move == "ножницы") # определяем, проиграл ли игрок
            if player_won: # если игрок победил
                total_wins += 1 # увеличиваем счётчик побед
                if i < len(player_history) and player_history[i] == player_history[i-1]: # если текущий ход такой же, как предыдущий
                    repeats_after_win += 1 # считаем это повтором после победы
            elif player_lost: # если игрок проиграл
                total_losses += 1 # увеличиваем счётчик поражений
                if i < len(player_history) and player_history[i] != player_history[i-1]: # если текущий ход отличается от предыдущего
                    changes_after_loss += 1 # считаем это сменой после поражения
        if total_wins > 0 and repeats_after_win / total_wins > 0.5: # если более 50% побед сопровождались повтором хода
            strategies.append(("repeat_win", counter_moves[last_move])) # добавляем контр-ход к последнему ходу
        if total_losses > 0 and changes_after_loss / total_losses > 0.6: # если более 60% поражений сопровождались сменой хода
            anti_last = [m for m in ["камень", "ножницы", "бумага"] if m != last_move] # создаём список из ходов, отличных от последнего
            predicted = random.choice(anti_last) # предполагаем, что игрок изменит ход — выбираем случайный из других
            strategies.append(("change_loss", counter_moves[predicted])) # добавляем контр-ход к предполагаемому новому ходу
    strategies.append(("last_move", counter_moves[last_move])) # всегда добавляем контр-ход к последнему ходу как базовую стратегию
    strategy_weights = { # базовые веса стратегий
        "pattern": 3, # паттерны имеют высокий приоритет
        "freq": 3, # частота — высокий приоритет
        "repeat_win": 2, # повтор после победы — средний
        "change_loss": 2, # смена после поражения — средний
        "last_move": 1 # последний ход — низкий приоритет
    }
    if player_type == "консерватор": # если игрок склонен повторять ход после победы
        strategy_weights["repeat_win"] = 5 # повышаем приоритет этой стратегии
    elif player_type == "адаптив": # если игрок меняет ход после поражения
        strategy_weights["change_loss"] = 4 # повышаем приоритет стратегии смены
    elif player_type == "зациклен": # если игрок повторяет один и тот же ход
        strategy_weights["freq"] = 5 # повышаем приоритет частотной стратегии
    elif player_type == "хаотичный": # если поведение непредсказуемо
        strategy_weights = {"last_move": 4, "freq": 2} # полагаемся в основном на последний ход
    weighted_strategies = [] # список для взвешенного выбора
    for strategy_name, move in strategies: # для каждой подходящей стратегии
        weight = strategy_weights.get(strategy_name, 1) # получаем её вес
        weighted_strategies.extend([(strategy_name, move)] * weight) # добавляем стратегию в список столько раз, каков её вес
    random_chance = max(0.05, 0.15 - len(player_history) * 0.005) # вероятность случайного хода: от 15% в начале до 5% в конце
    if random.random() < random_chance: # если случайное число меньше порога
        return random.choice(["камень", "ножницы", "бумага"]) # бот делает случайный ход
    chosen_strategy = random.choice(weighted_strategies) # выбираем стратегию с учётом весов
    return chosen_strategy[1] # возвращаем ход (второй элемент кортежа)

def adaptiveBotChoice(player_history, round_number, difficulty="medium"): # обёртка для выбора логики бота в зависимости от уровня сложности
    if round_number <= 2 or len(player_history) < 2: # если слишком мало данных
        return random.choice(["камень", "ножницы", "бумага"]) # возвращаем случайный ход
    counter_moves = { # словарь контр-ходов
        "камень": "бумага",
        "ножницы": "камень",
        "бумага": "ножницы"
    }
    last_move = player_history[-1] # последний ход игрока
    if difficulty == "easy": # лёгкий уровень
        if random.random() < 0.7: # с 70% вероятностью
            return last_move # бот повторяет ход игрока
        else: # иначе
            return random.choice(["камень", "ножницы", "бумага"]) # случайный ход
    elif difficulty == "medium": # средний уровень
        freq = Counter(player_history) # считаем частоту ходов
        if freq: # если есть данные
            most_common = max(freq, key=freq.get) # находим самый частый ход
            if random.random() < 0.6: # с 60% вероятностью
                return counter_moves[most_common] # бот ставит контр-ход к самому частому
        return counter_moves.get(last_move, random.choice(["камень", "ножницы", "бумага"])) # иначе — контр-ход к последнему ходу или случайно
    elif difficulty == "hard": # сложный уровень
        fake_computer_history = [] # создаём фейковую историю ходов бота
        for move in player_history: # для каждого хода игрока
            fake_computer_history.append(counter_moves.get(move, random.choice(["камень", "ножницы", "бумага"]))) # добавляем контр-ход (или случайный, если неопределённо)
        return hardBotChoice(player_history, fake_computer_history, round_number) # запускаем сложную логику

def findWinner(player_choice, computer_choice): # определяет победителя раунда
    if player_choice == computer_choice: # если ходы одинаковы
        return "ничья" # результат — ничья
    winning_combinations = { # словарь: что побеждает что
        "камень": "ножницы",
        "ножницы": "бумага",
        "бумага": "камень"
    }
    if winning_combinations[player_choice] == computer_choice: # если ход игрока побеждает ход бота
        return "игрок" # игрок победил
    else: # иначе
        return "бот" # бот победил

def printChoices(player_choice, computer_choice): # выводит ходы на экран
    print(f"Ваш выбор: {player_choice}") # показываем ход игрока
    print(f"Выбор компьютера: {computer_choice}") # показываем ход бота

def printResult(result): # выводит результат раунда
    if result == "ничья": # если ничья
        print("Вы сыграли с компьютером в ничью") # сообщение о ничьей
    elif result == "игрок": # если игрок победил
        print("Вы смогли выиграть у компьютера") # сообщение о победе
    else: # если бот победил
        print("Компьютер победил вас") # сообщение о поражении

def theGame(): # основная функция, управляющая игрой
    print("=" * 50) # разделяющая линия
    print("Игра 'КАМЕНЬ, НОЖНИЦЫ, БУМАГА'") # заголовок игры
    print("=" * 50) # разделяющая линия
    print("Выберите уровень сложности:") # приглашение выбрать сложность
    print("1 - Легкий (бот предсказуем)") # описание лёгкого режима
    print("2 - Средний (бот анализирует частоту ходов)") # описание среднего режима
    print("3 - Сложный (бот ищет паттерны и стратегии)") # описание сложного режима
    while True: # цикл выбора сложности
        difficulty_choice = input("Введите номер (1-3): ") # запрос ввода
        if difficulty_choice == "1": # если выбрано 1
            difficulty = "easy" # устанавливаем легкий уровень
            print("Выбран легкий уровень сложности") # подтверждение
            break # выходим из цикла
        elif difficulty_choice == "2": # если выбрано 2
            difficulty = "medium" # устанавливаем средний уровень
            print("Выбран средний уровень сложности") # подтверждение
            break # выходим
        elif difficulty_choice == "3": # если выбрано 3
            difficulty = "hard" # устанавливаем сложный уровень
            print("Выбран сложный уровень") # подтверждение
            break # выходим
        else: # если введено что-то другое
            print("Пожалуйста, введите 1, 2 или 3") # сообщение об ошибке
    print("=" * 50) # разделяющая линия
    while True: # цикл ввода количества раундов
        try: # пробуем преобразовать ввод в число
            rounds = int(input("Сколько раундов вы хотите сыграть? (1-50): ")) # запрос количества раундов
            if 1 <= rounds <= 50: # если в допустимом диапазоне
                break # выходим из цикла
            else: # если вне диапазона
                print("Пожалуйста, введите число от 1 до 50") # сообщение об ошибке
        except ValueError: # если ввод не число
            print("Пожалуйста, введите число") # сообщение об ошибке
    player_score = 0 # счёт игрока
    computer_score = 0 # счёт бота
    ties = 0 # счётчик ничьих
    player_history = [] # история ходов игрока
    computer_history = [] # история ходов бота
    for round_num in range(1, rounds + 1): # цикл по раундам
        print("=" * 50) # разделитель
        print(f"Раунд №{round_num} из {rounds}") # номер раунда
        print("Счет:") # заголовок счёта
        print(f"Вы: {player_score}, компьютер: {computer_score}, ничьи: {ties}") # текущий счёт
        print("=" * 50) # разделитель
        while True: # цикл ввода хода игрока
            print("Ваш выбор (введите камень / ножницы / бумага)") # подсказка
            choice = input("Введите ваш выбор: ").strip().lower() # считываем ввод, удаляем пробелы, приводим к нижнему регистру
            if choice in ["камень", "ножницы", "бумага"]: # если ввод корректный
                player_choice = choice # сохраняем выбор
                player_history.append(choice) # добавляем в историю
                break # выходим из цикла
            else: # если ввод некорректный
                print("Неверный ввод, введите еще раз") # сообщение об ошибке
        if difficulty == "hard": # если сложный уровень
            computer_choice = hardBotChoice(player_history, computer_history, round_num) # бот делает умный ход
        else: # иначе
            computer_choice = adaptiveBotChoice(player_history, round_num, difficulty) # бот выбирает по простой логике
        computer_history.append(computer_choice) # добавляем ход бота в историю
        printChoices(player_choice, computer_choice) # выводим ходы
        result = findWinner(player_choice, computer_choice) # определяем победителя
        printResult(result) # выводим результат
        if result == "игрок": # если игрок победил
            player_score += 1 # увеличиваем его счёт
        elif result == "бот": # если бот победил
            computer_score += 1 # увеличиваем счёт бота
        else: # если ничья
            ties += 1 # увеличиваем счётчик ничьих
    print("=" * 50) # разделитель
    print("Игра окончена") # сообщение о завершении
    print("=" * 50) # разделитель
    print("Финальный счёт:") # заголовок
    print(f"Вы: {player_score}, компьютер: {computer_score}, ничьи: {ties}") # итоговый счёт
    if player_score > computer_score: # если игрок выиграл
        print("Поздравляю, вы выиграли в этой игре") # поздравление
    elif player_score < computer_score: # если проиграл
        print("К сожалению, вы проиграли компьютеру") # сообщение о поражении
    else: # если ничья
        print("У вас ничья с компьютером") # сообщение о ничье
    while True: # цикл вопроса о повторе
        play_again = input("Хотите сыграть еще раз? (да/нет): ").strip().lower() # запрос с приведением к нижнему регистру
        if play_again == "да": # если хочет играть снова
            print("=" * 50) # разделитель
            print("=" * 50) # ещё один
            theGame() # рекурсивный запуск игры
            return # выход из текущей игры
        elif play_again == "нет": # если не хочет
            print("Спасибо за игру!") # благодарность
            break # выходим
        else: # если введено что-то другое
            print("Пожалуйста, введите 'да' или 'нет'") # сообщение об ошибке

theGame() # запуск игры