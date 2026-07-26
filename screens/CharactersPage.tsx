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
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme/AppTheme';

const CHARACTERS = [
  {
    id: 'cletus',
    name: 'Cletus Dawson',
    title: 'Head Moonshiner',
    emoji: '🧔',
    avatarColor: '#8B4513',
    borderColor: '#DAA520',
    role: 'You',
    quote: '"My granddaddy taught me, and his granddaddy\'s corn taught him."',
    bio: 'The man, the myth, the still. Third-generation shine runner who turned family tradition into a trailer park empire. Rumor has it the recipe\'s tattooed somewhere nobody\'s looking.',
    traits: ['Master Distiller', 'Stubborn as Mules', 'Surprisingly Wise'],
    icon: 'flask',
    iconColor: '#DAA520',
    special: 'PLAYER',
  },
  {
    id: 'dolly',
    name: 'Dolly Mae Dawson',
    title: 'The Boss Lady',
    emoji: '👩‍🦱',
    avatarColor: '#C2185B',
    borderColor: '#FF80AB',
    role: 'Wife',
    quote: '"Don\'t test me, honey. I know where every shovel on this lot is buried."',
    bio: 'Runs the trailer park with hair bigger than her temper — which is saying something. Cletus makes the shine, Dolly makes sure he doesn\'t drink it all. Legally holds the deed to everything.',
    traits: ['Iron-Fisted', 'Business Savvy', 'Terrifyingly Organized'],
    icon: 'heart',
    iconColor: '#FF80AB',
    special: null,
  },
  {
    id: 'earl',
    name: 'Big Earl Pickett',
    title: 'The Mechanic',
    emoji: '👨‍🔧',
    avatarColor: '#4E342E',
    borderColor: '#A1887F',
    role: 'Neighbor',
    quote: '"Duct tape, WD-40, and prayer. That\'s all a man needs."',
    bio: 'Has never once thrown anything away. His lot looks like a junkyard but he\'ll find that exact bolt you need in 4 seconds flat. Runs the trucks. Fixes the stills. Asks no questions.',
    traits: ['Duct Tape Wizard', 'Never Throws Nothin\' Out', 'Zero Questions Asked'],
    icon: 'construct',
    iconColor: '#A1887F',
    special: null,
  },
  {
    id: 'granny',
    name: 'Granny Huckabee',
    title: 'The Witch Doctor',
    emoji: '👵',
    avatarColor: '#2E7D32',
    borderColor: '#81C784',
    role: 'Elder',
    quote: '"My shine cures what ails ya, and what don\'t ail ya too. Prevention, child."',
    bio: 'Technically 94, but nobody\'s got proof. Brews folk remedies, reads fortunes in corn mash, and knows every secret in a five-county radius. Somehow always wins at poker.',
    traits: ['Mysteriously Ageless', 'Knows Everything', 'Fists of Iron'],
    icon: 'leaf',
    iconColor: '#81C784',
    special: null,
  },
  {
    id: 'bubba',
    name: 'Deputy Bubba Ray',
    title: 'The Crooked Law',
    emoji: '👮',
    avatarColor: '#1565C0',
    borderColor: '#64B5F6',
    role: 'Law',
    quote: '"I didn\'t see nuthin\'. You didn\'t neither. We good?"',
    bio: 'Upstanding officer of the law... mostly. His patrol car breaks down suspiciously close to the still every Friday at 6pm. Coincidence, surely. Drinks on the house, never touches paperwork.',
    traits: ['Willfully Blind', 'Thirsty for Justice (Shine)', 'Naps on Duty'],
    icon: 'shield-checkmark',
    iconColor: '#64B5F6',
    special: null,
  },
  {
    id: 'tater',
    name: 'Tater Slocum',
    title: 'The Lovable Fool',
    emoji: '😄',
    avatarColor: '#E65100',
    borderColor: '#FFB74D',
    role: 'Neighbor',
    quote: '"Wait, is today Wednesday? I thought it was Saturday again."',
    bio: 'Dumb as a bag of hammers but heart purer than triple-distilled shine. Once drove to town for bread and came back with a goat. Named it Bread. Still unsure what day it is.',
    traits: ['Perpetually Confused', '100% Lovable', 'Emotionally Reliable'],
    icon: 'happy',
    iconColor: '#FFB74D',
    special: null,
  },
  {
    id: 'crystal',
    name: 'Crystal Jean Beaumont',
    title: '1987 Possum Holler Beauty Queen',
    emoji: '👑',
    avatarColor: '#880E4F',
    borderColor: '#F48FB1',
    role: 'Neighbor',
    quote: '"Beauty fades, honey. But a copper still? That\'s forever."',
    bio: 'Still wears the rhinestone crown. Has not acknowledged it is no longer 1987. Runs the trailer park\'s unofficial gossip network and knows the value of every piece of property within 40 miles.',
    traits: ['Rhinestone Queen', 'Information Broker', 'Deceptively Shrewd'],
    icon: 'star',
    iconColor: '#F48FB1',
    special: null,
  },
  {
    id: 'pastor',
    name: 'Pastor Jim Bob Flagg',
    title: 'The Preacher Man',
    emoji: '📖',
    avatarColor: '#6A1B9A',
    borderColor: '#CE93D8',
    role: 'Clergy',
    quote: '"The Lord works in mysterious ways... and so does fermentation. Amen."',
    bio: 'Preaches against sinful spirits every Sunday at 9am. First in line for samples at 9:01am. His sermons get significantly longer after three cups. The congregation has never been more engaged.',
    traits: ['Ironically Thirsty', 'Surprisingly Good Sermons', 'Flexible Convictions'],
    icon: 'book',
    iconColor: '#CE93D8',
    special: null,
  },
  {
    id: 'cooter',
    name: 'Cooter McGee',
    title: 'The Competition',
    emoji: '😤',
    avatarColor: '#B71C1C',
    borderColor: '#EF9A9A',
    role: 'Rival',
    quote: '"My shine is better and you KNOW it. Don\'t test me, Dawson."',
    bio: 'Rival moonshiner from the next holler over. His brew\'s actually pretty good, which makes it worse. Lost a taste-off to Cletus in \'09 and has never once emotionally recovered. Motivated by pure spite.',
    traits: ['Pure Spite Energy', 'Actually Pretty Good', 'Holds Grudges Forever'],
    icon: 'flame',
    iconColor: '#EF9A9A',
    special: 'RIVAL',
  },
  {
    id: 'wayne',
    name: 'Little Wayne Jessup',
    title: 'The Kid Entrepreneur',
    emoji: '👦',
    avatarColor: '#00695C',
    borderColor: '#80CBC4',
    role: 'Neighbor',
    quote: '"Supply and demand, old timer. Basic economics."',
    bio: 'Twelve years old and already running a lemonade-to-shine distribution pipeline. Charges a 15% commission on anything passing through his lot. Cletus calls him concerning. Dolly calls him a business partner.',
    traits: ['Terrifyingly Ambitious', '12 Going on 40', 'Future CEO or Criminal'],
    icon: 'cash',
    iconColor: '#80CBC4',
    special: null,
  },
  {
    id: 'lurleen',
    name: 'Lurleen Dupree',
    title: 'Bar Owner & Heart of Darkness',
    emoji: '🍺',
    avatarColor: '#4E342E',
    borderColor: '#BCAAA4',
    role: 'Business Owner',
    quote: '"Tab\'s always open. Payment\'s always overdue. Circle of life."',
    bio: 'Runs the only watering hole for 40 miles in any direction: The Muddy Jug. Cletus\'s #1 wholesale customer. Keeps the books better than any accountant. Never forgets a debt. Never.',
    traits: ['Photographic Debt Memory', 'Heart of Stone & Gold', 'Best Chicken Wings Ever'],
    icon: 'wine',
    iconColor: '#BCAAA4',
    special: null,
  },
  {
    id: 'hank',
    name: 'Hank Jr. Beaumont III',
    title: 'The Hunter',
    emoji: '🦌',
    avatarColor: '#37474F',
    borderColor: '#90A4AE',
    role: 'Neighbor',
    quote: '"If it moves, it\'s dinner. If it don\'t, it might still be dinner."',
    bio: 'Never seen without camo, never seen with a legal hunting license. Believes squirrel is fine dining if you\'re hungry enough. Supplies Lurleen\'s kitchen. Nobody asks. Everybody eats.',
    traits: ['Apex Predator', 'Camo in All Seasons', 'Farm-to-Table Pioneer'],
    icon: 'leaf',
    iconColor: '#90A4AE',
    special: null,
  },
];

function CharacterCard({ character, index }: { character: typeof CHARACTERS[0]; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 60,
        tension: 70,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleToggle = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(expandAnim, {
      toValue,
      tension: 80,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View style={[
      styles.card,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: pressScale }],
        borderColor: character.borderColor + '55',
      },
    ]}>
      <TouchableOpacity
        onPress={handleToggle}
        onPressIn={() => Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start()}
        activeOpacity={0.9}
        style={styles.cardHeader}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: character.avatarColor + '33', borderColor: character.borderColor }]}>
          <Text style={styles.avatarEmoji}>{character.emoji}</Text>
          {character.special && (
            <View style={[styles.specialBadge, { backgroundColor: character.special === 'PLAYER' ? '#DAA520' : '#E53935' }]}>
              <Text style={styles.specialBadgeText}>{character.special}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.charName}>{character.name}</Text>
            <View style={[styles.rolePill, { borderColor: character.borderColor + '66' }]}>
              <Text style={[styles.roleText, { color: character.borderColor }]}>{character.role}</Text>
            </View>
          </View>
          <Text style={[styles.charTitle, { color: character.borderColor }]}>{character.title}</Text>
          <View style={styles.iconRow}>
            <Ionicons name={character.icon as any} size={13} color={character.iconColor} />
            <Text style={styles.traitPreview} numberOfLines={1}>
              {character.traits.slice(0, 2).join(' · ')}
            </Text>
          </View>
        </View>

        {/* Expand chevron */}
        <Ionicons
          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={18}
          color={Theme.colors.textMuted}
        />
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.divider, { backgroundColor: character.borderColor + '33' }]} />

          {/* Quote */}
          <View style={[styles.quoteBox, { borderLeftColor: character.borderColor }]}>
            <Text style={[styles.quoteText, { color: character.borderColor }]}>{character.quote}</Text>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>{character.bio}</Text>

          {/* Traits */}
          <View style={styles.traitsRow}>
            {character.traits.map((trait) => (
              <View key={trait} style={[styles.traitTag, { backgroundColor: character.avatarColor + '33', borderColor: character.borderColor + '44' }]}>
                <Text style={[styles.traitTagText, { color: character.borderColor }]}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

export default function CharactersPage({ navigation }: any) {
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ scale: headerScale }] }]}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Theme.colors.secondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>THE PARK FOLK</Text>
            <Text style={styles.headerSub}>Yer Neighbors & Associates</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{CHARACTERS.length}</Text>
          </View>
        </Animated.View>

        {/* Intro banner */}
        <View style={styles.introBanner}>
          <Text style={styles.introEmoji}>🚜</Text>
          <Text style={styles.introText}>
            Every soul in Possum Holler Trailer Park. Tap a character to learn their story.
          </Text>
        </View>

        {/* Character list */}
        {CHARACTERS.map((char, index) => (
          <CharacterCard key={char.id} character={char} index={index} />
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={18} color={Theme.colors.textMuted} />
          <Text style={styles.footerText}>
            {'  '}More characters unlocked as yer brewery grows!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
    gap: Theme.spacing.sm,
    ...Theme.elevation.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.secondary,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    letterSpacing: 1,
  },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.textInverse,
  },

  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glass.light,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
    gap: Theme.spacing.sm,
  },
  introEmoji: { fontSize: 28 },
  introText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },

  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
    ...Theme.elevation.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  avatarEmoji: { fontSize: 30 },
  specialBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.xs,
  },
  specialBadgeText: {
    fontSize: 8,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.textInverse,
    letterSpacing: 0.5,
  },

  cardInfo: { flex: 1, gap: 3 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  },
  charName: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    fontWeight: Theme.typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  charTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  traitPreview: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    flex: 1,
  },

  expandedContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Theme.spacing.md,
  },
  quoteBox: {
    borderLeftWidth: 3,
    paddingLeft: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  quoteText: {
    fontSize: Theme.typography.fontSize.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  bioText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    lineHeight: 21,
    marginBottom: Theme.spacing.md,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  traitTag: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
  },
  traitTagText: {
    fontSize: 11,
    fontWeight: Theme.typography.fontWeight.semibold,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glass.light,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  footerText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    lineHeight: 20,
  },
});
