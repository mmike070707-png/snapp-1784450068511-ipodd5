import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme/AppTheme';
import { useGame } from '../contexts/GameContext';

const MAX_LEVEL = 5;

const BREWERY_ITEMS = [
  { id: 'still', name: 'Copper Still', icon: 'flask-outline', desc: 'Heart of the operation', baseCost: 50 },
  { id: 'fermenter', name: 'Barrel/Tank', icon: 'beer-outline', desc: 'Where the magic happens', baseCost: 80 },
  { id: 'aging', name: 'Aging Barrel', icon: 'wine-outline', desc: 'Smoother than butter', baseCost: 110 },
  { id: 'bottler', name: 'Bottling Station', icon: 'funnel-outline', desc: 'Ready for the still', baseCost: 150 },
];

const TRAILER_ITEMS = [
  { id: 'size', name: 'Trailer Size', icon: 'home-outline', desc: 'More room to spread out', baseCost: 80 },
  { id: 'furniture', name: 'Furniture', icon: 'bed-outline', desc: 'Rest after a long day', baseCost: 60 },
  { id: 'power', name: 'Solar Power', icon: 'sunny-outline', desc: 'Off-grid livin\'', baseCost: 120 },
];

interface ItemCardProps {
  id: string;
  name: string;
  icon: string;
  desc: string;
  level: number;
  upgradeCost: number;
  canAfford: boolean;
  atMax: boolean;
  onUpgrade: () => void;
  index: number;
  section: 'brewery' | 'trailer';
}

function ItemCard({ id, name, icon, desc, level, upgradeCost, canAfford, atMax, onUpgrade, index }: ItemCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 90,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const levelPercent = ((level - 1) / (MAX_LEVEL - 1)) * 100;

  return (
    <Animated.View style={[
      styles.card,
      { opacity: fadeAnim, transform: [{ translateY }, { scale: pressScale }] },
    ]}>
      <View style={styles.cardIconWrap}>
        <Ionicons name={icon as any} size={28} color={Theme.colors.secondary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: `${levelPercent}%` }]} />
          </View>
          <Text style={styles.levelLabel}>{`Lvl ${level}/${MAX_LEVEL}`}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.upgradeBtn,
          atMax && styles.upgradeBtnMax,
          !canAfford && !atMax && styles.upgradeBtnPoor,
        ]}
        onPress={onUpgrade}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={atMax || !canAfford}
        activeOpacity={0.85}
      >
        {atMax ? (
          <Ionicons name="checkmark-circle" size={18} color={Theme.colors.success} />
        ) : (
          <View style={styles.upgradeBtnInner}>
            <Ionicons name="arrow-up-circle-outline" size={16} color={canAfford ? Theme.colors.textInverse : Theme.colors.textMuted} />
            <Text style={[styles.upgradeBtnText, !canAfford && styles.upgradeBtnTextPoor]}>
              {upgradeCost}
            </Text>
            <Ionicons name="ellipse" size={10} color={canAfford ? Theme.colors.secondary : Theme.colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BreweryPage() {
  const { coins, breweryLevels, trailerLevels, upgradeItem } = useGame();

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const getUpgradeCost = (baseCost: number, level: number) => baseCost * level;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ scale: headerScale }] }]}>
          <View>
            <Text style={styles.headerTitle}>MOONSHINE MONEY</Text>
            <Text style={styles.headerSub}>YER EMPIRE</Text>
          </View>
          <View style={styles.coinBadge}>
            <Ionicons name="ellipse" size={18} color={Theme.colors.secondary} />
            <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
          </View>
        </Animated.View>

        {/* Brewery Badge */}
        <View style={styles.breweryBanner}>
          <Ionicons name="flame" size={22} color={Theme.colors.secondary} />
          <Text style={styles.sectionTitle}> YER BREWERY</Text>
        </View>

        {BREWERY_ITEMS.map((item, index) => {
          const level = breweryLevels[item.id] ?? 1;
          const cost = getUpgradeCost(item.baseCost, level);
          return (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              icon={item.icon}
              desc={item.desc}
              level={level}
              upgradeCost={cost}
              canAfford={coins >= cost}
              atMax={level >= MAX_LEVEL}
              section="brewery"
              index={index}
              onUpgrade={() => upgradeItem('brewery', item.id, cost)}
            />
          );
        })}

        {/* Trailer section */}
        <View style={[styles.breweryBanner, { marginTop: Theme.spacing.lg }]}>
          <Ionicons name="home" size={22} color={Theme.colors.secondary} />
          <Text style={styles.sectionTitle}> YER TRAILER</Text>
        </View>

        {TRAILER_ITEMS.map((item, index) => {
          const level = trailerLevels[item.id] ?? 1;
          const cost = getUpgradeCost(item.baseCost, level);
          return (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              icon={item.icon}
              desc={item.desc}
              level={level}
              upgradeCost={cost}
              canAfford={coins >= cost}
              atMax={level >= MAX_LEVEL}
              section="trailer"
              index={index + BREWERY_ITEMS.length}
              onUpgrade={() => upgradeItem('trailer', item.id, cost)}
            />
          );
        })}

        {/* Tip card */}
        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={20} color={Theme.colors.secondary} />
          <Text style={styles.tipText}>
            {'  '}Go fishin\', huntin\', or campin\' to earn more coins!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
    ...Theme.elevation.md,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize.display,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.secondary,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textMuted,
    letterSpacing: 3,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
    gap: Theme.spacing.xs,
  },
  coinText: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
  },
  breweryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
    letterSpacing: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.elevation.sm,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
    marginRight: Theme.spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  cardDesc: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: 2,
    marginBottom: Theme.spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.full,
  },
  levelLabel: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    minWidth: 44,
    textAlign: 'right',
  },
  upgradeBtn: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    marginLeft: Theme.spacing.sm,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.elevation.xs,
  },
  upgradeBtnMax: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.success,
  },
  upgradeBtnPoor: {
    backgroundColor: Theme.colors.disabled,
  },
  upgradeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  upgradeBtnText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textInverse,
  },
  upgradeBtnTextPoor: {
    color: Theme.colors.textMuted,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glass.light,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  tipText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
});
