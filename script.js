// create the game board
const gameBoard = (function createBoard() {
    const board = document.querySelector(".board");
    const position = {};
    for (i = 0; i < 9; i++) {
        // dynamically create squares
        position[i] = document.createElement("div");
        position[i].setAttribute("class", "position");
        position[i].style.width = "30px";
        position[i].style.height = "30px";
        position[i].style.border = "1px solid black";
        position[i].style.display = "flex";
        position[i].style.justifyContent = "center";
        position[i].style.alignItems = "center";
        board.appendChild(position[i]);

        position[i].addEventListener("click", (e) => {
            e.target.textContent = "O";
        })
    }
    return {board, position};
})();
