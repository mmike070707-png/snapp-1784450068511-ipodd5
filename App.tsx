import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Button, FlatList } from 'react-native';
import { HillbillyCharactersView } from './components/HillbillyCharacters';
import { fetchBatches, createBatch, MoonshineBatch } from './components/MoonshineBackend';

export default function App() {
  const [batches, setBatches] = useState<MoonshineBatch[]>([]);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    const data = await fetchBatches();
    setBatches(data);
  };

  const handleAddBatch = async () => {
    await createBatch({
      batch_name: 'Mountain Lightning ' + Math.floor(Math.random() * 100),
      proof: 150,
      distiller: 'Granny Mae',
      status: 'Fermenting',
    });
    loadBatches();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Moonshine $ Dashboard</Text>
        <Button title="Brew New Batch" color="#ffcc00" onPress={handleAddBatch} />
      </View>
      <View style={styles.batchSection}>
        <Text style={styles.sectionTitle}>Active Batches ({batches.length})</Text>
        <FlatList
          data={batches}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <View style={styles.batchCard}>
              <Text style={styles.batchText}>{item.batch_name} - {item.proof} Proof ({item.status})</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.characterSection}>
        <HillbillyCharactersView />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffcc00', marginBottom: 10 },
  batchSection: { padding: 16, maxHeight: 200 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  batchCard: { backgroundColor: '#1a1a1a', padding: 10, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#333' },
  batchText: { color: '#cccccc', fontSize: 14 },
  characterSection: { flex: 1 },
});
