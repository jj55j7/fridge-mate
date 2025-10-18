import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LocationMatch {
  userId: string;
  distance: number; // in kilometers
  location: UserLocation;
}

export async function getCurrentLocation(): Promise<UserLocation> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Get address from coordinates
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: address[0] ? 
        `${address[0].city}, ${address[0].region}` : 
        'Unknown location',
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw new Error('Failed to get location');
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearbyUsers(
  userLocation: UserLocation,
  allUsers: Array<{
    id: string;
    location: UserLocation;
    lastActive: Date;
  }>,
  maxDistance: number = 10 // 10km radius
): LocationMatch[] {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return allUsers
    .filter(user => {
      // Filter out users who haven't been active in the last 24 hours
      return user.lastActive > oneDayAgo;
    })
    .map(user => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        user.location.latitude,
        user.location.longitude
      );
      
      return {
        userId: user.id,
        distance,
        location: user.location,
      };
    })
    .filter(match => match.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km away`;
  } else {
    return `${Math.round(distance)}km away`;
  }
}

export function getDistanceEmoji(distance: number): string {
  if (distance < 0.5) return '🏠'; // Very close
  if (distance < 1) return '🚶'; // Walking distance
  if (distance < 3) return '🚲'; // Bike distance
  if (distance < 10) return '🚗'; // Car distance
  return '✈️'; // Far away
}

export function getDeliveryStatus(distance: number): {
  canDeliver: boolean;
  deliveryTime: string;
  deliveryMethod: string;
} {
  if (distance < 0.5) {
    return {
      canDeliver: true,
      deliveryTime: '5-10 minutes',
      deliveryMethod: 'Walking',
    };
  } else if (distance < 2) {
    return {
      canDeliver: true,
      deliveryTime: '10-20 minutes',
      deliveryMethod: 'Bike',
    };
  } else if (distance < 5) {
    return {
      canDeliver: true,
      deliveryTime: '15-30 minutes',
      deliveryMethod: 'Car',
    };
  } else {
    return {
      canDeliver: false,
      deliveryTime: 'Too far',
      deliveryMethod: 'Not available',
    };
  }
}
