import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TravelEntry } from '../models/TravelEntry';
import { getEntries, removeEntry } from '../services/AsyncStorage';
import { ThemeContext } from '../context/ThemeContext';
import TravelEntryItem from '../components/TravelEntryItems';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  
  const loadEntries = async () => {
    const travelEntries = await getEntries();
    setEntries(travelEntries);
  };
  
  useEffect(() => {
    if (isFocused) {
      loadEntries();
    }
  }, [isFocused]);
  
  useEffect(() => {
    // Animate elements in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);
  
  
  const markIntroAsSeen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      setHasSeenIntro(true);
    } catch (error) {
      console.error('Error saving intro status:', error);
      setHasSeenIntro(true);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };
  
  const handleRemoveEntry = async (id: string) => {
    Alert.alert(
      'Remove Entry',
      'Are you sure you want to remove this travel memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            await removeEntry(id);
            loadEntries();
          }
        }
      ]
    );
  };

  // If user hasn't seen intro yet, show landing screen content
  if (!hasSeenIntro) {
    return (
      <View style={[
        styles.landingContainer,
        { backgroundColor: isDarkMode ? '#0B2545' : '#f0f6fc' }
      ]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        
        <Animated.View 
          style={[
            styles.logoContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <Image 
            source={require('../assets/journme-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[
            styles.tagline,
            { color: isDarkMode ? '#e0e0e0' : '#3f4c5a' }
          ]}>
            keep your memories.
          </Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.contentContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.featureRow}>
            <View style={[
              styles.featureIcon,
              { backgroundColor: isDarkMode ? '#1B3A60' : '#e0f2f1' }
            ]}>
              <Ionicons name="camera" size={24} color="#4CAF50" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[
                styles.featureTitle,
                { color: isDarkMode ? '#fff' : '#1A2533' }
              ]}>
                Capture Moments
              </Text>
              <Text style={[
                styles.featureDescription,
                { color: isDarkMode ? '#B0BEC5' : '#546E7A' }
              ]}>
                Take photos of your travel experiences
              </Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <View style={[
              styles.featureIcon,
              { backgroundColor: isDarkMode ? '#1B3A60' : '#e0f2f1' }
            ]}>
              <Ionicons name="location" size={24} color="#4285F4" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[
                styles.featureTitle,
                { color: isDarkMode ? '#fff' : '#1A2533' }
              ]}>
                Track Locations
              </Text>
              <Text style={[
                styles.featureDescription,
                { color: isDarkMode ? '#B0BEC5' : '#546E7A' }
              ]}>
                Automatically save where you've been
              </Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <View style={[
              styles.featureIcon,
              { backgroundColor: isDarkMode ? '#1B3A60' : '#e0f2f1' }
            ]}>
              <Ionicons name="journal" size={24} color="#FF9800" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[
                styles.featureTitle,
                { color: isDarkMode ? '#fff' : '#1A2533' }
              ]}>
                Create Your Story
              </Text>
              <Text style={[
                styles.featureDescription,
                { color: isDarkMode ? '#B0BEC5' : '#546E7A' }
              ]}>
                Build a beautiful diary of your adventures
              </Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[
              styles.getStartedButton,
              { backgroundColor: '#4CAF50' }
            ]}
            onPress={markIntroAsSeen}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
  
  // Show regular home screen content when user has seen intro
  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }
    ]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <FlatList
        data={entries}
        renderItem={({ item }) => (
          <TravelEntryItem entry={item} onRemove={handleRemoveEntry} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4285F4']}
            tintColor={isDarkMode ? '#fff' : '#4285F4'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="images-outline" 
              size={60} 
              color={isDarkMode ? '#444' : '#ccc'} 
            />
            <Text style={[
              styles.emptyText,
              { color: isDarkMode ? '#fff' : '#666' }
            ]}>
              No Entries yet.
            </Text>
            <Text style={[
              styles.emptySubText,
              { color: isDarkMode ? '#aaa' : '#888' }
            ]}>
              Start adding your travel memories!
            </Text>
          </View>
        }
      />
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[
            styles.floatingButton, 
            { backgroundColor: isDarkMode ? '#4285F4' : '#4285F4' }
          ]}
          onPress={() => navigation.navigate('AddEntry' as never)}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.themeToggleButton, 
            { backgroundColor: isDarkMode ? '#555' : '#ddd' }
          ]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDarkMode ? 'sunny' : 'moon'} 
            size={24} 
            color={isDarkMode ? '#fff' : '#333'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Original HomeScreen styles
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 16,
    marginTop: 8,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 12,
  },
  themeToggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  
  // Landing screen styles
  landingContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: -10,
    fontStyle: 'italic',
  },
  contentContainer: {
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  getStartedButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  }
});

export default HomeScreen;