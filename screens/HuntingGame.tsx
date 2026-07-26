import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Rect as SvgRect,
  Circle as SvgCircle,
  Ellipse,
  Polygon,
  Path,
  G,
} from 'react-native-svg';
import { Theme } from '../theme/AppTheme';
import { useGame } from '../contexts/GameContext';

type Phase = 'idle' | 'stalking' | 'sighting' | 'aiming' | 'missed' | 'tracking' | 'escaped' | 'result';

type Prey = {
  name: string;
  emoji: string;
  coinsMin: number;
  coinsMax: number;
  rarity: string;
  rarityColor: string;
  desc: string;
};

const PREY_TABLE: Prey[] = [
  { name: 'Squirrel', emoji: '🐿️', coinsMin: 5, coinsMax: 12, rarity: 'Common', rarityColor: '#888888', desc: 'Bushy-tailed tree rat. Better than nothin\'.' },
  { name: 'Possum', emoji: '🦝', coinsMin: 10, coinsMax: 20, rarity: 'Common', rarityColor: '#888888', desc: 'Road chicken. Plays dead but it ain\'t.' },
  { name: 'Wild Turkey', emoji: '🦃', coinsMin: 20, coinsMax: 32, rarity: 'Uncommon', rarityColor: '#44AA88', desc: 'Big bird with a bad attitude. Fine table fare.' },
  { name: 'Wild Hog', emoji: '🐗', coinsMin: 30, coinsMax: 48, rarity: 'Rare', rarityColor: '#4488FF', desc: 'Mean, ugly, and delicious. Watch those tusks!' },
  { name: '8-POINT BUCK', emoji: '🦌', coinsMin: 58, coinsMax: 85, rarity: 'LEGENDARY', rarityColor: '#DAA520', desc: 'A wall-mount trophy. Tell yer grandkids about this one.' },
];

function selectPrey(accuracy: number): Prey {
  const r = Math.random();
  if (accuracy < 35) return r < 0.72 ? PREY_TABLE[0] : PREY_TABLE[1];
  if (accuracy < 60) {
    if (r < 0.25) return PREY_TABLE[0];
    if (r < 0.60) return PREY_TABLE[1];
    if (r < 0.92) return PREY_TABLE[2];
    return PREY_TABLE[3];
  }
  if (accuracy < 85) {
    if (r < 0.10) return PREY_TABLE[1];
    if (r < 0.40) return PREY_TABLE[2];
    if (r < 0.88) return PREY_TABLE[3];
    return PREY_TABLE[4];
  }
  if (r < 0.06) return PREY_TABLE[2];
  if (r < 0.38) return PREY_TABLE[3];
  return PREY_TABLE[4];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

const SCENE_H = 280;

export default function HuntingGame() {
  const navigation = useNavigation();
  const { addCoins, setActivityCooldown, activityCooldowns, coins } = useGame();

  const [phase, setPhase] = useState<Phase>('idle');
  const [crosshair, setCrosshair] = useState(50);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackTimeLeft, setTrackTimeLeft] = useState(0);
  const [stalkCount, setStalkCount] = useState(3);
  const [accuracy, setAccuracy] = useState(0);
  const [result, setResult] = useState<{ prey: Prey; coins: number } | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [sceneWidth, setSceneWidth] = useState(400);

  const phaseRef = useRef<Phase>('idle');
  const crosshairRef = useRef(50);
  const crosshairDirRef = useRef(1);
  const lockedPreyRef = useRef<Prey | null>(null);
  const trackProgressRef = useRef(0);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.5)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const treeSwayLeft = useRef(new Animated.Value(0)).current;
  const preyBob = useRef(new Animated.Value(0)).current;
  const muzzleFlash = useRef(new Animated.Value(0)).current;
  const birdScatter = useRef(new Animated.Value(0)).current;
  const fogDrift = useRef(new Animated.Value(0)).current;
  const leafFall = useRef(new Animated.Value(0)).current;

  const treeLoop = useRef<Animated.CompositeAnimation | null>(null);
  const preyLoop = useRef<Animated.CompositeAnimation | null>(null);
  const leafLoop = useRef<Animated.CompositeAnimation | null>(null);
  const fogLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    leafLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(leafFall, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(leafFall, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(leafFall, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    leafLoop.current.start();
    fogLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fogDrift, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(fogDrift, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    fogLoop.current.start();
    return () => {
      leafLoop.current?.stop();
      fogLoop.current?.stop();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const end = activityCooldowns['hunting'] ?? 0;
      setCooldownSec(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(interval);
  }, [activityCooldowns]);

  const startTreeSway = useCallback(() => {
    treeLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(treeSwayLeft, { toValue: -4, duration: 1800, useNativeDriver: true }),
        Animated.timing(treeSwayLeft, { toValue: 4, duration: 1800, useNativeDriver: true }),
      ])
    );
    treeLoop.current.start();
  }, [treeSwayLeft]);

  const stopTreeSway = useCallback(() => {
    treeLoop.current?.stop();
    treeSwayLeft.setValue(0);
  }, [treeSwayLeft]);

  const startPreyBob = useCallback(() => {
    preyLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(preyBob, { toValue: -6, duration: 600, useNativeDriver: true }),
        Animated.timing(preyBob, { toValue: 6, duration: 600, useNativeDriver: true }),
      ])
    );
    preyLoop.current.start();
  }, [preyBob]);

  const stopPreyBob = useCallback(() => {
    preyLoop.current?.stop();
    preyBob.setValue(0);
  }, [preyBob]);

  useEffect(() => {
    if (phase !== 'aiming') return;
    crosshairRef.current = 50;
    crosshairDirRef.current = 1;
    const speed = 2.2 + Math.random() * 1.4;
    const interval = setInterval(() => {
      crosshairRef.current += crosshairDirRef.current * speed;
      if (crosshairRef.current >= 100) { crosshairRef.current = 100; crosshairDirRef.current = -1; }
      if (crosshairRef.current <= 0) { crosshairRef.current = 0; crosshairDirRef.current = 1; }
      setCrosshair(Math.round(crosshairRef.current));
    }, 32);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'stalking') return;
    setStalkCount(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setStalkCount(count);
      if (count <= 0) {
        clearInterval(interval);
        if (phaseRef.current !== 'stalking') return;
        phaseRef.current = 'sighting';
        setPhase('sighting');
        startPreyBob();
        startTreeSway();
      }
    }, 900);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'sighting') return;
    const timeout = setTimeout(() => {
      if (phaseRef.current !== 'sighting') return;
      phaseRef.current = 'aiming';
      setPhase('aiming');
    }, 1400);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'tracking') return;
    trackProgressRef.current = 0;
    setTrackProgress(0);
    const interval = setInterval(() => {
      setTrackTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0 && phaseRef.current === 'tracking') {
          phaseRef.current = 'escaped';
          setPhase('escaped');
          setActivityCooldown('hunting', 900000);
        }
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'result') return;
    resultScale.setValue(0.5);
    resultOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(resultScale, { toValue: 1, tension: 70, friction: 7, useNativeDriver: true }),
      Animated.timing(resultOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [phase]);

  const handleStartHunt = () => {
    if (cooldownSec > 0 || phaseRef.current !== 'idle') return;
    phaseRef.current = 'stalking';
    setPhase('stalking');
  };

  const handleFire = () => {
    if (phaseRef.current !== 'aiming') return;
    stopPreyBob();
    stopTreeSway();

    muzzleFlash.setValue(1);
    Animated.timing(muzzleFlash, { toValue: 0, duration: 220, useNativeDriver: true }).start();

    birdScatter.setValue(0);
    Animated.timing(birdScatter, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const acc = Math.abs(50 - crosshairRef.current);
    const accuracyScore = Math.max(0, 100 - acc * 2);
    setAccuracy(accuracyScore);

    if (acc > 38) {
      phaseRef.current = 'missed';
      setPhase('missed');
      setActivityCooldown('hunting', 900000);
    } else {
      lockedPreyRef.current = selectPrey(accuracyScore);
      phaseRef.current = 'tracking';
      setPhase('tracking');
      setTrackTimeLeft(6);
    }
  };

  const handleTrackTap = () => {
    if (phaseRef.current !== 'tracking') return;
    const gain = 7 + Math.random() * 7;
    const newProg = Math.min(100, trackProgressRef.current + gain);
    trackProgressRef.current = newProg;
    setTrackProgress(newProg);
    if (newProg >= 100) {
      const prey = lockedPreyRef.current!;
      const earned = Math.floor(prey.coinsMin + Math.random() * (prey.coinsMax - prey.coinsMin + 1));
      addCoins(earned);
      setActivityCooldown('hunting', 900000);
      phaseRef.current = 'result';
      setPhase('result');
      setResult({ prey, coins: earned });
    }
  };

  const handleReset = () => {
    if (cooldownSec > 0) return;
    phaseRef.current = 'idle';
    setPhase('idle');
    setResult(null);
    lockedPreyRef.current = null;
    trackProgressRef.current = 0;
    setTrackProgress(0);
    setCrosshair(50);
    setStalkCount(3);
    muzzleFlash.setValue(0);
    birdScatter.setValue(0);
  };

  const showPrey = phase === 'sighting' || phase === 'aiming';
  const W = sceneWidth;

  // Left and right tree trunk pairs
  const leftTrees = [
    { x: -8, treeH: 200, treeW: 48 },
    { x: 32, treeH: 170, treeW: 44 },
  ];
  const rightTrees = [
    { x: W - 56, treeH: 195, treeW: 48 },
    { x: W - 92, treeH: 175, treeW: 42 },
  ];
  // Background trees (smaller, lighter)
  const bgTrees = [
    { x: W * 0.22, treeH: 140, treeW: 34 },
    { x: W * 0.4, treeH: 150, treeW: 38 },
    { x: W * 0.6, treeH: 135, treeW: 32 },
    { x: W * 0.78, treeH: 145, treeW: 36 },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F0D" />
      <Animated.View style={[styles.container, { opacity: fadeIn }]}>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={26} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{'🦌  VARMINT HUNTIN\''}</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>{`🪙 ${coins}`}</Text>
          </View>
        </View>

        {/* Scene */}
        <View
          style={styles.scene}
          onLayout={e => setSceneWidth(Math.round(e.nativeEvent.layout.width))}
        >
          {/* SVG Background */}
          <Svg width={W} height={SCENE_H} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgGrad id="canopy" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#0A1F0A" stopOpacity="1" />
                <Stop offset="0.6" stopColor="#183A18" stopOpacity="1" />
                <Stop offset="1" stopColor="#1A4A1A" stopOpacity="1" />
              </SvgGrad>
              <SvgGrad id="floor" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#0D2A0D" stopOpacity="1" />
                <Stop offset="1" stopColor="#050F05" stopOpacity="1" />
              </SvgGrad>
            </Defs>

            {/* Forest canopy sky */}
            <SvgRect x={0} y={0} width={W} height={130} fill="url(#canopy)" />

            {/* Light rays through trees */}
            <Path
              d={`M${W*0.38},0 L${W*0.28},130 L${W*0.34},130 L${W*0.46},0 Z`}
              fill="rgba(200,230,150,0.05)"
            />
            <Path
              d={`M${W*0.56},0 L${W*0.48},130 L${W*0.53},130 L${W*0.63},0 Z`}
              fill="rgba(200,230,150,0.04)"
            />

            {/* Overcast sky peek (top) */}
            <SvgRect x={0} y={0} width={W} height={20} fill="#2A4A2A" opacity={0.4} />

            {/* Background trees (far, faded) */}
            {bgTrees.map((t, i) => (
              <G key={i}>
                <SvgRect x={t.x - 5} y={SCENE_H - t.treeH} width={10} height={t.treeH} fill="#0E2A0E" opacity={0.6} />
                <Polygon
                  points={`${t.x},${SCENE_H - t.treeH - 40} ${t.x - t.treeW/2},${SCENE_H - t.treeH + 20} ${t.x + t.treeW/2},${SCENE_H - t.treeH + 20}`}
                  fill="#0C260C"
                  opacity={0.55}
                />
              </G>
            ))}

            {/* Ground line */}
            <SvgRect x={0} y={130} width={W} height={12} fill="#2A3A18" />

            {/* Forest floor */}
            <SvgRect x={0} y={142} width={W} height={SCENE_H - 142} fill="url(#floor)" />

            {/* Ground texture lines */}
            <Path d={`M0,175 Q${W*0.3},171 ${W*0.6},175 Q${W*0.8},178 ${W},175`} stroke="rgba(30,60,20,0.4)" strokeWidth="2" fill="none" />
            <Path d={`M0,200 Q${W*0.25},196 ${W*0.5},200 Q${W*0.75},204 ${W},200`} stroke="rgba(30,60,20,0.3)" strokeWidth="2" fill="none" />

            {/* Ground foliage patches */}
            <Ellipse cx={W*0.2} cy={SCENE_H - 8} rx={35} ry={10} fill="#0F3010" opacity={0.7} />
            <Ellipse cx={W*0.5} cy={SCENE_H - 6} rx={40} ry={12} fill="#0D2A0E" opacity={0.65} />
            <Ellipse cx={W*0.8} cy={SCENE_H - 8} rx={32} ry={10} fill="#0F3010" opacity={0.7} />

            {/* Fallen log */}
            <Path
              d={`M${W*0.25},${SCENE_H - 25} Q${W*0.4},${SCENE_H - 30} ${W*0.55},${SCENE_H - 25}`}
              stroke="#3A2010" strokeWidth="10" fill="none" strokeLinecap="round"
            />
            <Path
              d={`M${W*0.25},${SCENE_H - 25} Q${W*0.4},${SCENE_H - 30} ${W*0.55},${SCENE_H - 25}`}
              stroke="#4A2A14" strokeWidth="6" fill="none" strokeLinecap="round"
            />

            {/* Left foreground trees */}
            {leftTrees.map((t, i) => (
              <G key={i}>
                <SvgRect
                  x={t.x + t.treeW/2 - 8}
                  y={SCENE_H - t.treeH}
                  width={16}
                  height={t.treeH}
                  fill="#1A0A02"
                />
                <Polygon
                  points={`${t.x + t.treeW/2},${SCENE_H - t.treeH - 50} ${t.x},${SCENE_H - t.treeH + 30} ${t.x + t.treeW},${SCENE_H - t.treeH + 30}`}
                  fill={i === 0 ? '#081808' : '#0A1E0A'}
                />
                <Polygon
                  points={`${t.x + t.treeW/2},${SCENE_H - t.treeH - 20} ${t.x + 4},${SCENE_H - t.treeH + 55} ${t.x + t.treeW - 4},${SCENE_H - t.treeH + 55}`}
                  fill={i === 0 ? '#0A2010' : '#0C2412'}
                />
              </G>
            ))}

            {/* Right foreground trees */}
            {rightTrees.map((t, i) => (
              <G key={i}>
                <SvgRect
                  x={t.x + rightTrees[0].treeW/2 - 8}
                  y={SCENE_H - t.treeH}
                  width={16}
                  height={t.treeH}
                  fill="#1A0A02"
                />
                <Polygon
                  points={`${t.x + t.treeW/2},${SCENE_H - t.treeH - 48} ${t.x},${SCENE_H - t.treeH + 30} ${t.x + t.treeW},${SCENE_H - t.treeH + 30}`}
                  fill={i === 0 ? '#081808' : '#0A1E0A'}
                />
                <Polygon
                  points={`${t.x + t.treeW/2},${SCENE_H - t.treeH - 16} ${t.x + 4},${SCENE_H - t.treeH + 54} ${t.x + t.treeW - 4},${SCENE_H - t.treeH + 54}`}
                  fill={i === 0 ? '#0A2010' : '#0C2412'}
                />
              </G>
            ))}

            {/* Fog layer */}
            <SvgRect x={0} y={155} width={W} height={40} fill="rgba(180,210,160,0.06)" />
            <SvgRect x={0} y={165} width={W} height={25} fill="rgba(180,210,160,0.04)" />
          </Svg>

          {/* Fog drift overlay */}
          <Animated.View style={[styles.fogOverlay, {
            opacity: fogDrift.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }),
            transform: [{ translateX: fogDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 22] }) }],
          }]} />

          {/* Falling leaf */}
          <Animated.Text style={[styles.fallingLeaf, {
            transform: [
              { translateY: leafFall.interpolate({ inputRange: [0, 1], outputRange: [-10, 60] }) },
              { translateX: leafFall.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
            ],
            opacity: leafFall.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
          }]}>{'🍂'}</Animated.Text>

          {/* Birds scatter on shot */}
          <Animated.Text style={[styles.birdsRow, {
            transform: [
              { translateX: birdScatter.interpolate({ inputRange: [0, 1], outputRange: [0, 90] }) },
              { translateY: birdScatter.interpolate({ inputRange: [0, 1], outputRange: [0, -35] }) },
            ],
            opacity: birdScatter.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 1, 0] }),
          }]}>{'🐦  🐦    🐦  🐦'}</Animated.Text>

          {/* Tree sway overlay (left trees) */}
          <Animated.View style={[styles.leftTreeOverlay, {
            transform: [{ rotate: treeSwayLeft.interpolate({ inputRange: [-4, 4], outputRange: ['-1deg', '1deg'] }) }],
          }]} pointerEvents="none" />

          {/* Prey */}
          {showPrey && (
            <Animated.Text style={[styles.preyEmoji, { transform: [{ translateY: preyBob }] }]}>
              {'🦌'}
            </Animated.Text>
          )}

          {/* Muzzle flash */}
          {phase === 'aiming' && (
            <Animated.View style={[styles.muzzleFlash, { opacity: muzzleFlash }]}>
              <Text style={styles.muzzleText}>{'💥'}</Text>
            </Animated.View>
          )}

          {/* Result */}
          {phase === 'result' && result && (
            <Animated.Text style={[styles.preyEmoji, { transform: [{ scale: resultScale }], opacity: resultOpacity }]}>
              {result.prey.emoji}
            </Animated.Text>
          )}
          {(phase === 'missed' || phase === 'escaped') && (
            <Text style={styles.preyEmoji}>{'💨'}</Text>
          )}

          {/* Scene labels */}
          {phase === 'idle' && <Text style={styles.sceneLabel}>{'🌲  DEEP BACKWOODS  🌲'}</Text>}
          {phase === 'stalking' && <Text style={styles.sceneLabel}>{`🥾  MOVIN' IN QUIET...  ${stalkCount}`}</Text>}
          {phase === 'tracking' && <Text style={styles.sceneLabel}>{'🩸  FOLLOW THE TRAIL!'}</Text>}

          {(phase === 'stalking' || phase === 'tracking') && (
            <Text style={styles.footprints}>{'👣  👣  👣'}</Text>
          )}

          {phase === 'idle' && (
            <View style={styles.bgWildlife}>
              <Text style={styles.bgAnimal}>{'🐿️'}</Text>
              <Text style={styles.bgAnimal}>{'🦝'}</Text>
              <Text style={styles.bgAnimal}>{'🦃'}</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlArea}>

          {phase === 'idle' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'VARMINT HUNTIN\''}</Text>
              <Text style={styles.phaseSub}>
                {cooldownSec > 0
                  ? `Restin' up... ${formatTime(cooldownSec)} left`
                  : `Load up that rifle and head into them woods. Hogs, turkey, and maybe a big buck if yer steady.`}
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleStartHunt}
                disabled={cooldownSec > 0}
                activeOpacity={0.82}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🔫  GRAB YER RIFLE!'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'stalking' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'STALKIN\'...'}</Text>
              <Text style={styles.phaseSub}>Move quiet-like through them trees. One snap of a twig and it bolts.</Text>
              <Text style={styles.stalkCountdown}>{stalkCount > 0 ? `${stalkCount}` : '...'}</Text>
            </View>
          )}

          {phase === 'sighting' && (
            <View style={styles.controlBox}>
              <Text style={[styles.phaseTitle, styles.sightTitle]}>{'🦌  THERE IT IS!!!'}</Text>
              <Text style={styles.phaseSub}>Raise that rifle slow. Get yer crosshair steady on it!</Text>
              <Text style={styles.waitEmoji}>{'🔭'}</Text>
            </View>
          )}

          {phase === 'aiming' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>TAKE YER SHOT</Text>
              <Text style={styles.phaseSub}>Hold steady! Tap FIRE when the crosshair hits center!</Text>
              <View style={styles.scopeOuter}>
                <View style={styles.scopeInner}>
                  <View style={styles.scopeCrossH} />
                  <View style={styles.scopeCrossV} />
                  <View style={styles.sweetSpot} />
                  <View style={[styles.reticle, { left: `${crosshair}%`, marginLeft: -10 }]}>
                    <View style={styles.reticleH} />
                    <View style={styles.reticleV} />
                  </View>
                </View>
                <Text style={styles.scopeLabel}>
                  {crosshair < 30 || crosshair > 70 ? 'FAR OFF...' : crosshair > 42 && crosshair < 58 ? 'STEADY!' : 'CLOSE...'}
                </Text>
              </View>
              <TouchableOpacity style={[styles.actionBtn, styles.fireBtn]} onPress={handleFire} activeOpacity={0.72}>
                <Text style={styles.actionBtnText}>{'🔫  FIRE!!!'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'missed' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'CLEAN MISS! 😤'}</Text>
              <Text style={styles.phaseSub}>Shot went wide. That critter heard ya comin\' and bolted. Come back in 15 minutes.</Text>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnGreen, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🔫  TRY AGAIN'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'tracking' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{`TRACK IT DOWN! — ${trackTimeLeft}s`}</Text>
              <View style={styles.trackBarOuter}>
                <View style={[
                  styles.trackBarInner,
                  { width: `${trackProgress}%`, backgroundColor: trackProgress > 65 ? '#4A7C3F' : Theme.colors.secondary },
                ]} />
              </View>
              <Text style={styles.phaseSub}>
                {trackProgress < 30 ? `🥾 Follow that blood trail!` : trackProgress < 65 ? `🌿 Getting closer...` : `🏃 Almost got it!`}
              </Text>
              <TouchableOpacity style={[styles.actionBtn, styles.trackBtn]} onPress={handleTrackTap} activeOpacity={0.6}>
                <Text style={styles.actionBtnText}>{'👣  TRACK!'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'escaped' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'IT GAVE YA THE SLIP! 💔'}</Text>
              <Text style={styles.phaseSub}>Lost the trail. Should\'ve moved faster. Come back in 15 minutes.</Text>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnGreen, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🔫  HUNT AGAIN'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'result' && result && (
            <Animated.View style={[styles.controlBox, { transform: [{ scale: resultScale }], opacity: resultOpacity }]}>
              <Text style={[styles.rarityLabel, { color: result.prey.rarityColor }]}>
                {`★  ${result.prey.rarity.toUpperCase()}  ★`}
              </Text>
              <Text style={styles.phaseTitle}>{result.prey.name.toUpperCase()}</Text>
              <Text style={styles.preyDesc}>{result.prey.desc}</Text>
              <Text style={styles.coinsEarned}>{`+${result.coins} 🪙`}</Text>
              <TouchableOpacity
                style={[styles.actionBtn, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🔫  HUNT AGAIN'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1F0D' },
  container: { flex: 1, backgroundColor: '#0D1F0D' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    letterSpacing: 1,
  },
  coinBadge: {
    backgroundColor: Theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
  },
  coinText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
  },
  scene: {
    height: SCENE_H,
    overflow: 'hidden',
    backgroundColor: '#0D1F0D',
  },
  fogOverlay: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#AACCAA',
  },
  fallingLeaf: {
    position: 'absolute',
    top: 0,
    left: 110,
    fontSize: 18,
  },
  birdsRow: {
    position: 'absolute',
    top: 14,
    left: 20,
    fontSize: 16,
    letterSpacing: 4,
  },
  leftTreeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    bottom: 0,
  },
  preyEmoji: {
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 62,
  },
  muzzleFlash: {
    position: 'absolute',
    right: 60,
    top: 14,
  },
  muzzleText: { fontSize: 36 },
  sceneLabel: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.sm,
    color: '#4A7C3F',
    letterSpacing: 2,
  },
  footprints: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 8,
  },
  bgWildlife: {
    position: 'absolute',
    top: 8,
    right: 60,
    flexDirection: 'row',
    gap: 8,
  },
  bgAnimal: { fontSize: 18, opacity: 0.6 },
  controlArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  controlBox: { alignItems: 'center', gap: Theme.spacing.md },
  phaseTitle: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  sightTitle: { color: '#88CC44' },
  phaseSub: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  preyDesc: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 280,
  },
  stalkCountdown: {
    fontSize: 72,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: '#4A7C3F',
    marginTop: Theme.spacing.sm,
  },
  waitEmoji: { fontSize: 52, marginTop: Theme.spacing.md },
  scopeOuter: { width: '100%', alignItems: 'center', gap: 6 },
  scopeInner: {
    width: '100%',
    height: 52,
    backgroundColor: '#0A180A',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: '#4A7C3F',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scopeCrossH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(74,124,63,0.35)',
  },
  scopeCrossV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(74,124,63,0.35)',
  },
  sweetSpot: {
    position: 'absolute',
    left: '42%',
    width: '16%',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(74,124,63,0.18)',
  },
  reticle: {
    position: 'absolute',
    width: 20,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF4444',
  },
  reticleV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FF4444',
  },
  scopeLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#4A7C3F',
    letterSpacing: 2,
  },
  trackBarOuter: {
    width: '100%',
    height: 22,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  trackBarInner: { height: '100%', borderRadius: Theme.borderRadius.full },
  actionBtn: {
    width: '100%',
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.elevation.md,
  },
  actionBtnDisabled: { backgroundColor: Theme.colors.disabled },
  actionBtnGreen: { backgroundColor: '#2A5A1A' },
  fireBtn: { backgroundColor: '#8B1A1A', paddingVertical: 18 },
  trackBtn: { backgroundColor: '#4A7C3F', paddingVertical: 22 },
  actionBtnText: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.textInverse,
    letterSpacing: 1,
  },
  rarityLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    letterSpacing: 3,
    textAlign: 'center',
  },
  coinsEarned: {
    fontSize: 42,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.secondary,
  },
});
