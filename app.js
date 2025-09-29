// Davi's Chess Game - Complete Implementation with Advanced AI
// Professional chess game with intelligent AI and realistic gameplay

// ============================================================================
// GAME STATE AND CONSTANTS
// ============================================================================

// Global game state object holding all game-related information
let gameState = {
    board: [],                     	// 8x8 matrix representing the chess board
    currentPlayer: 'white',      // current active player: 'white' or 'black'
    gameMode: null,            // mode: 'ai', 'local', 'online'
    aiDifficulty: 'medium',      // AI difficulty level
    isGamePaused: false,
    isGameOver: false,
    winner: null,
    moveHistory: [],                 // history of all moves (for undo, display)
    capturedPieces: { white: [], black: [] },  // captured pieces per player
    selectedSquare: null,          // currently selected board cell
    validMoves: [],                   // valid moves for selected piece
    enPassantTarget: null,       // en passant capture possibility
    castlingRights: {                 // castling availability for each player
        white: { kingside: true, queenside: true },
        black: { kingside: true, queenside: true }
    },
    kingPositions: {                  // track kings' positions
        white: [7, 4],
        black: [0, 4]
    },
    gameStartTime: null,
    roomCode: null,
    isConnected: false,
    promotionSquare: null, // Store exact square for promotion
    promotionMove: null, // Store the move object for proper finalization
    moveCount: 0
};

// Enhanced piece values for improved AI evaluation
const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
};

// Comprehensive piece-square tables for strategic positioning
const PIECE_SQUARE_TABLES = {
    'p': [ // Pawn position values
        [0,   0,   0,   0,   0,   0,   0,   0],
        [78,  83,  86,  73,  102, 82,  85,  90],
        [7,   29,  21,  44,  40,  31,  44,  7],
        [-17, 16,  -2,  15,  14,  0,   15,  -13],
        [-26, 3,   10,  9,   6,   1,   0,   -23],
        [-22, 9,   5,   -11, -10, -2,  3,   -19],
        [-31, 8,   -7,  -37, -36, -14, 3,   -31],
        [0,   0,   0,   0,   0,   0,   0,   0]
    ],
    'n': [ // Knight position values
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    'b': [ // Bishop position values
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    'r': [ // Rook position values
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    'q': [ // Queen position values
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    'k': [ // King position values (middle game)
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ]
};

// Chess piece Unicode symbols
const PIECE_SYMBOLS = {
    'white': { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
    'black': { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
};

// Enhanced AI difficulty settings with strategic differences
const AI_SETTINGS = {
    easy: { 
        depth: 2, 
        randomness: 0.4,
        aggression: 0.3,
        positionalWeight: 0.5
    },
    medium: { 
        depth: 3, 
        randomness: 0.15,
        aggression: 0.7,
        positionalWeight: 0.8
    },
    hard: { 
        depth: 4, 
        randomness: 0.05,
        aggression: 1.0,
        positionalWeight: 1.0
    }
};

// ============================================================================
// INITIALIZATION AND SETUP
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Davi\'s Chess Game initialized');
    initializeGame();
    setupEventListeners();
    startGameTimer();
});

function setupEventListeners() {
    // This is now handled in showGameMode, but we can keep it for direct interaction if needed.
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDifficulty(this.dataset.difficulty);
        });
    });

    // Pawn promotion
    document.querySelectorAll('.promotion-piece').forEach(btn => {
        btn.addEventListener('click', function() {
            // This is handled by the onclick attribute, but we keep the listener for robustness
        });
    });

    // Move history toggle
    const moveHistoryElement = document.querySelector('.move-history');
    if (moveHistoryElement) {
        moveHistoryElement.addEventListener('click', () => toggleMoveHistory());
    }

    // Room code input
    const roomInput = document.getElementById('room-code-input');
    if (roomInput) {
        roomInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                joinRoom();
            }
        });
    }

    // Add drag and drop support
    setupDragAndDrop();
}

function initializeGame() {
    console.log('Initializing new chess game');
    
    gameState.board = createInitialBoard();
    gameState.currentPlayer = 'white';
    gameState.isGameOver = false;
    gameState.winner = null;
    gameState.moveHistory = [];
    gameState.capturedPieces = { white: [], black: [] };
    gameState.selectedSquare = null;
    gameState.validMoves = [];
    gameState.enPassantTarget = null;
    gameState.castlingRights = {
        white: { kingside: true, queenside: true },
        black: { kingside: true, queenside: true }
    };
    gameState.kingPositions = { white: [7, 4], black: [0, 4] };
    gameState.gameStartTime = new Date();
    gameState.promotionSquare = null;
    gameState.promotionMove = null;
    gameState.moveCount = 0;
    
    createChessBoard();
    updateGameDisplay();
    updateMoveHistory();
    updateCapturedPieces();
    updateGameStats();
}

function createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // CRITICAL FIX: Create separate objects for each piece to prevent reference sharing
    // Black pieces - back rank
    board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map(piece => ({ type: piece, color: 'black' }));
    
    // Black pawns - each pawn is a separate object
    board[1] = Array(8).fill(null).map(() => ({ type: 'p', color: 'black' }));
    
    // White pawns - each pawn is a separate object  
    board[6] = Array(8).fill(null).map(() => ({ type: 'p', color: 'white' }));
    
    // White pieces - back rank
    board[7] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map(piece => ({ type: piece, color: 'white' }));
    
    return board;
}

// ============================================================================
// UI NAVIGATION
// ============================================================================

function showMainMenu() {
    console.log('Showing main menu');
    hideAllScreens();
    document.getElementById('main-menu').classList.remove('hidden');
    gameState.gameMode = null;
    gameState.isGamePaused = false;
}

function showGameMode(mode) {
    console.log(`Showing game mode: ${mode}`);
    
    if (mode === 'ai') {
        hideAllScreens();
        document.getElementById('ai-setup').classList.remove('hidden');
    } else if (mode === 'local') {
        startLocalGame();
    } else if (mode === 'online') {
        hideAllScreens();
        document.getElementById('online-setup').classList.remove('hidden');
    }
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
}

function showGameScreen() {
    console.log('Showing game screen');
    hideAllScreens();
    document.getElementById('game-screen').classList.remove('hidden');
    initializeGame();
}

// ============================================================================
// GAME MODES
// ============================================================================

function startLocalGame() {
    console.log('Starting local multiplayer game');
    gameState.gameMode = 'local';
    showGameScreen();
    document.getElementById('game-mode-display').textContent = 'Local Multiplayer';
}

function selectDifficulty(difficulty) {
    console.log(`AI difficulty selected: ${difficulty}`);
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');

    setTimeout(() => {
        gameState.gameMode = 'ai';
        gameState.aiDifficulty = difficulty;
        const difficultyNames = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
        document.getElementById('game-mode-display').textContent = `vs AI (${difficultyNames[difficulty]})`;
        showGameScreen();
    }, 300);
}

function showJoinRoom() {
    console.log('Showing join room screen');
    hideAllScreens();
    document.getElementById('join-room').classList.remove('hidden');
}

function createRoom() {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    gameState.roomCode = roomCode;
    
    hideAllScreens();
    document.getElementById('room-created').classList.remove('hidden');
    document.getElementById('room-code-display').textContent = roomCode;
    
    setTimeout(() => {
        gameState.gameMode = 'online';
        gameState.isConnected = true;
        document.getElementById('game-mode-display').textContent = `Online - Room: ${roomCode}`;
        showGameScreen();
        showGameStatus('Opponent connected! Game started.', 'info');
    }, 3000);
}

function joinRoom() {
    const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
    
    if (roomCode.length !== 6) {
        showGameStatus('Enter a valid 6-character room code', 'error');
        return;
    }
    
    gameState.roomCode = roomCode;
    gameState.gameMode = 'online';
    gameState.isConnected = true;
    gameState.currentPlayer = 'black';
    
    document.getElementById('game-mode-display').textContent = `Online - Room: ${roomCode}`;
    showGameScreen();
    showGameStatus('Connected to game!', 'success');
}

function cancelRoom() {
    gameState.roomCode = null;
    gameState.isConnected = false;
    showMainMenu();
}

function newGame() {
    // This function is a user-facing alias for resetGame
    resetGame();
}

function showSettings() {
    console.log('Showing settings');
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function saveSettings() {
    console.log('Settings saved (placeholder)');
    closeSettings();
}
// ============================================================================
// CHESS BOARD RENDERING
// ============================================================================

function createChessBoard() {
    console.log('Creating visual chess board');
    
    const boardElement = document.getElementById('chess-board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceElement = createPieceElement(piece, row, col);
                square.appendChild(pieceElement);
            }
            
            boardElement.appendChild(square);
        }
    }
}

function createPieceElement(piece, row, col) {
    const pieceElement = document.createElement('div');
    pieceElement.className = `piece ${piece.color}`;
    pieceElement.textContent = PIECE_SYMBOLS[piece.color][piece.type];
    pieceElement.dataset.row = row;
    pieceElement.dataset.col = col;
    pieceElement.draggable = true;
    
    return pieceElement;
}

function updateBoardDisplay() {
    const squares = document.querySelectorAll('.square');
    
    squares.forEach(square => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = gameState.board[row][col];
        
        square.innerHTML = '';
        
        if (piece) {
            const pieceElement = createPieceElement(piece, row, col);
            square.appendChild(pieceElement);
        }
    });
    
    updateSquareHighlights();
}

// ============================================================================
// MOVE HANDLING AND VALIDATION
// ============================================================================

function handleSquareClick(row, col) {
    console.log(`Square clicked: ${row}, ${col}`);
    
    if (gameState.isGameOver || gameState.isGamePaused) return;
    if (gameState.gameMode === 'ai' && gameState.currentPlayer === 'black') return;
    
    const piece = gameState.board[row][col];
    const isValidMove = gameState.validMoves.some(move => move.row === row && move.col === col);
    
    if (gameState.selectedSquare) {
        if (isValidMove) {
            makeMove(gameState.selectedSquare.row, gameState.selectedSquare.col, row, col);
        } else if (piece && piece.color === gameState.currentPlayer) {
            selectSquare(row, col);
        } else {
            deselectSquare();
        }
    } else {
        if (piece && piece.color === gameState.currentPlayer) {
            selectSquare(row, col);
        }
    }
}

function selectSquare(row, col) {
    console.log(`Selecting square: ${row}, ${col}`);
    
    gameState.selectedSquare = { row, col };
    gameState.validMoves = getValidMoves(row, col);
    
    updateSquareHighlights();
}

function deselectSquare() {
    console.log('Deselecting square');
    
    gameState.selectedSquare = null;
    gameState.validMoves = [];
    
    updateSquareHighlights();
}

function updateSquareHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'valid-move', 'valid-capture', 'in-check');
    });
    
    if (gameState.selectedSquare) {
        const selectedElement = document.querySelector(
            `.square[data-row="${gameState.selectedSquare.row}"][data-col="${gameState.selectedSquare.col}"]`
        );
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }
    
    gameState.validMoves.forEach(move => {
        const squareElement = document.querySelector(
            `.square[data-row="${move.row}"][data-col="${move.col}"]`
        );
        if (squareElement) {
            if (move.isCapture) {
                squareElement.classList.add('valid-capture');
            } else {
                squareElement.classList.add('valid-move');
            }
        }
    });
    
    if (isInCheck(gameState.currentPlayer)) {
        const kingPos = gameState.kingPositions[gameState.currentPlayer];
        const kingElement = document.querySelector(
            `.square[data-row="${kingPos[0]}"][data-col="${kingPos[1]}"]`
        );
        if (kingElement) {
            kingElement.classList.add('in-check');
        }
    }
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    console.log(`Making move: ${fromRow},${fromCol} -> ${toRow},${toCol}`);
    
    const piece = gameState.board[fromRow][fromCol];
    const capturedPiece = gameState.board[toRow][toCol];
    
    console.log(`Piece moved: ${piece.type} ${piece.color}, destination row: ${toRow}`);
    
    const move = {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: piece,
        capturedPiece: capturedPiece,
        notation: '',
        special: null
    };
    
    handleSpecialMoves(move);
    
    // Make the actual move
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = null;
    
    if (piece.type === 'k') {
        gameState.kingPositions[piece.color] = [toRow, toCol];
    }
    
    if (capturedPiece) {
        gameState.capturedPieces[capturedPiece.color === 'white' ? 'black' : 'white'].push(capturedPiece);
    }
    
    updateCastlingRights(move);
    
    // CRITICAL FIX: Check for pawn promotion AFTER the move is made
    const needsPromotion = piece.type === 'p' && (
        (piece.color === 'white' && toRow === 0) || 
        (piece.color === 'black' && toRow === 7)
    );
    
    console.log(`Checking promotion: piece=${piece.type}, color=${piece.color}, row=${toRow}, needsPromotion=${needsPromotion}`);
    
    if (needsPromotion) {
        console.log(`PAWN PROMOTION TRIGGERED at ${toRow}, ${toCol}`);
        handlePawnPromotionStart(toRow, toCol, move);
        return; // Don't finalize move yet
    }
    
    finalizeMove(move);
}

function handleSpecialMoves(move) {
    const piece = move.piece;
    
    // Castling
    if (piece.type === 'k' && Math.abs(move.to.col - move.from.col) === 2) {
        move.special = 'castling';
        
        if (move.to.col === 6) { // Kingside
            gameState.board[move.from.row][5] = gameState.board[move.from.row][7];
            gameState.board[move.from.row][7] = null;
        } else { // Queenside
            gameState.board[move.from.row][3] = gameState.board[move.from.row][0];
            gameState.board[move.from.row][0] = null;
        }
    }
    
    // En passant
    if (piece.type === 'p' && gameState.enPassantTarget && 
        move.to.row === gameState.enPassantTarget.row && 
        move.to.col === gameState.enPassantTarget.col) {
        move.special = 'enPassant';
        
        const capturedRow = piece.color === 'white' ? move.to.row + 1 : move.to.row - 1;
        move.capturedPiece = gameState.board[capturedRow][move.to.col];
        gameState.board[capturedRow][move.to.col] = null;
    }
    
    gameState.enPassantTarget = null;
    if (piece.type === 'p' && Math.abs(move.to.row - move.from.row) === 2) {
        gameState.enPassantTarget = {
            row: (move.from.row + move.to.row) / 2,
            col: move.from.col
        };
    }
}

function finalizeMove(move) {
    move.notation = generateMoveNotation(move);
    gameState.moveHistory.push(move);
    gameState.moveCount++;
    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    
    deselectSquare();
    updateBoardDisplay();
    updateGameDisplay();
    updateMoveHistory();
    updateCapturedPieces();
    updateGameStats();
    
    checkGameEnd();
    
    if (gameState.gameMode === 'ai' && gameState.currentPlayer === 'black' && !gameState.isGameOver) {
        setTimeout(() => makeAIMove(), 500);
    }
}

// ============================================================================
// PAWN PROMOTION - CRITICAL BUG FIX
// ============================================================================

function handlePawnPromotionStart(row, col, move) {
    console.log(`STARTING PAWN PROMOTION at ${row}, ${col}`);
    console.log(`Piece on board:`, gameState.board[row][col]);
    
    // Store the exact square position and move object for promotion
    gameState.promotionSquare = { row, col };
    gameState.promotionMove = move;
    
    // Show promotion modal - force it to be visible
    const modal = document.getElementById('promotion-modal');
    if (modal) {
        console.log(`Showing promotion modal`);
        modal.classList.remove('hidden'); // This should be enough
    } else {
        console.error('Promotion modal not found!');
    }
    
    // Also update the board display immediately
    updateBoardDisplay();
}

function selectPromotion(pieceType) {
    console.log(`PROMOTING PAWN to: ${pieceType} at position ${gameState.promotionSquare.row}, ${gameState.promotionSquare.col}`);
    
    if (!gameState.promotionSquare || !gameState.promotionMove) {
        console.error('Error: Invalid promotion state');
        return;
    }
    
    const { row, col } = gameState.promotionSquare;
    gameState.board[row][col].type = pieceType;
    
    // Hide modal
    const modal = document.getElementById('promotion-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Update the move with promotion info
    if (gameState.promotionMove) {
        gameState.promotionMove.special = 'promotion';
        gameState.promotionMove.promotionPiece = pieceType;
        
        // Finalize the move properly
        finalizeMove(gameState.promotionMove);
    }
    
    // Clear promotion state
    gameState.promotionSquare = null;
    gameState.promotionMove = null;
}

// ============================================================================
// MOVE VALIDATION AND CHESS RULES
// ============================================================================

function getValidMoves(row, col) {
    const piece = gameState.board[row][col];
    if (!piece || piece.color !== gameState.currentPlayer) return [];
    
    let moves = [];
    
    switch (piece.type) {
        case 'p': moves = getPawnMoves(row, col); break;
        case 'r': moves = getRookMoves(row, col); break;
        case 'n': moves = getKnightMoves(row, col); break;
        case 'b': moves = getBishopMoves(row, col); break;
        case 'q': moves = getQueenMoves(row, col); break;
        case 'k': moves = getKingMoves(row, col); break;
    }
    
    return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col));
}

function getPawnMoves(row, col) {
    const moves = [];
    const piece = gameState.board[row][col];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    
    // Forward move
    if (isValidSquare(row + direction, col) && !gameState.board[row + direction][col]) {
        moves.push({ row: row + direction, col: col, isCapture: false });
        
        if (row === startRow && !gameState.board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col: col, isCapture: false });
        }
    }
    
    // Diagonal captures
    for (const deltaCol of [-1, 1]) {
        const newRow = row + direction;
        const newCol = col + deltaCol;
        
        if (isValidSquare(newRow, newCol)) {
            const target = gameState.board[newRow][newCol];
            if (target && target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol, isCapture: true });
            }
            
            // En passant
            if (gameState.enPassantTarget && 
                newRow === gameState.enPassantTarget.row && 
                newCol === gameState.enPassantTarget.col) {
                moves.push({ row: newRow, col: newCol, isCapture: true });
            }
        }
    }
    
    return moves;
}

function getRookMoves(row, col) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (const [dRow, dCol] of directions) {
        for (let i = 1; i < 8; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            
            if (!isValidSquare(newRow, newCol)) break;
            
            const target = gameState.board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol, isCapture: false });
            } else {
                if (target.color !== gameState.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol, isCapture: true });
                }
                break;
            }
        }
    }
    
    return moves;
}

function getKnightMoves(row, col) {
    const moves = [];
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    
    for (const [dRow, dCol] of knightMoves) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (isValidSquare(newRow, newCol)) {
            const target = gameState.board[newRow][newCol];
            if (!target || target.color !== gameState.board[row][col].color) {
                moves.push({ row: newRow, col: newCol, isCapture: !!target });
            }
        }
    }
    
    return moves;
}

function getBishopMoves(row, col) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    for (const [dRow, dCol] of directions) {
        for (let i = 1; i < 8; i++) {
            const newRow = row + i * dRow;
            const newCol = col + i * dCol;
            
            if (!isValidSquare(newRow, newCol)) break;
            
            const target = gameState.board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol, isCapture: false });
            } else {
                if (target.color !== gameState.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol, isCapture: true });
                }
                break;
            }
        }
    }
    
    return moves;
}

function getQueenMoves(row, col) {
    return [...getRookMoves(row, col), ...getBishopMoves(row, col)];
}

function getKingMoves(row, col) {
    const moves = [];
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (isValidSquare(newRow, newCol)) {
            const target = gameState.board[newRow][newCol];
            if (!target || target.color !== gameState.board[row][col].color) {
                moves.push({ row: newRow, col: newCol, isCapture: !!target });
            }
        }
    }
    
    // Castling
    const color = gameState.board[row][col].color;
    if (gameState.castlingRights[color] && !isInCheck(color)) {
        if (gameState.castlingRights[color].kingside && 
            !gameState.board[row][5] && !gameState.board[row][6] &&
            !wouldBeInCheck(row, col, row, 5) && !wouldBeInCheck(row, col, row, 6)) {
            moves.push({ row: row, col: 6, isCapture: false });
        }
        
        if (gameState.castlingRights[color].queenside && 
            !gameState.board[row][3] && !gameState.board[row][2] && !gameState.board[row][1] &&
            !wouldBeInCheck(row, col, row, 3) && !wouldBeInCheck(row, col, row, 2)) {
            moves.push({ row: row, col: 2, isCapture: false });
        }
    }
    
    return moves;
}

function isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isInCheck(color) {
    const kingPos = gameState.kingPositions[color];
    return isSquareAttacked(kingPos[0], kingPos[1], color === 'white' ? 'black' : 'white');
}

function isSquareAttacked(row, col, byColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.color === byColor) {
                if (canPieceAttackSquare(r, c, row, col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function canPieceAttackSquare(pieceRow, pieceCol, targetRow, targetCol) {
    const piece = gameState.board[pieceRow][pieceCol];
    const rowDiff = targetRow - pieceRow;
    const colDiff = targetCol - pieceCol;
    
    switch (piece.type) {
        case 'p':
            const direction = piece.color === 'white' ? -1 : 1;
            return rowDiff === direction && Math.abs(colDiff) === 1;
        case 'r':
            return (rowDiff === 0 || colDiff === 0) && isPathClear(pieceRow, pieceCol, targetRow, targetCol);
        case 'n':
            return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || 
                   (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
        case 'b':
            return Math.abs(rowDiff) === Math.abs(colDiff) && isPathClear(pieceRow, pieceCol, targetRow, targetCol);
        case 'q':
            return (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && 
                   isPathClear(pieceRow, pieceCol, targetRow, targetCol);
        case 'k':
            return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
    }
    return false;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowDir = Math.sign(toRow - fromRow);
    const colDir = Math.sign(toCol - fromCol);
    
    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;
    
    while (currentRow !== toRow || currentCol !== toCol) {
        if (gameState.board[currentRow][currentCol] !== null) {
            return false;
        }
        currentRow += rowDir;
        currentCol += colDir;
    }
    
    return true;
}

function wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
    const originalPiece = gameState.board[toRow][toCol];
    const movingPiece = gameState.board[fromRow][fromCol];
    
    gameState.board[toRow][toCol] = movingPiece;
    gameState.board[fromRow][fromCol] = null;
    
    let originalKingPos = null;
    if (movingPiece.type === 'k') {
        originalKingPos = [...gameState.kingPositions[movingPiece.color]];
        gameState.kingPositions[movingPiece.color] = [toRow, toCol];
    }
    
    const inCheck = isInCheck(movingPiece.color);
    
    gameState.board[fromRow][fromCol] = movingPiece;
    gameState.board[toRow][toCol] = originalPiece;
    
    if (originalKingPos) {
        gameState.kingPositions[movingPiece.color] = originalKingPos;
    }
    
    return inCheck;
}

// ============================================================================
// ENHANCED AI IMPLEMENTATION
// ============================================================================

let previousMoves = []; // Track AI moves to prevent repetition

function makeAIMove() {
    console.log('AI is thinking...');
    showGameStatus('AI is thinking...', 'info');
    
    const settings = AI_SETTINGS[gameState.aiDifficulty];
    const bestMove = findBestMove(settings.depth, settings, 'black');
    
    if (bestMove) {
        setTimeout(() => {
            makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
        }, 800);
    }
}

function findBestMove(depth, settings, color) {
    let bestMove = null;
    let bestValue = -Infinity;
    const allMoves = getAllPossibleMoves(color);
    
    // Shuffle moves for randomness at lower difficulties
    if (settings.randomness > 0.1) {
        shuffleArray(allMoves);
    }
    
    // Prioritize captures and attacks for aggressive play
    // allMoves.sort((a, b) => {
    //     const scoreA = getMoveScore(a, settings);
    //     const scoreB = getMoveScore(b, settings);
    //     return scoreB - scoreA;
    // });
    
    for (const move of allMoves) {
        // Skip repetitive moves at higher difficulties
        if (isRepetitiveMove(move) && gameState.aiDifficulty !== 'easy') continue;
        
        makeTemporaryMove(move);
        const value = minimax(depth - 1, false, -Infinity, Infinity, settings);
        undoTemporaryMove(move);
        
        // Add randomness for lower difficulties
        const randomFactor = (Math.random() - 0.5) * settings.randomness * 100;
        const adjustedValue = value + randomFactor;
        
        if (adjustedValue > bestValue) {
            bestValue = adjustedValue;
            bestMove = move;
        }
    }
    
    // Track move to prevent repetition
    if (bestMove) {
        previousMoves.push(JSON.stringify({ from: bestMove.from, to: bestMove.to, piece: bestMove.piece.type }));
        if (previousMoves.length > 6) {
            previousMoves.shift();
        }
    }
    
    return bestMove;
}

function getMoveScore(move, settings) {
    let score = 0;
    
    // Prioritize captures
    if (move.capturedPiece) {
        score += PIECE_VALUES[move.capturedPiece.type] * settings.aggression;
    }
    
    // Prioritize center control
    const centerDistance = Math.abs(move.to.row - 3.5) + Math.abs(move.to.col - 3.5);
    score += (7 - centerDistance) * 10 * settings.positionalWeight;
    
    // Prioritize piece development
    if (move.from.row === 0 || move.from.row === 1) {
        score += 20 * settings.positionalWeight;
    }
    
    // Prioritize attacks on opponent king area
    const whiteKingPos = gameState.kingPositions.white;
    const kingDistance = Math.abs(move.to.row - whiteKingPos[0]) + Math.abs(move.to.col - whiteKingPos[1]);
    if (kingDistance <= 2) {
        score += 30 * settings.aggression;
    }
    
    return score;
}

function isRepetitiveMove(move) {
    const moveString = JSON.stringify({
        from: move.from,
        to: move.to,
        piece: move.piece.type
    });

    // Check if the last two moves are the same as this one (back and forth)
    return previousMoves.length >= 2 &&
           previousMoves[previousMoves.length - 2] === moveString;
}

function minimax(depth, isMaximizing, alpha, beta, settings) {
    if (depth === 0) {
        return evaluatePosition(settings);
    }
    
    const color = isMaximizing ? 'black' : 'white';
    const moves = getAllPossibleMoves(color);
    
    if (moves.length === 0) {
        if (isInCheck(color)) {
            return isMaximizing ? -999999 : 999999;
        } else {
            return 0;
        }
    }
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            makeTemporaryMove(move);
            const eval = minimax(depth - 1, false, alpha, beta, settings);
            undoTemporaryMove(move);
            
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            makeTemporaryMove(move);
            const eval = minimax(depth - 1, true, alpha, beta, settings);
            undoTemporaryMove(move);
            
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function getAllPossibleMoves(color) {
    const moves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.color === color) {
                const pieceMoves = getValidMoves(row, col);
                pieceMoves.forEach(move => {
                    moves.push({
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        piece: piece,
                        capturedPiece: gameState.board[move.row][move.col]
                    });
                });
            }
        }
    }
    
    return moves;
}

function evaluatePosition(settings) {
    let score = 0;
    
    // Material evaluation
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece) {
                let pieceValue = PIECE_VALUES[piece.type];
                
                // Add positional bonuses
                if (PIECE_SQUARE_TABLES[piece.type]) {
                    const tableRow = piece.color === 'white' ? 7 - row : row;
                    pieceValue += PIECE_SQUARE_TABLES[piece.type][tableRow][col] * settings.positionalWeight;
                }
                
                // Mobility bonus
                const mobility = getValidMoves(row, col).length;
                pieceValue += mobility * 5 * settings.positionalWeight;
                
                if (piece.color === 'black') {
                    score += pieceValue;
                } else {
                    score -= pieceValue;
                }
            }
        }
    }
    
    // King safety evaluation
    score += evaluateKingSafety('black', settings) - evaluateKingSafety('white', settings);
    
    // Center control bonus
    score += evaluateCenterControl('black', settings) - evaluateCenterControl('white', settings);
    
    return score;
}

function evaluateKingSafety(color, settings) {
    const kingPos = gameState.kingPositions[color];
    let safety = 0;
    
    // Check if king is castled
    if ((color === 'white' && kingPos[1] > 5) || (color === 'black' && kingPos[1] > 5)) {
        safety += 50 * settings.positionalWeight;
    }
    
    // Penalty for exposed king
    const opponentColor = color === 'white' ? 'black' : 'white';
    const attackers = countAttackers(kingPos[0], kingPos[1], opponentColor);
    safety -= attackers * 30 * settings.aggression;
    
    return safety;
}

function evaluateCenterControl(color, settings) {
    let control = 0;
    const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
    
    for (const [row, col] of centerSquares) {
        if (gameState.board[row][col] && gameState.board[row][col].color === color) {
            control += 20 * settings.positionalWeight;
        }
        if (isSquareAttacked(row, col, color)) {
            control += 10 * settings.positionalWeight;
        }
    }
    
    return control;
}

function countAttackers(row, col, color) {
    let count = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.color === color && canPieceAttackSquare(r, c, row, col)) {
                count++;
            }
        }
    }
    return count;
}

let tempMoveState = {};

function makeTemporaryMove(move) {    
    tempMoveState.capturedPiece = gameState.board[move.to.row][move.to.col];
    tempMoveState.originalKingPos = null;

    gameState.board[move.to.row][move.to.col] = move.piece;
    gameState.board[move.from.row][move.from.col] = null;
    
    if (move.piece.type === 'k') {
        tempMoveState.originalKingPos = [...gameState.kingPositions[move.piece.color]];
        gameState.kingPositions[move.piece.color] = [move.to.row, move.to.col];
    }
}

function undoTemporaryMove(move) {
    gameState.board[move.from.row][move.from.col] = move.piece;
    gameState.board[move.to.row][move.to.col] = tempMoveState.capturedPiece;
    
    if (move.piece.type === 'k') {
        gameState.kingPositions[move.piece.color] = tempMoveState.originalKingPos;
    }

    tempMoveState = {};
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ============================================================================
// GAME END CONDITIONS
// ============================================================================

function checkGameEnd() {
    const currentColor = gameState.currentPlayer;
    const hasValidMoves = hasAnyValidMoves(currentColor);
    
    if (!hasValidMoves) {
        if (isInCheck(currentColor)) {
            gameState.isGameOver = true;
            gameState.winner = currentColor === 'white' ? 'black' : 'white';
            const winnerName = gameState.winner.charAt(0).toUpperCase() + gameState.winner.slice(1);
            showGameEnd('Checkmate!', `${winnerName} wins!`);
            showGameStatus('Checkmate!', 'error');
        } else {
            gameState.isGameOver = true;
            gameState.winner = 'draw';
            showGameEnd('Stalemate!', 'The game is a draw.');
            showGameStatus('Draw - Stalemate!', 'info');
        }
    } else if (isInCheck(currentColor)) {
        showGameStatus('Check!', 'warning');
    }
}

function hasAnyValidMoves(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.color === color) {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// ============================================================================
// GAME CONTROLS
// ============================================================================

function undoLastMove() {
    if (gameState.moveHistory.length === 0 || gameState.isGameOver) return;
    
    console.log('Undoing last move');
    
    const lastMove = gameState.moveHistory.pop();
    gameState.moveCount--;
    
    gameState.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    gameState.board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
    
    if (lastMove.special === 'castling') {
        if (lastMove.to.col === 6) {
            gameState.board[lastMove.from.row][7] = gameState.board[lastMove.from.row][5];
            gameState.board[lastMove.from.row][5] = null;
        } else {
            gameState.board[lastMove.from.row][0] = gameState.board[lastMove.from.row][3];
            gameState.board[lastMove.from.row][3] = null;
        }
    }
    
    if (lastMove.special === 'enPassant') {
        const capturedRow = lastMove.piece.color === 'white' ? lastMove.to.row + 1 : lastMove.to.row - 1;
        gameState.board[capturedRow][lastMove.to.col] = lastMove.capturedPiece;
        gameState.board[lastMove.to.row][lastMove.to.col] = null;
    }
    
    if (lastMove.piece.type === 'k') {
        gameState.kingPositions[lastMove.piece.color] = [lastMove.from.row, lastMove.from.col];
    }
    
    if (lastMove.capturedPiece && lastMove.special !== 'enPassant') {
        const capturedList = gameState.capturedPieces[lastMove.capturedPiece.color === 'white' ? 'black' : 'white'];
        const index = capturedList.findIndex(p => p.type === lastMove.capturedPiece.type);
        if (index !== -1) {
            capturedList.splice(index, 1);
        }
    }
    
    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    
    updateBoardDisplay();
    updateGameDisplay();
    updateMoveHistory();
    updateCapturedPieces();
    
    if (gameState.gameMode === 'ai' && gameState.moveHistory.length > 0) {
        setTimeout(() => undoLastMove(), 100);
    }
}

function pauseGame() {
    console.log('Pausing game');
    gameState.isGamePaused = true;
    document.getElementById('pause-screen').classList.remove('hidden');
}

function resumeGame() {
    console.log('Resuming game');
    gameState.isGamePaused = false;
    document.getElementById('pause-screen').classList.add('hidden');
}

function closeSettings() {
    // Placeholder for closing settings modal without saving
    document.getElementById('settings-modal').classList.add('hidden');
}

function toggleMoveHistory() {
    const historyElement = document.querySelector('.move-history');
    if (historyElement) {
        historyElement.classList.toggle('expanded');
        console.log('Move history toggled');
    }
}

function resetGame() {
    console.log('Resetting game');
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    
    previousMoves = []; // Reset AI move history
    initializeGame();
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateGameDisplay() {
    const playerTurnElement = document.getElementById('turn-indicator');
    if (playerTurnElement) {
        const playerName = gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1);
        playerTurnElement.textContent = `${playerName}'s Turn`;
    }
    
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.disabled = gameState.moveHistory.length === 0 || gameState.isGameOver;
    }
}

function updateMoveHistory() {
    const historyElement = document.getElementById('move-list');
    if (!historyElement) return;
    
    historyElement.innerHTML = '';
    
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
        const moveEntry = document.createElement('div');
        moveEntry.className = 'move-entry';
        
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = gameState.moveHistory[i];
        const blackMove = gameState.moveHistory[i + 1];
        
        moveEntry.innerHTML = `
            <span class="move-number">${moveNumber}.</span>
            <span class="move-notation">${whiteMove ? whiteMove.notation : ''}</span>
            ${blackMove ? `<span class="move-notation">${blackMove.notation}</span>` : ''}
        `;
        
        historyElement.appendChild(moveEntry);
    }
    
    historyElement.scrollTop = historyElement.scrollHeight;
}

function updateCapturedPieces() {
    const whiteElement = document.getElementById('captured-white');
    const blackElement = document.getElementById('captured-black');
    
    if (whiteElement) {
        whiteElement.innerHTML = gameState.capturedPieces.white.map(piece => 
            `<span class="captured-piece">${PIECE_SYMBOLS.black[piece.type]}</span>`
        ).join('');
    }
    
    if (blackElement) {
        blackElement.innerHTML = gameState.capturedPieces.black.map(piece => 
            `<span class="captured-piece">${PIECE_SYMBOLS.white[piece.type]}</span>`
        ).join('');
    }
}

function updateGameStats() {
    const moveCountElement = document.getElementById('move-count');
    const gameTimeElement = document.getElementById('game-time');
    
    if (moveCountElement) {
        moveCountElement.textContent = gameState.moveCount;
    }
    
    if (gameTimeElement && gameState.gameStartTime) {
        const elapsed = Math.floor((new Date() - gameState.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        gameTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function showGameStatus(message, type = 'info') {
    const statusElement = document.getElementById('game-status');
    const titleElement = document.getElementById('status-title');
    const messageElement = document.getElementById('status-message');
    
    titleElement.textContent = message;
    messageElement.textContent = ''; // Can add more details here if needed
    
    statusElement.classList.remove('hidden');
    
    if (type === 'info' || type === 'success') {
        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, 3000);
    }
}

function hideStatus() {
    const statusElement = document.getElementById('game-status');
    if (statusElement) statusElement.classList.add('hidden');
}

function showGameEnd(title, message) {
    const modal = document.getElementById('game-over-modal');
    const titleElement = document.getElementById('game-over-title');
    const messageElement = document.getElementById('game-over-message');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    modal.classList.remove('hidden');
}

// ============================================================================
// ADDITIONAL UTILITIES
// ============================================================================

function updateCastlingRights(move) {
    const piece = move.piece;
    
    if (piece.type === 'k') {
        gameState.castlingRights[piece.color].kingside = false;
        gameState.castlingRights[piece.color].queenside = false;
    }
    
    if (piece.type === 'r') {
        if (move.from.col === 0) {
            gameState.castlingRights[piece.color].queenside = false;
        } else if (move.from.col === 7) {
            gameState.castlingRights[piece.color].kingside = false;
        }
    }
    
    if (move.capturedPiece && move.capturedPiece.type === 'r') {
        const opponentColor = move.capturedPiece.color;
        if (move.to.col === 0) {
            gameState.castlingRights[opponentColor].queenside = false;
        } else if (move.to.col === 7) {
            gameState.castlingRights[opponentColor].kingside = false;
        }
    }
}

function generateMoveNotation(move) {
    const piece = move.piece;
    let notation = '';
    
    if (move.special === 'castling') {
        return move.to.col === 6 ? 'O-O' : 'O-O-O';
    }
    
    if (piece.type !== 'p') {
        notation += piece.type.toUpperCase();
    }
    
    if (move.capturedPiece || move.special === 'enPassant') {
        if (piece.type === 'p') {
            notation += String.fromCharCode(97 + move.from.col);
        }
        notation += 'x';
    }
    
    notation += String.fromCharCode(97 + move.to.col) + (8 - move.to.row);
    
    if (move.special === 'promotion') {
        notation += '=' + (move.promotionPiece || 'Q').toUpperCase();
    }
    
    const opponent = piece.color === 'white' ? 'black' : 'white';
    if (isInCheck(opponent)) {
        notation += hasAnyValidMoves(opponent) ? '+' : '#';
    }
    
    return notation;
}

function startGameTimer() {
    setInterval(() => {
        if (!gameState.isGamePaused && !gameState.isGameOver && gameState.gameStartTime) {
            updateGameStats();
        }
    }, 1000);
}

function setupDragAndDrop() {
    // Drag and drop functionality would be implemented here
    // For now, we rely on click-based movement
}

console.log("Davi's Chess Game JavaScript loaded successfully");