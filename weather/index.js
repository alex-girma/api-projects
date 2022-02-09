const weather = document.querySelector(".weather");
const APIKEY = "757467271d43201ef1109733f5cf29df";

class Weather {
	constructor() {
		this.data;
		this.init();
	}

	fetchWeather = async function (position) {
		const { latitude, longitude } = position.coords;
		const res = await fetch(
			`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKEY}`
		);
		const data = await res.json();
		console.log(data);
		this.data = data;
	};

	displayWeather = function () {};

	init = function () {
		navigator.geolocation.getCurrentPosition(this.fetchWeather);
		this.displayWeather();
	};
}

const we = new Weather();
