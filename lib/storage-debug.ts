export const debugStorage = {
  getToken: () => {
    if (typeof window === 'undefined') {
      console.log('Server side - no localStorage available');
      return null;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'null');
      return token;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  
  setToken: (token: string) => {
    if (typeof window === 'undefined') {
      console.log('Server side - cannot set localStorage');
      return false;
    }
    
    try {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },
  
  removeToken: () => {
    if (typeof window === 'undefined') {
      console.log('Server side - cannot remove from localStorage');
      return false;
    }
    
    try {
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  checkStorageSupport: () => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage not supported:', error);
      return false;
    }
  }
};

export default debugStorage;
