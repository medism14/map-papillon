/** @format */

import {
  Animated,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useForm, Controller } from "react-hook-form";
import { CommonActions } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice/authSlice";
import api from "../api/api";

const AuthScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    reset,
    clearErrors,
  } = useForm();

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
    return reset();
  }, [isSubmitSuccessful]);

  const resetNavigation = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: navigation.getState().routes[0].name }],
      })
    );
  };

  const handleAuth = async (data: any) => {
    try {
      const response = await api.post(
        `/login/${data.username}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dispatch(login(data.username));
      reset();
      clearErrors();
      resetNavigation();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Bienvenue</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Authentification</Text>

          <KeyboardAvoidingView style={styles.inputContainer}>
            <Text style={styles.label}>Nom d'utilisateur:</Text>
            <Controller
              name="username"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre nom d'utilisateur"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
              rules={{
                required: "Le nom d'utilisateur est requis",
                minLength: {
                  value: 3,
                  message: "Le nom doit contenir au moins 3 caractères",
                },
              }}
            />
            {errors.username && (
              <Text style={styles.errorText}>
                {errors.username.message as string}
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
              onPress={handleSubmit(handleAuth)}
            >
              <Text style={styles.buttonText}>Se connecter</Text>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: 200,
    backgroundColor: "#16537E",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  button: {
    backgroundColor: "#16537E",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
});

export default AuthScreen;
