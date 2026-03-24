import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface RewardsBadgeProps {
  points: number;
}

export default function RewardsBadge({ points }: RewardsBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Ionicons name="leaf" size={40} color={Colors.card} style={styles.icon} />
        <Text style={styles.points}>{points}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    marginBottom: 8,
  },
  points: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.card,
  },
});
