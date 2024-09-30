const apiKey = `98cf5a648bd4e88eeca98c58f9fe8f10`;

const inputSearch = document.querySelector("#search");
const searchButton = document.querySelector("#pesquisar");
const weatherInfos = document.querySelector(".weather--infos");
const weatherCurrent = document.querySelector(".weather--infos--current");
const airConditions = document.querySelector(".air--conditions");
const cityEl = document.querySelector("#city");
const temperature = document.querySelector("#temperature span");
const weatherIcon = document.querySelector("#weather-icon");
const realFell = document.querySelector("#real-fell span");
const wind = document.querySelector("#wind span");
const humidity = document.querySelector("#humidity span");
const weatherCondition = document.querySelector("#weather-condition span");
const loader = document.querySelector("#loader");

if ("geolocation" in navigator) {
  weatherCurrent.style.display = "none";
  airConditions.style.display = "none";
  loader.style.display = "block";

  navigator.geolocation.getCurrentPosition((position) => {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    getCityNameByLoc(lat, lon);
  });
} else {
  const message =
    "Os parãmetros de localização não estão disponíveis no seu navegador";
  createErrorMessage(message);
}

async function getWeatherData(city) {
  try {
    // Checar se o campo de input está vazio
    if (city.trim() === "") {
      createErrorMessage("Por favor, insira o nome de uma cidade.");
      return;
    }
    weatherCurrent.style.display = "none";
    airConditions.style.display = "none";
    loader.style.display = "block";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`
    );

    //Checar se existe uma mensagem de erro na tela
    const oldErrorMsg = document.querySelector(".error--message");
    if (oldErrorMsg) {
      oldErrorMsg.remove();
    }

    if (!response.ok) {
      //Caso ocorra erro na requisação, executa o tratamento de erros
      handleHttpErrors(response.status);
      return;
    }

    const data = await response.json();

    updateElementText(cityEl, data.name);
    updateElementText(temperature, parseInt(`${data.main.temp}`));
    updateElementText(realFell, parseInt(`${data.main.feels_like}`));
    updateElementText(wind, data.wind.speed);
    updateElementText(humidity, data.main.humidity);
    updateElementText(weatherCondition, data.weather[0].description);

    weatherIcon.setAttribute(
      "src",
      `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`
    );
  } catch (error) {
    createErrorMessage(error.message);
  } finally {
    loader.style.display = "none";
    weatherCurrent.style.display = "flex";
    airConditions.style.display = "flex";
  }
}

async function getCityNameByLoc(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`
  );

  const data = await response.json();
  const city = data.name;

  getWeatherData(city);
}

function updateElementText(element, text) {
  element.innerHTML = text;
}

inputSearch.addEventListener("keypress", (e) => {
  if (e.code === "Enter") {
    const city = inputSearch.value;
    getWeatherData(city);
  }
});

searchButton.addEventListener("click", (e) => {
  const city = inputSearch.value;
  getWeatherData(city);
});

function createErrorMessage(erro) {
  const errorMsg = document.createElement("div");
  errorMsg.classList.add("error--message");
  weatherInfos.appendChild(errorMsg);
  errorMsg.innerHTML = `${erro}`;
  return errorMsg;
}

function handleHttpErrors(status) {
  let errorMessage = "";

  switch (status) {
    case 404:
      errorMessage =
        "Cidade não encontrada. Verifique o nome e tente novamente.";
      break;
    case 401:
      errorMessage =
        "Erro de autenticação. Não foi possível realizar a requisição.";
      break;
    case 500:
      errorMessage = "Erro no servidor. Tente novamente mais tarde.";
      break;
    default:
      errorMessage = "Erro desconhecido. Tente novamente.";
  }

  createErrorMessage(errorMessage);
}
