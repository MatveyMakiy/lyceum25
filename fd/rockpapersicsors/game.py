import random
from collections import Counter

def hardBotChoice(player_history, computer_history, round_number):
    if round_number <= 3 or len(player_history) < 3:
        return random.choice(["камень", "ножницы", "бумага"])
    freq = Counter(player_history)
    most_common = freq.most_common(1)[0][0] if freq else None
    recent_pattern = tuple(player_history[-3:]) if len(player_history) >= 3 else None
    last_player_move = player_history[-1] if player_history else None
    counter_moves = {
        "камень": "бумага",
        "ножницы": "камень",
        "бумага": "ножницы"
    }
    strategies = []
    if most_common and freq[most_common] / len(player_history) > 0.4:
        strategies.append(("freq", counter_moves[most_common]))
    if recent_pattern and len(player_history) >= 6:
        pattern_history = []
        for i in range(len(player_history) - 3):
            if tuple(player_history[i:i+3]) == recent_pattern and i+3 < len(player_history):
                pattern_history.append(player_history[i+3])
        
        if pattern_history:
            pattern_next = Counter(pattern_history).most_common(1)[0][0]
            strategies.append(("pattern", counter_moves[pattern_next]))
    
    if len(player_history) >= 4:
        repeats_after_win = 0
        total_wins = 0
        
        for i in range(1, len(player_history)):
            if (player_history[i-1] == "камень" and computer_history[i-1] == "ножницы") or \
               (player_history[i-1] == "ножницы" and computer_history[i-1] == "бумага") or \
               (player_history[i-1] == "бумага" and computer_history[i-1] == "камень"):
                total_wins += 1
                if player_history[i] == player_history[i-1]:
                    repeats_after_win += 1
        
        if total_wins > 0 and repeats_after_win / total_wins > 0.6:
            if last_player_move:
                strategies.append(("repeat_win", counter_moves[last_player_move]))
    
    if len(player_history) >= 4:
        changes_after_loss = 0
        total_losses = 0
        
        for i in range(1, len(player_history)):
            if (player_history[i-1] == "камень" and computer_history[i-1] == "бумага") or \
               (player_history[i-1] == "ножницы" and computer_history[i-1] == "камень") or \
               (player_history[i-1] == "бумага" and computer_history[i-1] == "ножницы"):
                total_losses += 1
                if player_history[i] != player_history[i-1]:
                    changes_after_loss += 1
        
        if total_losses > 0 and changes_after_loss / total_losses > 0.7:
            if last_player_move:
                possible_moves = ["камень", "ножницы", "бумага"]
                possible_moves.remove(last_player_move)
                predicted_move = random.choice(possible_moves)
                strategies.append(("change_loss", counter_moves[predicted_move]))

    if last_player_move:
        strategies.append(("last_move", counter_moves[last_player_move]))
    
    if strategies:
        strategy_weights = {
            "pattern": 4,
            "freq": 3,
            "repeat_win": 3,
            "change_loss": 2,
            "last_move": 1
        }
        weighted_strategies = []
        for strategy_name, move in strategies:
            weight = strategy_weights.get(strategy_name, 1)
            weighted_strategies.extend([(strategy_name, move)] * weight)
        
        chosen_strategy = random.choice(weighted_strategies)
        chosen_move = chosen_strategy[1]
        
        if random.random() < 0.15:
            return random.choice(["камень", "ножницы", "бумага"])
        
        return chosen_move
    
    return random.choice(["камень", "ножницы", "бумага"])

def adaptiveBotChoice(player_history, round_number, difficulty="medium"):

    if round_number <= 2 or len(player_history) < 2:
        return random.choice(["камень", "ножницы", "бумага"])
    
    last_move = player_history[-1]
    counter_moves = {
        "камень": "бумага",
        "ножницы": "камень", 
        "бумага": "ножницы"
    }
    
    if difficulty == "easy":
        if random.random() < 0.7:
            return last_move
        else:
            return random.choice(["камень", "ножницы", "бумага"])
    
    elif difficulty == "medium":
        freq = Counter(player_history)
        if len(freq) > 0:
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
    valid_choices = ["камень", "ножницы", "бумага"]

    for round_num in range (1, 1 + rounds):
        print("=" * 50)
        print(f"Раунд №{round_num} из {rounds} раундов")
        print("Счет:")
        print(f"Вы: {player_score}, компьютер: {computer_score}, ничьи: {ties}")
        print("=" * 50)

        if len(player_history) >= 3:
            freq = Counter(player_history)
            total = len(player_history)

        while True:
            print("Ваш выбор (введите камень / ножницы / бумага)")
            choice = input("Введите ваш выбор: ")
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
        play_again = input("Хотите сыграть еще раз? (да/нет): ")
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

theGame()