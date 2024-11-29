/** @format */

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

// Import statique des images
// const butterflyImages: any = {
//   "Apaturinae": require("../assets/Apaturinae.jpg"),
//   "Charaxinae": require("../assets/Charaxinae.jpg"), 
//   "Coliadinae": require("../assets/Coliadinae.jpg"),
//   "Danainae": require("../assets/Danainae.jpg"),
//   "Dismorphiinae": require("../assets/Dismorphiinae.jpg"),
//   "Heliconiinae": require("../assets/Heliconiinae.jpg"),
//   "Hesperiinae": require("../assets/Hesperiinae.jpg"),
//   "Heteropterinae": require("../assets/Heteropterinae.jpg"),
//   "Libytheinae": require("../assets/Libytheinae.jpg"),
//   "Limenitidinae": require("../assets/Limenitidinae.jpg"),
//   "Lycaeninae": require("../assets/Lycaeninae.jpg"),
//   "Nemeobiinae": require("../assets/Nemeobiinae.jpg"),
//   "Nymphalinae": require("../assets/Nymphalinae.jpg"),
//   "Papilioninae": require("../assets/Papilioninae.jpg"),
//   "Parnassiinae": require("../assets/Parnassiinae.jpg"),
//   "Pierinae": require("../assets/Pierinae.jpg"),
//   "Polyommatinae": require("../assets/Polyommatinae.jpg"),
//   "Pyrginae": require("../assets/Pyrginae.jpg"),
//   "Satyrinae": require("../assets/Satyrinae.jpg"),
//   "Theclinae": require("../assets/Theclinae.jpg"),
// };

const ButterflySpecies = ({ navigation }: { navigation: any }) => {
  const [butterflies, setButterflies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchButterflies();
  }, []);

  const fetchButterflies = async () => {
    try {
      const response = await axios.get("https://daviddurand.info/D228/papillons/liste-papillons");
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("DetailsSpecies", { butterfly: item })}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
        style={styles.gradient}
      >
        <Image
          source={require("../assets/Coliadinae.jpg")}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={butterflies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
