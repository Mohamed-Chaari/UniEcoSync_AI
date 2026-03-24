import { Tabs, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const { user, role, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If no user is logged in, redirect to login (basic guard)
  if (!user) {
    setTimeout(() => {
      router.replace('/login');
    }, 10);
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const headerRight = () => (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
      <Ionicons name="log-out-outline" size={24} color={Colors.textPrimary} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerRight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report Issue',
          href: role === 'maintenance' ? null : undefined, // Hide for maintenance
          tabBarIcon: ({ color }) => <Ionicons name="camera-outline" size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (role === 'maintenance') {
              e.preventDefault();
              Alert.alert('Access Restricted', 'Maintenance cannot report issues.');
            }
          },
        }}
      />
      <Tabs.Screen
        name="relocation"
        options={{
          title: 'Relocation',
          href: role === 'professor' ? undefined : null, // Show only for professor
          tabBarIcon: ({ color }) => <Ionicons name="swap-horizontal-outline" size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (role !== 'professor') {
              e.preventDefault();
              Alert.alert('Access Restricted', 'Only professors can use Smart Relocation.');
            }
          },
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color }) => <Ionicons name="business-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          href: role === 'maintenance' ? null : undefined, // Hide for maintenance
          tabBarIcon: ({ color }) => <Ionicons name="leaf-outline" size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (role === 'maintenance') {
              e.preventDefault();
              Alert.alert('Access Restricted', 'Maintenance does not earn rewards.');
            }
          },
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: 'Maintenance',
          href: role === 'maintenance' ? undefined : null, // Show only for maintenance
          tabBarIcon: ({ color }) => <Ionicons name="construct-outline" size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (role !== 'maintenance') {
              e.preventDefault();
              Alert.alert('Access Restricted', 'Only maintenance staff can access this inbox.');
            }
          },
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: role === 'admin' ? undefined : null, // Show only for admin
          tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (role !== 'admin') {
              e.preventDefault();
              Alert.alert('Access Restricted', 'Only administrators can access this console.');
            }
          },
        }}
      />
    </Tabs>
  );
}
