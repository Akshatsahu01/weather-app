#!/usr/bin/env node

import https from "https";

// Main execution
const cityName = process.argv[2];

if (!cityName) {
  console.error("Usage: node app.js <city-name>");
  console.error("Example: node app.js London");
  process.exit(1);
}

getWeather(cityName);

// Helper function to make HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function getWeather(cityName) {
  try {
    // Step 1: Get coordinates from city name
    console.log(`Fetching coordinates for ${cityName}...`);
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoData = await makeRequest(geocodingUrl);

    if (!geoData.results || geoData.results.length === 0) {
      console.error(`City "${cityName}" not found`);
      process.exit(1);
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    console.log(`Found: ${name}, ${country} (${latitude}, ${longitude})`);

    // Step 2: Fetch current weather
    console.log("\nFetching weather data...");
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const weatherData = await makeRequest(weatherUrl);

    // Step 3: Parse and display weather
    const current = weatherData.current;
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with hail",
    };

    console.log(`\n🌍 Weather in ${name}, ${country}`);
    console.log("━".repeat(40));
    console.log(`Temperature: ${current.temperature_2m}°C`);
    console.log(`Humidity: ${current.relative_humidity_2m}%`);
    console.log(
      `Condition: ${weatherCodes[current.weather_code] || "Unknown"}`,
    );
    console.log(`Wind Speed: ${current.wind_speed_10m} km/h`);
    console.log("━".repeat(40));
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
