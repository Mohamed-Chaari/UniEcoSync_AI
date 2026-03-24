export const getFirestore = jest.fn();
export const collection = jest.fn();
export const addDoc = jest.fn();
export const getDocs = jest.fn();
export const query = jest.fn();

export const getAuth = jest.fn(() => ({
  currentUser: { uid: 'test-uid' },
}));
export const initializeApp = jest.fn();
