import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Colors from '@/constants/Colors';
import { getRelocationSuggestion, RelocationSuggestion } from '@/services/api';

const ROOMS = ["Amphi", "SC1", "SC2", "SC3", "SC5", "SCV", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "lab 1", "lab 2", "lab 3", "lab 4", "lab 5", "lab 6", "lab 7", "lab 8", "lab 9", "lab 10", "lab 11", "lab 12", "lab 13", "lab 14", "lab 15", "lab 16", "lab 17", "lab 18", "lab 19", "lab 20", "SM 1", "SM 2"];
const ATTENDANCE_RANGES = ["1-10", "11-20", "21-30", "31-40", "41-50", "51-70", "71-100", "100+"];

export default function RelocationScreen() {
  const [roomId, setRoomId] = useState('Amphi');
  const [attendanceRange, setAttendanceRange] = useState('41-50');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<RelocationSuggestion | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFindOptimalRoom = async () => {
    if (!roomId || !attendanceRange) {
      Alert.alert('Validation Error', 'Please select a Room and Audience Range.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuggestion(null);

    let maxAttendance = 0;
    if (attendanceRange === '100+') {
        maxAttendance = 100;
    } else {
        const parts = attendanceRange.split('-');
        maxAttendance = parseInt(parts[1], 10);
    }

    try {
      const result = await getRelocationSuggestion(roomId, maxAttendance);
      setSuggestion(result);
    } catch (err: any) {
      console.error('Relocation error:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg('Failed to fetch optimal room. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerTitle}>Smart Relocation Engine</Text>
      <Text style={styles.subtitle}>Optimize energy by matching class size to the most efficient vacant room.</Text>

      <View style={styles.inputCard}>
        <Text style={styles.label}>Current Room</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={roomId}
            onValueChange={(itemValue) => setRoomId(itemValue)}
            style={styles.picker}
          >
            {ROOMS.map((room) => (
              <Picker.Item key={room} label={room} value={room} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Audience Range</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={attendanceRange}
            onValueChange={(itemValue) => setAttendanceRange(itemValue)}
            style={styles.picker}
          >
            {ATTENDANCE_RANGES.map((range) => (
              <Picker.Item key={range} label={range} value={range} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFindOptimalRoom}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.card} />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="search" size={20} color={Colors.card} style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Find Optimal Room</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {errorMsg && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color={Colors.danger} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {suggestion && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            <Text style={styles.resultTitle}>Optimal Match Found</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Suggested Room:</Text>
            <Text style={styles.detailValue}>{suggestion.suggested_room_name} ({suggestion.suggested_room_id})</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacity:</Text>
            <Text style={styles.detailValue}>{suggestion.capacity} seats</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Est. Energy Savings:</Text>
            <Text style={[styles.detailValue, styles.savingsValue]}>
              {suggestion.energy_saving_estimate_kwh.toFixed(2)} kWh
            </Text>
          </View>

          <View style={styles.reasonCard}>
            <Text style={styles.reasonTitle}>AI Logic:</Text>
            <Text style={styles.reasonText}>{suggestion.message}</Text>
          </View>

          <Text style={styles.actionListTitle}>Action Items:</Text>
          {suggestion.action_items.map((item, index) => (
            <View key={index} style={styles.actionItemRow}>
              <Ionicons name="checkmark" size={20} color={Colors.primary} style={styles.checkIcon} />
              <Text style={styles.actionItemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDED',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    marginBottom: 24,
  },
  errorText: {
    color: Colors.danger,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderTopWidth: 6,
    borderTopColor: Colors.success,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.success,
    marginLeft: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  savingsValue: {
    color: Colors.primary,
  },
  actionListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  actionItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  reasonCard: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  reasonTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
