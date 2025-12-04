
import random
from collections import Counter

def find_next_after_pattern(player_history, target):
    next_moves = []
    for i in range(len(player_history) - len(target)):
        if player_history[i:i + len(target)] == list(target):
            if i + len(target) < len(player_history):
                next_moves.append(player_history[i + len(target)])
    return Counter(next_moves).most_common(1)[0][0] if next_moves else None

def classify_player(player_history, computer_history):
    if len(player_history) < 3:
        return "новичок"

    total_wins = 0
    total_losses = 0
    repeats_after_win = 0
    changes_after_loss = 0

    for i in range(1, len(player_history)):
        player_move = player_history[i-1]
        bot_move = computer_history[i-1]

        # Проверяем, выиграл ли игрок
        player_won = (player_move == "камень" and bot_move == "ножницы") or \
                     (player_move == "ножницы" and bot_move == "бумага") or \
                     (player_move == "бумага" and bot_move == "камень")
        player_lost = (player_move == "камень" and bot_move == "бумага") or \
                      (player_move == "ножницы" and bot_move == "камень") or \
                      (player_move == "бумага" and bot_move == "ножницы")

        if player_won:
            total_wins += 1
            if i < len(player_history) and player_history[i] == player_history[i-1]:
                repeats_after_win += 1
        elif player_lost:
            total_losses += 1
            if i < len(player_history) and player_history[i] != player_history[i-1]:
                changes_after_loss += 1

    win_repeat_rate = repeats_after_win / total_wins if total_wins > 0 else 0
    loss_change_rate = changes_after_loss / total_losses if total_losses > 0 else 0

    if win_repeat_rate > 0.7:
        return "консерватор"
    elif loss_change_rate > 0.7:
        return "адаптив"
    elif len(set(player_history[-3:])) == 1:
        return "зациклен"
    else:
        return "хаотичный"

def hardBotChoice(player_history, computer_history, round_number):
    if round_number <= 3 or len(player_history) < 3:
        return random.choice(["камень", "ножницы", "бумага"])

    counter_moves = {
        "камень": "бумага",
        "ножницы": "камень",
        "бумага": "ножницы"
    }

    last_move = player_history[-1]
    freq = Counter(player_history)
    most_common = freq.most_common(1)[0][0]

    strategies = []

    # Определяем тип игрока
    player_type = classify_player(player_history, computer_history)

    # 1. Поиск паттернов (последние 3 хода)
    if len(player_history) >= 3:
        recent_pattern = tuple(player_history[-3:])
        predicted_next = find_next_after_pattern(player_history, recent_pattern)
        if predicted_next:
            strategies.append(("pattern", counter_moves[predicted_next]))

    # 2. Частотная стратегия
    if freq[most_common] / len(player_history) > 0.35:
        strategies.append(("freq", counter_moves[most_common]))

    # 3. Анализ поведения после побед и поражений
    if len(player_history) >= 4:
        total_wins = 0
        total_losses = 0
        repeats_after_win = 0
        changes_after_loss = 0

        for i in range(1, len(player_history)):
            player_move = player_history[i-1]
            bot_move = computer_history[i-1]

            player_won = (player_move == "камень" and bot_move == "ножницы") or \
                         (player_move == "ножницы" and bot_move == "бумага") or \
                         (player_move == "бумага" and bot_move == "камень")
            player_lost = (player_move == "камень" and bot_move == "бумага") or \
                          (player_move == "ножницы" and bot_move == "камень") or \
                          (player_move == "бумага" and bot_move == "ножницы")

            if player_won:
                total_wins += 1
                if i < len(player_history) and player_history[i] == player_history[i-1]:
                    repeats_after_win += 1
            elif player_lost:
                total_losses += 1
                if i < len(player_history) and player_history[i] != player_history[i-1]:
                    changes_after_loss += 1

        # Повтор хода после победы
        if total_wins > 0 and repeats_after_win / total_wins > 0.5:
            strategies.append(("repeat_win", counter_moves[last_move]))

        # Смена хода после поражения
        if total_losses > 0 and changes_after_loss / total_losses > 0.6:
            anti_last = [m for m in ["камень", "ножницы", "бумага"] if m != last_move]
            predicted = random.choice(anti_last)
            strategies.append(("change_loss", counter_moves[predicted]))

    # 4. Реакция на последний ход (база)
    strategies.append(("last_move", counter_moves[last_move]))

    # Устанавливаем веса в зависимости от типа игрока
    strategy_weights = {
        "pattern": 3,
        "freq": 3,
        "repeat_win": 2,
        "change_loss": 2,
        "last_move": 1
    }

    if player_type == "консерватор":
        strategy_weights["repeat_win"] = 5
    elif player_type == "адаптив":
        strategy_weights["change_loss"] = 4
    elif player_type == "зациклен":
        strategy_weights["freq"] = 5
    elif player_type == "хаотичный":
        strategy_weights = {"last_move": 4, "freq": 2}

    # Взвешенный выбор
    weighted_strategies = []
    for strategy_name, move in strategies:
        weight = strategy_weights.get(strategy_name, 1)
        weighted_strategies.extend([(strategy_name, move)] * weight)

    # Уменьшаем рандом с опытом: от 15% до 5%
    random_chance = max(0.05, 0.15 - len(player_history) * 0.005)
    if random.random() < random_chance:
        return random.choice(["камень", "ножницы", "бумага"])

    chosen_strategy = random.choice(weighted_strategies)
    return chosen_strategy[1]

def adaptiveBotChoice(player_history, round_number, difficulty="medium"):
    if round_number <= 2 or len(player_history) < 2:
        return random.choice(["камень", "ножницы", "бумага"])

    counter_moves = {
        "камень": "бумага",
        "ножницы": "камень",
        "бумага": "ножницы"
    }

    last_move = player_history[-1]

    if difficulty == "easy":
        if random.random() < 0.7:
            return last_move
        else:
            return random.choice(["камень", "ножницы", "бумага"])

    elif difficulty == "medium":
        freq = Counter(player_history)
        if freq:
            most_common = max(freq, key=freq.get)
            if random.random() < 0.6:
                return counter_moves[most_common]
        return counter_moves.get(last_move, random.choice(["камень", "ножницы", "бумага"]))

    elif difficulty == "hard":
        fake_computer_history = []
        for move in player_history:
            fake_computer_history.append(counter_moves.get(move, random.choice(["камень", "ножницы", "бумага"])))
        return hardBotChoice(player_history, fake_computer_history, round_number)

def findWinner(player_choice, computer_choice):
    if player_choice == computer_choice:
        return "ничья"
    winning_combinations = {
        "камень": "ножницы",
        "ножницы": "бумага",
        "бумага": "камень"
    }
    if winning_combinations[player_choice] == computer_choice:
        return "игрок"
    else:
        return "бот"

def printChoices(player_choice, computer_choice):
    print(f"Ваш выбор: {player_choice}")
    print(f"Выбор компьютера: {computer_choice}")

def printResult(result):
    if result == "ничья":
        print("Вы сыграли с компьютером в ничью")
    elif result == "игрок":
        print("Вы смогли выиграть у компьютера")
    else:
        print("Компьютер победил вас")

def theGame():
    print("=" * 50)
    print("Игра 'КАМЕНЬ, НОЖНИЦЫ, БУМАГА'")
    print("=" * 50)
    print("Выберите уровень сложности:")
    print("1 - Легкий (бот предсказуем)")
    print("2 - Средний (бот анализирует частоту ходов)")
    print("3 - Сложный (бот ищет паттерны и стратегии)")
    
    while True:
        difficulty_choice = input("Введите номер (1-3): ")
        if difficulty_choice == "1":
            difficulty = "easy"
            print("Выбран легкий уровень сложности")
            break
        elif difficulty_choice == "2":
            difficulty = "medium"
            print("Выбран средний уровень сложности")
            break
        elif difficulty_choice == "3":
            difficulty = "hard"
            print("Выбран сложный уровень")
            break
        else:
            print("Пожалуйста, введите 1, 2 или 3")

    print("=" * 50)

    while True:
        try:
            rounds = int(input("Сколько раундов вы хотите сыграть? (1-50): "))
            if 1 <= rounds <= 50:
                break
            else:
                print("Пожалуйста, введите число от 1 до 50")
        except ValueError:
            print("Пожалуйста, введите число")

    player_score = 0
    computer_score = 0
    ties = 0
    player_history = []
    computer_history = []

    for round_num in range(1, rounds + 1):
        print("=" * 50)
        print(f"Раунд №{round_num} из {rounds}")
        print("Счет:")
        print(f"Вы: {player_score}, компьютер: {computer_score}, ничьи: {ties}")
        print("=" * 50)

        while True:
            print("Ваш выбор (введите камень / ножницы / бумага)")
            choice = input("Введите ваш выбор: ").strip().lower()
            if choice in ["камень", "ножницы", "бумага"]:
                player_choice = choice
                player_history.append(choice)
                break
            else:
                print("Неверный ввод, введите еще раз")

        if difficulty == "hard":
            computer_choice = hardBotChoice(player_history, computer_history, round_num)
        else:
            computer_choice = adaptiveBotChoice(player_history, round_num, difficulty)

        computer_history.append(computer_choice)

        printChoices(player_choice, computer_choice)
        result = findWinner(player_choice, computer_choice)
        printResult(result)

        if result == "игрок":
            player_score += 1
        elif result == "бот":
            computer_score += 1
        else:
            ties += 1

    print("=" * 50)
    print("Игра окончена")
    print("=" * 50)
    print("Финальный счёт:")
    print(f"Вы: {player_score}, компьютер: {computer_score}, ничьи: {ties}")

    if player_score > computer_score:
        print("Поздравяю, вы выиграли в этой игре")
    elif player_score < computer_score:
        print("К сожалению, вы проиграли компьютеру")
    else:
        print("У вас ничья с компьютером")

    while True:
        play_again = input("Хотите сыграть еще раз? (да/нет): ").strip().lower()
        if play_again == "да":
            print("=" * 50)
            print("=" * 50)
            theGame()
            return
        elif play_again == "нет":
            print("Спасибо за игру!")
            break
        else:
            print("Пожалуйста, введите 'да' или 'нет'")

# Запуск игры
theGame()
