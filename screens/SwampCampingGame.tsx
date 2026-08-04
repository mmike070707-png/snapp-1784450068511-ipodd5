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
} from 'react-native-svg';
import { Theme } from '../theme/AppTheme';
import { useGame } from '../contexts/GameContext';

type Phase = 'idle' | 'pitching' | 'firestarting' | 'luring' | 'critter' | 'missed' | 'catching' | 'escaped' | 'result';

type Critter = {
  name: string;
  emoji: string;
  coinsMin: number;
  coinsMax: number;
  rarity: string;
  rarityColor: string;
};

const CRITTER_TABLE: Critter[] = [
  { name: 'Bullfrog', emoji: '🐸', coinsMin: 8, coinsMax: 16, rarity: 'Common', rarityColor: '#888888' },
  { name: 'Firefly Jar', emoji: '🪲', coinsMin: 14, coinsMax: 24, rarity: 'Common', rarityColor: '#888888' },
  { name: 'Nutria Rat', emoji: '🐀', coinsMin: 22, coinsMax: 35, rarity: 'Uncommon', rarityColor: '#44AA88' },
  { name: 'Cottonmouth', emoji: '🐍', coinsMin: 32, coinsMax: 52, rarity: 'Rare', rarityColor: '#4488FF' },
  { name: 'BIG OL\' GATOR', emoji: '🐊', coinsMin: 62, coinsMax: 95, rarity: 'LEGENDARY', rarityColor: '#DAA520' },
];

function selectCritter(firepower: number): Critter {
  const r = Math.random();
  if (firepower < 30) return r < 0.75 ? CRITTER_TABLE[0] : CRITTER_TABLE[1];
  if (firepower < 55) {
    if (r < 0.35) return CRITTER_TABLE[0];
    if (r < 0.72) return CRITTER_TABLE[1];
    if (r < 0.94) return CRITTER_TABLE[2];
    return CRITTER_TABLE[3];
  }
  if (firepower < 80) {
    if (r < 0.12) return CRITTER_TABLE[1];
    if (r < 0.48) return CRITTER_TABLE[2];
    if (r < 0.88) return CRITTER_TABLE[3];
    return CRITTER_TABLE[4];
  }
  if (r < 0.06) return CRITTER_TABLE[2];
  if (r < 0.40) return CRITTER_TABLE[3];
  return CRITTER_TABLE[4];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

const SCENE_H = 260;

export default function SwampCampingGame() {
  const navigation = useNavigation();
  const { addCoins, setActivityCooldown, activityCooldowns, coins } = useGame();

  const [phase, setPhase] = useState<Phase>('idle');
  const [firepower, setFirepower] = useState(0);
  const [catchProgress, setCatchProgress] = useState(0);
  const [critterTimeLeft, setCritterTimeLeft] = useState(0);
  const [catchTimeLeft, setCatchTimeLeft] = useState(0);
  const [pitchCount, setPitchCount] = useState(3);
  const [result, setResult] = useState<{ critter: Critter; coins: number } | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [sceneWidth, setSceneWidth] = useState(400);

  const phaseRef = useRef<Phase>('idle');
  const firepowerRef = useRef(0);
  const firepowerDirRef = useRef(1);
  const lockedCritterRef = useRef<Critter | null>(null);
  const catchProgressRef = useRef(0);
  const critterTimeRef = useRef(0);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.5)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const fireFlicker = useRef(new Animated.Value(1)).current;
  const fireflyAnim = useRef(new Animated.Value(0)).current;
  const gatorBlink = useRef(new Animated.Value(1)).current;
  const fireGlow = useRef(new Animated.Value(0.6)).current;

  const fireLoop = useRef<Animated.CompositeAnimation | null>(null);
  const fireflyLoop = useRef<Animated.CompositeAnimation | null>(null);
  const gatorLoop = useRef<Animated.CompositeAnimation | null>(null);
  const fireGlowLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    fireflyLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fireflyAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(fireflyAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    fireflyLoop.current.start();
    gatorLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(gatorBlink, { toValue: 0.15, duration: 200, useNativeDriver: true }),
        Animated.timing(gatorBlink, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(gatorBlink, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ])
    );
    gatorLoop.current.start();
    return () => {
      fireflyLoop.current?.stop();
      gatorLoop.current?.stop();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const end = activityCooldowns['camping'] ?? 0;
      setCooldownSec(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(interval);
  }, [activityCooldowns]);

  const startFireFlicker = useCallback(() => {
    fireLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fireFlicker, { toValue: 1.12, duration: 220, useNativeDriver: true }),
        Animated.timing(fireFlicker, { toValue: 0.88, duration: 180, useNativeDriver: true }),
      ])
    );
    fireLoop.current.start();
    fireGlowLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fireGlow, { toValue: 1.0, duration: 350, useNativeDriver: true }),
        Animated.timing(fireGlow, { toValue: 0.55, duration: 280, useNativeDriver: true }),
      ])
    );
    fireGlowLoop.current.start();
  }, [fireFlicker, fireGlow]);

  const stopFireFlicker = useCallback(() => {
    fireLoop.current?.stop();
    fireGlowLoop.current?.stop();
    fireFlicker.setValue(1);
    fireGlow.setValue(0.6);
  }, [fireFlicker, fireGlow]);

  useEffect(() => {
    if (phase !== 'firestarting') return;
    firepowerRef.current = 0;
    firepowerDirRef.current = 1;
    const interval = setInterval(() => {
      firepowerRef.current += firepowerDirRef.current * 2.6;
      if (firepowerRef.current >= 100) { firepowerRef.current = 100; firepowerDirRef.current = -1; }
      if (firepowerRef.current <= 0) { firepowerRef.current = 0; firepowerDirRef.current = 1; }
      setFirepower(Math.round(firepowerRef.current));
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'pitching') return;
    setPitchCount(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setPitchCount(count);
      if (count <= 0) {
        clearInterval(interval);
        if (phaseRef.current !== 'pitching') return;
        phaseRef.current = 'firestarting';
        setPhase('firestarting');
      }
    }, 900);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'luring') return;
    startFireFlicker();
    const waitMs = 2500 + Math.random() * 4000;
    const timeout = setTimeout(() => {
      if (phaseRef.current !== 'luring') return;
      critterTimeRef.current = 5;
      setCritterTimeLeft(5);
      phaseRef.current = 'critter';
      setPhase('critter');
    }, waitMs);
    return () => {
      clearTimeout(timeout);
      stopFireFlicker();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'critter') return;
    const interval = setInterval(() => {
      critterTimeRef.current -= 1;
      setCritterTimeLeft(critterTimeRef.current);
      if (critterTimeRef.current <= 0) {
        clearInterval(interval);
        if (phaseRef.current !== 'critter') return;
        phaseRef.current = 'missed';
        setPhase('missed');
        setActivityCooldown('camping', 900000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'catching') return;
    catchProgressRef.current = 0;
    setCatchProgress(0);
    const interval = setInterval(() => {
      setCatchTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0 && phaseRef.current === 'catching') {
          phaseRef.current = 'escaped';
          setPhase('escaped');
          setActivityCooldown('camping', 900000);
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

  const handleMakeCamp = () => {
    if (cooldownSec > 0 || phaseRef.current !== 'idle') return;
    phaseRef.current = 'pitching';
    setPhase('pitching');
  };

  const handleStrikeMatch = () => {
    if (phaseRef.current !== 'firestarting') return;
    lockedCritterRef.current = selectCritter(firepowerRef.current);
    phaseRef.current = 'luring';
    setPhase('luring');
  };

  const handleGrabCritter = () => {
    if (phaseRef.current !== 'critter') return;
    phaseRef.current = 'catching';
    setPhase('catching');
    setCatchTimeLeft(5);
  };

  const handleCatchTap = () => {
    if (phaseRef.current !== 'catching') return;
    const gain = 7.5 + Math.random() * 7;
    const newProg = Math.min(100, catchProgressRef.current + gain);
    catchProgressRef.current = newProg;
    setCatchProgress(newProg);
    if (newProg >= 100) {
      const critter = lockedCritterRef.current!;
      const earned = Math.floor(critter.coinsMin + Math.random() * (critter.coinsMax - critter.coinsMin + 1));
      addCoins(earned);
      setActivityCooldown('camping', 900000);
      phaseRef.current = 'result';
      setPhase('result');
      setResult({ critter, coins: earned });
    }
  };

  const handleReset = () => {
    if (cooldownSec > 0) return;
    phaseRef.current = 'idle';
    setPhase('idle');
    setResult(null);
    lockedCritterRef.current = null;
    catchProgressRef.current = 0;
    setCatchProgress(0);
    setCritterTimeLeft(0);
    setCatchTimeLeft(0);
    setPitchCount(3);
    fireFlicker.setValue(1);
    fireGlow.setValue(0.6);
  };

  const showFire = phase === 'luring' || phase === 'critter' || phase === 'catching' || phase === 'result';
  const showCritter = phase === 'critter' || phase === 'catching';

  const W = sceneWidth;

  // Stars: fixed relative positions (we compute from W)
  const stars = [
    { rx: 0.05, ry: 0.06, r: 2 },
    { rx: 0.12, ry: 0.18, r: 1.5 },
    { rx: 0.22, ry: 0.08, r: 2.5 },
    { rx: 0.32, ry: 0.22, r: 1.5 },
    { rx: 0.40, ry: 0.06, r: 2 },
    { rx: 0.50, ry: 0.16, r: 3 },
    { rx: 0.58, ry: 0.05, r: 1.5 },
    { rx: 0.68, ry: 0.20, r: 2 },
    { rx: 0.76, ry: 0.08, r: 2.5 },
    { rx: 0.85, ry: 0.15, r: 1.5 },
    { rx: 0.92, ry: 0.06, r: 2 },
    { rx: 0.18, ry: 0.30, r: 1.5 },
    { rx: 0.44, ry: 0.28, r: 1.5 },
    { rx: 0.70, ry: 0.30, r: 1.5 },
    { rx: 0.90, ry: 0.26, r: 2 },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#070D1A" />
      <Animated.View style={[styles.container, { opacity: fadeIn }]}>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={26} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{'⛺  SWAMP CAMPIN\''}</Text>
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
              <SvgGrad id="nightSky" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#04091A" stopOpacity="1" />
                <Stop offset="0.7" stopColor="#070F26" stopOpacity="1" />
                <Stop offset="1" stopColor="#0A1530" stopOpacity="1" />
              </SvgGrad>
              <SvgGrad id="swamp" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#060F08" stopOpacity="1" />
                <Stop offset="0.5" stopColor="#040A05" stopOpacity="1" />
                <Stop offset="1" stopColor="#020504" stopOpacity="1" />
              </SvgGrad>
              <SvgGrad id="water" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#061A10" stopOpacity="1" />
                <Stop offset="1" stopColor="#030D08" stopOpacity="1" />
              </SvgGrad>
            </Defs>

            {/* Night sky */}
            <SvgRect x={0} y={0} width={W} height={110} fill="url(#nightSky)" />

            {/* Stars */}
            {stars.map((s, i) => (
              <SvgCircle
                key={i}
                cx={W * s.rx}
                cy={110 * s.ry}
                r={s.r}
                fill="white"
                opacity={0.6 + (i % 3) * 0.15}
              />
            ))}

            {/* Moon */}
            <SvgCircle cx={W - 36} cy={24} r={20} fill="#F5E6A3" opacity={0.92} />
            <SvgCircle cx={W - 30} cy={20} r={14} fill="#E8D490" opacity={0.85} />
            {/* Moon craters */}
            <SvgCircle cx={W - 40} cy={20} r={3} fill="#C8B878" opacity={0.5} />
            <SvgCircle cx={W - 28} cy={30} r={2} fill="#C8B878" opacity={0.4} />
            {/* Moon glow */}
            <SvgCircle cx={W - 36} cy={24} r={32} fill="#F5E6A3" opacity={0.06} />
            <SvgCircle cx={W - 36} cy={24} r={44} fill="#F5E6A3" opacity={0.03} />

            {/* Distant cypress trees (background) */}
            <Polygon
              points={`${W*0.3},110 ${W*0.27},60 ${W*0.33},60`}
              fill="#060F08" opacity={0.9}
            />
            <Polygon
              points={`${W*0.38},110 ${W*0.35},72 ${W*0.41},72`}
              fill="#060F08" opacity={0.85}
            />
            <Polygon
              points={`${W*0.62},110 ${W*0.59},65 ${W*0.65},65`}
              fill="#060F08" opacity={0.9}
            />
            <Polygon
              points={`${W*0.7},110 ${W*0.67},75 ${W*0.73},75`}
              fill="#060F08" opacity={0.85}
            />

            {/* Swamp edge */}
            <SvgRect x={0} y={110} width={W} height={10} fill="#0D2A18" />
            <Path
              d={`M0,116 Q${W*0.2},112 ${W*0.4},117 Q${W*0.6},122 ${W*0.8},116 Q${W*0.9},113 ${W},116`}
              fill="#0A2010" stroke="none"
            />

            {/* Swamp area */}
            <SvgRect x={0} y={120} width={W} height={SCENE_H - 120} fill="url(#swamp)" />

            {/* Dark swamp water at bottom */}
            <SvgRect x={0} y={SCENE_H - 40} width={W} height={40} fill="url(#water)" />
            <Path
              d={`M0,${SCENE_H - 40} Q${W*0.2},${SCENE_H - 44} ${W*0.4},${SCENE_H - 40} Q${W*0.6},${SCENE_H - 36} ${W*0.8},${SCENE_H - 40} Q${W*0.9},${SCENE_H - 42} ${W},${SCENE_H - 40}`}
              fill="#061A10" stroke="none"
            />

            {/* Water shimmer */}
            <Path
              d={`M${W*0.1},${SCENE_H - 28} Q${W*0.2},${SCENE_H - 31} ${W*0.3},${SCENE_H - 28}`}
              stroke="rgba(0,150,80,0.2)" strokeWidth="2" fill="none"
            />
            <Path
              d={`M${W*0.5},${SCENE_H - 22} Q${W*0.6},${SCENE_H - 25} ${W*0.7},${SCENE_H - 22}`}
              stroke="rgba(0,150,80,0.18)" strokeWidth="2" fill="none"
            />

            {/* Left cypress tree */}
            <SvgRect x={0} y={125} width={18} height={SCENE_H - 125} fill="#0A1A06" />
            <Polygon
              points={`9,75 -18,145 36,145`}
              fill="#071408"
            />
            <Polygon
              points={`9,95 -14,160 32,160`}
              fill="#0A1A0A"
            />
            {/* Left cypress roots/moss */}
            <Ellipse cx={9} cy={SCENE_H - 20} rx={28} ry={10} fill="#0A1A0A" opacity={0.7} />

            {/* Right cypress tree */}
            <SvgRect x={W - 18} y={130} width={18} height={SCENE_H - 130} fill="#0A1A06" />
            <Polygon
              points={`${W - 9},80 ${W - 36},148 ${W + 18},148`}
              fill="#071408"
            />
            <Polygon
              points={`${W - 9},102 ${W - 32},163 ${W + 14},163`}
              fill="#0A1A0A"
            />
            <Ellipse cx={W - 9} cy={SCENE_H - 18} rx={28} ry={10} fill="#0A1A0A" opacity={0.7} />

            {/* Background reeds */}
            {[0.18, 0.26, 0.36, 0.46, 0.54, 0.64, 0.74, 0.82].map((pct, i) => (
              <Path
                key={i}
                d={`M${W*pct},${SCENE_H} L${W*pct + (i%2===0 ? -3 : 3)},${130 + (i%3)*12}`}
                stroke="#1A3A18"
                strokeWidth="3"
                fill="none"
                opacity={0.6}
              />
            ))}

            {/* Rocks in water */}
            <Ellipse cx={W*0.35} cy={SCENE_H - 18} rx={12} ry={6} fill="#1A1A12" opacity={0.7} />
            <Ellipse cx={W*0.65} cy={SCENE_H - 22} rx={10} ry={5} fill="#1A1A12" opacity={0.65} />
          </Svg>

          {/* Fire glow (shown when fire is lit) */}
          {showFire && (
            <Animated.View style={[styles.fireGlowRing, { opacity: fireGlow }]} />
          )}

          {/* Tent */}
          {phase !== 'pitching' && (
            <Text style={styles.tentEmoji}>{'⛺'}</Text>
          )}

          {/* Campfire */}
          {showFire && (
            <Animated.Text style={[styles.campfireEmoji, { transform: [{ scale: fireFlicker }] }]}>
              {'🔥'}
            </Animated.Text>
          )}

          {/* Unlit fire pit */}
          {phase === 'firestarting' && (
            <Text style={styles.firePitEmoji}>{'🪵'}</Text>
          )}

          {/* Critter approaching */}
          {showCritter && lockedCritterRef.current && (
            <Text style={styles.critterEmoji}>{lockedCritterRef.current.emoji}</Text>
          )}

          {/* Missed / escaped */}
          {(phase === 'missed' || phase === 'escaped') && (
            <Text style={styles.critterEmoji}>{'💨'}</Text>
          )}

          {/* Result critter */}
          {phase === 'result' && result && (
            <Animated.Text style={[styles.critterEmoji, { transform: [{ scale: resultScale }], opacity: resultOpacity }]}>
              {result.critter.emoji}
            </Animated.Text>
          )}

          {/* Gator eyes */}
          <Animated.Text style={[styles.gatorEyes, { opacity: gatorBlink }]}>
            {'👀          👀'}
          </Animated.Text>

          {/* Fireflies */}
          <Animated.Text style={[styles.firefliesRow, { opacity: fireflyAnim }]}>
            {'🪲      🪲      🪲      🪲'}
          </Animated.Text>

          {/* Scene labels */}
          {phase === 'idle' && <Text style={styles.sceneLabel}>{'🌙  DARK BAYOU SWAMP  🌙'}</Text>}
          {phase === 'pitching' && <Text style={styles.sceneLabel}>{`🏕️  PITCHIN' CAMP...  ${pitchCount}`}</Text>}
          {phase === 'luring' && <Text style={styles.sceneLabel}>{'🔥  FIRE\'S GOIN\'...  🔥'}</Text>}
          {phase === 'catching' && <Text style={styles.sceneLabel}>{'🎒  BAG IT QUICK!!!'}</Text>}
        </View>

        {/* Controls */}
        <View style={styles.controlArea}>

          {phase === 'idle' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'SWAMP CAMPIN\''}</Text>
              <Text style={styles.phaseSub}>
                {cooldownSec > 0
                  ? `Restin' up... ${formatTime(cooldownSec)} left`
                  : `Head out to the bayou. Build a fire and see what creeps outta them dark waters.`}
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleMakeCamp}
                disabled={cooldownSec > 0}
                activeOpacity={0.82}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🏕️  MAKE CAMP!'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'pitching' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'SETTIN\' UP...'}</Text>
              <Text style={styles.phaseSub}>Hammerin' stakes into that soggy swamp mud.</Text>
              <Text style={styles.countdownText}>{pitchCount > 0 ? `${pitchCount}` : '...'}</Text>
            </View>
          )}

          {phase === 'firestarting' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>START THE FIRE</Text>
              <Text style={styles.phaseSub}>Tap STRIKE when the bar hits the sweet spot — hot fire draws big critters!</Text>
              <View style={styles.powerBarOuter}>
                <View style={[
                  styles.powerBarInner,
                  { width: `${firepower}%`, backgroundColor: firepower > 75 ? '#FF8C00' : firepower > 40 ? '#FF4500' : '#CC4400' },
                ]} />
                <View style={styles.sweetSpotMarker} />
              </View>
              <Text style={styles.powerPct}>{`🔥 ${firepower}%`}</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={handleStrikeMatch} activeOpacity={0.78}>
                <Text style={styles.actionBtnText}>{'🔥  STRIKE MATCH!'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'luring' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'FIRE\'S GOIN\'...'}</Text>
              <Text style={styles.phaseSub}>Sit tight. Somethin\' always comes sniffin\' around a good campfire.</Text>
              <Text style={styles.waitEmoji}>{'🔥'}</Text>
            </View>
          )}

          {phase === 'critter' && (
            <View style={styles.controlBox}>
              <Text style={[styles.phaseTitle, styles.critterTitle]}>
                {lockedCritterRef.current ? `${lockedCritterRef.current.emoji}  SOMETHIN\'S THERE!!!` : 'SOMETHIN\'S THERE!!!'}
              </Text>
              <View style={styles.critterTimerBar}>
                <View style={[
                  styles.critterTimerFill,
                  { width: `${(critterTimeLeft / 5) * 100}%`, backgroundColor: critterTimeLeft > 3 ? '#FF8C00' : critterTimeLeft > 1 ? '#FF4500' : '#CC2222' },
                ]} />
              </View>
              <TouchableOpacity style={[styles.actionBtn, styles.grabBtn]} onPress={handleGrabCritter} activeOpacity={0.7}>
                <Text style={styles.actionBtnText}>{'🎒  GRAB IT!!!'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'missed' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'TOO SLOW! 😤'}</Text>
              <Text style={styles.phaseSub}>That critter spooked and vanished into the dark. Swamp don\`t give second chances.</Text>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnAmber, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🏕️  CAMP AGAIN'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'catching' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{`BAG IT! — ${catchTimeLeft}s`}</Text>
              <View style={styles.catchBarOuter}>
                <View style={[
                  styles.catchBarInner,
                  { width: `${catchProgress}%`, backgroundColor: catchProgress > 65 ? '#FF8C00' : Theme.colors.secondary },
                ]} />
              </View>
              <Text style={styles.phaseSub}>
                {catchProgress < 30 ? `💪 She's a wriggly one!` : catchProgress < 65 ? `😤 Keep tappin'!` : `🎒 Almost got it!`}
              </Text>
              <TouchableOpacity style={[styles.actionBtn, styles.catchBtn]} onPress={handleCatchTap} activeOpacity={0.6}>
                <Text style={styles.actionBtnText}>{'🎒  BAG IT!'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'escaped' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'WRIGGLED FREE! 💔'}</Text>
              <Text style={styles.phaseSub}>Slipped right through yer hands and back into them dark waters. Faster next time!</Text>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnAmber, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🏕️  CAMP AGAIN'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'result' && result && (
            <Animated.View style={[styles.controlBox, { transform: [{ scale: resultScale }], opacity: resultOpacity }]}>
              <Text style={[styles.rarityLabel, { color: result.critter.rarityColor }]}>
                {`★  ${result.critter.rarity.toUpperCase()}  ★`}
              </Text>
              <Text style={styles.phaseTitle}>{result.critter.name.toUpperCase()}</Text>
              <Text style={styles.coinsEarned}>{`+${result.coins} 🪙`}</Text>
              <Text style={styles.phaseSub}>{`Hot dog! Got yerself a ${result.critter.name} right outta the bayou!`}</Text>
              <TouchableOpacity
                style={[styles.actionBtn, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🏕️  CAMP AGAIN'}
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
  safe: { flex: 1, backgroundColor: '#070D1A' },
  container: { flex: 1, backgroundColor: '#070D1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: '#0D1428',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2A44',
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
    backgroundColor: '#04091A',
  },
  fireGlowRing: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#FF6600',
  },
  tentEmoji: {
    position: 'absolute',
    right: 52,
    bottom: 28,
    fontSize: 36,
  },
  campfireEmoji: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -20,
    fontSize: 40,
  },
  firePitEmoji: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    marginLeft: -18,
    fontSize: 36,
  },
  critterEmoji: {
    position: 'absolute',
    left: '25%',
    bottom: 32,
    fontSize: 48,
  },
  gatorEyes: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 2,
  },
  firefliesRow: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    color: '#AAFFAA',
  },
  sceneLabel: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.xs,
    color: '#2A6A3A',
    letterSpacing: 2,
  },
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
  critterTitle: { color: '#FF8C00' },
  phaseSub: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: '#FF8C00',
    marginTop: Theme.spacing.sm,
  },
  waitEmoji: { fontSize: 52, marginTop: Theme.spacing.md },
  powerBarOuter: {
    width: '100%',
    height: 26,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CC4400',
    position: 'relative',
  },
  powerBarInner: { height: '100%', borderRadius: Theme.borderRadius.full },
  sweetSpotMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '72%',
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  powerPct: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginTop: -Theme.spacing.xs,
  },
  critterTimerBar: {
    width: '100%',
    height: 16,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FF8C00',
  },
  critterTimerFill: { height: '100%', borderRadius: Theme.borderRadius.full },
  catchBarOuter: {
    width: '100%',
    height: 22,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  catchBarInner: { height: '100%', borderRadius: Theme.borderRadius.full },
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
  actionBtnAmber: { backgroundColor: '#7A4A00' },
  grabBtn: { backgroundColor: '#FF8C00', paddingVertical: 18 },
  catchBtn: { backgroundColor: '#B35900', paddingVertical: 22 },
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
