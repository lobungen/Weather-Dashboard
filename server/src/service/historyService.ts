import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// TODO: Define a City class with name and id properties
class City {
  name: string;
  id: string;

  constructor(public name: string, public id: string = uuidv4()) {
    this.name = name;
    this.id = id;
  }
}

// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
   private async read() {
    const history = await fs.promises.readFile('db/db.json', 'utf-8');
    return JSON.parse(history);
   }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
   async getCities(): Promise<City[]> {
    const filePath = path.join(__dirname, '../data/searchHistory.json');
    return new Promise<City[]>((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          const cities = JSON.parse(data) as City[];
          resolve(cities);
        }
      });
    });
   }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
   async addCity(city: string) {
    const cities = await this.getCities();
    const newCity = new City(city);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
   }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
   async removeCity(id: string) {
    const cities = await this.getCities();
    const updatedCities = cities.filter((city) => city.id !== id);
    await this.write(updatedCities);
    return updatedCities;
   }
}

export default new HistoryService();
