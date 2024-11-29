import { StyleSheet, Text, View, Image, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Papillon } from '../types/papillons'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

const DetailsSpecies = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { butterfly } = route.params as { butterfly: Papillon }

  return (
    <View style={styles.container}>
      <Pressable 
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.buttonPressed
        ]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </Pressable>

      <ScrollView>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: butterfly.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <Text style={styles.title}>{butterfly.nom}</Text>
          </LinearGradient>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{butterfly.texte}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Caractéristiques</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Habitat:</Text>
              <Text style={styles.infoValue}>Prairies, jardins et zones boisées</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Période de vol:</Text>
              <Text style={styles.infoValue}>Mai à Septembre</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Envergure:</Text>
              <Text style={styles.infoValue}>35-40 mm</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default DetailsSpecies

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  buttonPressed: {
    transform: [{ scale: 0.90 }],
  },
  imageContainer: {
    height: 300,
    width: width,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 120,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    color: '#666',
  }
})