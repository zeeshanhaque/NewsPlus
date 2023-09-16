window.addEventListener("load", () => {
    fetchNews("all");
    checkWeather();
});

function reload() {
    window.location.reload();
}

async function fetchNews(newsCategory) {
    const newsBox = document.getElementById("cards-container");

    try {
        const response = await fetch(`https://inshortsapi.vercel.app/news?category=${newsCategory}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        bindData(data.data);
    } catch (error) {
        console.error("Error fetching news:", error);
    }
    document.documentElement.scrollTop = 0;
}

function bindData(newsData) {
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = "";

    newsData.forEach(news => {
        const card = createNewsCard(news);
        cardsContainer.appendChild(card);
    });
}

function createNewsCard(news) {
    const newsCardTemplate = document.getElementById("template-news-card");
    const cardClone = newsCardTemplate.content.cloneNode(true);

    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDate = cardClone.querySelector("#news-date");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = news.imageUrl;
    newsTitle.textContent = news.title;
    newsDesc.textContent = news.content;

    newsSource.textContent = news.author;
    newsDate.textContent = news.date;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(news.url, "_blank");
    });

    return cardClone;
}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    if (curSelectedNav) {
        curSelectedNav.classList.remove("active");
    }
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
    document.getElementById("search-text").value = "";
}

const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", () => {
    const query = document.getElementById("search-text").value.trim().toLowerCase();
    if (query) {
        fetchNews(query);
        if (curSelectedNav) {
            curSelectedNav.classList.remove("active");
            curSelectedNav = null;
        }
    }
});


//  WEATHER

const weatherBody = document.querySelector('#weather-body');
const weatherLocation = document.querySelector('#weather-location');
const weatherImg = document.querySelector('#weather-img');
const temperature = document.querySelector('#temperature');
const description = document.querySelector('#description');

async function checkWeather() {
    const cityName = 'Dahanu';
    const weatherAPI = "ecee6f9e50124b746b3d065af7fb1ba0";
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherAPI}`;

    const weatherData = await fetch(weatherURL).then((response) => response.json());

    weatherLocation.innerHTML = `${weatherData.name}`;
    temperature.innerHTML = `${Math.round(weatherData.main.temp - 273.15)}°C`;
    description.innerHTML = `${weatherData.weather[0].main}`;

    switch (weatherData.weather[0].main) {
        case "Clouds":
            weatherImg.src = "./assets/cloud.png";
            break;
        case "Thunderstorm":
            weatherImg.src = "./assets/storm.png";
            break;
        case "Clear":
            weatherImg.src = "./assets/clear.png";
            break;
        case "Rain":
        case "Drizzle":
            weatherImg.src = "./assets/rain.png";
            break;
        case "Haze":
        case "Mist":
        case "Fog":
            weatherImg.src = "./assets/mist.png";
            break;
        case "Snow":
            weatherImg.src = "./assets/snow.png";
            break;
        default:
            weatherImg.src = "./assets/clear.png";
    }
}

checkWeather();


//  DATE

function formatTime(date) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const todayDate = document.getElementById("today-date");

    const day = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];

    todayDate.innerHTML = `${day}, ${dayOfMonth} ${month}`;
}

const currentDate = new Date();
const formattedTime = formatTime(currentDate);


// DARK 

function darkMode() {
    document.body.classList.toggle('dark');
}