// LandingScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const LandingScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    checkIfUserHasSeenIntro();
    
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
  }, [fadeAnim, slideAnim]); // Added the missing dependencies here

  const checkIfUserHasSeenIntro = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenIntro');
      setHasSeenIntro(value === 'true');
    } catch (error) {
      console.error('Error checking intro status:', error);
    }
  };

  const markIntroAsSeen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      console.log('Intro marked as seen');  // Add logging
      navigation.navigate('Home' as never);
    } catch (error) {
      console.error('Error saving intro status:', error);
      navigation.navigate('Home' as never);
    }
  };

  const getStarted = () => {
    markIntroAsSeen();
  };

  return (
    <View style={[
      styles.container,
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
          onPress={getStarted}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        
        {hasSeenIntro && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Text style={[
              styles.skipText,
              { color: isDarkMode ? '#90CAF9' : '#4285F4' }
            ]}>
              Skip to Home
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LandingScreen;