import { getDistance } from 'geolib';
import Broker from '../models/Broker';

interface BrokerWithLocation {
  _id: any;
  user: any;
  officeLocation?: {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  serviceRadius?: number;
}

export const findBrokersNearProperty = async (
  propertyLat: number,
  propertyLng: number,
  maxDistance: number = 10000
) => {
  try {
    console.log('🔍 Searching for brokers near property:', { propertyLat, propertyLng });

    const brokers = (await Broker.find({ verificationStatus: 'verified' }).populate(
      'user'
    )) as unknown as BrokerWithLocation[];

    if (brokers.length === 0) {
      console.log('❌ No verified brokers found');
      return [];
    }

    console.log(`✅ Found ${brokers.length} verified brokers`);

    const nearbyBrokers = brokers.filter((broker) => {
      const coords = broker.officeLocation?.coordinates;
      
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        const userName = broker.user?.name || 'Unknown';
        console.log(`⚠️ Broker ${userName} has no valid coordinates`);
        return false;
      }

      const distance = getDistance(
        { latitude: propertyLat, longitude: propertyLng },
        { latitude: coords.lat, longitude: coords.lng }
      );

      const brokerRadius = (broker.serviceRadius || 10) * 1000;
      const userName = broker.user?.name || 'Unknown';

      console.log(
        `📏 Broker: ${userName}, Distance: ${(distance / 1000).toFixed(2)}km, Service Radius: ${(broker.serviceRadius || 10)}km`
      );

      return distance <= brokerRadius;
    });

    console.log(`✅ Found ${nearbyBrokers.length} brokers within service radius`);

    nearbyBrokers.sort((a, b) => {
      const coordsA = a.officeLocation?.coordinates;
      const coordsB = b.officeLocation?.coordinates;

      if (!coordsA || !coordsB) return 0;

      const distanceA = getDistance(
        { latitude: propertyLat, longitude: propertyLng },
        { latitude: coordsA.lat!, longitude: coordsA.lng! }
      );

      const distanceB = getDistance(
        { latitude: propertyLat, longitude: propertyLng },
        { latitude: coordsB.lat!, longitude: coordsB.lng! }
      );

      return distanceA - distanceB;
    });

    return nearbyBrokers as any[];
  } catch (error) {
    console.error('❌ Find brokers near property error:', error);
    return [];
  }
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  return (
    getDistance({ latitude: lat1, longitude: lng1 }, { latitude: lat2, longitude: lng2 }) / 1000
  );
};