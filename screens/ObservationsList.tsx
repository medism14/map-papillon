import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Observation } from "../types/observation";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Dropdown } from 'react-native-element-dropdown';
import api from '../api/api';

const ObservationsList = () => {
  const navigation = useNavigation<any>();
  const { username } = useSelector((state: any) => state.auth);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [filteredObservations, setFilteredObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showOnlyMyObservations, setShowOnlyMyObservations] = useState(false);
  const [cities, setCities] = useState<{City: string, Country: string}[]>([]);
  const [cityOptions, setCityOptions] = useState<{label: string, value: string}[]>([]);
  const slideAnim = useRef(new Animated.Value(400)).current;

  const showFilterModal = () => {
    setFilterModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const hideFilterModal = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFilterModalVisible(false));
  };

  const fetchObservations = async () => {
    try {
      const citiesResponse = await api.get("/liste-villes");
      const citiesData = citiesResponse.data;

      // Création des options pour le dropdown
      const options = citiesData.map((city: {City: string, Country: string}) => ({
        label: `${city.City}, ${city.Country}`,
        value: city.City
      }));
      setCityOptions(options);

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

      const flattenedObservations = Array.from(
        new Set(allObservations.flat().map((obs) => JSON.stringify(obs)))
      ).map((str) => JSON.parse(str));

      setObservations(flattenedObservations);
      setFilteredObservations(flattenedObservations);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des observations:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, []);

  useEffect(() => {
    let filtered = [...observations];
    
    if (selectedCity) {
      filtered = filtered.filter(obs => obs.City === selectedCity);
    }
    
    if (selectedCountry) {
      filtered = filtered.filter(obs => obs.Country === selectedCountry);
    }
    
    if (showOnlyMyObservations) {
      filtered = filtered.filter(obs => obs.User === username);
    }
    
    setFilteredObservations(filtered);
  }, [selectedCity, selectedCountry, showOnlyMyObservations, observations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchObservations();
  };

  const renderFilterModal = () => (
    <Modal
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={hideFilterModal}
      animationType="none"
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1} 
        onPress={hideFilterModal}
      >
        <Animated.View 
          style={[
            styles.filterModal,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filtres</Text>
              <TouchableOpacity onPress={hideFilterModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => {
                setShowOnlyMyObservations(!showOnlyMyObservations);
                setSelectedCity(null);
                setSelectedCountry(null);
              }}
            >
              <Ionicons 
                name={showOnlyMyObservations ? "checkbox" : "square-outline"} 
                size={24} 
                color="#16537E" 
              />
              <Text style={styles.filterText}>Mes observations</Text>
            </TouchableOpacity>

            <Text style={styles.filterSubtitle}>Filtrer par ville</Text>
            <View style={styles.dropdownContainer}>
              <Dropdown
                style={[styles.dropdown, { flex: 1 }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={cityOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Sélectionnez une ville"
                value={selectedCity}
                search={true}
                onChange={item => {
                  setSelectedCity(item.value);
                  setShowOnlyMyObservations(false);
                }}
              />
              {selectedCity && (
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => setSelectedCity(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const renderItem = ({ item }: { item: Observation }) => (
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
          <Text style={styles.infoText}>{item.City}, {item.Country}</Text>
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
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16537E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('ObservationAdd')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nouvelle observation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={showFilterModal}
        >
          <Ionicons name="filter" size={24} color="#16537E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredObservations}
        renderItem={renderItem}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16537E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModal: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  filterText: {
    fontSize: 16,
    color: '#333',
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#666',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButton: {
    padding: 4,
  },
});