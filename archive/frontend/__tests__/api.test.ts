import axios from 'axios';
import { getWeatherAlert, getRelocationSuggestion } from '../services/api';

jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
    })),
  };
});

// Since api is initialized at import time using axios.create,
// we need to require it after mocking.
const api = require('../services/api').default;

describe('API Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('test_getWeatherAlert_returns_data', async () => {
    const mockData = {
      condition: 'Sunny',
      temperature_c: 25,
      humidity_percent: 50,
      sustainability_actions: ['Save water'],
      severity: 'low',
    };
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const result = await getWeatherAlert();

    expect(api.get).toHaveBeenCalledWith('/weather/');
    expect(result.condition).toBe('Sunny');
    expect(result.severity).toBe('low');
    expect(result.sustainability_actions).toEqual(['Save water']);
  });

  it('test_getRelocationSuggestion_returns_data', async () => {
    const mockData = {
      suggested_room_id: 'AMP-A1',
      suggested_room_name: 'Amphitheater A1',
      capacity: 400,
      energy_saving_estimate_kwh: 10,
      action_items: ['Move students'],
      message: 'Done',
    };
    (api.post as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const result = await getRelocationSuggestion('CR-101', 30);

    expect(api.post).toHaveBeenCalledWith('/relocation/', {
      room_id: 'CR-101',
      attendance_count: 30,
    });
    expect(result.suggested_room_id).toBe('AMP-A1');
    expect(result.energy_saving_estimate_kwh).toBe(10);
  });

  it('test_getWeatherAlert_handles_error', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(getWeatherAlert()).rejects.toThrow('Network error');
  });
});
