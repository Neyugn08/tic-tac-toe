// Create a class for lines
class line {
    constructor(i1, i2, i3) {
        this.i = [i1, i2, i3];
    }
    // calculate the number of squares of the prevalent
    value(gameBoard) {
        let cntPlayer = 0, cntBot = 0, cnt = 0;
        let arr = [this.i[0], this.i[1], this.i[2]];
        for (let j = 0; j < 3; j++) {
            if (gameBoard.position[arr[j]].owner == "player") cntPlayer++;
            else if (gameBoard.position[arr[j]].owner == "bot") cntBot++;
        }
        cnt = Math.max(cntBot, cntPlayer);
        return cnt;
    }
    // return the total number of filled square and the prevalent
    status(gameBoard) {
        let cntPlayer = 0, cntBot = 0;
        let arr = [this.i[0], this.i[1], this.i[2]];
        for (let j = 0; j < 3; j++) {
            if (gameBoard.position[arr[j]].owner == "player") cntPlayer++;
            if (gameBoard.position[arr[j]].owner == "bot") cntBot++;
        }
        if (cntPlayer > cntBot) return [cntPlayer + cntBot, "player"];
        else if (cntBot > cntPlayer) return [cntPlayer + cntBot, "bot"];
        else return [null, null];
    }
}
// create the winning conditions
const winDet = (() => {
    // set up rows
    let col = new Array(3);
    col[0] = new line(0, 3, 6);
    col[1] = new line (1, 4, 7);
    col[2] = new line (2, 5, 8);

    // set up cols
    let row = new Array(3);
    row[0] = new line(0, 1, 2);
    row[1] = new line(3, 4, 5);
    row[2] = new line(6, 7, 8);

    // set up diagonals
    let diag = new Array(2);
    diag[0] = new line (0, 4, 8);
    diag[1] = new line (2, 4, 6);

    // stop the game
    let detWinner = (l, index) => {
        return l[index].status(gameBoard)[1];
    }
    // find the index of the blank squares
    function remainSquare(gameBoard, l, index) {
        if (gameBoard.position[l[index].i[0]].owner.length == 0) return l[index].i[0];
        else if (gameBoard.position[l[index].i[1]].owner.length == 0) return l[index].i[1];
        else return l[index].i[2];
    }
    // determining the end of the game
    let detFull = () => {
        for (let i = 0; i < 3; i++) {
            if (row[i].value(gameBoard) == 3) return detWinner(row, i);
            if (col[i].value(gameBoard) == 3) return detWinner(col, i);
            if (i <= 1 && diag[i].value(gameBoard) == 3) return detWinner(diag, i);
        }
        return false;
    };
    // These 2 functions decide the bot to block or to win
    function detWinBot(statusL, l, index) {
        if (statusL == null) return [null, null];
        if (statusL[0] == 2 && statusL[1] != null) {
            const triumphant = detWinner(l, index);
            if (triumphant == "bot") return [remainSquare(gameBoard, l, index), "bot"];
            else if (triumphant == "player") return [remainSquare(gameBoard, l, index), "player"];
        }
        return [null, null];
    };
    let detAdvtg = (side) => {
        let altOpt = [null, null];
        for (let k = 0; k < 3; k++) {
            let statusRow = row[k].status(gameBoard);
            let statusCol = col[k].status(gameBoard);
            let statusDiag;
            if (k <= 1) statusDiag = diag[k].status(gameBoard);

            // the bot prioritizes winning over blocking
            let tmp1 = detWinBot(statusRow, row, k);
            let tmp2 = detWinBot(statusCol, col, k);
            let tmp3 = detWinBot(statusDiag, diag, k);
            if (tmp1[1] == side) return tmp1;
            else if (tmp1[1] != null) altOpt = tmp1;
            if (tmp2[1] == side) return tmp2;
            else if (tmp2[1] != null) altOpt = tmp2;
            if (k <= 1 && tmp3[1] == side) return tmp3;
            else if (k <= 1 && tmp3[1] != null) altOpt = tmp3;
        }
        return altOpt;
    };
    return {detFull, detAdvtg, row, col, diag};
})();
// create the game board
const gameBoard = (function createBoard() {
    let spareSpace = 0;
    const board = document.querySelector(".board");
    const position = new Array(9).fill(null);
    // bot plays
    const botMove = () => {
        let advtg = winDet.detAdvtg("bot");
        // block or win if possible
        if (advtg[1] == "bot" || advtg[1] == "player") tickSquare("bot", advtg[0], gameBoard);
        // strategic moves when there is no danger
        else if (position[4].owner.length == 0)  tickSquare("bot", 4, gameBoard);
        else {
            // The best move available
            let optimalMove = bestMove(savePositions());
            console.log(optimalMove);
            tickSquare("bot", optimalMove, gameBoard);
        } 
        spareSpace++;
        if (gameTermi(spareSpace)) spareSpace = 0;
    };

    for (let i = 0; i < 9; i++) {
        // dynamically create squares
        position[i] = {};
        position[i].owner = "";
        position[i].control = document.createElement("div");
        position[i].control.setAttribute("class", "position");
        position[i].control.style.width = "4rem";
        position[i].control.style.height = "4rem";
        position[i].control.style.fontSize = "2rem";
        position[i].control.style.border = "1px solid black";
        position[i].control.style.display = "flex";
        position[i].control.style.justifyContent = "center";
        position[i].control.style.alignItems = "center";
        board.appendChild(position[i].control);
        // Player plays
        position[i].control.addEventListener("click", function(e) {
            if (e.target.textContent.length == 0) {
                tickSquare("player", i, gameBoard);
                spareSpace++;
                if (gameTermi(spareSpace)) spareSpace = 0;
                else setTimeout(() => botMove(i), 100);
            };
        });
    }
    return {board, position};
})();

function gameTermi(spareSpace) {
    if (winDet.detFull()) {
        setTimeout(() => announceWinner(winDet.detFull()), 500);
        return true;
    }
    else if (spareSpace == 9) {
        setTimeout(() => announceWinner("Tie"), 500);
        return true;
    }
    else return false;
}

function announceWinner(winner) {
    let body = document.querySelector("body");
    let popup = document.createElement("div");
    if (winner == "Tie") {
        popup.textContent = winner;
    }
    else popup.textContent = `The winner is ${winner}`;
    popup.style.position = "absolute";
    popup.style.fontWeight = "700";
    popup.style.backgroundColor = "white";
    popup.style.border = "2px solid black";
    popup.style.borderRadius = "5px";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.fontSize = "1rem";
    body.appendChild(popup);
    popup.style.width = "14rem";
    popup.style.height = "14rem";

    // create a delete pop-up
    let reset = document.createElement("button");
    reset.style.fontSize = "0.5rem";
    reset.style.border = "1px solid black";
    reset.style.margin = "5px";
    reset.style.borderRadius = "5px";
    reset.style.backgroundColor = "#24a0ed";
    reset.textContent = "Want to play again?"
    reset.style.color = "white";
    reset.addEventListener("click", () => resetBoard(gameBoard, popup, reset));
    reset.addEventListener("mouseover", () => {
        reset.style.backgroundColor = "rgb(7, 94, 156)";
    });
    reset.addEventListener("mouseout", () => {
        reset.style.backgroundColor = "#24a0ed";
    });
    popup.appendChild(reset);
}

// tick a square 
function tickSquare(owner, index, gameBoard) {
    if (owner == "player") {
        gameBoard.position[index].control.textContent = "O";
        gameBoard.position[index].control.style.color = "red";
        gameBoard.position[index].owner = "player";
    }
    else if (owner == "bot") {
        gameBoard.position[index].owner = "bot";
        gameBoard.position[index].control.textContent = "X";
        gameBoard.position[index].control.style.color = "green";
    }
    else return;
}

// reset the game 
function resetBoard(gameBoard, popup, reset) {
    for (let i = 0; i < 9; i++) {
        gameBoard.position[i].owner = "";
        gameBoard.position[i].control.textContent = "";
    }
    popup.remove();
    reset.remove();
}

function savePositions() {
    let originalPosition = [];
    for (let i = 0; i < 9; i++) {
        if (gameBoard.position[i].owner.length == 0) originalPosition.push(i);
    }
    return originalPosition;
}

// Minimax algorithm
function bestMove(currentPositions) {
    let optimalMove;
    let optimalVal = -Infinity;
    for (let i of currentPositions) {
        gameBoard.position[i].owner = "bot";
        let val = minimax(-Infinity, Infinity, "player"); // FIXED: Start with "player"
        if (optimalVal < val) {
            optimalVal = val;
            optimalMove = i;
        }
        gameBoard.position[i].owner = "";
    }
    return optimalMove;
}

// Minimax algorithm
function bestMove(currentPositions) {
    let optimalMove;
    let optimalVal = -Infinity;
    for (let i of currentPositions) {
        gameBoard.position[i].owner = "bot";
        // This is the turn of the minimizer
        let val = minimax(-Infinity, Infinity, "player");
        if (optimalVal < val) {
            optimalVal = val;
            optimalMove = i;
        }
        gameBoard.position[i].owner = "";
    }
    return optimalMove;
}

// Using alpha-beta pruning technique
function minimax(alpha, beta, side) {
    let currentPositions = savePositions();
    // Calculate the scores
    let detFull = winDet.detFull();
    if (detFull != false || currentPositions.length == 0) {
        if (detFull == "player") return -1;
        else if (detFull == "bot") return 1;
        else return 0;
    }
    if (side == "bot") {
        let maxVal = -Infinity;
        // Searching for optimal moves from the position's children
        for (let i of currentPositions) {
            gameBoard.position[i].owner = "bot";
            maxVal = Math.max(maxVal, minimax(alpha, beta, "player"));
            alpha = maxVal; 
            gameBoard.position[i].owner = "";
            if (beta <= alpha) break;
        }
        return maxVal;
    }
    else {
        let minVal = Infinity;
        for (let i of currentPositions) {
            gameBoard.position[i].owner = "player";
            minVal = Math.min(minVal, minimax(alpha, beta, "bot"));
            beta = minVal;
            gameBoard.position[i].owner = "";
            if (beta <= alpha) break;
        }
        return minVal;
    }
}
