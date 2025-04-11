import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';

// Theme context
import { ThemeContext } from './src/context/ThemeContext';

const Stack = createStackNavigator();

export default function App() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load theme preference and check if first launch
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load theme preference
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === 'dark');
        } else {
          // Use system default if no preference stored
          setIsDarkMode(systemColorScheme === 'dark');
        }
        
        // Check if user has seen intro
        const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
        setIsFirstLaunch(hasSeenIntro !== 'true');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, [systemColorScheme]);
  
  // Save theme preference
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
      setIsDarkMode(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  if (isLoading) {
    // You could return a splash screen here
    return null;
  }
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent" 
          translucent 
        />
        <Stack.Navigator initialRouteName={isFirstLaunch ? "Landing" : "Home"}>
          <Stack.Screen 
            name="Landing" 
            component={LandingScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'Travel Diary',
              headerStyle: {
                backgroundColor: isDarkMode ? '#1A2533' : '#f0f6fc',
              },
              headerTintColor: isDarkMode ? '#fff' : '#1A2533',
            }} 
          />
          <Stack.Screen 
            name="AddEntry" 
            component={AddEntryScreen} 
            options={{ 
              title: 'Add New Entry',
              headerStyle: {
                backgroundColor: isDarkMode ? '#1A2533' : '#f0f6fc',
              },
              headerTintColor: isDarkMode ? '#fff' : '#1A2533',
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}