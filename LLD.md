# Low-Level Design (LLD)

## 1. Module Details

### `app.js`

The application is an ECMAScript module with one import:

```text
import https from 'https'
```

No external npm packages are required.

## 2. Hoisting Behavior

The CLI entry point intentionally calls `getWeather(cityName)` before the `getWeather` declaration. This works because JavaScript hoists function declarations before executing the module. The same behavior makes `makeRequest` available inside `getWeather` even though its declaration appears earlier in the source than the `getWeather` declaration.

The `const` variables remain declared before use. They are not accessed through hoisting and would be unavailable during their temporal dead zone.

## 3. Functions

### `makeRequest(url)`

**Input**: A complete HTTPS URL string.

**Behavior**:

- Calls `https.get(url, callback)`.
- Accumulates response chunks into a string.
- Parses the accumulated body with `JSON.parse` when the response ends.
- Resolves with the parsed object.
- Rejects when JSON parsing fails or the request emits an error.

**Output**: `Promise<object>`.

**Current limitation**: HTTP status codes are not checked, and no timeout is configured.

### `getWeather(cityName)`

**Input**: A non-empty city name string.

**Behavior**:

1. Builds the geocoding URL using `encodeURIComponent(cityName)`.
2. Requests one English result from Open-Meteo.
3. If `results` is missing or empty, writes a not-found message and exits with code `1`.
4. Extracts `latitude`, `longitude`, `name`, and `country` from the first result.
5. Builds a forecast URL with `timezone=auto` and these current variables:
   - `temperature_2m`
   - `relative_humidity_2m`
   - `weather_code`
   - `wind_speed_10m`
6. Maps the returned WMO code through the local `weatherCodes` object.
7. Prints the current weather.
8. Catches errors, prints the message, and exits with code `1`.

## 4. API Contracts

### Geocoding request

```text
GET https://geocoding-api.open-meteo.com/v1/search
  ?name=<encoded city>
  &count=1
  &language=en
  &format=json
```

Expected response shape:

```json
{
  "results": [
    {
      "name": "London",
      "country": "United Kingdom",
      "latitude": 51.5074,
      "longitude": -0.1278
    }
  ]
}
```

### Forecast request

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude=<latitude>
  &longitude=<longitude>
  &current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
  &timezone=auto
```

Expected current data:

```json
{
  "current": {
    "temperature_2m": 18.5,
    "relative_humidity_2m": 70,
    "weather_code": 2,
    "wind_speed_10m": 12.3
  }
}
```

## 5. Weather-Code Mapping

The implementation maps WMO codes `0`, `1`, `2`, `3`, `45`, `48`, `51`, `53`, `55`, `61`, `63`, `65`, `71`, `73`, `75`, `80`, `81`, `82`, `85`, `86`, `95`, `96`, and `99` to text labels. Any unrecognized code displays as `Unknown`.

## 6. CLI Contract

### Valid invocation

```text
node app.js London
npm start -- London
```

The city argument is the third process argument (`process.argv[2]`). Additional arguments are ignored by the current implementation.

### Missing argument

The app writes:

```text
Usage: node app.js <city-name>
Example: node app.js London
```

and exits with code `1`.

### Successful output

The output includes the resolved location, temperature in Celsius, relative humidity percentage, condition label, and wind speed in km/h.

## 7. Error Handling

- Invalid or missing command-line input: usage error, exit `1`.
- No geocoding match: city-not-found error, exit `1`.
- Network error or invalid JSON: generic error message, exit `1`.
- Unknown weather code: non-fatal `Unknown` label.

## 8. Recommended Test Seams

The current file is tightly coupled to live HTTPS calls. To make automated tests practical, extract or inject the request function and separate formatting from orchestration. Useful test cases are:

- Missing city argument.
- Geocoding response with no results.
- Successful geocoding and forecast response.
- Unknown WMO code.
- Network failure.
- Malformed JSON response.
