export interface TravelEntry {
  id: string;
  imageUri: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  notes?: string;
  timestamp: number;
}