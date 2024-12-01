/** @format */

import 'react-native-gesture-handler';
import { StatusBar } from "expo-status-bar"; 
import { StyleSheet, View, Animated } from "react-native";
import StackNavigator from "./navigation/StackNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import store from './redux/store';
import { useEffect, useState, useRef } from 'react';
import { Text } from 'react-native';

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Vérification de connexion simplifiée sans NetInfo
        const response = await fetch('https://www.google.com');
        setIsConnected(true);
        Animated.spring(slideAnim, {
          toValue: -50,
          useNativeDriver: true,
          friction: 8
        }).start();
      } catch (error) {
        setIsConnected(false);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8
        }).start();
      }
    };

    checkConnection();
    
    // Vérifier la connexion toutes les 5 secondes
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <Animated.View 
            style={[
              styles.offlineContainer,
              {
                transform: [{
                  translateY: slideAnim
                }]
              }
            ]}
          >
            <Text style={styles.offlineText}>
              Pas de connexion Internet
            </Text>
          </Animated.View>
          <StackNavigator />
        </SafeAreaView>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  offlineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#b52424',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  offlineText: {
    color: '#fff', 
    fontSize: 14,
    fontWeight: 'bold',
  },
});
