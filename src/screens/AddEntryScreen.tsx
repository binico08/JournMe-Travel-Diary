import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  BackHandler,
  Modal,
  Dimensions
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry } from '../services/AsyncStorage';
import { TravelEntry } from '../models/TravelEntry';
import { ThemeContext } from '../context/ThemeContext';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const { width } = Dimensions.get('window');

const AddEntryScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Request permissions on mount
  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take pictures for your travel entries.');
      }
      
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to record your travel locations.');
      }
      
      // Request notification permission
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert('Permission Required', 'Notification permission is needed to send travel entry confirmations.');
      }
    })();
  }, []);
  
  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (hasChanges) {
          Alert.alert(
            'Discard Changes',
            'You have unsaved changes. Are you sure you want to discard them?',
            [
              { text: 'Stay', style: 'cancel', onPress: () => {} },
              { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
            ]
          );
          return true; // Prevent default back behavior
        }
        return false; // Let default back behavior happen
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [hasChanges, navigation])
  );
  
  // Take a picture using the camera
  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setHasChanges(true);
        
        // Get location immediately after taking the picture
        getLocation();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };
  
  // Get current location
  const getLocation = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to record your travel location.');
        setIsLoading(false);
        return;
      }
      
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(locationData);
      
      // Get address from coordinates using reverse geocoding
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
      
      if (addressResponse && addressResponse.length > 0) {
        const addr = addressResponse[0];
        const formattedAddress = [
          addr.name,
          addr.street,
          addr.city,
          addr.region,
          addr.country,
          addr.postalCode
        ].filter(Boolean).join(', ');
        
        setAddress(formattedAddress);
      }
      
      setIsLoading(false);
      setHasChanges(true);
    } catch (error) {
      console.error('Error getting location:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    }
  };
  
  // Send a local notification
  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Travel Entry Saved!',
        body: `Your travel memory at ${address} has been saved.`,
        data: { type: 'travel_entry_saved' },
      },
      trigger: null, // Show immediately
    });
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!imageUri) {
      errors.push('Please take a picture for your travel entry.');
    }
    
    if (!location) {
      errors.push('Please wait for the location to be determined or try again.');
    }
    
    if (!address || address.trim() === '') {
      errors.push('Location address is required.');
    }
    
    setValidationErrors(errors);
    console.log('Validation errors:', errors); // Add logging
    return errors.length === 0;
  };
  
  // Open confirmation modal
  const confirmSaveEntry = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };
  
  // Save the travel entry
  const saveEntryHandler = async () => {
    try {
      setIsLoading(true);
      setShowConfirmModal(false);
      
      const newEntry: TravelEntry = {
        id: Date.now().toString(),
        imageUri: imageUri!,
        location: {
          latitude: location!.coords.latitude,
          longitude: location!.coords.longitude,
        },
        address,
        notes: notes.trim() !== '' ? notes : undefined,
        timestamp: Date.now(),
      };
      
      await saveEntry(newEntry);
      await sendNotification();
      
      setIsLoading(false);
      setHasChanges(false);
      
      Alert.alert(
        'Success',
        'Travel entry saved successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save travel entry. Please try again.');
    }
  };
  
  // Cancel saving
  const cancelSaveEntry = () => {
    setShowConfirmModal(false);
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity 
            style={[
              styles.cameraButton, 
              { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }
            ]} 
            onPress={takePicture}
          >
            <Ionicons 
              name="camera" 
              size={50} 
              color={isDarkMode ? '#4285F4' : '#4285F4'} 
            />
            <Text style={[
              styles.cameraText, 
              { color: isDarkMode ? '#fff' : '#333' }
            ]}>
              Take a Picture
            </Text>
          </TouchableOpacity>
        )}
        
        {imageUri && (
          <TouchableOpacity 
            style={styles.retakeButton} 
            onPress={takePicture}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={[
        styles.infoContainer, 
        { backgroundColor: isDarkMode ? '#222' : '#fff' }
      ]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={[
              styles.loadingText, 
              { color: isDarkMode ? '#fff' : '#333' }
            ]}>
              Getting location...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.addressContainer}>
              <Ionicons 
                name="location" 
                size={24} 
                color={isDarkMode ? '#4285F4' : '#4285F4'} 
                style={styles.addressIcon} 
              />
              <Text style={[
                styles.addressText, 
                { color: isDarkMode ? '#fff' : '#333' }
              ]}>
                {address || 'Location will appear here after taking a picture'}
              </Text>
            </View>
            
            {!location && imageUri && (
              <TouchableOpacity 
                style={styles.refreshLocationButton} 
                onPress={getLocation}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.refreshLocationText}>Refresh Location</Text>
              </TouchableOpacity>
            )}
            
            <TextInput
              style={[
                styles.notesInput, 
                { 
                  color: isDarkMode ? '#fff' : '#333',
                  backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                  borderColor: isDarkMode ? '#444' : '#ddd'
                }
              ]}
              placeholder="Add notes about this place..."
              placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              multiline
              value={notes}
              onChangeText={(text) => {
                setNotes(text);
                setHasChanges(true); 
              }}
            />
          </>
        )}
      </View>
      
      {validationErrors.length > 0 && (
        <View style={styles.errorsContainer}>
          {validationErrors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              • {error}
            </Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.saveButton, 
          { 
            backgroundColor: '#4CAF50',
            opacity: isLoading ? 0.7 : 1
          }
        ]}
        onPress={confirmSaveEntry}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>
      
      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelSaveEntry}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: isDarkMode ? '#333' : '#fff' }
          ]}>
            <View style={styles.modalHeader}>
              <Ionicons name="save-outline" size={30} color="#4CAF50" />
              <Text style={[
                styles.modalTitle,
                { color: isDarkMode ? '#fff' : '#333' }
              ]}>
                Save Travel Entry
              </Text>
            </View>
            
            <Text style={[
              styles.modalText,
              { color: isDarkMode ? '#ddd' : '#666' }
            ]}>
              Are you sure you want to save this travel memory?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelSaveEntry}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={saveEntryHandler}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  cameraText: {
    marginTop: 8,
    fontSize: 16,
  },
  retakeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retakeText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  infoContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#4285F4',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  refreshLocationText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  errorsContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.85,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddEntryScreen;