import Line from "./line.js";
const board = document.querySelector(".board");
const body = document.querySelector("body");

// Tracking information
const urlParams = new URLSearchParams(window.location.search);
const trafficSource = urlParams.get("utm_source") || document.referrer || "direct";
const trafficMedium = urlParams.get("utm_medium") || "none";
const trafficCampaign = urlParams.get("utm_campaign") || "none";

// The game board is a NUMBER_OF_CELLS * NUMBER_OF_CELLS square
const NUMBER_OF_CELLS = 3;
// A player wins if their have WIN_CELLS cells forming a line 
const WIN_CELLS = 3;
const SQUARE_DIAGONALS = 2;

class GameBoard {
    constructor() {
        this.emptyCells = NUMBER_OF_CELLS ** 2;
        this.gameStartedAt = null;
        this.gameMoves = 0;
        this.gameCompleted = false;
        // Create an array representing the game board 
        this.cells = new Array(NUMBER_OF_CELLS ** 2);
        // Each cell having an index and a state
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i] = {
                index: i,
                // A cell's state can be "player", "bot", or "null"
                state: null
            };
        }
        this.cols = new Array(NUMBER_OF_CELLS);
        this.rows = new Array(NUMBER_OF_CELLS);
        this.diags = new Array(SQUARE_DIAGONALS);
        // Each column, row or diagonal contains NUMBER_OF_CELLS cells
        for (let i = 0; i < NUMBER_OF_CELLS; i++) {
            let colCells = new Array(NUMBER_OF_CELLS);
            let rowCells = new Array(NUMBER_OF_CELLS);
            let diagCells;
            if (i <= SQUARE_DIAGONALS - 1) {
                diagCells = new Array(NUMBER_OF_CELLS);
            }
            for (let j = 0; j < NUMBER_OF_CELLS; j++) {
                // Assign cells to their corresponding rows / columns
                colCells[j] = this.cells[i + j * NUMBER_OF_CELLS];
                rowCells[j] = this.cells[i * NUMBER_OF_CELLS + j];
                if (i <= SQUARE_DIAGONALS - 1) {
                    // Assign cells to their corresponding diagonals
                    // 1st diagonal
                    if (i == 0) diagCells[j] = this.cells[j * (NUMBER_OF_CELLS + 1)]; 
                    // 2nd diagonal
                    else if (i == 1) diagCells[j] = this.cells[(j + 1) * (NUMBER_OF_CELLS - 1)];
                }
            }
            // Set up rows, columns and diagonals
            this.cols[i] = new Line(colCells);
            this.rows[i] = new Line(rowCells);
            if (i <= SQUARE_DIAGONALS - 1) {
                this.diags[i] = new Line(diagCells);
            }
        }
    }
    initDOM() {
        // Dynamically generate DOM cells
        for (let i = 0; i < this.cells.length; i++) {
            const DOMCell = document.createElement("div");
            DOMCell.setAttribute("class", "cell");
            DOMCell.setAttribute("id", `${i}`);
            board.appendChild(DOMCell);
        }
        board.addEventListener("click", (e) => {
            if (e.target.className == "cell" && e.target.textContent.length == 0) {
                // Track the start of an actual game
                if (!this.gameStartedAt) {
                    this.gameStartedAt = Date.now();
                    if (typeof gtag === "function") {
                        gtag("event", "game_started", {
                            traffic_source: trafficSource,
                            traffic_medium: trafficMedium,
                            traffic_campaign: trafficCampaign
                        });
                    }
                }
                this.gameMoves++;
                // Update DOM
                this.tickDOMCell("player", e.target);
                // Update internal data
                const id = parseInt(e.target.id);
                this.cells[id].state = "player";
                this.emptyCells--;
                // Decide whether the game ends or bot moves
                const winner = this.winner();
                if (winner) {
                    setTimeout(() => this.announceWinner(winner), 500);
                }
                else setTimeout(() => this.botMove(), 100);
            };
        });
    }
    tickDOMCell(state, DOMCell) {
        if (state == "player") {
            DOMCell.textContent = "O";
            DOMCell.style.color = "red";
        }
        else if (state == "bot") {
            DOMCell.textContent = "X";
            DOMCell.style.color = "green";
        }
        else return;
    }
    // Determine the winner of the game
    winner() {
        // Iterate over all rows, columns and diagonals to check whether there is a winner
        for (let i = 0; i < NUMBER_OF_CELLS; i++) {
            // In a line, if the prevalent side has WIN_CELLS cells, it wins
            const rowPrevalent = this.rows[i].prevalent();
            if (rowPrevalent && rowPrevalent.cellCount == WIN_CELLS) return rowPrevalent.identity;
            const colPrevalent = this.cols[i].prevalent();
            if (colPrevalent && colPrevalent.cellCount == WIN_CELLS) return colPrevalent.identity;
            if (i <= SQUARE_DIAGONALS - 1) {
                const diagPrevalent = this.diags[i].prevalent();
                if (diagPrevalent && diagPrevalent.cellCount == WIN_CELLS) return diagPrevalent.identity;
            }
        }
        // Tie if all cells are occupied
        if (this.emptyCells == 0) {
            return "Tie";
        }
        return null;
    }
    announceWinner(winner) {
        // Track completion of an actual game
        if (!this.gameCompleted && this.gameStartedAt) {
            this.gameCompleted = true;
            const duration = Math.round((Date.now() - this.gameStartedAt) / 1000);
            if (typeof gtag === "function") {
                gtag("event", "game_completed", {
                    result: winner == "Tie" ? "tie" : winner,
                    moves: this.gameMoves,
                    duration_seconds: duration,
                    traffic_source: trafficSource,
                    traffic_medium: trafficMedium,
                    traffic_campaign: trafficCampaign
                });
            }
        }
        // Create a popup
        const popup = document.createElement("div");
        popup.setAttribute("class", "popup");
        if (winner == "Tie") popup.textContent = winner;
        else popup.textContent = `The winner is ${winner}`;
        body.appendChild(popup);
        // Create a reset button on the popup
        const reset = document.createElement("button");
        reset.setAttribute("class", "reset");
        reset.textContent = "Want to play again?"
        reset.addEventListener("click", () => {
            this.reset();
            popup.remove();
            reset.remove();
        });
        popup.appendChild(reset);
    }
    // Reset the game 
    reset() {
        if (typeof gtag === "function") {
            gtag("event", "game_reset");
        }
        this.emptyCells = NUMBER_OF_CELLS ** 2;
        this.gameStartedAt = null;
        this.gameMoves = 0;
        this.gameCompleted = false;
        for (let i = 0; i < this.cells.length; i++) {
            // Internal data reset
            this.cells[i].state = null;
        }
        // DOM reset
        Array.from(document.querySelectorAll(".cell")).forEach((cell) => {
            cell.textContent = "";
        });
    }
    botMove() {
        let optimalCell = null;
        // If player or bot can win in the next move, bot moves to the corresponding position to reduce computations
        const iMove = this.inevitableMove();
        if (iMove) optimalCell = iMove;
        // Use the best move available
        else optimalCell = this.bestMove(this.vacantCells());       
        // Select the DOM cell that represents the best move
        const DOMCell = document.getElementById(`${optimalCell.index}`);
        // Update DOM
        this.tickDOMCell("bot", DOMCell);
        // Update internal data
        optimalCell.state = "bot";
        this.emptyCells--;
        this.gameMoves++;
        // Determine the end of the game
        const winner = this.winner();
        if (winner) {
            setTimeout(() => this.announceWinner(winner), 500);
        }
    }
    inevitableMove() {
        let moves = [];
        // Iterate over all rows, columns and diagonals
        for (let i = 0; i < NUMBER_OF_CELLS; i++) {
            const rowPrevalent = this.rows[i].prevalent();
            if (rowPrevalent && rowPrevalent.cellCount == 2 && this.rows[i].filledCount() != 3) moves.push(this.rows[i].blankCell());
            const colPrevalent = this.cols[i].prevalent();
            if (colPrevalent && colPrevalent.cellCount == 2 && this.cols[i].filledCount() != 3) moves.push(this.cols[i].blankCell());
            if (i <= SQUARE_DIAGONALS - 1) {
                const diagPrevalent = this.diags[i].prevalent();
                if (diagPrevalent && diagPrevalent.cellCount == 2 && this.diags[i].filledCount() != 3) moves.push(this.diags[i].blankCell());
            }
        }
        if (moves.length == 0) return null;
        // Prioritize win immdiately over blocking
        for (const move of moves) {
            if (move.state == "bot") return move;
        }
        return moves[0];
    }
    vacantCells() {
        let emptyCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            if (!this.cells[i].state) emptyCells.push(this.cells[i]);
        }
        return emptyCells;
    }
    // Minimax algorithm
    bestMove(vacantCells) {
        let optimalMove;
        let optimalVal = -Infinity;
        for (let cell of vacantCells) {
            cell.state = "bot";
            // This is the turn of the minimizer
            const val = this.minimax(-Infinity, Infinity, "player");
            if (optimalVal < val) {
                optimalVal = val;
                optimalMove = cell;
            }
            cell.state = null;
        }
        return optimalMove;
    }
    // Use alpha-beta pruning technique
    minimax(alpha, beta, side) {
        let emptyCells = this.vacantCells();
        // Calculate the scores
        let winner = this.winner();
        if (winner || emptyCells.length == 0) {
            if (winner == "player") return -1;
            else if (winner == "bot") return 1;
            else return 0;
        }
        if (side == "bot") {
            let maxVal = -Infinity;
            // Searching for optimal moves from the position's children
            for (let cell of emptyCells) {
                cell.state = "bot";
                maxVal = Math.max(maxVal, this.minimax(alpha, beta, "player"));
                alpha = maxVal; 
                cell.state = null;
                if (beta <= alpha) break;
            }
            return maxVal;
        }
        else {
            let minVal = Infinity;
            for (let cell of emptyCells) {
                cell.state = "player";
                minVal = Math.min(minVal, this.minimax(alpha, beta, "bot"));
                beta = minVal;
                cell.state = null;
                if (beta <= alpha) break;
            }
            return minVal;
        }
    }
}

// Start the game
const gameBoard = new GameBoard();
gameBoard.initDOM();