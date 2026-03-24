import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/Colors';

export type HotspotType = "water_leak" | "overflow_bin" | "electrical" | "other";

export interface Hotspot {
  id: string;
  title: string;
  description: string;
  coordinate: { latitude: number; longitude: number };
  type: HotspotType;
}

const typeColors: Record<HotspotType, string> = {
  water_leak: Colors.primary,
  overflow_bin: Colors.warning,
  electrical: Colors.danger,
  other: Colors.textSecondary,
};

const defaultHotspots: Hotspot[] = [
  { id: '1', title: 'Water Leak', description: 'Building A bathroom', coordinate: { latitude: 36.8065, longitude: 10.1815 }, type: 'water_leak' },
  { id: '2', title: 'Overflow Bin', description: 'Cafeteria entrance', coordinate: { latitude: 36.8070, longitude: 10.1820 }, type: 'overflow_bin' },
  { id: '3', title: 'Electrical Fault', description: 'Lab B corridor', coordinate: { latitude: 36.8060, longitude: 10.1810 }, type: 'electrical' },
];

interface Props {
  hotspots?: Hotspot[];
}

export default function AnomalyMap({ hotspots = defaultHotspots }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Campus Hotspots</Text>
      {hotspots.map((spot) => (
        <View key={spot.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: typeColors[spot.type] }]} />
          <View>
            <Text style={styles.spotTitle}>{spot.title}</Text>
            <Text style={styles.spotDesc}>{spot.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, marginVertical: 8 },
  title: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  spotTitle: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  spotDesc: { fontSize: 12, color: Colors.textSecondary },
});
