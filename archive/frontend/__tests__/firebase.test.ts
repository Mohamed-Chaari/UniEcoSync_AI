import { submitAnomalyReport, AnomalyReport } from '../services/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(),
    collection: jest.fn((db, name) => name),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
  };
});

jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
  };
});

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(),
  };
});

describe('Firebase Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('test_submitAnomalyReport_logs_and_resolves', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const mockReport: AnomalyReport = {
      userId: 'user123',
      type: 'water_leak',
      description: 'Leaking pipe',
      location: 'Building A',
      imageUrl: 'http://example.com/image.png'
    };

    await expect(submitAnomalyReport(mockReport)).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("Mock submitted report:", mockReport);

    consoleSpy.mockRestore();
  });
});
