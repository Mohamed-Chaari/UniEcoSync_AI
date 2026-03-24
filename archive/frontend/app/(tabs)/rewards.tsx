import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import RewardsBadge from '@/components/RewardsBadge';
import { Ionicons } from '@expo/vector-icons';
import { getLeaderboard, User } from '@/services/api';

export default function RewardsScreen() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRedeem = () => {
    Alert.alert('Coming Soon', 'Redemption options will be available in the next update!');
  };

  const currentUser = leaderboard.find(u => u.name === 'Mohamed Chaari');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.headerTitle}>Eco-Rewards</Text>

      <View style={styles.badgeSection}>
        <RewardsBadge points={currentUser?.eco_points || 0} />
        <Text style={styles.badgeLabel}>Your Eco-Points</Text>
        <Text style={styles.badgeSubtitle}>Keep reporting to earn more!</Text>

        <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
          <Ionicons name="gift-outline" size={20} color={Colors.card} style={styles.redeemIcon} />
          <Text style={styles.redeemButtonText}>Redeem Points</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Campus Leaderboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={{ color: 'red', marginBottom: 16 }}>Could not load leaderboard</Text>
          <TouchableOpacity onPress={fetchLeaderboard} style={styles.redeemButton}>
            <Text style={styles.redeemButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : leaderboard.length > 0 ? (
        <View style={styles.leaderboardContainer}>
          {/* Weekly Winner Card */}
          <View style={styles.winnerCard}>
            <Ionicons name="trophy" size={40} color="#FFD700" style={styles.winnerIcon} />
            <Text style={styles.winnerCardTitle}>
              🏆 Current Leader: {leaderboard[0].name} - Wins a 5 TND Free Voucher at the Buvette!
            </Text>
            <Text style={styles.winnerCardPoints}>{leaderboard[0].eco_points} Eco-Points</Text>
          </View>

          {/* Rest of Leaderboard */}
          {leaderboard.slice(1).map((user, index) => {
            const rank = index + 2;
            const isCurrentUser = user.name === 'Mohamed Chaari';
            const initial = user.name.charAt(0).toUpperCase();

            return (
              <View
                key={user.id}
                style={[
                  styles.leaderboardItem,
                  isCurrentUser && styles.currentUserItem
                ]}
              >
                <View style={styles.rankContainer}>
                  {rank === 2 ? (
                    <Ionicons name="medal" size={24} color="#C0C0C0" />
                  ) : rank === 3 ? (
                    <Ionicons name="medal" size={24} color="#CD7F32" />
                  ) : (
                    <Text style={styles.rankText}>#{rank}</Text>
                  )}
                </View>

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
                    {user.name} {isCurrentUser ? '(You)' : ''}
                  </Text>
                </View>

                <View style={styles.pointsContainer}>
                  <Text style={[styles.pointsText, isCurrentUser && styles.currentPointsText]}>
                    {user.eco_points} pts
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 24, color: Colors.textSecondary }}>No data available.</Text>
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
    marginBottom: 24,
  },
  badgeSection: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: Colors.card,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  badgeSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  redeemIcon: {
    marginRight: 8,
  },
  redeemButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  leaderboardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 8,
  },
  winnerCard: {
    backgroundColor: '#FFFBE6',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  winnerIcon: {
    marginBottom: 8,
  },
  winnerCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
    textAlign: 'center',
    marginBottom: 8,
  },
  winnerCardPoints: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DAA520',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  currentUserItem: {
    backgroundColor: '#E8F5E9',
  },
  rankContainer: {
    width: 40,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.card,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  currentUserName: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  currentPointsText: {
    color: Colors.primary,
  },
});
