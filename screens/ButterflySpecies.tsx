/** @format */

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/api";

const ButterflySpecies = ({ navigation }: { navigation: any }) => {
  const [butterflies, setButterflies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchButterflies();
  }, []);

  const fetchButterflies = async () => {
    try {
      const response = await api.get("/liste-papillons");
      const dataAll = response.data;
      const butterfliesData = Object.entries(dataAll).map(([id, data]) => ({
        id,
        ...(data as Record<string, any>),
      }));

      setButterflies(butterfliesData as any);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des papillons :", error);
      setLoading(false);
    }
  };

  const filteredButterflies = useMemo(() => {
    if (!searchQuery.trim()) return butterflies;

    const normalizedQuery = searchQuery.toLowerCase().trim();
    return butterflies.filter((butterfly: any) => {
      const nameMatch = butterfly.nom?.toLowerCase().includes(normalizedQuery);
      const descMatch = butterfly.texte?.toLowerCase().includes(normalizedQuery);
      return nameMatch || descMatch;
    });
  }, [butterflies, searchQuery]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("DetailsSpecies", { butterfly: item })
        }
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        >
          <Image
            source={{
              uri: `https://daviddurand.info/D228/papillons/${item.image}`,
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.title}>{item.nom}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.texte}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
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
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un papillon..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filteredButterflies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun papillon trouvé</Text>
          </View>
        }
      />
    </View>
  );
};

export default ButterflySpecies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  list: {
    padding: 16,
  },
  card: {
    height: 200,
    marginBottom: 30,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
});
