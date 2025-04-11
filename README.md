# Travel Diary App

A React Native application that allows users to document their travels by taking pictures and automatically recording their locations.

## Features

- Take photos directly from the app using the device camera
- Automatically get current location with reverse geocoding to show address
- Save travel entries with photos and locations
- View all saved entries in a list format
- Remove unwanted entries
- Dark mode / Light mode toggle
- Receive notifications when entries are saved

## Technologies Used

- React Native with TypeScript
- Expo framework
- React Navigation for screen navigation
- AsyncStorage for persistent data storage
- Expo Camera and Image Picker for capturing photos
- Expo Location for geolocation services
- Expo Notifications for local push notifications

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/device-features-react-native.git
cd device-features-react-native
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

## Required Permissions

This app requires the following permissions:
- Camera - For taking travel photos
- Location - For recording travel locations
- Notifications - For sending confirmation when entries are saved

## Usage

1. Home Screen
   - View all your saved travel entries
   - Toggle between dark and light mode
   - Tap the "+" button to add a new entry
   - Tap the trash icon to remove an entry

2. Add Entry Screen
   - Take a photo using your device camera
   - Your current location will be automatically detected
   - Add optional notes about the location
   - Save your entry and receive a confirmation notification

## Project Structure

```
travel-diary-app/
├── App.tsx                    # Main application component
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel configuration
├── app.json                   # Expo configuration
└── src/
    ├── screens/               # Application screens
    │   ├── HomeScreen.tsx     # Home screen with travel entries list
    │   └── AddEntryScreen.tsx # Screen for adding new travel entries
    ├── models/                # Data models
    │   └── TravelEntry.ts     # Travel entry model definition
    ├── services/              # Service functions
    │   └── StorageService.ts  # AsyncStorage operations for entries
    └── context/               # React contexts
        └── ThemeContext.tsx   # Theme context for dark/light mode
```

## Validations

The app includes the following validations:
- Permission checks for camera, location, and notifications
- Entry form validation to ensure photos and locations are captured
- Confirmation before discarding unsaved changes
- Error handling for failed API operations
- Empty state handling for when no entries exist
- Loading states during asynchronous operations

## GitHub Repository

This project is available at: 