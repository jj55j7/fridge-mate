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
    // Pass ranking to Discover via push so back navigation returns to this screen
    router.push({
      pathname: '/(tabs)/discover',
      params: { rankedFoods: JSON.stringify(items) }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: 'absolute', left: 10, top: 20, zIndex: 10, padding: 8 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={{ fontSize: 28, color: '#2f34ac' }}>{'←'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Rank your food</Text>
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
      <TouchableOpacity
        style={[styles.saveButton, { marginBottom: 16, paddingVertical: 15, paddingHorizontal: 100 }]}
        onPress={() => {
          // Save ranking and go to Explore
          router.push({
            pathname: '/(tabs)/explore',
            params: { rankedFoods: JSON.stringify(items) }
          });
        }}
      >
        <Text style={styles.saveButtonText}>Show My Matches</Text>
      </TouchableOpacity>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, marginTop: 36 },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 16, opacity: 0.7 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12 },
  rank: { fontSize: 18, fontWeight: 'bold', width: 32 },
  food: { flex: 1, fontSize: 18 },
  buttons: { flexDirection: 'row', gap: 8 },
  arrow: { fontSize: 20, paddingHorizontal: 8, color: '#2f34ac' },
  saveButton: { marginTop: 24, marginBottom: 30, backgroundColor: '#2f34ac', padding: 16, borderRadius: 30, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
