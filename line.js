export default class Line {
    constructor(cells) {
        this.cells = cells;
    }
    // Find the prevalent and their number of cells in a line
    prevalent() {
        let playerCells = 0, botCells = 0;
        for (let j = 0; j < this.cells.length; j++) {
            if (this.cells[j].state == "player") playerCells++;
            if (this.cells[j].state == "bot") botCells++;
        }
        if (playerCells == botCells) return null;
        return {
            identity: playerCells > botCells ? "player" : "bot",
            cellCount: Math.max(playerCells, botCells)
        }
    }
    // Count the number of filled cells in a line
    filledCount() {
        let cnt = 0;
        for (let j = 0; j < this.cells.length; j++) {
            if (this.cells[j].state) cnt++;
        }
        return cnt;
    }
    // Pick a blank cell in the line
    blankCell() {
        for (let j = 0; j < this.cells.length; j++) {
            if (!this.cells[j].state) return this.cells[j];
        }
        return null;
    }
}