import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUri: string;
}

const characters: Character[] = [
  {
    id: '1',
    name: 'Sheriff Cletus',
    role: 'Law & Donuts',
    description: 'Keeps the county secure with a glazed donut in hand and zero patience for city folk.',
    imageUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    name: 'Granny Mae',
    role: 'Moonshine Mastermind',
    description: 'Brewing the highest proof whiskey in the holler behind a innocent-looking herbal bundle.',
    imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    name: 'Jebediah',
    role: 'Engine Mechanic',
    description: 'Can fix any truck with duct tape, a wrench, and pure stubbornness.',
    imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
];

export const HillbillyCharactersView = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Moonshine $ Characters</Text>
      <Text style={styles.subtitle}>High-Graphics Cartoon Hilarious Lineup</Text>
      {characters.map((char) => (
        <View key={char.id} style={styles.card}>
          <Image source={{ uri: char.imageUri }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{char.name}</Text>
            <Text style={styles.role}>{char.role}</Text>
            <Text style={styles.description}>{char.description}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffcc00', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#aaaaaa', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#1e1e1e', borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  image: { width: '100%', height: 220 },
  info: { padding: 16 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  role: { fontSize: 14, color: '#ff9900', marginBottom: 8, fontWeight: '600' },
  description: { fontSize: 14, color: '#cccccc' },
});
