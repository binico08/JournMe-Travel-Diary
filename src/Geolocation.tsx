// npx expo install expo-location
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function GeolocationScreen() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
    } catch (error) {
      setErrorMsg('Error fetching location.');
      console.error(error);
    }
  };

  const getAddress = async () => {
    if (!location) return;
    const address = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setAddress(
      formatAddress(
        address[0].name ?? '',
        address[0].city ?? '',
        address[0].region ?? '',
        address[0].postalCode ?? ''
      )
    );
  };

  function formatAddress(
    name: string,
    city: string,
    region: string,
    postalCode: string
  ): string {
    return name + ', ' + city + ', ' + region + ' ' + postalCode;
  }

  return (
    <View style={styles.container}>
      <Button title="Get Current Location" onPress={getCurrentLocation} />
      <Button title="Get Address" onPress={getAddress} />
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      {location && (
        <Text style={styles.text}>
          Latitude: {location.latitude} | Longitude: {location.longitude}
        </Text>
      )}
      {address && <Text style={styles.text}>{address}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
