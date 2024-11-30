/** @format */

import { StyleSheet, Text, View, Pressable, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice/authSlice";
import { CommonActions, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { isConnected, username } = useSelector((state: any) => state.auth);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@sessionCookie");
      await api.post(`/logout/${username}`);
      dispatch(logout());
      resetNavigation();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const resetNavigation = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: navigation.getState().routes[0].name }],
      })
    );
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Vous n'êtes pas connecté</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{username?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{username}</Text>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#16537E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  text: {
    fontSize: 18,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#16537E",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
