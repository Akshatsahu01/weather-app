# Product Requirements Document (PRD)

## 1. Product Summary

Weather App is a lightweight CLI utility for quickly viewing current weather for a named city. A user supplies a city name, and the app resolves the location and displays the latest available current conditions from Open-Meteo.

## 2. Problem Statement

Users need a fast, low-friction way to check current weather from a terminal without opening a browser or managing an API key.

## 3. Target Users

- Developers and technical users working in a terminal.
- Users who want a quick current-weather lookup.
- Learners exploring Node.js HTTP requests and public APIs.

## 4. User Story

As a terminal user, I want to enter a city name and see its current temperature, humidity, condition, and wind speed so that I can make a quick weather decision.

## 5. User Experience

### Primary flow

1. User runs `npm start -- <city-name>`.
2. The app indicates that it is fetching coordinates.
3. The app identifies the selected city and country.
4. The app indicates that it is fetching weather data.
5. The app displays current weather values.

### Failure flows

- If the city argument is missing, show usage instructions and an example.
- If no city is found, identify the requested city as not found.
- If the network or API response fails, show an error message and return a non-zero exit code.

## 6. Functional Requirements

| ID   | Requirement                                                                   | Priority |
| ---- | ----------------------------------------------------------------------------- | -------- |
| FR-1 | Accept a city name as a command-line argument.                                | Must     |
| FR-2 | Resolve the city using Open-Meteo geocoding.                                  | Must     |
| FR-3 | Use the first matching geocoding result.                                      | Must     |
| FR-4 | Fetch current temperature, humidity, weather code, and wind speed.            | Must     |
| FR-5 | Display the resolved city and country.                                        | Must     |
| FR-6 | Display temperature in Celsius and wind speed in km/h.                        | Must     |
| FR-7 | Convert supported WMO weather codes to readable condition text.               | Must     |
| FR-8 | Return exit code `1` for missing input, no match, or handled request failure. | Must     |
| FR-9 | Provide an `npm start` script.                                                | Should   |

## 7. Non-Functional Requirements

- **Performance**: Perform only the two required sequential API requests and avoid unnecessary local processing.
- **Usability**: Output should be readable in a standard terminal and include units.
- **Portability**: Run on supported Node.js versions with ECMAScript module support.
- **Maintainability**: Keep API URLs, weather-code mapping, and CLI behavior easy to locate and update.
- **Security**: Encode user input before including it in a URL and avoid collecting credentials or personal data.
- **Availability**: Clearly communicate external API or network failures; live results depend on Open-Meteo availability.

## 8. Acceptance Criteria

- Running without a city prints usage and exits non-zero.
- Running with a known city prints the city, country, temperature, humidity, condition, and wind speed.
- A city with no geocoding result produces a not-found message and exits non-zero.
- A supported weather code produces its mapped condition label.
- A request or JSON parsing failure produces an error and exits non-zero.
- The documented commands work from the project directory.

## 9. Success Metrics

- A valid lookup completes successfully when both Open-Meteo services are available.
- Users can identify all four requested weather values without interpreting raw API field names.
- Invalid input and external failures are understandable from terminal output alone.

## 10. Future Enhancements

- Add request timeouts, HTTP status validation, retries, and response schema validation.
- Support multiple search results so users can disambiguate cities with the same name.
- Add forecast dates, units, and optional location/timezone output.
- Add automated tests with mocked API responses.
- Add command-line flags for units, result count, and output format such as JSON.
- Improve separation between transport, domain mapping, and presentation.
