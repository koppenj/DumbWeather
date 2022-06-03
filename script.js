const APIKEY = `8a92d008a4cbcee28bd21da25a6d76d0`;
let units = 'imperial';
const changeUnits = document.querySelector('#change-units');

// Temperature conversions
function setUnitSymbol() {
  const currentTemp = document.querySelector('#current-temp');
  const feelsLike = document.querySelector('#feels-like');
  if (units === 'imperial') {
    units = 'metric';
    let temp = currentTemp.innerText;
    const currentFiltered = temp.replace(/[^0-9.]/g, '');
    const newCurrentTemp = (5/9*(currentFiltered  - 32)).toFixed(2);
    currentTemp.textContent = newCurrentTemp + `${checkUnitSymbol(units)}`;

    let currentFeelsLike = feelsLike.innerText;
    const currentFeelsFiltered = currentFeelsLike.replace(/[^0-9.]/g, '');
    const newCurrentFeelsLike = (5/9*(currentFeelsFiltered  - 32)).toFixed(2);
    feelsLike.textContent = newCurrentFeelsLike + `${checkUnitSymbol(units)}`;
  } else {
    units = 'imperial';
    let temp = currentTemp.innerText;
    const currentFiltered = temp.replace(/[^0-9.]/g, '');
    const newCurrentTemp = (9/5*(currentFiltered) + 32).toFixed(2);
    currentTemp.textContent = newCurrentTemp + `${checkUnitSymbol(units)}`;

    let currentFeelsLike = feelsLike.innerText;
    const currentFeelsFiltered = currentFeelsLike.replace(/[^0-9.]/g, '');
    const newCurrentFeelsLike = (9/5*(currentFeelsFiltered) + 32).toFixed(2);
    feelsLike.textContent = newCurrentFeelsLike + `${checkUnitSymbol(units)}`;
  }
};
// Sets template based on selected units
function checkUnitSymbol(units) {
  let activeUnitSymbol;
  switch (units) {
    case 'imperial':
      activeUnitSymbol = ` °` + `F`;
      break;
    case 'metric':
      activeUnitSymbol = ` °` + `C`;
      break;
    default:
      activeUnitSymbol = ` °` + `F`;
  }
  return activeUnitSymbol;
}

changeUnits.addEventListener('click', setUnitSymbol);

// Should probably write a catch/error handler. Set a default city?
async function getCity(cityName) {
  const cityResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKEY}`, {mode: 'cors'});
  const locationData = await cityResponse.json();
  const city = locationData[0].name;
  const state = locationData[0].state;
  const lat = locationData[0].lat;
  const lon = locationData[0].lon;
  return {city, state, lat, lon};
}

async function getCurrentWeather(lat,lon) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${APIKEY}`, {mode: 'cors'});
  const currentWeatherData = await response.json();
  return {currentWeatherData, units};
}

async function showData(weatherData, units, state) {
  const unitSym = checkUnitSymbol(units);
  const currentCity = document.querySelector('h1');
  currentCity.textContent = weatherData.name + `, ` + state;
  const description = document.querySelector('#description');
  description.innerText = weatherData.weather[0].description;
  const icon = document.querySelector('#icon');
  const getIcon = await fetch(`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`, {mode: 'cors'});
  const imgHolder = document.createElement('img');
  imgHolder.src = getIcon.url;
  icon.replaceChildren(imgHolder);

  const currentTemp = document.querySelector('#current-temp');
  currentTemp.textContent = weatherData.main.temp + unitSym;
  const currentHumidity = document.querySelector('#humidity');
  currentHumidity.textContent = weatherData.main.humidity + '%';
  const feelsLike = document.querySelector('#feels-like');
  feelsLike.textContent = weatherData.main.feels_like + unitSym;
}

const lookupBtn = document.querySelector('#lookup-city');
const searchInput = document.querySelector('input#city-search');

async function multiTask() {
  const searchCity = await getCity(searchInput.value);
  const getWeather = await getCurrentWeather(searchCity.lat, searchCity.lon);
  const data = getWeather.currentWeatherData;
  const units = getWeather.units;
  const state = searchCity.state;
  showData(data, units,state);
  searchInput.value = '';
}
lookupBtn.addEventListener('click', multiTask);
searchInput.addEventListener('keypress', function (event) {
  if(event.key === 'Enter') {
    multiTask();
  }
})

// Get permission from user to use their geolocation
const findMe = document.querySelector('#lookup-client-location');
findMe.addEventListener('click', setUserLocation);

function setUserLocation() {
  if('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const reverseCity = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${APIKEY}`, {mode: 'cors'});
      const cityState = await reverseCity.json();
      const state = cityState[0].state;
      const getWeather = await getCurrentWeather(lat,lon);
      const data = getWeather.currentWeatherData;
      const units = getWeather.units;
      showData(data, units, state);
    });
  } else {
    console.log('Location Not available');
  }
};
