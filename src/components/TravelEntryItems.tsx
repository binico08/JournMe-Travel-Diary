import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelEntry } from '../models/TravelEntry';
import { ThemeContext } from '../context/ThemeContext';

interface TravelEntryItemProps {
  entry: TravelEntry;
  onRemove: (id: string) => void;
}

const TravelEntryItem: React.FC<TravelEntryItemProps> = ({ entry, onRemove }) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#333' : '#fff' }
    ]}>
      <Image source={{ uri: entry.imageUri }} style={styles.image} />
      
      <View style={styles.contentContainer}>
        <Text style={[
          styles.address, 
          { color: isDarkMode ? '#fff' : '#000' }
        ]}>
          {entry.address}
        </Text>
        
        <Text style={[
          styles.timestamp, 
          { color: isDarkMode ? '#ccc' : '#666' }
        ]}>
          {new Date(entry.timestamp).toLocaleString()}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onRemove(entry.id)}
      >
        <Ionicons name="trash-outline" size={24} color={isDarkMode ? '#fff' : '#ff6b6b'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: 12,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default TravelEntryItem;