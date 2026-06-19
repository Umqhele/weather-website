// Simulated database for popular cities when NO API key is supplied
const MOCK_CITIES = {
  Johannesburg: {
    name: "Johannesburg",
    country: "South Africa",
    temp: 25,
    condition: "Clear",
    humidity: 90,
    wind: 15,
    feelsLike: 26,
    pressure: 1013,
    timezone: 25200, // UTC+7
    hourly: [
      { time: "0:00", temp: 19 },
      { time: "4:00", temp: 20 },
      { time: "8:00", temp: 23 },
      { time: "13:00", temp: 24 },
      { time: "17:00", temp: 23 },
      { time: "21:00", temp: 20 },
    ],
    daily: [
      { day: "Mon", icon: "☀️", temp: 23, condition: "Clear" },
      { day: "Tue", icon: "⛅", temp: 20, condition: "Clouds" },
      { day: "Wed", icon: "☀️", temp: 25, condition: "Clear" },
      { day: "Thu", icon: "☁️", temp: 24, condition: "Clouds" },
      { day: "Fri", icon: "⛈️", temp: 27, condition: "Thunderstorm" },
    ],
  },
  madrid: {
    name: "Madrid",
    country: "Spain",
    temp: 29,
    condition: "Clear",
    humidity: 35,
    wind: 9,
    feelsLike: 30,
    pressure: 1016,
    timezone: 7200, // UTC+2
    hourly: [
      { time: "0:00", temp: 21 },
      { time: "4:00", temp: 19 },
      { time: "8:00", temp: 25 },
      { time: "13:00", temp: 31 },
      { time: "17:00", temp: 30 },
      { time: "21:00", temp: 26 },
    ],
    daily: [
      { day: "Thu", icon: "☀️", temp: 29, condition: "Clear" },
      { day: "Fri", icon: "☀️", temp: 32, condition: "Clear" },
      { day: "Sat", icon: "⛅", temp: 31, condition: "Clouds" },
      { day: "Sun", icon: "☀️", temp: 30, condition: "Clear" },
      { day: "Mon", icon: "☁️", temp: 28, condition: "Clouds" },
    ],
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    temp: 22,
    condition: "Clouds",
    humidity: 65,
    wind: 12,
    feelsLike: 22,
    pressure: 1010,
    timezone: 32400, // UTC+9
    hourly: [
      { time: "0:00", temp: 18 },
      { time: "4:00", temp: 17 },
      { time: "8:00", temp: 21 },
      { time: "13:00", temp: 23 },
      { time: "17:00", temp: 22 },
      { time: "21:00", temp: 19 },
    ],
    daily: [
      { day: "Thu", icon: "☁️", temp: 22, condition: "Clouds" },
      { day: "Fri", icon: "🌧️", temp: 20, condition: "Rain" },
      { day: "Sat", icon: "⛅", temp: 24, condition: "Clouds" },
      { day: "Sun", icon: "☀️", temp: 26, condition: "Clear" },
      { day: "Mon", icon: "☀️", temp: 25, condition: "Clear" },
    ],
  },
  london: {
    name: "London",
    country: "United Kingdom",
    temp: 16,
    condition: "Rain",
    humidity: 82,
    wind: 20,
    feelsLike: 15,
    pressure: 1008,
    timezone: 3600, // UTC+1
    hourly: [
      { time: "0:00", temp: 13 },
      { time: "4:00", temp: 12 },
      { time: "8:00", temp: 15 },
      { time: "13:00", temp: 17 },
      { time: "17:00", temp: 16 },
      { time: "21:00", temp: 14 },
    ],
    daily: [
      { day: "Thu", icon: "🌧️", temp: 16, condition: "Rain" },
      { day: "Fri", icon: "⛅", temp: 18, condition: "Clouds" },
      { day: "Sat", icon: "🌧️", temp: 15, condition: "Rain" },
      { day: "Sun", icon: "☁️", temp: 17, condition: "Clouds" },
      { day: "Mon", icon: "☀️", temp: 19, condition: "Clear" },
    ],
  },
  "cape town": {
    name: "Cape Town",
    country: "South Africa",
    temp: 14,
    condition: "Clouds",
    humidity: 78,
    wind: 25,
    feelsLike: 12,
    pressure: 1021,
    timezone: 7200, // UTC+2
    hourly: [
      { time: "0:00", temp: 11 },
      { time: "4:00", temp: 10 },
      { time: "8:00", temp: 13 },
      { time: "13:00", temp: 15 },
      { time: "17:00", temp: 14 },
      { time: "21:00", temp: 12 },
    ],
    daily: [
      { day: "Thu", icon: "☁️", temp: 14, condition: "Clouds" },
      { day: "Fri", icon: "💨", temp: 15, condition: "Wind" },
      { day: "Sat", icon: "☀️", temp: 18, condition: "Clear" },
      { day: "Sun", icon: "☀️", temp: 19, condition: "Clear" },
      { day: "Mon", icon: "⛅", temp: 16, condition: "Clouds" },
    ],
  },
};

// State variables
let currentCityTimezoneOffset = 7200; // Johannesburg default offset (UTC+2)
let clockTimerInterval = null;

// Initialization after contents load
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/**
 * Configure UI listeners and boot layout
 */
function initApp() {
  // Check if user has an existing saved OpenWeatherMap API key
  updateBadge();

  // Trigger initial search for "Johannesburg" (the default layout presentation)
  performCityLookup("Johannesburg");

  // Click Location Display -> trigger edit mode input
  const locationDisplay = document.getElementById("location-display");
  const searchBoxWrapper = document.getElementById("search-box-wrapper");
  const citySearchInput = document.getElementById("city-search-input");
  const pencilEditBtn = document.getElementById("pencil-edit-btn");

  const toggleSearchOn = () => {
    locationDisplay.classList.add("hidden");
    searchBoxWrapper.classList.remove("hidden");
    citySearchInput.focus();
    citySearchInput.select();
  };

  locationDisplay.addEventListener("click", toggleSearchOn);
  pencilEditBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Avoid double bubbling
    toggleSearchOn();
  });

  // Handle losing focus on search input (Reverts to title)
  citySearchInput.addEventListener("blur", () => {
    // Delay slightly to allow form submit handler to run first if enter clicked
    setTimeout(() => {
      if (searchBoxWrapper.classList.contains("hidden") === false) {
        locationDisplay.classList.remove("hidden");
        searchBoxWrapper.classList.add("hidden");
      }
    }, 220);
  });

  // Form submission custom interceptor
  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityQuery = citySearchInput.value.trim();
    if (cityQuery) {
      performCityLookup(cityQuery);
    }
    // Dismiss search field helper
    locationDisplay.classList.remove("hidden");
    searchBoxWrapper.classList.add("hidden");
  });

  // API MODAL SETUP TRIGGERS
  const apiKeyBtn = document.getElementById("api-key-btn");
  const settingsModal = document.getElementById("settings-modal");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  const modalSaveBtn = document.getElementById("modal-save-btn");
  const modalClearBtn = document.getElementById("modal-clear-btn");
  const apiKeyInput = document.getElementById(
    "a01bda5e0e090944aeb8cdb1486d87b6",
  );

  apiKeyBtn.addEventListener("click", () => {
    // Pre-fill input value
    const activeKey =
      localStorage.getItem("openweather_api_key") ||
      "a01bda5e0e090944aeb8cdb1486d87b6"; // Default demo key
    apiKeyInput.value = activeKey;
    settingsModal.classList.remove("hidden");
  });

  modalCancelBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  // Close on overlay backdrop Click
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
    }
  });

  modalSaveBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem("openweather_api_key", key);
      showToast("API Key saved successfully! Fetching live data...");
    } else {
      localStorage.removeItem("openweather_api_key");
    }
    updateBadge();
    settingsModal.classList.add("hidden");

    // Immediately refetch weather with new credentials
    const currentLocName =
      document.getElementById("current-location").textContent;
    performCityLookup(currentLocName);
  });

  modalClearBtn.addEventListener("click", () => {
    localStorage.removeItem("openweather_api_key");
    apiKeyInput.value = "a01bda5e0e090944aeb8cdb1486d87b6";
    updateBadge();
    settingsModal.classList.add("hidden");
    showToast("Custom API key cleared. Reverted to high-fidelity demo mode.");

    // Refetch mock values
    const currentLocName =
      document.getElementById("current-location").textContent;
    performCityLookup(currentLocName);
  });

  // Close Error toast button
  const closeToastBtn = document.getElementById("close-toast-btn");
  closeToastBtn.addEventListener("click", () => {
    document.getElementById("error-toast").classList.add("hidden");
  });

  // Launch clock sync ticking loop
  syncClockTicks();
}

/**
 * Perform high-reliability, multi-mode coordinate fetch
 * @param {string} cityName
 */
async function performCityLookup(cityName) {
  const apiKey = localStorage.getItem("openweather_api_key");

  if (!apiKey) {
    // DEMO Fallback Mode
    const normalized = cityName.toLowerCase().trim();
    const fallbackMatch =
      MOCK_CITIES[normalized] || lookupRobustMockData(cityName);

    renderWeatherInterface(fallbackMatch);
    return;
  }

  // LIVE OPENWEATHERMAP API INTEGRATION
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`,
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid OpenWeatherMap API Key. Please verify settings.",
        );
      } else if (response.status === 404) {
        throw new Error(
          `City "${cityName}" not found. Try spelling carefully.`,
        );
      } else {
        throw new Error(`Server returned error status (${response.status})`);
      }
    }

    const currentData = await response.json();

    // Query secondary 5-day / 3-hour Forecast payload
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`,
    );

    let forecastData = null;
    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json();
    }

    // Process standard live payload parameters matching our design blueprint
    const unifiedData = extractPayloadData(currentData, forecastData);
    renderWeatherInterface(unifiedData);
  } catch (err) {
    console.error("OpenWeatherMap fetch failed: ", err);
    showToast(`${err.message} Showing simulated values instead.`);

    // Graceful error-resilient recovery pattern: feed synthesized simulated layout to prevent crash
    const robustSimulation = lookupRobustMockData(cityName);
    renderWeatherInterface(robustSimulation);
  }
}

/**
 * Dynamically synthesizes weather patterns for ANY city searched in demo mode
 * This guarantees infinite exploration value for client-only previews!
 */
function lookupRobustMockData(cityName) {
  // Generate simple seed values from city string length and characters
  const textSeed = cityName.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < textSeed.length; i++) {
    hash = textSeed.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // Dynamic generated variables
  const tempRange = 10 + (hash % 23); // Temperature between 10°C and 33°C
  const conditions = [
    "Clear",
    "Clouds",
    "Rain",
    "Drizzle",
    "Thunderstorm",
    "Snow",
    "Mist",
  ];
  const condition = conditions[hash % conditions.length];

  const humidity = 40 + (hash % 56); // Humidity 40% - 96%
  const windSpeed = 5 + (hash % 26); // Wind 5 - 31 km/h
  const feelsLike = Math.round(tempRange + (hash % 2 === 0 ? 1.5 : -1.5));
  const pressure = 1005 + (hash % 18); // Pressure 1005 - 1023 hPa

  // Timezone offsets between -11 and +12
  const hoursOffset = -11 + (hash % 24);
  const timezoneOffset = hoursOffset * 3600;

  // Build responsive weather emojis indices
  const conditionEmojiMap = {
    Clear: "☀️",
    Clouds: "⛅",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "🌩️",
    Snow: "🌨️",
    Mist: "🌫️",
  };

  // Synthesize structured weekly forecast
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIndex = new Date().getDay();
  const daily = [];

  for (let d = 0; d < 5; d++) {
    const loopDayIndex = (todayIndex + d) % 7;
    const genTemp =
      tempRange + (d % 2 === 0 ? -Math.round(hash % 3) : Math.round(hash % 4));
    const genCond = conditions[(hash + d) % conditions.length];
    daily.push({
      day: weekdays[loopDayIndex],
      icon: conditionEmojiMap[genCond] || "☀️",
      temp: genTemp,
      condition: genCond,
    });
  }

  // Synthesize 6 steps hourly increments
  const hourly = [];
  for (let h = 0; h < 6; h++) {
    const hourLabel = `${(h * 4) % 24}:00`;
    const hourTempOffset =
      h % 2 === 0 ? Math.round(hash % 2) : -Math.round(hash % 3);
    hourly.push({
      time: hourLabel,
      temp: tempRange + hourTempOffset,
    });
  }

  return {
    name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
    country: "Regional",
    temp: tempRange,
    condition: condition,
    humidity: humidity,
    wind: windSpeed,
    feelsLike: feelsLike,
    pressure: pressure,
    timezone: timezoneOffset,
    hourly: hourly,
    daily: daily,
  };
}

/**
 * Standardize OpenWeatherMap raw responses to match local templating keys
 */
function extractPayloadData(current, forecast) {
  const rawCond =
    current.weather && current.weather[0] ? current.weather[0].main : "Clear";

  // Process weather conditions
  let timezoneOffset = 0;
  if (typeof current.timezone !== "undefined") {
    timezoneOffset = current.timezone;
  }

  // Default synthesized forecast lists if the secondary API payload is missing
  let daily = [];
  let hourly = [];

  if (forecast && forecast.list) {
    // Group forecasts by dates to get single daily nodes
    const sortedDays = {};
    const hourlyIndices = forecast.list.slice(0, 6); // next 18 hours

    forecast.list.forEach((item) => {
      const dateStr = item.dt_txt.split(" ")[0]; // Get YYYY-MM-DD
      if (!sortedDays[dateStr]) {
        sortedDays[dateStr] = [];
      }
      sortedDays[dateStr].push(item);
    });

    // Loop and grab 5 distinct calendar items
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayKeys = Object.keys(sortedDays).slice(0, 5);

    dayKeys.forEach((dateKey) => {
      // Find representative reading (midday point is excellent)
      const readings = sortedDays[dateKey];
      const middleReading =
        readings[Math.floor(readings.length / 2)] || readings[0];
      const dateObj = new Date(middleReading.dt * 1000);

      const condName =
        middleReading.weather && middleReading.weather[0]
          ? middleReading.weather[0].main
          : "Clear";

      // Map main descriptor to uniform matching system Emojis symbols
      const compactEmoji = mapConditionToEmoji(condName);

      daily.push({
        day: weekdays[dateObj.getDay()],
        icon: compactEmoji,
        temp: Math.round(middleReading.main.temp),
        condition: condName,
      });
    });

    // Hourly: map next 6 sequential data points
    hourlyIndices.forEach((item) => {
      const timeObj = new Date(item.dt * 1000);

      // Format time correctly depending on timezone offsets
      const utcTimeValue =
        timeObj.getTime() + timeObj.getTimezoneOffset() * 60000;
      const targetLocalTime = new Date(utcTimeValue + timezoneOffset * 1000);

      let hr = targetLocalTime.getHours();
      let padTime = `${hr}:00`;

      hourly.push({
        time: padTime,
        temp: Math.round(item.main.temp),
      });
    });
  } else {
    // Fallback robust synthesizing code if forecast API call fails
    const mockFallback = lookupRobustMockData(current.name);
    daily = mockFallback.daily;
    hourly = mockFallback.hourly;
  }

  return {
    name: current.name,
    country: current.sys ? current.sys.country : "",
    temp: Math.round(current.main.temp),
    condition: rawCond,
    humidity: current.main.humidity,
    wind: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
    feelsLike: Math.round(current.main.feels_like),
    pressure: current.main.pressure,
    timezone: timezoneOffset,
    hourly: hourly,
    daily: daily,
  };
}

/**
 * Master Render Engine: Syncs HTML layout nodes with selected weather data bundle
 */
function renderWeatherInterface(weatherData) {
  // Save timezone globally to keep clock tickers synchronized correctly
  currentCityTimezoneOffset = weatherData.timezone;
  updateClockDisplay();

  // 1. Sync header text elements
  const locationStr = weatherData.country
    ? `${weatherData.name}, ${weatherData.country}`
    : weatherData.name;
  document.getElementById("current-location").textContent = locationStr;

  // 2. Sync main giant temperature displays
  document.getElementById("main-temp-val").textContent = weatherData.temp;

  // 3. Sync details listing
  document.getElementById("humidity-val").textContent =
    `${weatherData.humidity}%`;
  document.getElementById("condition-val").textContent = weatherData.condition;
  document.getElementById("wind-val").textContent = `${weatherData.wind} km/h`;
  document.getElementById("feels-like-val").textContent =
    `${weatherData.feelsLike}° C`;
  document.getElementById("pressure-val").textContent =
    `${weatherData.pressure} hPa`;

  // 4. Update large minimalist SVG condition illustration (Right side of card)
  const giantSgContainer = document.getElementById("giant-weather-svg");
  giantSgContainer.innerHTML = getMinimalSVGMarkup(weatherData.condition);

  // 5. Populate and render bottom Hourly Timeline
  const hourlyTimeline = document.getElementById("hourly-timeline");
  hourlyTimeline.innerHTML = ""; // Clear existing

  weatherData.hourly.forEach((hourNode, index) => {
    const itemCol = document.createElement("div");
    itemCol.className = "hourly-tick-col";
    itemCol.innerHTML = `
            <div id="tick-col-${index}" class="tick-line"></div>
            <span class="hour">${hourNode.time}</span>
            <span class="temp">${hourNode.temp}°c</span>
        `;
    hourlyTimeline.appendChild(itemCol);
  });

  // 6. Populate top 5-day horizontal forecast bar
  const forecastBar = document.getElementById("forecast-bar");
  forecastBar.innerHTML = ""; // Clear existing

  weatherData.daily.forEach((dayNode, index) => {
    const itemPill = document.createElement("div");
    itemPill.className = `forecast-item ${index === 2 ? "active" : ""}`; // Highlight middle day just like reference image Wed style
    itemPill.innerHTML = `
            <span class="day">${dayNode.day}</span>
            <span class="icon">${dayNode.icon}</span>
            <span class="temp">${dayNode.temp}°</span>
        `;
    forecastBar.appendChild(itemPill);
  });
}

/**
 * Returns dynamic, highly responsive minimalist line outline SVGs based on code categories
 */
function getMinimalSVGMarkup(condition) {
  const norm = condition.toLowerCase().trim();

  // CLEAR SKY
  if (
    norm.includes("clear") ||
    norm.includes("sunny") ||
    norm.includes("hot")
  ) {
    return `
            <svg viewBox="0 0 100 100" class="minimal-stroke-sun">
                <circle cx="50" cy="50" r="18" fill="none" stroke="white" stroke-width="4.5" />
                <line x1="50" y1="15" x2="50" y2="21" stroke="white" stroke-width="4.5" stroke-linecap="round" />
                <line x1="50" y1="79" x2="50" y2="85" stroke="white" stroke-width="4.5" stroke-linecap="round" />
                <line x1="15" y1="50" x2="21" y2="50" stroke="white" stroke-width="4.5" stroke-linecap="round" />
                <line x1="79" y1="50" x2="85" y2="50" stroke="white" stroke-width="4.5" stroke-linecap="round" />
                <line x1="25.25" y1="25.25" x2="29.5" y2="29.5" stroke="white" stroke-width="4.5" stroke-linecap="round" />
                <line x1="70.5" y1="70.5" x2="74.75" y2="74.75" stroke="white" stroke-width="4.5" stroke-linecap="round" />
                <line x1="74.75" y1="25.25" x2="70.5" y2="29.5" stroke="white" stroke-width="4.5" stroke-linecap="round" />
                <line x1="29.5" y1="70.5" x2="25.25" y2="74.75" stroke="white" stroke-width="4.5" stroke-linecap="round" />
            </svg>
        `;
  }

  // CLOUDY, OVERCAST, MIST, FOG
  if (
    norm.includes("cloud") ||
    norm.includes("overcast") ||
    norm.includes("haze")
  ) {
    return `
            <svg viewBox="0 0 100 100" class="minimal-stroke-cloud">
                <path d="M25,65 Q18,65 18,57 Q18,48 29,46 Q33,31 49,31 Q63,31 69,43 Q80,43 80,54 Q80,65 67,65 Z" fill="none" stroke="white" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
        `;
  }

  // THUNDERSTORM
  if (norm.includes("thunder") || norm.includes("storm")) {
    return `
            <svg viewBox="0 0 100 100" class="minimal-stroke-cloud">
                <path d="M30,55 Q24,55 24,48 Q24,41 33,39 Q37,26 51,26 Q63,26 68,36 Q78,36 78,45 Q78,55 68,55 Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />
                <polygon points="52,58 43,69 49,69 45,82 56,67 50,67" fill="white" stroke="white" stroke-width="1" />
            </svg>
        `;
  }

  // RAIN, DRIZZLE, SHOWER
  if (
    norm.includes("rain") ||
    norm.includes("drizzle") ||
    norm.includes("shower")
  ) {
    return `
            <svg viewBox="0 0 100 100" class="minimal-stroke-cloud">
                <path d="M30,53 Q24,53 24,46 Q24,39 33,37 Q37,24 51,24 Q63,24 68,34 Q78,34 78,43 Q78,53 68,53 Z" fill="none" stroke="white" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" />
                <line x1="38" y1="63" x2="35" y2="73" stroke="white" stroke-width="3" stroke-linecap="round" class="minimal-stroke-rain-drop drop-delay-1" />
                <line x1="50" y1="66" x2="47" y2="76" stroke="white" stroke-width="3" stroke-linecap="round" class="minimal-stroke-rain-drop" />
                <line x1="62" y1="63" x2="59" y2="73" stroke="white" stroke-width="3" stroke-linecap="round" class="minimal-stroke-rain-drop drop-delay-2" />
            </svg>
        `;
  }

  // SNOW, ICE
  if (norm.includes("snow") || norm.includes("ice") || norm.includes("hail")) {
    return `
            <svg viewBox="0 0 100 100" class="minimal-stroke-cloud">
                <path d="M30,53 Q24,53 24,46 Q24,39 33,37 Q37,24 51,24 Q63,24 68,34 Q78,34 78,43 Q78,53 68,53 Z" fill="none" stroke="white" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" />
                <circle cx="38" cy="67" r="3" fill="white" />
                <circle cx="50" cy="71" r="3" fill="white" />
                <circle cx="62" cy="67" r="3" fill="white" />
            </svg>
        `;
  }

  // MIST / OTHER ATMOSPHERE
  return `
        <svg viewBox="0 0 100 100" class="minimal-stroke-sun">
            <line x1="20" y1="35" x2="80" y2="35" stroke="white" stroke-width="4.5" stroke-linecap="round" />
            <line x1="30" y1="48" x2="70" y2="48" stroke="white" stroke-width="4.5" stroke-linecap="round" />
            <line x1="15" y1="61" x2="85" y2="61" stroke="white" stroke-width="4.5" stroke-linecap="round" />
            <line x1="40" y1="74" x2="60" y2="74" stroke="white" stroke-width="4.5" stroke-linecap="round" />
        </svg>
    `;
}

/**
 * Utility: Map standard OpenWeatherMap condition descriptor names to standard emojis types
 */
function mapConditionToEmoji(conditionName) {
  const raw = conditionName.toLowerCase();
  if (raw.includes("clear")) return "☀️";
  if (raw.includes("cloud")) return "⛅";
  if (raw.includes("rain") || raw.includes("drizzle")) return "🌧️";
  if (raw.includes("thunder")) return "🌩️";
  if (raw.includes("snow")) return "🌨️";
  if (raw.includes("mist") || raw.includes("fog") || raw.includes("smoke"))
    return "🌫️";
  return "☀️";
}

/**
 * Periodic Ticker synchronizing clock displays
 */
function syncClockTicks() {
  if (clockTimerInterval) {
    clearInterval(clockTimerInterval);
  }
  clockTimerInterval = setInterval(updateClockDisplay, 1000);
}

/**
 * Re-computes clock and updates date/time label taking city offsets into consideration
 */
function updateClockDisplay() {
  const timeDisplayNode = document.getElementById("current-time-date");
  if (!timeDisplayNode) return;

  // Fetch UTC milliseconds
  const now = new Date();
  const utcTimeMs = now.getTime() + now.getTimezoneOffset() * 60000;

  // Offset target date
  const cityDate = new Date(utcTimeMs + currentCityTimezoneOffset * 1000);

  // Time calculations
  let hoursStr = String(cityDate.getHours()).padStart(2, "0");
  let minsStr = String(cityDate.getMinutes()).padStart(2, "0");

  // Date formatting (E.g. "12 March, Tuesday")
  const daysArr = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsArr = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const finalDayNickname = daysArr[cityDate.getDay()];
  const finalMonthName = monthsArr[cityDate.getMonth()];
  const dateNum = cityDate.getDate();

  timeDisplayNode.textContent = `${hoursStr}:${minsStr} • ${dateNum} ${finalMonthName}, ${finalDayNickname}`;
}

/**
 * Toast notification widget trigger
 */
function showToast(message) {
  const errorToast = document.getElementById("error-toast");
  const errorMessage = document.getElementById("error-message");

  errorMessage.textContent = message;
  errorToast.classList.remove("hidden");

  // Automatically fade out after 6 seconds
  setTimeout(() => {
    errorToast.classList.add("hidden");
  }, 6000);
}

/**
 * Dynamic setup indicators (Demo Mode vs Live mode badge tags)
 */
function updateBadge() {
  const hasKey = !!localStorage.getItem("openweather_api_key");
  const badge = document.getElementById("demo-badge");

  if (hasKey) {
    badge.className = "badge live";
    badge.querySelector("span").textContent = "Live Mode Active";
  } else {
    badge.className = "badge demo-only";
    badge.querySelector("span").textContent = "Demo Mode Active";
  }
}
