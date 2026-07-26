import React, { useRef, useEffect, useState } from 'react';
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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme/AppTheme';
import { useGame } from '../contexts/GameContext';

type ActivitiesStackParamList = {
  ActivitiesHome: undefined;
  BassFishing: undefined;
  Hunting: undefined;
  SwampCamping: undefined;
};

const ACTIVITIES = [
  {
    id: 'fishing',
    name: 'Bass Fishin\'',
    icon: 'fish-outline',
    emoji: '🎣',
    desc: 'Head down to the crick and pull some lunkers outta that muddy water, boy.',
    rewardMin: 3,
    rewardMax: 85,
    screen: 'BassFishing' as keyof ActivitiesStackParamList,
    color: '#1A6B8A',
    bgColor: '#0D2E3A',
    scene: '🐟🐠🐡🎣🏆  5 species to catch',
  },
  {
    id: 'hunting',
    name: 'Varmint Huntin\'',
    icon: 'leaf-outline',
    emoji: '🦌',
    desc: 'Git yer rifle and head into them woods. Hogs ya aint never needa tag fer. Means as they is and all.',
    rewardMin: 5,
    rewardMax: 85,
    screen: 'Hunting' as keyof ActivitiesStackParamList,
    color: '#4A7C3F',
    bgColor: '#1A2E1A',
    scene: '🐿️🦝🦃🐗🦌  5 animals to bag',
  },
  {
    id: 'camping',
    name: 'Swamp Campin\'',
    icon: 'compass-outline',
    emoji: '⛺',
    desc: 'Set up camp out in the swamp. Build a fire and see what creeps outta them dark waters tonight.',
    rewardMin: 8,
    rewardMax: 95,
    screen: 'SwampCamping' as keyof ActivitiesStackParamList,
    color: '#8B6914',
    bgColor: '#2E2209',
    scene: '🐸🪲🐀🐍🐊  5 critters to catch',
  },
];

function formatCooldown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

interface ActivityCardProps {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  desc: string;
  rewardMin: number;
  rewardMax: number;
  scene: string;
  color: string;
  bgColor: string;
  index: number;
  screen: keyof ActivitiesStackParamList;
  onPlay: () => void;
}

function ActivityCard({
  id, name, icon, emoji, desc, rewardMin, rewardMax,
  scene, color, bgColor, index, onPlay,
}: ActivityCardProps) {
  const { activityCooldowns } = useGame();
  const [secondsLeft, setSecondsLeft] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 130,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 130,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const cooldownEnd = activityCooldowns[id] ?? 0;
      const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 500);
    return () => clearInterval(interval);
  }, [activityCooldowns, id]);

  const handlePress = () => {
    if (secondsLeft > 0) return;
    onPlay();
  };

  const handlePressIn = () => Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();

  const isReady = secondsLeft === 0;

  return (
    <Animated.View style={[
      styles.card,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pressScale }] },
    ]}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={[styles.cardHeader, { backgroundColor: bgColor }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View>
            <Text style={styles.activityName}>{name}</Text>
            <View style={styles.rewardRow}>
              <Ionicons name="ellipse" size={10} color={Theme.colors.secondary} />
              <Text style={styles.rewardText}>{` ${rewardMin}–${rewardMax} coins`}</Text>
            </View>
          </View>
        </View>
        {isReady ? (
          <View style={[styles.readyBadge, { backgroundColor: color }]}>
            <Text style={styles.readyBadgeText}>{'READY'}</Text>
          </View>
        ) : (
          <View style={styles.cooldownBadge}>
            <Ionicons name="time-outline" size={12} color={Theme.colors.textMuted} />
            <Text style={styles.cooldownBadgeText}>{formatCooldown(secondsLeft)}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.descText}>{desc}</Text>
        <View style={styles.sceneRow}>
          <Text style={styles.sceneText}>{scene}</Text>
        </View>
        {!isReady && (
          <View style={styles.cooldownBar}>
            <View style={[styles.cooldownFill, {
              width: `${Math.max(0, 1 - secondsLeft / 900) * 100}%`,
              backgroundColor: color,
            }]} />
          </View>
        )}
        <TouchableOpacity
          style={[styles.goBtn, { backgroundColor: isReady ? color : Theme.colors.disabled }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!isReady}
          activeOpacity={0.85}
        >
          {isReady ? (
            <View style={styles.goBtnInner}>
              <Ionicons name={icon as any} size={20} color={Theme.colors.textInverse} />
              <Text style={styles.goBtnText}>{'PLAY NOW'}</Text>
            </View>
          ) : (
            <View style={styles.goBtnInner}>
              <Ionicons name="time-outline" size={18} color={Theme.colors.textMuted} />
              <Text style={styles.goBtnTextWait}>{`Restin'... ${formatCooldown(secondsLeft)}`}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function ActivitiesPage() {
  const { coins } = useGame();
  const navigation = useNavigation<NavigationProp<ActivitiesStackParamList>>();
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View>
            <Text style={styles.headerTitle}>GIT OUT THERE</Text>
            <Text style={styles.headerSub}>EARN THEM COINS</Text>
          </View>
          <View style={styles.coinBadge}>
            <Ionicons name="ellipse" size={16} color={Theme.colors.secondary} />
            <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
          </View>
        </Animated.View>

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={Theme.colors.textMuted} />
          <Text style={styles.infoText}>{' '}Each game has a 15-minute cooldown after each play. Tap PLAY NOW to launch the game.</Text>
        </View>

        {ACTIVITIES.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            {...activity}
            index={index}
            onPlay={() => navigation.navigate(activity.screen)}
          />
        ))}

        <View style={styles.bottomNote}>
          <Ionicons name="star-outline" size={16} color={Theme.colors.secondary} />
          <Text style={styles.bottomNoteText}>{' '}Use coins at the Brewery to build yer empire!</Text>
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
  scroll: { flex: 1 },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
    ...Theme.elevation.md,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.secondary,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: Theme.typography.fontSize.xs,
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
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xs,
  },
  infoText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    flex: 1,
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    ...Theme.elevation.md,
  },
  cardAccent: { height: 3 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  emoji: { fontSize: 42 },
  activityName: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rewardText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  readyBadgeText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.textInverse,
    letterSpacing: 1,
  },
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cooldownBadgeText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textMuted,
  },
  cardBody: {
    padding: Theme.spacing.md,
    paddingTop: 0,
  },
  descText: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.sm,
  },
  sceneRow: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
  },
  sceneText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    letterSpacing: 1,
  },
  cooldownBar: {
    height: 4,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  cooldownFill: {
    height: '100%',
    borderRadius: Theme.borderRadius.full,
  },
  goBtn: {
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.elevation.sm,
  },
  goBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  goBtnText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.textInverse,
    letterSpacing: 2,
  },
  goBtnTextWait: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textMuted,
  },
  bottomNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glass.light,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  bottomNoteText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
});
