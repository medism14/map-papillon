import { StyleSheet, View, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Observation } from '../types/observation';
import { FontAwesome } from '@expo/vector-icons';
import api from '../api/api';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const CartObservations = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const { isConnected } = useSelector((state: any) => state.auth);

  useFocusEffect(
    React.useCallback(() => {
      fetchObservations();
    }, [])
  );

  const fetchObservations = async () => {
    try {
      // Récupérer les observations par ville
      const citiesResponse = await api.get("/liste-villes");
      const citiesData = citiesResponse.data;

      if (!Array.isArray(citiesData)) {
        throw new Error("La liste des villes n'est pas un tableau");
      }

      const allObservations = await Promise.all(
        citiesData.map(async (cityData: {City: string, Country: string}) => {
          if (!cityData.City) return [];
          
          const response = await api.get(`/liste-par-ville/${cityData.City}`);
          return response.data;
        })
      );

      let flattenedObservations = allObservations.flat();

      // Récupérer les observations personnelles si connecté
      if (isConnected) {
        try {
          const userObservationsResponse = await api.get("/mes-observations");
          if (userObservationsResponse.data) {
            flattenedObservations = [
              ...flattenedObservations,
              ...userObservationsResponse.data
            ];
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des observations personnelles:", error);
        }
      }

      // Dédoublonner les observations
      const uniqueObservations = Array.from(
        new Set(flattenedObservations.map((obs) => JSON.stringify(obs)))
      ).map((str) => JSON.parse(str));

      setObservations(uniqueObservations);
      setLoading(false);
    } catch (error) {
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
      >
        {observations && observations.map((observation, index) => {
          if (!observation.LatLng) return null;
          const [lat, lng] = observation.LatLng.split(',').map(Number);
          if (isNaN(lat) || isNaN(lng)) return null;
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: lat,
                longitude: lng
              }}
              title={observation.TypePapillon}
              description={`Observé par ${observation.User} - ${observation.Compte} papillon(s)`}
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
    top: 10,
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