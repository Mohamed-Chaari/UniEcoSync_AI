import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { getAdminReports, AdminReportsResponse, ReportResponse, uploadScheduleCSV } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

export default function AdminScreen() {
  const [reportsData, setReportsData] = useState<AdminReportsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReports();
      setReportsData(data);
    } catch (err) {
      setError('Failed to load reports.');
      console.error(err);
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

  const handleUploadCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/csv'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploading(true);

        const formData = new FormData();
        // The type needs to be asserted correctly for react-native environment
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'text/csv'
        } as any);

        const response = await uploadScheduleCSV(formData);
        Alert.alert('Success', response.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Upload Failed', 'There was an error uploading the CSV file.');
    } finally {
      setUploading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#FF5252';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return Colors.primary;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={32} color={Colors.primary} />
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      <Text style={styles.pageTitle}>Control Panel</Text>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadCSV}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.uploadButtonText}>Upload Room Schedule CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard title="Total Users" value={150} icon="people-outline" />
        <StatCard
          title="Total Reports"
          value={loading ? "..." : (reportsData?.total_count || 0)}
          icon="document-text-outline"
        />
        <StatCard title="Campus HVAC Efficiency" value="94%" icon="leaf-outline" />
      </View>

      <View style={styles.reportsSection}>
        <Text style={styles.sectionTitle}>Recent Reports</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : reportsData?.reports.length === 0 ? (
          <Text style={styles.emptyText}>No reports found.</Text>
        ) : (
          reportsData?.reports.map((report: ReportResponse) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportType}>{report.type}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                  <Text style={styles.priorityText}>{report.priority}</Text>
                </View>
              </View>
              <Text style={styles.reportDescription}>
                <Ionicons name="chatbox-outline" size={14} color={Colors.textSecondary} /> {report.description}
              </Text>
              <Text style={styles.reportLocation}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} /> {report.location}
              </Text>
              <Text style={styles.reportAnalysis}>
                <Ionicons name="analytics-outline" size={14} color={Colors.primary} /> {report.ai_analysis}
              </Text>
              <Text style={styles.reportDate}>
                {getRelativeTime(report.created_at)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  actionContainer: {
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statTextContainer: {
    marginLeft: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  reportsSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  loader: {
    marginTop: 24,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FF5252',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
  reportCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  reportAnalysis: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
