import { v4 as uuidv4 } from 'uuid';  // Import UUID package
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  cityName: string;
  lat: number;
  long: number;
  state: string;
  country: string;
}

// TODO: Define a class for the Weather object
class Weather {
  cityName: string;
  date: string;
  description: string;
  feelsLike: number;
  humidity: number;
  icon: string;
  temp: number;
  windSpeed: number;

  constructor(
    cityName: string,
    date: string,
    description: string,
    feelsLike: number,
    humidity: number,
    icon: string,
    temp: number,
    windSpeed: number
  ) {
    this.cityName = cityName;
    this.date = date;
    this.description = description;
    this.feelsLike = feelsLike;
    this.humidity = humidity;
    this.icon = icon;
    this.temp = temp;
    this.windSpeed = windSpeed;
}}


// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;
  private state: string = '';
  private country!: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
   private async fetchLocationData(query: string) {
    const url = `${this.baseURL}direct?q=${query}&limit=1&appid=${this.apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Location not found');
    }
    const locationData: Coordinates = {
      cityName: data[0].name,
      lat: data[0].lat,
      long: data[0].lon,
      state: data[0].state || '',
      country: data[0].country,
    };
    return locationData;
   }
  // TODO: Create destructureLocationData method
   private destructureLocationData(locationData: Coordinates): Coordinates {
    const { cityName, lat, long, state, country } = locationData;
    return {
      cityName,
      lat,
      long,
      state,
      country,
    };
   }
  // TODO: Create buildGeocodeQuery method
   private buildGeocodeQuery(): string {
    const { cityName, state, country } = this;
    const query = `${cityName}${state ? ',' + state : ''}${country ? ',' + country : ''}`;
    return query;
   }
  // TODO: Create buildWeatherQuery method
   private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, long } = coordinates;
    return `${this.baseURL}weather?lat=${lat}&lon=${long}&appid=${this.apiKey}&units=metric`;
   }
  // TODO: Create fetchAndDestructureLocationData method
   private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
   }
  // TODO: Create fetchWeatherData method
   private async fetchWeatherData(coordinates: Coordinates) {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherQuery);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const weatherData = await response.json();
    return weatherData;
   }
  // TODO: Build parseCurrentWeather method
   private parseCurrentWeather(response: any) {
    const weather = new Weather(
      response.name,
      new Date(response.dt * 1000).toLocaleDateString(),
      response.weather[0].description,
      response.main.feels_like,
      response.main.humidity,
      response.weather[0].icon,
      response.main.temp,
      response.wind.speed
    );
    return weather;
   }
  // TODO: Complete buildForecastArray method
   private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecast = weatherData.map((data) => {
      const date = new Date(data.dt * 1000).toLocaleDateString();
      return new Weather(
        currentWeather.cityName,
        date,
        data.weather[0].description,
        data.main.feels_like,
        data.main.humidity,
        data.weather[0].icon,
        data.main.temp,
        data.wind.speed
      );
    });
    return forecast;
   }
  // Removed duplicate implementation of getWeatherForCity
     // Method to save search history to a JSON file
  private saveSearchHistory(city: string) {
    const searchHistoryPath = path.join(__dirname, 'searchHistory.json');

    // Read current search history if the file exists
    let searchHistory = [];
    if (fs.existsSync(searchHistoryPath)) {
      const data = fs.readFileSync(searchHistoryPath, 'utf-8');
      searchHistory = JSON.parse(data);
    }

    // Create a new search entry with a unique ID
    const searchEntry = {
      id: uuidv4(),
      cityName: city,
      timestamp: new Date().toISOString(),
    };

    // Push the new search entry into the history
    searchHistory.push(searchEntry);

    // Write the updated search history to the file
    fs.writeFileSync(searchHistoryPath, JSON.stringify(searchHistory, null, 2));
  }

  // Method to retrieve the search history from the JSON file
  private getSearchHistory() {
    const searchHistoryPath = path.join(__dirname, 'searchHistory.json');

    if (fs.existsSync(searchHistoryPath)) {
      const data = fs.readFileSync(searchHistoryPath, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  }

  // Get weather for a city and save the city search to history
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const locationData = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(locationData);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData);

    // Save the city search to the history
    this.saveSearchHistory(city);

    // Return the weather data along with the search history
    return {
      currentWeather,
      forecastArray,
      locationData,
      searchHistory: this.getSearchHistory(),
    };
  }
}


export default new WeatherService();
