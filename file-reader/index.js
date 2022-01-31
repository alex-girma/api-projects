const inputFile = document.querySelector(".inputfile");
const outputFile = document.querySelector(".output");

inputFile.addEventListener(
	"change",
	function (e) {
		const reader = new FileReader();
		reader.onload = function () {
			const challenges = reader.result.split(/:\s|\/\s/gm);
			console.table(challenges);
			for (let challenge = 0; challenge < challenges.length; challenge = challenge + 2) {
				const markup = document.createElement("a");
				markup.textContent = challenges[challenge];
				markup.setAttribute("href", challenges[challenge + 1]);

				outputFile.appendChild(markup);
			}
		};
		reader.readAsText(inputFile.files[0]);
	},
	false
);
