import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme/AppTheme';
import { useGame } from '../contexts/GameContext';

const MORE_ITEMS = [
  { label: 'The Park Folk', icon: 'people-circle-outline', screen: 'Characters', desc: 'Meet yer neighbors' },
  { label: 'Profile', icon: 'person-circle-outline', screen: 'Profile', desc: 'Your account & progress' },
  { label: 'Social Sharing', icon: 'share-social-outline', screen: 'Social', desc: 'Share yer achievements' },
  { label: 'Analytics', icon: 'bar-chart-outline', screen: 'Analytics', desc: 'Track yer stats' },
  { label: 'Admin Panel', icon: 'settings-outline', screen: 'Admin', desc: 'Manage the operation' },
];

interface MoreRowProps {
  label: string;
  icon: string;
  desc: string;
  onPress: () => void;
  index: number;
}

function MoreRow({ label, icon, desc, onPress, index }: MoreRowProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay: index * 80, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pressScale }] }}>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        onPressIn={() => Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start()}
        activeOpacity={0.85}
      >
        <View style={styles.rowIcon}>
          <Ionicons name={icon as any} size={24} color={Theme.colors.secondary} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowDesc}>{desc}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={Theme.colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MoreScreen({ navigation }: any) {
  const { coins, totalEarned } = useGame();
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <Ionicons name="menu-outline" size={28} color={Theme.colors.secondary} />
          <Text style={styles.headerTitle}>MORE</Text>
          <View style={styles.coinBadge}>
            <Ionicons name="ellipse" size={14} color={Theme.colors.secondary} />
            <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
          </View>
        </Animated.View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Ionicons name="ellipse" size={20} color={Theme.colors.secondary} />
            <Text style={styles.statValue}>{coins.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Current Coins</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={20} color={Theme.colors.secondary} />
            <Text style={styles.statValue}>{totalEarned.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>COMING SOON</Text>
        {MORE_ITEMS.map((item, index) => (
          <MoreRow
            key={item.screen}
            label={item.label}
            icon={item.icon}
            desc={item.desc}
            index={index}
            onPress={() => navigation.navigate(item.screen)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
    gap: Theme.spacing.sm,
    ...Theme.elevation.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.secondary,
    letterSpacing: 3,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
    gap: 4,
  },
  coinText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
  },
  statRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.elevation.sm,
  },
  statValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textMuted,
    letterSpacing: 2,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.md,
    ...Theme.elevation.xs,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  rowBody: { flex: 1 },
  rowLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  rowDesc: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
});
