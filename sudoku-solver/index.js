const boardContainer = document.querySelector(".board");
const timer = document.querySelector(".timer");
const difficultySelector = document.querySelector(".difficulty");
const difficultyEasy = document.querySelector(".difficulty__easy");
const difficultyMedium = document.querySelector(".difficulty__medium");
const difficultyHard = document.querySelector(".difficulty__hard");
const difficultyRandom = document.querySelector(".difficulty__random");
const validateBoard = document.querySelector(".validate");
const validateStatus = document.querySelector(".validate-status");
const solveBoard = document.querySelector(".solve");

class Sudoku {
	constructor() {
		this.data;
		this.createAndFillBoard();
		this.timer;
		this.startTimer();
	}

	startTimer = function () {
		let start = Date.now();
		this.timer = setInterval(() => {
			let timeInSec = (Date.now() - start) / 1000;
			let sec = Math.floor(timeInSec % 60);
			let min = Math.floor((timeInSec / 60) % 60);
			let hour = Math.floor((timeInSec / 3600) % 60);

			let hours = hour > 9 ? "" + hour : "0" + hour;
			let minutes = min > 9 ? "" + min : "0" + min;
			let seconds = sec > 9 ? "" + sec : "0" + sec;
			timer.textContent = hours + ":" + minutes + ":" + seconds;
		}, 1000);
	};

	getBoard = async function (difficulty = "random") {
		try {
			const res = await fetch(`https://sugoku.herokuapp.com/board?difficulty=${difficulty}`);
			this.data = await res.json();
		} catch (err) {
			console.log(err);
		}
	};

	solveOrValidateBoard = async function (req) {
		const encodeBoard = (board) =>
			board.reduce(
				(result, row, i) =>
					result + `%5B${encodeURIComponent(row)}%5D${i === board.length - 1 ? "" : "%2C"}`,
				""
			);

		const encodeParams = (params) =>
			Object.keys(params)
				.map((key) => key + "=" + `%5B${encodeBoard(params[key])}%5D`)
				.join("&");

		try {
			const response = await fetch(
				`https://sugoku.herokuapp.com/${req === "validate" ? "validate" : "solve"}`,
				{
					method: "POST",
					body:
						req === "validate"
							? encodeParams(JSON.parse(localStorage.getItem("solvedBoard")))
							: encodeParams(this.data),
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
				}
			);
			const res = await response.json();
			return res;
		} catch (err) {
			console.log(err);
		}
	};

	createAndFillBoard = async function (difficulty, b = undefined) {
		let board = b;
		if (b === undefined) {
			await this.getBoard(difficulty);
			board = this.data.board;
		}
		localStorage.setItem("board", JSON.stringify(board));
		boardContainer.textContent = "";
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				const input = document.createElement("input");
				input.setAttribute("type", "number");
				if ((j + 1) % 3 === 0 && (j + 1) % 9 !== 0)
					input.style.borderRight = "2px solid rgb(149, 147, 147)";
				if (i === 2 || i === 5) input.style.borderBottom = "2px solid rgb(149, 147, 147)";
				input.value = `${board[i][j] === 0 ? "" : board[i][j]}`;
				if (board[i][j] > 0) input.readOnly = true;
				boardContainer.appendChild(input);
			}
		}
	};

	highlightBoard = function (clickedInput) {
		boardContainer.childNodes.forEach((child, index) => {
			// changes the bgcolor of all numbers on the board which are equal to the clicked input value.
			if (clickedInput.value === child.value && clickedInput.value > 0)
				child.style.backgroundColor = "#AED6F1";

			// changes the bgc horizontaly and verticaly
			if (child === clickedInput) {
				const columnOffset = index - (index % 9);
				const rowOffset = Math.floor(index / 9);
				for (let column = 0; column < 9; column++) {
					let horizontal = columnOffset + column;
					let vertical = index + 9 * (column - rowOffset);
					let horChild = boardContainer.childNodes[horizontal];
					let verChild = boardContainer.childNodes[vertical];
					horChild.style.backgroundColor = "#D6EAF8";
					verChild.style.backgroundColor = "#D6EAF8";

					// if the input value appears verticaly or horizontaly this will change the font color to red
					horChild.value === clickedInput.value
						? (horChild.style.color = "#EC7063")
						: (horChild.style.color = "");
					horChild.value === clickedInput.value
						? (clickedInput.style.color = "#EC7063")
						: (clickedInput.style.color = "");
					verChild.value === clickedInput.value
						? (verChild.style.color = "#EC7063")
						: (verChild.style.color = "");
					verChild.value === clickedInput.value
						? (clickedInput.style.color = "#EC7063")
						: (clickedInput.style.color = "");

					//there must be a better way TODO: refactor
					// changes the bgc 3x3
					for (let row = 0; row < 3; row++) {
						let columnOffset = index - (index % 3);
						let centerOffset = columnOffset + row + 9 * (column - rowOffset);
						let centerChild = boardContainer.childNodes[centerOffset];
						if (column < 3 && rowOffset < 3) {
							centerChild.style.backgroundColor = "#D6EAF8 ";
							if (centerChild.value === clickedInput.value) {
								centerChild.style.color = "red";
								clickedInput.style.color = "red";
							}
							if (centerChild.value !== clickedInput.value) {
								centerChild.style.color = "";
								clickedInput.style.color = "";
							}
						}
						if (column > 2 && column < 6 && rowOffset > 2 && rowOffset < 6) {
							centerChild.style.backgroundColor = "#D6EAF8 ";
							if (centerChild.value === clickedInput.value) {
								centerChild.style.color = "red";
								clickedInput.style.color = "red";
							}
							if (centerChild.value !== clickedInput.value) {
								centerChild.style.color = "";
								clickedInput.style.color = "";
							}
						}
						if (column > 5 && rowOffset > 5) {
							centerChild.style.backgroundColor = "#D6EAF8 ";
							if (centerChild.value === clickedInput.value) {
								centerChild.style.color = "red";
								clickedInput.style.color = "red";
							}
							if (centerChild.value !== clickedInput.value) {
								centerChild.style.color = "";
								clickedInput.style.color = "";
							}
						}
					}
				}
			}
		});
	};

	saveBoardForValidate = function () {
		let data = {
			board: [],
		};
		let tempBoard = [];
		boardContainer.childNodes.forEach((child) => {
			tempBoard.push(child.value);
		});
		for (let i = 0; i < 9; i++) {
			data.board.push(tempBoard.slice(i * 9, i * 9 + 9));
		}
		localStorage.setItem("solvedBoard", JSON.stringify(data));
	};

	clearHighlight = function () {
		boardContainer.childNodes.forEach((child) => {
			child.style.backgroundColor = "";
		});
	};

	clearInputs = function () {
		let board = localStorage.getItem("board");
		this.createAndFillBoard(difficulty, JSON.parse(board));
	};

	restartTimer = function () {
		clearInterval(this.timer);
		this.startTimer();
	};
}

const startGame = new Sudoku();

const eventHandler = function () {
	boardContainer.addEventListener("input", () => {
		const clickedInput = e.target.closest("input");
		clickedInput.value = [...clickedInput.value.slice(-1)];
		startGame.highlightBoard(clickedInput);
	});

	boardContainer.addEventListener("click", () => {
		const clickedInput = e.target.closest("input");
		startGame.clearHighlight();
		startGame.highlightBoard(clickedInput);
	});

	difficultySelector.addEventListener("click", (e) => {
		difficultyEasy.classList.remove("height");
		difficultyMedium.classList.remove("height");
		difficultyHard.classList.remove("height");
		if (!e.target.closest("button")) return;
		const difficulty = e.target.closest("button").textContent.toLowerCase();
		if (difficulty === "clear") {
			startGame.clearInputs();
		} else {
			startGame.createAndFillBoard(difficulty);
			e.target.closest("button").classList.toggle("height");
		}
		startGame.restartTimer();
	});

	solveBoard.addEventListener("click", async () => {
		const board = await startGame.solveOrValidateBoard("solve");
		console.log(board);
		startGame.createAndFillBoard("solve", board.solution);
	});
	validateBoard.addEventListener("click", async () => {
		startGame.saveBoardForValidate();
		const board = await startGame.solveOrValidateBoard("validate");
		validateStatus.textContent = board.status;
		clearInterval(startGame.timer);
	});
};
eventHandler();
