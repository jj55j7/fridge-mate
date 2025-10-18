import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDistance, getCurrentLocation, getDistanceEmoji } from '@/lib/location';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const MapsModule = require('react-native-maps');
    MapView = MapsModule.default;
    Marker = MapsModule.Marker;
    PROVIDER_GOOGLE = MapsModule.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn('react-native-maps not available on this platform');
  }
} else {
  // For web, create mock components to prevent import errors
  MapView = null;
  Marker = null;
  PROVIDER_GOOGLE = null;
}

interface MapUser {
  id: string;
  name: string;
  foodPhoto: string;
  foodItems: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  lastActive: Date;
}

interface MapViewProps {
  onUserSelect: (user: MapUser) => void;
  users: MapUser[];
}

export default function MapViewComponent({ onUserSelect, users }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      Alert.alert('Location Error', 'Could not get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (user: MapUser) => {
    setSelectedUser(user);
  };

  const handleUserSelect = () => {
    if (selectedUser) {
      onUserSelect(selectedUser);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading map...</ThemedText>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText>Unable to load map. Please check your location permissions.</ThemedText>
      </View>
    );
  }

  // Show web fallback if MapView is not available
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={styles.webFallback}>
        <ThemedText type="subtitle" style={styles.webFallbackTitle}>
          🗺️ Map View
        </ThemedText>
        <ThemedText style={styles.webFallbackText}>
          Map functionality is available on mobile devices. Here are nearby users:
        </ThemedText>
        <View style={styles.usersList}>
          {users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => onUserSelect(user)}
            >
              <ThemedText type="subtitle" style={styles.userName}>
                {user.name}
              </ThemedText>
              <ThemedText style={styles.userDistance}>
                {getDistanceEmoji(user.distance)} {formatDistance(user.distance)}
              </ThemedText>
              <ThemedText style={styles.userFood}>
                Has: {user.foodItems?.join(', ') || 'Unknown food'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* User's location marker */}
        <Marker
          coordinate={userLocation}
          title="You"
          description="Your location"
          pinColor="blue"
        />

        {/* Other users' markers */}
        {users.map((user) => (
          <Marker
            key={user.id}
            coordinate={user.location}
            title={user.name}
            description={`${user.foodItems?.[0] || 'Food'} - ${formatDistance(user.distance)}`}
            onPress={() => handleMarkerPress(user)}
          >
            <View style={styles.customMarker}>
              <View style={styles.markerContent}>
                <Text style={styles.markerEmoji}>🍽️</Text>
                <Text style={styles.markerDistance}>
                  {getDistanceEmoji(user.distance)}
                </Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Selected user info */}
      {selectedUser && (
        <ThemedView style={styles.selectedUserCard}>
          <View style={styles.userInfo}>
            <ThemedText type="subtitle" style={styles.userName}>
              {selectedUser.name}
            </ThemedText>
            <ThemedText style={styles.userDistance}>
              {getDistanceEmoji(selectedUser.distance)} {formatDistance(selectedUser.distance)}
            </ThemedText>
            <ThemedText style={styles.userFood}>
              Has: {selectedUser.foodItems?.join(', ') || 'Unknown food'}
            </ThemedText>
            <ThemedText style={styles.lastActive}>
              Last active: {selectedUser.lastActive.toLocaleDateString()}
            </ThemedText>
          </View>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleUserSelect}
          >
            <Text style={styles.selectButtonText}>💕 Match with {selectedUser.name}</Text>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={initializeLocation}
        >
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContent: {
    alignItems: 'center',
  },
  markerEmoji: {
    fontSize: 16,
  },
  markerDistance: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  selectedUserCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userDistance: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  userFood: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 12,
    opacity: 0.6,
  },
  selectButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonText: {
    fontSize: 20,
  },
  webFallback: {
    flex: 1,
    padding: 20,
  },
  webFallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  webFallbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
