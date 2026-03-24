import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { getAdminReports, ReportResponse } from '@/services/api';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function MaintenanceScreen() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getAdminReports();
      setReports(data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Could not load maintenance inbox.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleStatusChange = async (id: number) => {
    // Local SQLite Backend does not have status updates implemented in the API yet.
    // For now, we will just show an alert that this feature is coming soon.
    Alert.alert('Coming Soon', 'Updating status will be available in the next update!');
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'water_leak': return { name: 'water-outline', color: '#3498DB' };
      case 'overflow_bin': return { name: 'trash-outline', color: '#E67E22' };
      case 'electrical': return { name: 'flash-outline', color: '#E74C3C' };
      default: return { name: 'alert-circle-outline', color: '#95A5A6' };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#FF5252';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return Colors.primary;
    }
  };

  const renderReport = ({ item }: { item: ReportResponse }) => {
    const { name: iconName, color: iconColor } = getIconForType(item.type);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <View style={styles.reportCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName as any} size={24} color={iconColor} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.typeText}>{item.type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.timeText}>{formatTimeAgo(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: priorityColor + '20' }]}>
            <Text style={[styles.statusText, { color: priorityColor }]}>
              {item.priority.toUpperCase()} PRIORITY
            </Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>{item.description}</Text>

        <View style={styles.analysisRow}>
          <Ionicons name="analytics-outline" size={16} color={Colors.primary} style={styles.analysisIcon} />
          <Text style={styles.analysisText}>{item.ai_analysis}</Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.reporterText}>Report ID: {item.id}</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.warning }]}
            onPress={() => handleStatusChange(item.id)}
          >
            <Text style={styles.actionButtonText}>
              Mark In Progress
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance Inbox</Text>
        <Text style={styles.headerSubtitle}>Real-time campus anomalies</Text>
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success} />
          <Text style={styles.emptyText}>All caught up! No active reports.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReport}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resolvedCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  analysisIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  analysisText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  reporterText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: Colors.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
