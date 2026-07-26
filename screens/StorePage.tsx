import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme/AppTheme';
import { useGame } from '../contexts/GameContext';
import { redirectToPaymentLink } from '../stripe';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = 340;

const PACKAGES = [
  {
    id: 'pocket',
    label: 'Pocket Change',
    coins: 100,
    price: '$0.99',
    icon: 'cash-outline',
    desc: 'Just a lil\' jingle in yer overalls',
    badge: null,
    highlight: false,
  },
  {
    id: 'mason',
    label: 'Mason Jar',
    coins: 600,
    price: '$2.99',
    icon: 'beer-outline',
    desc: 'A jar full of shiny coins',
    badge: null,
    highlight: false,
  },
  {
    id: 'jug',
    label: 'Gallon Jug',
    coins: 1500,
    price: '$5.00',
    icon: 'flask-outline',
    desc: 'Now we\'re talkin\' serious moonshinin\'',
    badge: 'BEST VALUE',
    highlight: true,
  },
  {
    id: 'barrel',
    label: 'The Barrel',
    coins: 3000,
    price: '$10.00',
    icon: 'wine-outline',
    desc: 'A whole barrel of the good stuff',
    badge: 'MOST COINS',
    highlight: false,
  },
];

interface PackageCardProps {
  id: string;
  label: string;
  coins: number;
  price: string;
  icon: string;
  desc: string;
  badge: string | null;
  highlight: boolean;
  index: number;
  onSelect: (pkg: typeof PACKAGES[0]) => void;
}

function PackageCard({ label, coins, price, icon, desc, badge, highlight, index, onSelect, id }: PackageCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, delay: index * 100, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay: index * 100, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () => Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();

  const pkg = PACKAGES.find(p => p.id === id)!;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pressScale }] }}>
      <TouchableOpacity
        style={[styles.pkgCard, highlight && styles.pkgCardHighlight]}
        onPress={() => onSelect(pkg)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {badge && (
          <View style={[styles.badge, highlight && styles.badgeHighlight]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <View style={styles.pkgLeft}>
          <View style={[styles.pkgIconWrap, highlight && styles.pkgIconHighlight]}>
            <Ionicons name={icon as any} size={28} color={highlight ? Theme.colors.textInverse : Theme.colors.secondary} />
          </View>
          <View>
            <Text style={[styles.pkgLabel, highlight && styles.pkgLabelHighlight]}>{label}</Text>
            <Text style={styles.pkgDesc}>{desc}</Text>
          </View>
        </View>
        <View style={styles.pkgRight}>
          <View style={styles.coinsRow}>
            <Ionicons name="ellipse" size={14} color={Theme.colors.secondary} />
            <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
          </View>
          <Text style={[styles.priceText, highlight && styles.priceHighlight]}>{price}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function StorePage() {
  const { coins, addCoins } = useGame();
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(SHEET_H)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const openSheet = (pkg: typeof PACKAGES[0]) => {
    setSelectedPkg(pkg);
    setPurchased(false);
    setSheetOpen(true);
    Animated.parallel([
      Animated.spring(sheetY, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: SHEET_H, duration: 220, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSheetOpen(false);
      setSelectedPkg(null);
    });
  };

  const handleConfirmPurchase = () => {
    if (!selectedPkg) return;
    const opened = redirectToPaymentLink();
    if (!opened) {
      setPurchased(true); // show "not set up yet" state
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View>
            <Text style={styles.headerTitle}>THE COIN STILL</Text>
            <Text style={styles.headerSub}>BUY YER COINS</Text>
          </View>
          <View style={styles.coinBadge}>
            <Ionicons name="ellipse" size={16} color={Theme.colors.secondary} />
            <Text style={styles.coinCount}>{coins.toLocaleString()}</Text>
          </View>
        </Animated.View>

        <View style={styles.bannerCard}>
          <Ionicons name="star" size={22} color={Theme.colors.secondary} />
          <View style={{ flex: 1, marginLeft: Theme.spacing.sm }}>
            <Text style={styles.bannerTitle}>Fill Up Yer Coin Jar</Text>
            <Text style={styles.bannerSub}>Coins build yer brewery, trailer, and fund every adventure.</Text>
          </View>
        </View>

        {PACKAGES.map((pkg, index) => (
          <PackageCard key={pkg.id} {...pkg} index={index} onSelect={openSheet} />
        ))}

        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Theme.colors.textMuted} />
          <Text style={styles.disclaimerText}>{' '}Purchases are processed securely via Stripe. All sales final.</Text>
        </View>
      </ScrollView>

      {/* Confirmation Sheet */}
      {sheetOpen && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={closeSheet}>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
            <View style={styles.sheetHandle} />
            {purchased ? (
              <View style={styles.purchaseSuccess}>
                <Ionicons name="alert-circle-outline" size={64} color={Theme.colors.textMuted} />
                <Text style={styles.successTitle}>NOT READY YET</Text>
                <Text style={styles.successSub}>
                  {'No Stripe payment link is configured.\nAdd STRIPE_PAYMENT_LINK in Settings → Environment.'}
                </Text>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeSheet} activeOpacity={0.75}>
                  <Text style={styles.cancelBtnText}>Got it</Text>
                </TouchableOpacity>
              </View>
            ) : selectedPkg ? (
              <View style={styles.sheetContent}>
                <Text style={styles.sheetTitle}>Confirm Purchase</Text>
                <View style={styles.sheetPkgRow}>
                  <View style={styles.sheetPkgIcon}>
                    <Ionicons name={selectedPkg.icon as any} size={32} color={Theme.colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.sheetPkgName}>{selectedPkg.label}</Text>
                    <View style={styles.sheetCoinsRow}>
                      <Ionicons name="ellipse" size={14} color={Theme.colors.secondary} />
                      <Text style={styles.sheetCoinsText}>{`  ${selectedPkg.coins.toLocaleString()} coins`}</Text>
                    </View>
                  </View>
                  <Text style={styles.sheetPrice}>{selectedPkg.price}</Text>
                </View>
                <Text style={styles.sheetNote}>You'll be taken to a secure Stripe checkout page to complete your purchase.</Text>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPurchase} activeOpacity={0.85}>
                  <Ionicons name="card-outline" size={20} color={Theme.colors.textInverse} style={{ marginRight: 8 }} />
                  <Text style={styles.confirmBtnText}>{`PAY ${selectedPkg.price}`}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeSheet} activeOpacity={0.75}>
                  <Text style={styles.cancelBtnText}>Nevermind</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Theme.spacing.md, paddingBottom: Theme.spacing.xxl },
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
  coinCount: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.glass.light,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  bannerTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  bannerSub: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  pkgCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.elevation.sm,
  },
  pkgCardHighlight: {
    borderColor: Theme.colors.secondary,
    backgroundColor: '#2C1E08',
    ...Theme.elevation.xl,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: Theme.spacing.md,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  badgeHighlight: {
    backgroundColor: Theme.colors.secondary,
  },
  badgeText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.white,
    letterSpacing: 1,
  },
  pkgLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.md,
  },
  pkgIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  pkgIconHighlight: {
    backgroundColor: Theme.colors.secondary,
    borderColor: Theme.colors.secondary,
  },
  pkgLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  pkgLabelHighlight: {
    color: Theme.colors.secondary,
  },
  pkgDesc: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  pkgRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinsText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
  },
  priceText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textSecondary,
  },
  priceHighlight: {
    color: Theme.colors.text,
    fontWeight: Theme.typography.fontWeight.extrabold,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    lineHeight: 18,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.xxl,
    borderTopRightRadius: Theme.borderRadius.xxl,
    paddingTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
    ...Theme.elevation.xl,
    borderTopWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.border,
    alignSelf: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sheetContent: {},
  sheetTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  sheetPkgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
  },
  sheetPkgIcon: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPkgName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  sheetCoinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetCoinsText: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.secondary,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  sheetPrice: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.secondary,
    marginLeft: 'auto',
  },
  sheetNote: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.md,
    fontStyle: 'italic',
  },
  confirmBtn: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
    ...Theme.elevation.md,
  },
  confirmBtnText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.textInverse,
    letterSpacing: 1,
  },
  cancelBtn: {
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textMuted,
  },
  purchaseSuccess: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  successTitle: {
    fontSize: Theme.typography.fontSize.display,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.secondary,
    letterSpacing: 2,
  },
  successSub: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});
