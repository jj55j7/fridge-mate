import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simple drag-and-drop ranking (can be improved with a library)
export default function RankFoodScreen() {
  const router = useRouter();
  const { foods } = useLocalSearchParams();
  const [items, setItems] = useState<string[]>(foods ? JSON.parse(foods as string) : []);

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    setItems(newItems);
  };

  const handleSave = () => {
    // Pass ranking to Discover via router.replace with query param
    router.replace({
      pathname: '/(tabs)/discover',
      params: { rankedFoods: JSON.stringify(items) }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Rank Your Foods</ThemedText>
      <ThemedText style={styles.subtitle}>
        Drag to reorder your foods by priority (expiring soonest at the top).
      </ThemedText>
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => (
          <View style={styles.itemRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.food}>{item}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => moveItem(index, index - 1)} disabled={index === 0}>
                <Text style={styles.arrow}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => moveItem(index, index + 1)} disabled={index === items.length - 1}>
                <Text style={styles.arrow}>↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Ranking</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16, opacity: 0.7 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12 },
  rank: { fontSize: 18, fontWeight: 'bold', width: 32 },
  food: { flex: 1, fontSize: 16 },
  buttons: { flexDirection: 'row', gap: 8 },
  arrow: { fontSize: 20, paddingHorizontal: 8, color: '#FF6B6B' },
  saveButton: { marginTop: 24, backgroundColor: '#FF6B6B', padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
