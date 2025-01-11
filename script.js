import config from './config.js';

const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';
const WEATHER_API_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';

// Initialize on load
window.addEventListener("load", () => {
    fetchNews('all');
    checkWeather();
});

function reload() {
    window.location.reload();
}

async function fetchNews(newsCategory) {
    const newsBox = document.getElementById("cards-container");

    try {
        // Prepare search query
        const searchQuery = newsCategory;
        const encodedQuery = encodeURIComponent(searchQuery).replace(/%20/g, '+');
        
        // Construct the News API URL
        const newsApiUrl = `${NEWS_API_ENDPOINT}?q=${encodedQuery}&apiKey=${config.NEWS_API_KEY}&pageSize=30&language=en`;
        
        // Encode the full URL for the CORS proxy
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(newsApiUrl)}`;
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // The proxy wraps the response in a 'contents' property that needs to be parsed
        const newsData = JSON.parse(data.contents);
        
        // Filter articles
        const filteredArticles = newsData.articles
            .filter(article => article.title !== '[Removed]')
            .slice(0, 36);

        bindData(filteredArticles);
    } catch (error) {
        console.error("Error fetching news:", error);
        newsBox.innerHTML = '<div class="error">Failed to load news. Please try again later.</div>';
    }
    document.documentElement.scrollTop = 0;
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = "";

    if (!articles || articles.length === 0) {
        cardsContainer.innerHTML = '<div class="no-results">No news articles found</div>';
        return;
    }

    articles.forEach(article => {
        const card = createNewsCard(article);
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

    // Handle image with fallback
    newsImg.src = news.urlToImage || './assets/news-default.jpg';
    newsImg.onerror = () => {
        newsImg.src = './assets/news-default.jpg';
    };

    newsTitle.textContent = news.title || 'No title available';
    newsDesc.textContent = news.description || 'No description available';
    newsSource.textContent = news.source?.name || 'Unknown Source';

    // Format the date
    const publishDate = news.publishedAt ? new Date(news.publishedAt) : new Date();
    newsDate.textContent = publishDate.toLocaleDateString();

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(news.url, "_blank", "noopener,noreferrer");
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
    const query = document.getElementById("search-text").value.trim();
    if (query) {
        fetchNews(query);
        if (curSelectedNav) {
            curSelectedNav.classList.remove("active");
            curSelectedNav = null;
        }
    }
});

// Weather functionality
async function checkWeather() {
    const cityName = 'Dahanu';

    try {
        // Construct the Weather API URL
        const weatherApiUrl = `${WEATHER_API_ENDPOINT}?q=${cityName}&appid=${config.WEATHER_API_KEY}`;
        
        // Encode the full URL for the CORS proxy
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(weatherApiUrl)}`;
        
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('Weather API request failed');
        }

        const data = await response.json();
        const weatherData = JSON.parse(data.contents);
        updateWeatherUI(weatherData);
    } catch (error) {
        console.error("Error fetching weather:", error);
        document.querySelector('#weather-body').innerHTML = 
            '<p>Weather data unavailable</p>';
    }
}

function updateWeatherUI(weatherData) {
    const weatherLocation = document.querySelector('#weather-location');
    const temperature = document.querySelector('#temperature');
    const description = document.querySelector('#description');
    const weatherImg = document.querySelector('#weather-img');

    weatherLocation.textContent = weatherData.name;
    temperature.textContent = `${Math.round(weatherData.main.temp - 273.15)}°C`;
    description.textContent = weatherData.weather[0].main;

    // Update weather image based on condition
    const weatherImages = {
        'Clouds': './assets/cloud.png',
        'Thunderstorm': './assets/storm.png',
        'Clear': './assets/clear.png',
        'Rain': './assets/rain.png',
        'Drizzle': './assets/rain.png',
        'Haze': './assets/mist.png',
        'Mist': './assets/mist.png',
        'Fog': './assets/mist.png',
        'Snow': './assets/snow.png'
    };

    weatherImg.src = weatherImages[weatherData.weather[0].main] || './assets/clear.png';
    weatherImg.onerror = () => {
        weatherImg.src = './assets/clear.png';
    };
}

// Date functionality
function updateDate() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentDate = new Date();
    const todayDate = document.getElementById("today-date");
    
    const day = days[currentDate.getDay()];
    const dayOfMonth = currentDate.getDate();
    const month = months[currentDate.getMonth()];

    todayDate.textContent = `${day}, ${dayOfMonth} ${month}`;
}

// Dark mode functionality
function darkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

// Initialize dark mode from localStorage
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
});

// Make functions available globally for HTML onclick handlers
window.onNavItemClick = onNavItemClick;
window.darkMode = darkMode;
window.reload = reload;