/** @format */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "../screens/AuthScreen";
import ButterflySpecies from "../screens/ButterflySpecies";
import CartObservations from "../screens/CartObservations";
import DetailsSpecies from "../screens/DetailsSpecies";
import ObservationsList from "../screens/ObservationsList";
import ObservationAdd from "../screens/ObservationAdd";
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

const ObservationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ObservationsList" component={ObservationsList} />
      <Stack.Screen name="ObservationAdd" component={ObservationAdd} />
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
            case "Papillons":
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
            case "Carte":
              icon = focused ? (
                <FontAwesome name="map" size={24} color="black" />
              ) : (
                <FontAwesome name="map" size={24} color="black" />
              );
              break;
            case "Profil":
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
        name="Papillons"
        component={ButterflyStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Observations"
        component={ObservationStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Carte"
        component={CartObservations}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profil"
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
