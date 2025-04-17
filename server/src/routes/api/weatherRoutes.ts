import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;
    const weatherData = await WeatherService.getWeatherForCity(city);
    await HistoryService.addCity(city);
    //ensures saved data has proper casing regardless of input
    res.json(weatherData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
  // TODO: save city to search history
router.post('/history', async (req: Request, res: Response) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }
  try {
    const historyService = new HistoryService();
    await historyService.saveCityToHistory(city);
    res.status(200).json({ message: `City ${city} saved to search history` });
  } catch (error) {
    console.error('Error saving city to search history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const historyService = new HistoryService();
    const history = await historyService.getSearchHistory();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const historyService = new HistoryService();
    await historyService.deleteCityFromHistory(id);
    res.status(200).json({ message: `City with ID ${id} deleted from search history` });
  } catch (error) {
    console.error('Error deleting city from search history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
