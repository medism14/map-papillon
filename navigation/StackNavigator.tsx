/** @format */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "../screens/AuthScreen";
import ButterflySpecies from "../screens/ButterflySpecies";
import CartObservations from "../screens/CartObservations";
import DetailsSpecies from "../screens/DetailsSpecies";
import ObservationsList from "../screens/ObservationsList";
import ProfileScreen from "../screens/ProfileScreen";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ButterflyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ButterflySpecies" component={ButterflySpecies} />
      <Stack.Screen name="DetailsSpecies" component={DetailsSpecies} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let icon;
          switch (route.name) {
            case "Butterflies":
              icon = focused ? (
                <FontAwesome5 name="list" size={24} color="black" />
              ) : (
                <FontAwesome5 name="list" size={24} color="black" />
              );
              break;
            case "Observations":
              icon = focused ? (
                <FontAwesome name="bookmark" size={24} color="black" />
              ) : (
                <FontAwesome name="bookmark" size={24} color="black" />
              );
              break;
            case "Map":
              icon = focused ? (
                <FontAwesome name="map" size={24} color="black" />
              ) : (
                <FontAwesome name="map" size={24} color="black" />
              );
              break;
            case "Profile": // Ajout du cas pour la page Profil
              icon = focused ? (
                <FontAwesome name="user" size={24} color="black" />
              ) : (
                <FontAwesome name="user" size={24} color="black" />
              );
              break;
            default:
              icon = <FontAwesome name="home" size={24} color="black" />;
          }
          return icon;
        },
      })}
    >
      <Tab.Screen
        name="Butterflies"
        component={ButterflyStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Observations"
        component={ObservationsList}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Map"
        component={CartObservations}
        options={{ headerShown: false }}
      />
      <Tab.Screen // Ajout de la page Profil dans le TabNavigator
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default function StackNavigator() {
  const isConnected = useSelector((state: any) => state.auth.isConnected);

  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isConnected ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <Stack.Screen name="MainApp" component={TabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
  );
}
