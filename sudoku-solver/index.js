const boardContainer = document.querySelector(".board");
const timer = document.querySelector(".timer");
const difficulty = document.querySelector(".difficulty");
const difficultyEasy = document.querySelector(".difficulty__easy");
const difficultyMedium = document.querySelector(".difficulty__medium");
const difficultyHard = document.querySelector(".difficulty__hard");
const difficultyRandom = document.querySelector(".difficulty__random");
const validateBoard = document.querySelector(".validate");
const solveBoard = document.querySelector(".solve");

let timerID;

const fetchBoard = async function (difficulty = "random") {
	try {
		const res = await fetch(`https://sugoku.herokuapp.com/board?difficulty=${difficulty}`);
		const data = await res.json();
		return data.board.flat();
	} catch (err) {
		console.log(err);
	}
};

/////////////////////////////////////////////////////////////////////////
const fillBoardElements = function (board) {
	boardContainer.textContent = "";
	const size = board.length;
	try {
		for (let i = 0; i < size; i++) {
			const inputEl = document.createElement("input");
			inputEl.setAttribute("type", "number");
			inputEl.value = `${board[i] === 0 ? "" : board[i]}`;
			if (board[i] > 0) inputEl.readOnly = true;
			boardContainer.appendChild(inputEl);
		}
	} catch (err) {
		console.log(err);
	}
	startTimer();
};

const highlightBoard = function (clickedEl) {
	// changes the bgcolor of the number on the board which are equal to the clicked input value.
	boardContainer.childNodes.forEach((children) => {
		children.style.backgroundColor = "";
		if (clickedEl.value === children.value && clickedEl.value > 0)
			children.style.backgroundColor = "#AED6F1";
	});

	boardContainer.childNodes.forEach((children, index) => {
		if (clickedEl === children) {
			let width = 9;
			let columnOffset = index - (index % 9);
			let rowOffset = Math.floor(index / 9);
			for (let column = 0; column < width; column++) {
				let horizontal = columnOffset + column;
				let vertical = index + 9 * (column - rowOffset);
				boardContainer.childNodes[horizontal].style.backgroundColor = "#D6EAF8 ";
				boardContainer.childNodes[vertical].style.backgroundColor = "#D6EAF8 ";
				if (boardContainer.childNodes[horizontal].value === clickedEl.value) {
					boardContainer.childNodes[horizontal].style.color = "red";
					clickedEl.style.color = "red";
				}
				if (boardContainer.childNodes[horizontal].value !== clickedEl.value) {
					boardContainer.childNodes[horizontal].style.color = "";
					clickedEl.style.color = "";
				}
				if (boardContainer.childNodes[vertical].value === clickedEl.value) {
					boardContainer.childNodes[vertical].style.color = "red";
					clickedEl.style.color = "red";
				}
				if (boardContainer.childNodes[vertical].value !== clickedEl.value) {
					boardContainer.childNodes[vertical].style.color = "";
					clickedEl.style.color = "";
				}

				//there must be a better way TODO: refactor
				for (let row = 0; row < 3; row++) {
					let columnOffset = index - (index % 3);
					let centerOffset = columnOffset + row + 9 * (column - rowOffset);
					if (column < 3 && rowOffset < 3) {
						boardContainer.childNodes[centerOffset].style.backgroundColor = "#D6EAF8 ";
						if (boardContainer.childNodes[centerOffset].value === clickedEl.value) {
							boardContainer.childNodes[centerOffset].style.color = "red";
							clickedEl.style.color = "red";
						}
						if (boardContainer.childNodes[centerOffset].value !== clickedEl.value) {
							boardContainer.childNodes[centerOffset].style.color = "";
							clickedEl.style.color = "";
						}
					}
					if (column > 2 && column < 6 && rowOffset > 2 && rowOffset < 6) {
						boardContainer.childNodes[centerOffset].style.backgroundColor = "#D6EAF8 ";
						if (boardContainer.childNodes[centerOffset].value === clickedEl.value) {
							boardContainer.childNodes[centerOffset].style.color = "red";
							clickedEl.style.color = "red";
						}
						if (boardContainer.childNodes[centerOffset].value !== clickedEl.value) {
							boardContainer.childNodes[centerOffset].style.color = "";
							clickedEl.style.color = "";
						}
					}
					if (column > 5 && rowOffset > 5) {
						boardContainer.childNodes[centerOffset].style.backgroundColor = "#D6EAF8 ";
						if (boardContainer.childNodes[centerOffset].value === clickedEl.value) {
							boardContainer.childNodes[centerOffset].style.color = "red";
							clickedEl.style.color = "red";
						}
						if (boardContainer.childNodes[centerOffset].value !== clickedEl.value) {
							boardContainer.childNodes[centerOffset].style.color = "";
							clickedEl.style.color = "";
						}
					}
				}
			}
			children.style.color = "";
		}
	});
};

const clearInputs = function () {
	let board = localStorage.getItem("board");
	fillBoardElements(JSON.parse(board));
};

// TODO: refactor if possible
const startTimer = function () {
	const start = Date.now();
	timerID = setInterval(() => {
		let timeinSec = (Date.now() - start) / 1000;
		let sec = Math.floor(timeinSec % 60);
		let min = Math.floor((timeinSec / 60) % 60);
		let hour = Math.floor((timeinSec / 3600) % 60);

		let hours = hour > 9 ? "" + hour : "0" + hour;
		let minutes = min > 9 ? "" + min : "0" + min;
		let seconds = sec > 9 ? "" + sec : "0" + sec;
		timer.textContent = hours + ":" + minutes + ":" + seconds;
	}, 1000);
};

const data = {
	board: [],
};
let board = JSON.parse(localStorage.getItem("board"));
for (let i = 0; i < 9; i++) {
	data.board.push(board.slice(i * 9, i * 9 + 9));
}
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

const solve = async function () {
	try {
		const response = await fetch("https://sugoku.herokuapp.com/solve", {
			method: "POST",
			body: encodeParams(data),
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});
		const res = await response.json();
		return res.solution.flat();
	} catch (err) {
		console.log(err);
	}
};

///////////

const init = async function (difficulty) {
	const board = await fetchBoard(difficulty);
	fillBoardElements(board);
	localStorage.setItem("board", JSON.stringify(board));
};

const eventHandler = function () {
	boardContainer.addEventListener("click", (e) => {
		const clickedEl = e.target.closest("input");
		highlightBoard(clickedEl);
	});

	boardContainer.addEventListener("input", (e) => {
		const inputValue = e.target.closest("input");
		inputValue.setAttribute("value", inputValue.value);
		highlightBoard(inputValue);
	});

	difficulty.addEventListener("click", (e) => {
		const difficulty = e.target.closest("div").textContent;
		if (difficulty === "clear") {
			clearInterval(timerID);
			clearInputs();
		} else {
			clearInterval(timerID);
			init(difficulty);
		}
	});
	solveBoard.addEventListener("click", async () => {
		const boards = await solve();
		clearInterval(timerID);
		fillBoardElements(boards);
	});
};

init();
eventHandler();
