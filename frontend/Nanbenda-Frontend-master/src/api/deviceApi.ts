import { API_URL as API_BASE_URL } from './api';


export const fetchDeviceTypes = async (): Promise<string[]> => {
  return ['Mobile'];
};

export const fetchBrandsByType = async (type: string): Promise<string[]> => {
  const data = await fetchDevices();
  return data[type as keyof typeof data]?.brands || [];
};

export const fetchModelsByTypeAndBrand = async (type: string, brand: string): Promise<string[]> => {
  const data = await fetchDevices();
  return data[type as keyof typeof data]?.models[brand] || [];
};

// Keep existing fetchDevices as fallback/compatibility or remove if unused.
export const fetchDevices = async () => {
  // Simulating a backend call to a 'devices' table (fallback)
  return {
    Mobile: {
      brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Motorola'],
      models: {
        Apple: ['iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 14 Pro', 'iPhone 13 Standard'],
        Samsung: ['Galaxy S24 Ultra', 'Galaxy S23 Plus', 'Galaxy Z Fold 5', 'Galaxy A54'],
        Google: ['Pixel 8 Pro', 'Pixel 7a', 'Pixel Fold'],
        OnePlus: ['OnePlus 12', 'OnePlus 11', 'OnePlus Open'],
        Motorola: ['Razr+', 'Edge 40', 'Moto G Stylus']
      }
    },
    Laptop: {
      brands: ['Apple MacBook', 'Dell XPS', 'Lenovo ThinkPad', 'HP Spectre', 'ASUS'],
      models: {
        'Apple MacBook': ['MacBook Pro 14" (2023)', 'MacBook M3 Air', 'MacBook Pro 16" Intel'],
        'Lenovo ThinkPad': ['ThinkPad X1 Carbon Gen 11', 'ThinkPad T14s'],
        'Dell XPS': ['XPS 13 Developer Edition', 'XPS 15 Premium'],
        'HP Spectre': ['Spectre x360 14', 'Spectre x360 16'],
        'ASUS': ['Zenbook 14 OLED', 'ROG Zephyrus G14']
      }
    },
    TV: {
      brands: ['Samsung OLED', 'Sony Bravia', 'LG Electronics', 'TCL', 'Xiaomi'],
      models: {
        'Samsung OLED': ['65" S90C OLED TV', '55" Frame QLED TV'],
        'Sony Bravia': ['Sony A80L OLED', 'X90L Full Array'],
        'LG Electronics': ['C3 OLED 65"', 'G3 OLED 55"'],
        'TCL': ['6-Series Mini-LED', '8-Series 4K'],
        'Xiaomi': ['Mi TV Q1 75"', 'Mi TV 4S 55"']
      }
    },
    Other: {
      brands: ['Apple iPad', 'Nintendo Switch', 'Sony PlayStation', 'Apple Watch', 'Dyson'],
      models: {
        'Apple iPad': ['iPad Pro 12.9" M2', 'iPad Air 5th Gen'],
        'Apple Watch': ['Apple Watch Ultra 2', 'Apple Watch Series 9'],
        'Nintendo Switch': ['Switch OLED Model', 'Switch Lite'],
        'Sony PlayStation': ['PS5', 'PS5 Slim', 'PS4 Pro'],
        'Dyson': ['V15 Detect', 'V12 Detect Slim']
      }
    }
  };
};

export const fetchDeviceDamages = async (type: string, brand: string, model: string): Promise<string[]> => {
  return ['Screen Replacement', 'Battery Replacement', 'Water Damage', 'Software Issue', 'Other'];
};

export const fetchDevicePrice = async (type: string, brand: string, model: string, damageType: string): Promise<number> => {
  return 69.00;
};

export const fetchAddresses = async (token: string): Promise<any[]> => {
  return []; // Mock return for UI preview
};

export const createAddress = async (token: string, addressData: any): Promise<any> => {
  return {
    success: true,
    data: {
      id: Math.floor(Math.random() * 10000),
      ...addressData
    }
  };
};

export const setAddressActive = async (token: string, id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}/set-active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error setting address active:', error);
    return { success: false, message: 'Network error' };
  }
};

export const fetchUserRepairs = async (token: string): Promise<any[]> => {
  const storedStr = localStorage.getItem('mock_repairs');
  return storedStr ? JSON.parse(storedStr) : [];
};

export const createRepairBooking = async (token: string, bookingData: any, imageFiles: Blob[]): Promise<any> => {
  const newRepair = {
    id: Math.floor(Math.random() * 10000),
    ...bookingData,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  const storedStr = localStorage.getItem('mock_repairs');
  const storedRepairs = storedStr ? JSON.parse(storedStr) : [];
  localStorage.setItem('mock_repairs', JSON.stringify([newRepair, ...storedRepairs]));

  return {
    success: true,
    data: newRepair
  };
};

export const fetchBanners = async (): Promise<any[]> => {
  return [];
};


