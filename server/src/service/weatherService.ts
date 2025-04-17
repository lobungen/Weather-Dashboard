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


  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
   private async fetchLocationData(query: string) {
  const response = await fetch(query);
  const locationData = await response.json();

  if (!Array.isArray(locationData) || locationData.length === 0) {
    throw new Error(`City not found or invalid response: ${JSON.stringify(locationData)}`);
  }

  const location = this.destructureLocationData(locationData[0]);
  return location;
}
  // TODO: Create destructureLocationData method
   private destructureLocationData(locationData: Coordinates): Coordinates {
    const { cityName, lat, long, state, country } = locationData;
    const coordinates: Coordinates = {
      cityName: cityName,
      lat: lat,
      long: long,
      state: state,
      country: country,
    };
    return coordinates;
   }
  // TODO: Create buildGeocodeQuery method
   private buildGeocodeQuery(): string {
    const query = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=5&appid=${this.apiKey}`;
    return query;
   }
  // TODO: Create buildWeatherQuery method
   private buildWeatherQuery(coordinates: Coordinates): string {
    const query = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.long}&appid=${this.apiKey}`;
    return query;
   }
  // TODO: Create fetchAndDestructureLocationData method
   private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return locationData;
   }
  // TODO: Create fetchWeatherData method
   private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    const response = await fetch(query);
    const weatherData = await response.json();
    return weatherData;
   }
  // TODO: Build parseCurrentWeather method
   private parseCurrentWeather(response: any) {
    const { name } = response.city;
    const { dt, weather, main, wind } = response.list[0];
    const { description, icon } = weather[0];
    const { feels_like, humidity, temp } = main;
    const { speed } = wind;
    const currentWeather = new Weather(
      name,
      dt,
      description,
      feels_like,
      humidity,
      icon,
      temp,
      speed
    );
    return currentWeather;
   }
  // TODO: Complete buildForecastArray method
   private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray = weatherData.map((data: any) => {
      const { dt, weather, main, wind } = data;
      const { description, icon } = weather[0];
      const { feels_like, humidity, temp } = main;
      const { speed } = wind;
      const forecast = new Weather(
        currentWeather.cityName,
        dt,
        description,
        feels_like,
        humidity,
        icon,
        temp,
        speed
      );
      return forecast;
    });
    return forecastArray;
   }
  
     // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const locationData = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(locationData);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
    return { currentWeather, forecastArray };
  }
}


export default new WeatherService();
