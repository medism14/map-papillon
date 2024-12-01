import { StyleSheet, View, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Observation } from '../types/observation';
import { FontAwesome } from '@expo/vector-icons';
import api from '../api/api';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { countries } from '../lib/countries';

const CartObservations = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchObservations();
    }, [])
  );

  const fetchObservations = async () => {
    try {
      setLoading(true);
      let allObservations: Observation[] = [];

      // Récupérer les observations en parallèle pour tous les pays
      const observationPromises = countries.map((country) =>
        api.get(`/liste-par-pays/${country}`)
      );

      const responses = await Promise.all(observationPromises);

      responses.forEach((response) => {
        if (response.data) {
          // Filtrer les observations qui ont des coordonnées valides
          const validObservations = response.data.filter((obs: Observation) => {
            if (!obs.LatLng) return false;
            const [lat, lng] = obs.LatLng.split(',').map(Number);
            return !isNaN(lat) && !isNaN(lng);
          });
          allObservations = [...allObservations, ...validObservations];
        }
      });

      console.log("Nombre d'observations valides:", allObservations.length);
      setObservations(allObservations);
      setLoading(false);

      // Si la carte est prête, on force un recentrage
      if (mapReady && mapRef.current) {
        const initialRegion = {
          latitude: 46.227638,
          longitude: 2.213749,
          latitudeDelta: 8,
          longitudeDelta: 8,
        };
        mapRef.current.animateToRegion(initialRegion, 1000);
      }

    } catch (error) {
      console.error("Erreur lors de la récupération des observations:", error);
      Alert.alert('Erreur', 'Impossible de charger les observations');
      setLoading(false);
    }
  };

  const zoomIn = () => {
    mapRef.current?.getCamera().then((camera: any) => {
      camera.zoom += 1;
      mapRef.current?.animateCamera(camera, { duration: 300 });
    });
  };

  const zoomOut = () => {
    mapRef.current?.getCamera().then((camera: any) => {
      camera.zoom -= 1;
      mapRef.current?.animateCamera(camera, { duration: 300 });
    });
  };

  const onMapReady = () => {
    setMapReady(true);
    // Recharger les observations quand la carte est prête
    if (observations.length > 0 && mapRef.current) {
      const initialRegion = {
        latitude: 46.227638,
        longitude: 2.213749,
        latitudeDelta: 8,
        longitudeDelta: 8,
      };
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {observations.length} observations au total
        </Text>
      </View>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 46.227638,
          longitude: 2.213749,
          latitudeDelta: 8,
          longitudeDelta: 8,
        }}
        showsUserLocation={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
        onMapReady={onMapReady}
        onLayout={() => {
          if (mapRef.current && observations.length > 0) {
            const initialRegion = {
              latitude: 46.227638,
              longitude: 2.213749,
              latitudeDelta: 8,
              longitudeDelta: 8,
            };
            mapRef.current.animateToRegion(initialRegion, 1000);
          }
        }}
      >
        {mapReady && observations.map((observation, index) => {
          const [lat, lng] = observation.LatLng.split(',').map(Number);
          return (
            <Marker
              key={`${index}-${lat}-${lng}`}
              coordinate={{
                latitude: lat,
                longitude: lng
              }}
              title={observation.TypePapillon}
              description={`Observé par ${observation.User} - ${observation.Compte} papillon(s)`}
              pinColor="red"
            />
          );
        })}
      </MapView>
      <View style={styles.zoomButtonsContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <FontAwesome name="plus" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <FontAwesome name="minus" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartObservations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  statsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoomButtonsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});