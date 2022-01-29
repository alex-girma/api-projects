const board = document.querySelector(".board");

const boardCells = 81;
const data = [
	0, 0, 8, 0, 0, 0, 9, 5, 4, 2, 0, 4, 0, 5, 0, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 0,
	0, 8, 9, 4, 0, 0, 0, 9, 0, 2, 3, 0, 8, 9, 0, 0, 1, 3, 4, 0, 5, 0, 0, 1, 0, 0, 0, 0, 0, 7, 6, 7, 5,
	0, 8, 1, 0, 0, 2, 9, 0, 1, 7, 3, 4, 0, 1, 0,
];

class Sudoku {
	constructor() {
		this.size = 81;
		this.fillBoardElements(this.size);
	}

	fetchpuzzle = async function () {
		try {
			const res = await fetch("https://sugoku.herokuapp.com/board?difficulty=easy");
			const data = await res.json();
			return data.board.flat();
			// fetch("https://sugoku.herokuapp.com/board?difficulty=easy")
			// 	.then((res) => res.json())
			// 	.then((data) => console.log(data.board.flat()));
		} catch (err) {
			console.log(err);
		}
	};

	fillBoardElements = async function (size) {
		try {
			const test = await this.fetchpuzzle();
			for (let i = 0; i < size; i++) {
				const inputEl = document.createElement("input");
				inputEl.setAttribute("type", "number");
				inputEl.value = `${test[i] === 0 ? "" : test[i]}`;
				if (test[i] > 0) inputEl.readOnly = true;

				board.appendChild(inputEl);
			}
		} catch (err) {
			console.log(err);
		}
	};

	highlight = function (clickedEl) {
		board.childNodes.forEach((children) => {
			children.style.backgroundColor = "";
			if (clickedEl.value === children.value && clickedEl.value > 0)
				children.style.backgroundColor = "#AED6F1";
		});

		board.childNodes.forEach((children, index) => {
			if (clickedEl === children) {
				let width = 9;
				let columnOffset = index - (index % 9);
				let rowOffset = Math.floor(index / 9);
				for (let column = 0; column < width; column++) {
					let horizontal = columnOffset + column;
					let vertical = index + 9 * (column - rowOffset);
					board.childNodes[horizontal].style.backgroundColor = "#D6EAF8 ";
					board.childNodes[vertical].style.backgroundColor = "#D6EAF8 ";
					if (board.childNodes[horizontal].value === clickedEl.value) {
						board.childNodes[horizontal].style.color = "red";
						clickedEl.style.color = "red";
					}
					if (board.childNodes[vertical].value === clickedEl.value) {
						board.childNodes[vertical].style.color = "red";
						clickedEl.style.color = "red";
					}

					//there must be a better way
					for (let row = 0; row < 3; row++) {
						let columnOffset = index - (index % 3);
						let centerOffset = columnOffset + row + 9 * (column - rowOffset);
						if (column < 3 && rowOffset < 3) {
							board.childNodes[centerOffset].style.backgroundColor = "#D6EAF8 ";
							if (board.childNodes[centerOffset].value === clickedEl.value) {
								board.childNodes[centerOffset].style.color = "red";
								clickedEl.style.color = "red";
							}
						}
						if (column > 2 && column < 6 && rowOffset > 2 && rowOffset < 6) {
							board.childNodes[centerOffset].style.backgroundColor = "#D6EAF8 ";
							if (board.childNodes[centerOffset].value === clickedEl.value) {
								board.childNodes[centerOffset].style.color = "red";
								clickedEl.style.color = "red";
							}
						}
						if (column > 5 && rowOffset > 5) {
							board.childNodes[centerOffset].style.backgroundColor = "#D6EAF8 ";
							if (board.childNodes[centerOffset].value === clickedEl.value) {
								board.childNodes[centerOffset].style.color = "red";
								clickedEl.style.color = "red";
							}
						}
					}
				}
				children.style.color = "";
			}
		});
	};
}

const startGame = new Sudoku();

board.addEventListener("click", (e) => {
	const clickedEl = e.target.closest("input");
	startGame.highlight(clickedEl);
});
board.addEventListener("input", (e) => {
	const inputValue = e.target.closest("input");
	inputValue.setAttribute("value", inputValue.value);
	startGame.highlight(inputValue);
});
