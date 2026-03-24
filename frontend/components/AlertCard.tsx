import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface AlertCardProps {
  condition: string;
  action: string;
  severity: "low" | "medium" | "high";
}

export default function AlertCard({ condition, action, severity }: AlertCardProps) {
  const getSeverityColor = () => {
    switch (severity) {
      case 'high': return Colors.danger;
      case 'medium': return Colors.warning;
      case 'low': return Colors.success;
      default: return Colors.primary;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getSeverityColor() }]}>
      <View style={styles.header}>
        <Ionicons name="warning-outline" size={24} color={getSeverityColor()} />
        <Text style={styles.title}>{condition}</Text>
      </View>
      <Text style={styles.action}>{action}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: Colors.textPrimary,
  },
  action: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
