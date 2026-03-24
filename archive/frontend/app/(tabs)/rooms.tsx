import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getLiveSchedule, RoomSchedule } from '@/services/api';
import Colors from '@/constants/Colors';

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<RoomSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      const data = await getLiveSchedule();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Failed to fetch live schedule:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchRooms().finally(() => setLoading(false));

      const interval = setInterval(fetchRooms, 10000); // refresh every 10 seconds
      return () => clearInterval(interval);
    }, [])
  );

  const renderRoom = ({ item }: { item: RoomSchedule }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.room_name}</Text>
        <Text style={styles.roomCapacity}>Capacity: {item.capacity}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Empty</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Campus Dashboard</Text>
        <Text style={styles.subtitle}>Monitor currently empty rooms across campus.</Text>
      </View>

      <Text style={styles.sectionTitle}>Available Rooms Now</Text>

      {loading && rooms.length === 0 ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderRoom}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No empty rooms currently available.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  roomCapacity: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
    fontSize: 16,
  },
});
