/** @format */

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Observation } from "../types/observation";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";
import api from "../api/api";
import { useFocusEffect } from "@react-navigation/native";
import { countries } from "../lib/countries";

const ObservationsList = () => {
  const navigation = useNavigation<any>();
  const { username } = useSelector((state: any) => state.auth);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [filteredObservations, setFilteredObservations] = useState<
    Observation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showOnlyMyObservations, setShowOnlyMyObservations] = useState(false);
  const [cityOptions, setCityOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [countryOptions, setCountryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const slideAnim = useRef(new Animated.Value(400)).current;

  const showFilterModal = useCallback(() => {
    setFilterModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const hideFilterModal = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFilterModalVisible(false));
  }, [slideAnim]);

  const fetchObservations = useCallback(async () => {
    try {
      if (filterModalVisible) {
        setFilterModalVisible(false);
      }

      setLoading(true);
      let allObservations: Observation[] = [];

      // Récupérer les observations en parallèle pour tous les pays
      const observationPromises = countries.map((country) =>
        api.get(`/liste-par-pays/${country}`)
      );

      const responses = await Promise.all(observationPromises);

      responses.forEach((response) => {
        if (response.data) {
          if (showOnlyMyObservations) {
            const userObservations = response.data.filter(
              (obs: Observation) => obs.User === username
            );
            allObservations = [...allObservations, ...userObservations];
          } else {
            allObservations = [...allObservations, ...response.data];
          }
        }
      });

      if (!showOnlyMyObservations) {
        const citiesResponse = await api.get("/liste-villes");
        const citiesData = citiesResponse.data;

        // Optimisation des options de filtre
        const uniqueCities = new Map();
        const uniqueCountries = new Set();

        citiesData.forEach((city: { City: string; Country: string }) => {
          const cityName = city.City || "Non spécifié";
          uniqueCities.set(cityName, {
            label: `${cityName}, ${city.Country}`,
            value: cityName,
          });
          uniqueCountries.add(city.Country);
        });

        setCityOptions(Array.from(uniqueCities.values()));
        setCountryOptions(
          Array.from(uniqueCountries).map((country) => ({
            label: country as string,
            value: country as string,
          }))
        );
      }

      setObservations(allObservations);
      setFilteredObservations(allObservations);
    } catch (error) {
      console.error("Erreur lors de la récupération des observations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showOnlyMyObservations, username]);

  useFocusEffect(
    useCallback(() => {
      fetchObservations();
    }, [fetchObservations])
  );

  useEffect(() => {
    if (!showOnlyMyObservations && !loading) {
      const filtered = observations.filter((obs) => {
        const matchesCity =
          !selectedCity || (obs.City || "Non spécifié") === selectedCity;
        const matchesCountry =
          !selectedCountry || obs.Country === selectedCountry;
        return matchesCity && matchesCountry;
      });
      setFilteredObservations(filtered);
    }
  }, [
    selectedCity,
    selectedCountry,
    observations,
    showOnlyMyObservations,
    loading,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchObservations();
  }, [fetchObservations]);

  const renderFilterModal = () => (
    <Modal
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={hideFilterModal}
      animationType="none"
      key="filterModal"
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={hideFilterModal}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.filterModal,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
            }}
            activeOpacity={1}
          >
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filtres</Text>
              <TouchableOpacity onPress={hideFilterModal} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                const newValue = !showOnlyMyObservations;
                setShowOnlyMyObservations(newValue);
                setSelectedCity(null);
                setSelectedCountry(null);
                if (newValue) {
                  const userObservations = observations.filter(
                    (obs) => obs.User === username
                  );
                  setFilteredObservations(userObservations);
                } else {
                  setFilteredObservations(observations);
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showOnlyMyObservations ? "checkbox" : "square-outline"}
                size={24}
                color="#16537E"
              />
              <Text style={styles.filterText}>Mes observations</Text>
            </TouchableOpacity>

            {!showOnlyMyObservations && (
              <>
                <Text style={styles.filterSubtitle}>Filtrer par pays</Text>
                <View style={styles.dropdownContainer}>
                  <Dropdown
                    style={[styles.dropdown, { flex: 1 }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={countryOptions}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Sélectionnez un pays"
                    value={selectedCountry}
                    onChange={(item) => {
                      setSelectedCountry(item.value);
                      setSelectedCity(null);
                    }}
                  />
                  {selectedCountry && (
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => setSelectedCountry(null)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={24} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.filterSubtitle}>Filtrer par ville</Text>
                <View style={styles.dropdownContainer}>
                  <Dropdown
                    style={[styles.dropdown, { flex: 1 }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={cityOptions.filter(
                      (city) =>
                        !selectedCountry || city.label.includes(selectedCountry)
                    )}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Sélectionnez une ville"
                    value={selectedCity}
                    search={true}
                    onChange={(item) => {
                      setSelectedCity(item.value);
                    }}
                  />
                  {selectedCity && (
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => setSelectedCity(null)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={24} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const renderObservationItem = useCallback(
    ({ item }: { item: Observation }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="leaf-outline" size={24} color="#16537E" />
          <Text style={styles.butterflyType}>{item.TypePapillon}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.User}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.City || "Non spécifié"}, {item.Country}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {new Date(item.Timestamp).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calculator-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.Compte} observé(s)</Text>
          </View>
        </View>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate("ObservationAdd")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nouvelle observation</Text>
        </Pressable>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={showFilterModal}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={24} color="#16537E" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.listLoadingContainer}>
          <ActivityIndicator size="large" color="#16537E" />
        </View>
      ) : (
        <FlatList
          data={filteredObservations}
          renderItem={renderObservationItem}
          keyExtractor={(item) => item.idData}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune observation trouvée</Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

export default ObservationsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16537E",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  filterButton: {
    padding: 8,
  },
  listLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#16537E",
    marginTop: 8,
  },
  list: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  filterModal: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filterSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  filterText: {
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  butterflyType: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#16537E",
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#666",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resetButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#ccc",
  },
  disabledDropdown: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
  },
});
