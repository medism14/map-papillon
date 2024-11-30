/** @format */

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";
import { PapillonData } from "../types/papillonData";
import api from "../api/api";

const ObservationAdd = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { butterfly } = route.params || {};
  const { username } = useSelector((state: any) => state.auth);

  const [count, setCount] = useState("1");
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(0.01);
  const [butterflies, setButterflies] = useState([]);
  const [selectedButterfly, setSelectedButterfly] =
    useState<PapillonData | null>(null);

  // Coordonnées centrales de la France
  const FRANCE_CENTER = {
    latitude: 46.227638,
    longitude: 2.213749,
  };

  useEffect(() => {
    fetchButterflies();
    if (useCurrentLocation) {
      getCurrentLocation();
    } else if (!selectedLocation) {
      setSelectedLocation(FRANCE_CENTER);
    }
  }, [useCurrentLocation]);

  const fetchButterflies = async () => {
    try {
      const response = await api.get("/liste-papillons");
      const dataAll = response.data;
      const butterfliesData = Object.entries(dataAll).map(([id, data]) => ({
        id,
        ...(data as Record<string, any>),
        value: id,
        label: (data as any).nom,
      }));
      setButterflies(butterfliesData as any);
    } catch (error) {
      console.error("Erreur lors de la récupération des papillons:", error);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission de localisation refusée");
      setSelectedLocation(FRANCE_CENTER); // Fallback sur le centre de la France
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      setErrorMsg("Erreur lors de la récupération de la position");
      setSelectedLocation(FRANCE_CENTER); // Fallback sur le centre de la France
    }
  };

  const handleRegionChange = (region: any) => {
    setMapZoom(region.latitudeDelta);
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      Alert.alert("Erreur", "Veuillez sélectionner une localisation");
      return;
    }

    if (!count || isNaN(Number(count)) || Number(count) < 1) {
      Alert.alert("Erreur", "Veuillez entrer un nombre valide de papillons");
      return;
    }

    if (!selectedButterfly) {
      Alert.alert("Erreur", "Veuillez sélectionner une espèce");
      return;
    }

    setLoading(true);
    try {
      const latlng = `${selectedLocation.latitude},${selectedLocation.longitude}`;
      await api.post(
        `/observation/${selectedButterfly.id}/${count}/${latlng}`
      );

      Alert.alert("Succès", "Observation enregistrée avec succès", [
        {
          text: "OK",
          onPress: () => navigation.navigate("ObservationsList"),
        },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de l'enregistrement de l'observation");
    } finally {
      setLoading(false);
    }
  };

  const renderButterflyItem = (item: any) => {
    return (
      <View style={styles.dropdownItem}>
        <Image
          source={{
            uri: `https://daviddurand.info/D228/papillons/${item.image}`,
          }}
          style={styles.dropdownImage}
        />
        <Text style={styles.dropdownText}>{item.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Nouvelle observation</Text>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Espèce observée</Text>
        <Dropdown
          style={styles.dropdown}
          data={butterflies}
          labelField="label"
          valueField="value"
          onChange={(item) => setSelectedButterfly(item)}
          renderItem={renderButterflyItem}
          placeholder="Sélectionnez une espèce"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre de papillons observés</Text>
        <TextInput
          style={styles.input}
          value={count}
          onChangeText={setCount}
          keyboardType="numeric"
          placeholder="Entrez le nombre"
        />
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.label}>Localisation</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setUseCurrentLocation(!useCurrentLocation)}
        >
          <Text style={styles.buttonText}>
            {useCurrentLocation
              ? "Choisir sur la carte"
              : "Utiliser ma position"}
          </Text>
        </TouchableOpacity>
      </View>

      {!useCurrentLocation && selectedLocation && (
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: FRANCE_CENTER.latitude,
              longitude: FRANCE_CENTER.longitude,
              latitudeDelta: 8, // Zoom initial pour voir la France entière
              longitudeDelta: 8,
            }}
            onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
            onRegionChange={handleRegionChange}
            zoomEnabled={true}
            zoomControlEnabled={true}
            minZoomLevel={5} // Limite le dézoom pour rester sur la France
            maxZoomLevel={18}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Position sélectionnée"
                draggable
                onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? "Enregistrement..." : "Enregistrer l'observation"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ObservationAdd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 30,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  dropdownImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
  },
  mapContainer: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
