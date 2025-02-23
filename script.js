// Create a class for lines
class line {
    constructor(i1, i2, i3) {
        this.i1 = i1;
        this.i2 = i2;
        this.i3 = i3;
    }
    value(gameBoard) {
        let cntPlayer = 0, cntBot = 0, cnt = 0;
        let arr = [this.i1, this.i2, this.i3];
        for (let j = 0; j < 3; j++) {
            if (gameBoard.position[arr[j]].owner == "player") cntPlayer++;
            if (gameBoard.position[arr[j]].owner == "bot") cntBot++;
        }
        cnt = Math.max(cntBot, cntPlayer);
        return cnt;
    }
    status(gameBoard) {
        let cntPlayer = 0, cntBot = 0, cnt = 0;
        let arr = [this.i1, this.i2, this.i3];
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
    function remainSquare(gameBoard, l, index) {
        if (gameBoard.position[l[index].i1].owner.length == 0) return l[index].i1;
        else if (gameBoard.position[l[index].i2].owner.length == 0) return l[index].i2;
        else return l[index].i3;
    }
    let detFull = () => {
        for (i = 0; i < 3; i++) {
            if (row[i].value(gameBoard) == 3) return detWinner(row, i);
            if (col[i].value(gameBoard) == 3) return detWinner(col, i);
            if (i <= 1 && diag[i].value(gameBoard) == 3) return detWinner(diag, i);
        }
        return false;
    };
    let detAdvtg = () => {
        for (k = 0; k < 3; k++) {
            let statusRow = row[k].status(gameBoard);
            let statusCol = col[k].status(gameBoard);
            let statusDiag;
            if (k <= 1) statusDiag = diag[k].status(gameBoard);
            if (statusRow[0] == 2 &&
                statusRow[1] != null) return [remainSquare(gameBoard, row, k), detWinner(row, k)];
            if (statusCol[0] == 2 &&
                statusCol[1] != null) return [remainSquare(gameBoard, col, k), detWinner(col, k)];
            if (k <= 1 && statusDiag[0] == 2 &&
                statusDiag[1] != null) return [remainSquare(gameBoard, diag, k), detWinner(diag, k)];
        }
        return [null, null];
    };
    return {detFull, detAdvtg};
})();
// create the game board
const gameBoard = (function createBoard() {
    let spareSpace = 0;
    const board = document.querySelector(".board");
    const position = new Array(9).fill(null);
    // bot plays
    const botMove = () => {
        if (spareSpace >= 9) return;
        let rand = Math.floor(Math.random() * 9);
        let advtg = winDet.detAdvtg();
        if (advtg[1] == "bot" || advtg[1] == "player") {
            position[advtg[0]].owner = "bot";
            position[advtg[0]].control.textContent = "X";
            position[advtg[0]].control.style.color = "green";
        }
        else {
            while (position[rand].owner.length != 0) {
                rand = Math.floor(Math.random() * 9);
            }
            position[rand].owner = "bot";
            position[rand].control.textContent = "X";
            position[rand].control.style.color = "green";
        } 
        spareSpace++;
        if (winDet.detFull()) setTimeout(() => announceWinner(winDet.detFull()), 500);
        else if (spareSpace >= 9) setTimeout(() => announceWinner("Tie"), 500);
    };

    for (i = 0; i < 9; i++) {
        // dynamically create squares
        position[i] = {};
        position[i].owner = "";
        position[i].control = document.createElement("div");
        position[i].control.setAttribute("class", "position");
        position[i].control.style.width = "30px";
        position[i].control.style.height = "30px";
        position[i].control.style.border = "1px solid black";
        position[i].control.style.display = "flex";
        position[i].control.style.justifyContent = "center";
        position[i].control.style.alignItems = "center";
        board.appendChild(position[i].control);
        // Player plays
        let tmp = i;
        position[tmp].control.addEventListener("click", function(e) {
            if (e.target.textContent.length == 0) {
                e.target.textContent = "O";
                e.target.style.color = "red";
                position[tmp].owner = "player";
                spareSpace++;
                if (winDet.detFull()) setTimeout(() => announceWinner(winDet.detFull()), 500);
                else if (spareSpace == 9) setTimeout(() => announceWinner("Tie"), 500);
                else setTimeout(() => botMove(), 100);
            };
        });
    }
    return {board, position};
})();

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
    popup.style.display = "flex";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.fontSize = "0.5rem";
    body.appendChild(popup);
    popup.style.width = "120px";
    popup.style.height = "80%";
}