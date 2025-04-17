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
  }
}


// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5/';
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
   private async fetchLocationData(query: string) {
    const response = await fetch(
      `${this.baseURL}geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`
    );
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
  // TODO: Complete getWeatherForCity method
   async getWeatherForCity(city: string) {
    this.cityName = city;
    const locationData = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(locationData);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData);
    return {
      currentWeather,
      forecastArray,
      locationData,
    };
   }
}

export default new WeatherService();
