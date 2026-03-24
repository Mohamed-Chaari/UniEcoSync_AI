import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import AnomalyMap from '@/components/AnomalyMap';
import AlertCard from '@/components/AlertCard';
import { getWeatherAlert, WeatherAlert } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  const { role } = useAuth();
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const alert = await getWeatherAlert(); // Or pass '?scenario=rain' for demo
        setWeatherAlert(alert);
      } catch (error) {
        console.error("Failed to fetch weather alert:", error);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, []);

  const NavCard = ({ title, subtitle, icon, targetRoute, disabled }: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; targetRoute: any; disabled?: boolean }) => {
    if (disabled) return null;
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(targetRoute)}>
        <View style={styles.cardContent}>
          <Ionicons name={icon} size={32} color={Colors.primary} style={styles.cardIcon} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="leaf" size={32} color={Colors.primary} />
        <Text style={styles.headerTitle}>UniEcoSync AI</Text>
      </View>

      <Text style={styles.sectionTitle}>Live Campus Hotspots</Text>
      <View style={styles.mapContainer}>
        <AnomalyMap />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.cardsContainer}>
        <NavCard
          title="Report Issue"
          subtitle="Crowdsource a campus anomaly"
          icon="camera-outline"
          targetRoute="/(tabs)/report"
          disabled={role === 'maintenance'}
        />
        <NavCard
          title="Smart Relocation"
          subtitle="Optimize your classroom"
          icon="swap-horizontal-outline"
          targetRoute="/(tabs)/relocation"
          disabled={role !== 'professor'}
        />
        <NavCard
          title="Eco-Rewards"
          subtitle="View your green points"
          icon="leaf-outline"
          targetRoute="/(tabs)/rewards"
          disabled={role === 'maintenance'}
        />
        <NavCard
          title="Maintenance Inbox"
          subtitle="View reported anomalies"
          icon="construct-outline"
          targetRoute="/(tabs)/maintenance"
          disabled={role !== 'maintenance'}
        />
        <NavCard
          title="Admin Console"
          subtitle="System Overview & Analytics"
          icon="shield-checkmark-outline"
          targetRoute="/(tabs)/admin"
          disabled={role !== 'admin'}
        />
      </View>

      <Text style={styles.sectionTitle}>Live Weather Alert</Text>
      {loadingWeather ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : weatherAlert ? (
        <AlertCard
          condition={weatherAlert.condition}
          action={weatherAlert.sustainability_actions[0]}
          severity={weatherAlert.severity}
        />
      ) : (
        <Text style={styles.errorText}>Failed to load weather data.</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  mapContainer: {
    height: 250,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 16,
  },
  cardTextContainer: {
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 10,
  },
});
