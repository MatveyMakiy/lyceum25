import random

def krestikiNoliki():
    print ("Введите игровое поле, крестик - [X], нолик - [0], пустая поле - [ ]")
    board = []
    for i in range (3):
        line = input().strip()
        row = [kletki for kletki in line.replace('[', '').replace(']', '')]
        if len (row) != 3:
            print ("При вводе были нарушены правила ввода")
            return
        board.append(row)
        print ("--------------------------")

    def printBoard(board):
        for row in board:
            print('[' + ']['.join(row) + ']')

    def isWinner(board, player):
        for i in range(3):
            if all(board[i][j] == player for j in range(3)): return True
            if all(board[j][i] == player for j in range(3)): return True
        if all(board[i][i] == player for i in range(3)): return True
        if all(board[i][2 - i] == player for i in range(3)): return True
        return False
    
    def getEmptyKletki(board):
        return [(i, j) for i in range(3) for j in range(3) if board[i][j] == ' ']
    
    emptyKletki = getEmptyKletki(board)
    if not emptyKletki:
        print ("Доска была заполнена. Возможных ходов нет")
        return
    #бла-бла коммент про алгоритм выбора хода
    
    for i, j in emptyKletki:
        board[i][j] = 'X'
        if isWinner(board, 'X'):
            printBoard(board)
            print ("Бот смог сделать победный ход")
            return
        board[i][j] = ' '
    
    for i, j in emptyKletki:
        board[i][j] = '0'
        if isWinner(board, '0'):
            board[i][j] = ' '
            board[i][j] = 'X'
            printBoard(board)
            print ("Бот заблокировал выигрушную клетку соперника")
            return
        board[i][j] = ' '
    
    if (1, 1) in emptyKletki:
        board[1][1] = 'X'
        printBoard(board)
        print ("Бот сделал ход в центр")
        return
    
    corners = [(0, 0), (2, 0), (0, 2), (2, 2)]
    avialableCorners = [kletki for kletki in corners if kletki in emptyKletki]
    if avialableCorners:
        i, j = random.choice(avialableCorners)
        board[i][j] = 'X'
        printBoard(board)
        print("Бот сделал ход в угол")
        return
    
    i, j = random.choice(avialableCorners)
    i, j = emptyKletki[0]
    board[i][j] = 'X'
    printBoard(board)
    print("Бот сделал ход в любую свободную клетку")

krestikiNoliki()