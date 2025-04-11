import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../models/TravelEntry';

const ENTRIES_STORAGE_KEY = 'travelEntries';

/**
 * Retrieves all travel entries from AsyncStorage
 */
export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(ENTRIES_STORAGE_KEY);
    if (entriesJson !== null) {
      return JSON.parse(entriesJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting entries from storage:', error);
    return [];
  }
};

/**
 * Saves a new travel entry to AsyncStorage
 */
export const saveEntry = async (entry: TravelEntry): Promise<void> => {
  try {
    const entries = await getEntries();
    entries.unshift(entry); // Add new entry to the beginning of the array
    await AsyncStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry to storage:', error);
    throw new Error('Failed to save entry');
  }
};

/**
 * Updates an existing travel entry in AsyncStorage
 */
export const updateEntry = async (updatedEntry: TravelEntry): Promise<void> => {
  try {
    const entries = await getEntries();
    const index = entries.findIndex((e) => e.id === updatedEntry.id);
    
    if (index !== -1) {
      entries[index] = updatedEntry;
      await AsyncStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Error updating entry in storage:', error);
    throw new Error('Failed to update entry');
  }
};

/**
 * Removes a travel entry from AsyncStorage
 */
export const removeEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getEntries();
    const filteredEntries = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(filteredEntries));
  } catch (error) {
    console.error('Error removing entry from storage:', error);
    throw new Error('Failed to remove entry');
  }
};

/**
 * Gets a single travel entry by ID
 */
export const getEntryById = async (id: string): Promise<TravelEntry | null> => {
  try {
    const entries = await getEntries();
    const entry = entries.find((e) => e.id === id);
    return entry || null;
  } catch (error) {
    console.error('Error getting entry by ID:', error);
    return null;
  }
};

/**
 * Clears all travel entries from storage
 */
export const clearAllEntries = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ENTRIES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing entries:', error);
    throw new Error('Failed to clear entries');
  }
};