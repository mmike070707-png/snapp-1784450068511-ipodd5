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

type Phase = 'idle' | 'casting' | 'waiting' | 'bite' | 'missed' | 'reeling' | 'escaped' | 'result';

type Fish = {
  name: string;
  emoji: string;
  coinsMin: number;
  coinsMax: number;
  rarity: string;
  rarityColor: string;
  desc: string;
};

const FISH_TABLE: Fish[] = [
  { name: 'Bluegill', emoji: '🐟', coinsMin: 3, coinsMax: 8, rarity: 'Common', rarityColor: '#888888', desc: 'Tiny pan fish. Every kid\'s first catch.' },
  { name: 'Crappie', emoji: '🐠', coinsMin: 8, coinsMax: 16, rarity: 'Common', rarityColor: '#888888', desc: 'Speckled little fighter. Good eatin\'.' },
  { name: 'Channel Catfish', emoji: '🐡', coinsMin: 14, coinsMax: 26, rarity: 'Uncommon', rarityColor: '#44AA88', desc: 'Whiskered bottom-dweller. Puts up a scrap.' },
  { name: 'Largemouth Bass', emoji: '🎣', coinsMin: 26, coinsMax: 42, rarity: 'Rare', rarityColor: '#4488FF', desc: 'The king of the crick. Mean ol\' lunker.' },
  { name: 'TROPHY BASS', emoji: '🏆', coinsMin: 58, coinsMax: 85, rarity: 'LEGENDARY', rarityColor: '#DAA520', desc: 'A once-in-a-lifetime monster. Frame that thing!' },
];

function selectFish(power: number): Fish {
  const r = Math.random();
  if (power < 30) return r < 0.75 ? FISH_TABLE[0] : FISH_TABLE[1];
  if (power < 55) {
    if (r < 0.35) return FISH_TABLE[0];
    if (r < 0.72) return FISH_TABLE[1];
    if (r < 0.94) return FISH_TABLE[2];
    return FISH_TABLE[3];
  }
  if (power < 80) {
    if (r < 0.12) return FISH_TABLE[1];
    if (r < 0.48) return FISH_TABLE[2];
    if (r < 0.88) return FISH_TABLE[3];
    return FISH_TABLE[4];
  }
  if (r < 0.07) return FISH_TABLE[2];
  if (r < 0.40) return FISH_TABLE[3];
  return FISH_TABLE[4];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

const SCENE_H = 280;

export default function BassFishingGame() {
  const navigation = useNavigation();
  const { addCoins, setActivityCooldown, activityCooldowns, coins } = useGame();

  const [phase, setPhase] = useState<Phase>('idle');
  const [power, setPower] = useState(0);
  const [reelProgress, setReelProgress] = useState(0);
  const [biteTimeLeft, setBiteTimeLeft] = useState(0);
  const [reelTimeLeft, setReelTimeLeft] = useState(0);
  const [result, setResult] = useState<{ fish: Fish; coins: number } | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [sceneWidth, setSceneWidth] = useState(400);

  const phaseRef = useRef<Phase>('idle');
  const powerRef = useRef(0);
  const powerDirRef = useRef(1);
  const hookedFishRef = useRef<Fish | null>(null);
  const reelProgressRef = useRef(0);
  const biteTimeRef = useRef(0);

  const bobberY = useRef(new Animated.Value(0)).current;
  const biteScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.5)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const birdFly = useRef(new Animated.Value(0)).current;

  const bobbingLoop = useRef<Animated.CompositeAnimation | null>(null);
  const biteLoop = useRef<Animated.CompositeAnimation | null>(null);
  const rippleLoop = useRef<Animated.CompositeAnimation | null>(null);
  const birdLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    rippleLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(rippleAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    rippleLoop.current.start();
    birdLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(birdFly, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(birdFly, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(birdFly, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    birdLoop.current.start();
    return () => {
      rippleLoop.current?.stop();
      birdLoop.current?.stop();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const end = activityCooldowns['fishing'] ?? 0;
      setCooldownSec(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(interval);
  }, [activityCooldowns]);

  const startBobbing = useCallback(() => {
    bobberY.setValue(0);
    bobbingLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bobberY, { toValue: -10, duration: 700, useNativeDriver: true }),
        Animated.timing(bobberY, { toValue: 10, duration: 700, useNativeDriver: true }),
      ])
    );
    bobbingLoop.current.start();
  }, [bobberY]);

  const stopBobbing = useCallback(() => {
    bobbingLoop.current?.stop();
    bobberY.setValue(0);
  }, [bobberY]);

  const startBitePulse = useCallback(() => {
    biteLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(biteScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(biteScale, { toValue: 0.93, duration: 150, useNativeDriver: true }),
      ])
    );
    biteLoop.current.start();
  }, [biteScale]);

  const stopBitePulse = useCallback(() => {
    biteLoop.current?.stop();
    biteScale.setValue(1);
  }, [biteScale]);

  useEffect(() => {
    if (phase !== 'casting') return;
    powerRef.current = 0;
    powerDirRef.current = 1;
    const interval = setInterval(() => {
      powerRef.current += powerDirRef.current * 2.8;
      if (powerRef.current >= 100) { powerRef.current = 100; powerDirRef.current = -1; }
      if (powerRef.current <= 0) { powerRef.current = 0; powerDirRef.current = 1; }
      setPower(Math.round(powerRef.current));
    }, 38);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'waiting') return;
    const waitMs = 2500 + Math.random() * 5000;
    const timeout = setTimeout(() => {
      if (phaseRef.current !== 'waiting') return;
      biteTimeRef.current = 5;
      setBiteTimeLeft(5);
      phaseRef.current = 'bite';
      setPhase('bite');
      stopBobbing();
      Animated.timing(bobberY, { toValue: 26, duration: 130, useNativeDriver: true }).start();
      startBitePulse();
    }, waitMs);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'bite') return;
    const interval = setInterval(() => {
      biteTimeRef.current -= 1;
      setBiteTimeLeft(biteTimeRef.current);
      if (biteTimeRef.current <= 0) {
        clearInterval(interval);
        if (phaseRef.current !== 'bite') return;
        phaseRef.current = 'missed';
        setPhase('missed');
        setActivityCooldown('fishing', 900000);
        stopBitePulse();
        bobberY.setValue(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'reeling') return;
    reelProgressRef.current = 0;
    setReelProgress(0);
    const interval = setInterval(() => {
      setReelTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0 && phaseRef.current === 'reeling') {
          phaseRef.current = 'escaped';
          setPhase('escaped');
          setActivityCooldown('fishing', 900000);
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

  const handleStartCast = () => {
    if (cooldownSec > 0 || phaseRef.current !== 'idle') return;
    phaseRef.current = 'casting';
    setPhase('casting');
  };

  const handleSetPower = () => {
    if (phaseRef.current !== 'casting') return;
    hookedFishRef.current = selectFish(powerRef.current);
    phaseRef.current = 'waiting';
    setPhase('waiting');
    startBobbing();
  };

  const handleSetHook = () => {
    if (phaseRef.current !== 'bite') return;
    stopBitePulse();
    bobberY.setValue(0);
    phaseRef.current = 'reeling';
    setPhase('reeling');
    setReelTimeLeft(5);
  };

  const handleReelTap = () => {
    if (phaseRef.current !== 'reeling') return;
    const gain = 6.5 + Math.random() * 6;
    const newProg = Math.min(100, reelProgressRef.current + gain);
    reelProgressRef.current = newProg;
    setReelProgress(newProg);
    if (newProg >= 100) {
      const fish = hookedFishRef.current!;
      const earned = Math.floor(fish.coinsMin + Math.random() * (fish.coinsMax - fish.coinsMin + 1));
      addCoins(earned);
      setActivityCooldown('fishing', 900000);
      phaseRef.current = 'result';
      setPhase('result');
      setResult({ fish, coins: earned });
    }
  };

  const handleReset = () => {
    if (cooldownSec > 0) return;
    phaseRef.current = 'idle';
    setPhase('idle');
    setResult(null);
    hookedFishRef.current = null;
    reelProgressRef.current = 0;
    setReelProgress(0);
    setBiteTimeLeft(0);
    setReelTimeLeft(0);
    bobberY.setValue(0);
    biteScale.setValue(1);
  };

  const showBobber = phase === 'waiting' || phase === 'bite' || phase === 'reeling';
  const showFishShadows = phase === 'waiting' || phase === 'bite';

  const W = sceneWidth;
  const treeCount = 9;
  const trees = Array.from({ length: treeCount }, (_, i) => {
    const cx = (W / treeCount) * i + W / (treeCount * 2);
    const topY = 55 + (i % 3) * 8;
    const hw = 22 + (i % 2) * 5;
    return { cx, topY, hw };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <Animated.View style={[styles.container, { opacity: fadeIn }]}>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={26} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{'🎣  BASS FISHIN\''}</Text>
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
              <SvgGrad id="sky" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#0C3E7A" stopOpacity="1" />
                <Stop offset="1" stopColor="#1E88CC" stopOpacity="1" />
              </SvgGrad>
              <SvgGrad id="water" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#087A7A" stopOpacity="1" />
                <Stop offset="0.5" stopColor="#043D5A" stopOpacity="1" />
                <Stop offset="1" stopColor="#021825" stopOpacity="1" />
              </SvgGrad>
            </Defs>

            {/* Sky */}
            <SvgRect x={0} y={0} width={W} height={130} fill="url(#sky)" />

            {/* Sun */}
            <SvgCircle cx={W - 40} cy={26} r={22} fill="#FFD700" opacity={0.95} />
            <SvgCircle cx={W - 40} cy={26} r={34} fill="#FFD700" opacity={0.18} />
            <SvgCircle cx={W - 40} cy={26} r={46} fill="#FFD700" opacity={0.07} />

            {/* Clouds */}
            <Ellipse cx={65} cy={30} rx={42} ry={16} fill="white" opacity={0.72} />
            <Ellipse cx={105} cy={22} rx={30} ry={13} fill="white" opacity={0.6} />
            <Ellipse cx={W * 0.48} cy={38} rx={36} ry={14} fill="white" opacity={0.5} />
            <Ellipse cx={W * 0.55} cy={28} rx={24} ry={11} fill="white" opacity={0.42} />
            <Ellipse cx={W - 120} cy={18} rx={32} ry={13} fill="white" opacity={0.38} />

            {/* Tree silhouettes */}
            {trees.map((t, i) => (
              <G key={i}>
                <SvgRect x={t.cx - 4} y={105} width={8} height={25} fill="#2A1206" />
                <Polygon
                  points={`${t.cx},${t.topY} ${t.cx - t.hw},130 ${t.cx + t.hw},130`}
                  fill={i % 2 === 0 ? '#0A3010' : '#0D3A14'}
                />
                <Polygon
                  points={`${t.cx},${t.topY + 14} ${t.cx - t.hw * 0.72},${t.topY + 38} ${t.cx + t.hw * 0.72},${t.topY + 38}`}
                  fill={i % 2 === 0 ? '#103A18' : '#0E3516'}
                />
              </G>
            ))}

            {/* Shore */}
            <SvgRect x={0} y={130} width={W} height={10} fill="#2A5218" />
            <SvgRect x={0} y={136} width={W} height={8} fill="#1E4010" />

            {/* Water surface */}
            <SvgRect x={0} y={144} width={W} height={6} fill="#0ABBBB" />
            <SvgRect x={0} y={148} width={W} height={4} fill="#06DDDD" opacity={0.5} />

            {/* Deep water */}
            <SvgRect x={0} y={152} width={W} height={SCENE_H - 152} fill="url(#water)" />

            {/* Wave lines */}
            <Path
              d={`M0,168 Q${W*0.15},163 ${W*0.3},168 Q${W*0.45},173 ${W*0.6},168 Q${W*0.75},163 ${W*0.9},168 L${W},167`}
              stroke="rgba(0,200,200,0.22)" strokeWidth="2.5" fill="none"
            />
            <Path
              d={`M0,186 Q${W*0.2},181 ${W*0.4},186 Q${W*0.6},191 ${W*0.8},186 L${W},185`}
              stroke="rgba(0,180,180,0.16)" strokeWidth="2" fill="none"
            />
            <Path
              d={`M0,208 Q${W*0.25},203 ${W*0.5},208 Q${W*0.75},213 ${W},208`}
              stroke="rgba(0,160,160,0.12)" strokeWidth="2" fill="none"
            />

            {/* Lily pads */}
            <Ellipse cx={W * 0.14} cy={162} rx={18} ry={7} fill="#1A5A1A" opacity={0.85} />
            <Ellipse cx={W * 0.32} cy={160} rx={15} ry={6} fill="#1A5A1A" opacity={0.75} />
            <Ellipse cx={W * 0.62} cy={162} rx={17} ry={7} fill="#1A5A1A" opacity={0.8} />
            <Ellipse cx={W * 0.82} cy={160} rx={13} ry={5} fill="#1A5A1A" opacity={0.7} />
            {/* Flowers */}
            <SvgCircle cx={W * 0.14} cy={159} r={5} fill="#FF9EBB" opacity={0.9} />
            <SvgCircle cx={W * 0.62} cy={159} r={4} fill="#FFBB99" opacity={0.85} />

            {/* Seaweed */}
            {[0.08, 0.22, 0.42, 0.58, 0.72, 0.88].map((pct, i) => (
              <Path
                key={i}
                d={`M${W*pct},${SCENE_H} Q${W*pct - 9},${255 + (i%3)*6} ${W*pct},${238 + (i%3)*8} Q${W*pct + 9},${255 + (i%3)*6} ${W*pct},${SCENE_H}`}
                fill={i % 2 === 0 ? '#0A4A1A' : '#0C5520'}
                opacity={0.45}
              />
            ))}

            {/* Fish silhouettes */}
            <Ellipse cx={W * 0.24} cy={212} rx={22} ry={8} fill="rgba(20,70,110,0.55)" />
            <Polygon
              points={`${W*0.24 - 22},212 ${W*0.24 - 36},205 ${W*0.24 - 36},219`}
              fill="rgba(20,70,110,0.55)"
            />
            <Ellipse cx={W * 0.58} cy={238} rx={28} ry={10} fill="rgba(20,70,110,0.4)" />
            <Polygon
              points={`${W*0.58 - 28},238 ${W*0.58 - 44},230 ${W*0.58 - 44},246`}
              fill="rgba(20,70,110,0.4)"
            />
            <Ellipse cx={W * 0.82} cy={222} rx={18} ry={7} fill="rgba(20,70,110,0.45)" />
            <Polygon
              points={`${W*0.82 - 18},222 ${W*0.82 - 30},216 ${W*0.82 - 30},228`}
              fill="rgba(20,70,110,0.45)"
            />
          </Svg>

          {/* Bird flying across sky */}
          <Animated.Text style={[styles.birdFly, {
            transform: [{ translateX: birdFly.interpolate({ inputRange: [0, 1], outputRange: [-20, W + 20] }) }],
          }]}>{'🐦'}</Animated.Text>

          {/* Fish shadows while waiting */}
          {showFishShadows && (
            <Animated.View style={[styles.fishShadowRow, {
              opacity: rippleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1, 0.4] }),
            }]}>
              <Text style={styles.fishShadow}>{'🐟  🐠  🐟   🐡  🐟'}</Text>
            </Animated.View>
          )}

          {/* Bobber */}
          {showBobber && (
            <Animated.View style={[styles.bobberWrap, { transform: [{ translateY: bobberY }] }]}>
              <View style={styles.bobberStick} />
              <View style={styles.bobberRed} />
              <View style={styles.bobberWhite} />
            </Animated.View>
          )}

          {/* Ripple ring */}
          {showBobber && (
            <Animated.View style={[styles.rippleRing, {
              opacity: rippleAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 0] }),
              transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] }) }],
            }]} />
          )}

          {/* Bite bubbles */}
          {phase === 'bite' && (
            <Animated.Text style={[styles.bubbles, {
              opacity: biteScale.interpolate({ inputRange: [0.93, 1.1], outputRange: [0.6, 1] }),
            }]}>
              {'💧 💧 💧'}
            </Animated.Text>
          )}

          {/* Caught fish */}
          {phase === 'result' && result && (
            <Animated.Text style={[styles.catchEmoji, {
              transform: [{ scale: resultScale }],
              opacity: resultOpacity,
            }]}>
              {result.fish.emoji}
            </Animated.Text>
          )}
          {(phase === 'missed' || phase === 'escaped') && (
            <Text style={styles.catchEmoji}>{'💨'}</Text>
          )}

          {phase === 'idle' && <Text style={styles.waterLabel}>{'🌊  MUDDY CRICK POND  🌊'}</Text>}
          {phase === 'casting' && <Text style={styles.waterLabel}>{'🎣  SET YER CAST POWER!'}</Text>}
        </View>

        {/* Controls */}
        <View style={styles.controlArea}>

          {phase === 'idle' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'BASS FISHIN\''}</Text>
              <Text style={styles.phaseSub}>
                {cooldownSec > 0
                  ? `Restin' up... ${formatTime(cooldownSec)} left`
                  : `Head down to the crick. Pull some lunkers outta that muddy water, boy.`}
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleStartCast}
                disabled={cooldownSec > 0}
                activeOpacity={0.82}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🎣  CAST YER LINE!'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'casting' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>SET YER POWER</Text>
              <Text style={styles.phaseSub}>Tap CAST when the bar hits the sweet spot — more power, bigger fish!</Text>
              <View style={styles.powerBarOuter}>
                <View style={[
                  styles.powerBarInner,
                  { width: `${power}%`, backgroundColor: power > 75 ? '#DAA520' : power > 40 ? '#44AA66' : '#6688AA' },
                ]} />
                <View style={styles.sweetSpotMarker} />
              </View>
              <Text style={styles.powerPct}>{`${power}%`}</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={handleSetPower} activeOpacity={0.78}>
                <Text style={styles.actionBtnText}>{'⚡  CAST!'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'waiting' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'WAITIN\' ON A BITE...'}</Text>
              <Text style={styles.phaseSub}>Keep yer eyes on that bobber. Something\`s stirrin\` down there.</Text>
              <View style={styles.fishPreviewRow}>
                <Text style={styles.fishPreview}>{'🐟'}</Text>
                <Text style={styles.fishPreview}>{'🐠'}</Text>
                <Text style={styles.fishPreview}>{'🐡'}</Text>
                <Text style={styles.fishPreview}>{'🎣'}</Text>
                <Text style={styles.fishPreview}>{'🏆'}</Text>
              </View>
            </View>
          )}

          {phase === 'bite' && (
            <View style={styles.controlBox}>
              <Text style={[styles.phaseTitle, styles.biteTitle]}>{'🐟  FISH ON!!!'}</Text>
              <View style={styles.biteTimerBar}>
                <View style={[
                  styles.biteTimerFill,
                  { width: `${(biteTimeLeft / 5) * 100}%`, backgroundColor: biteTimeLeft > 3 ? '#44AA66' : biteTimeLeft > 1 ? '#DAA520' : '#CC3333' },
                ]} />
              </View>
              <Animated.View style={[styles.fullWidth, { transform: [{ scale: biteScale }] }]}>
                <TouchableOpacity style={[styles.actionBtn, styles.hookBtn]} onPress={handleSetHook} activeOpacity={0.7}>
                  <Text style={styles.actionBtnText}>{'🔥  SET THE HOOK!!!'}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {phase === 'missed' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'DADGUMMIT! 😤'}</Text>
              <Text style={styles.phaseSub}>Too slow on the hookset! That fish made a fool of ya. Come back in 15 minutes.</Text>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnBlue, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🎣  TRY AGAIN'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'reeling' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{`REEL 'ER IN! — ${reelTimeLeft}s`}</Text>
              <View style={styles.reelBarOuter}>
                <View style={[
                  styles.reelBarInner,
                  { width: `${reelProgress}%`, backgroundColor: reelProgress > 65 ? '#44AA66' : Theme.colors.secondary },
                ]} />
              </View>
              <Text style={styles.phaseSub}>
                {reelProgress < 30 ? `💪 She's a fighter!` : reelProgress < 65 ? `😤 Don't give up now!` : `🎣 Almost got 'em!`}
              </Text>
              <TouchableOpacity style={[styles.actionBtn, styles.reelBtn]} onPress={handleReelTap} activeOpacity={0.6}>
                <Text style={styles.actionBtnText}>{'💪  REEL!'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'escaped' && (
            <View style={styles.controlBox}>
              <Text style={styles.phaseTitle}>{'IT SNAPPED THE LINE! 💔'}</Text>
              <Text style={styles.phaseSub}>That fish outran ya. Should\'ve reeled faster. Come back in 15 minutes.</Text>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnBlue, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🎣  FISH AGAIN'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'result' && result && (
            <Animated.View style={[styles.controlBox, { transform: [{ scale: resultScale }], opacity: resultOpacity }]}>
              <Text style={[styles.rarityLabel, { color: result.fish.rarityColor }]}>
                {`★  ${result.fish.rarity.toUpperCase()}  ★`}
              </Text>
              <Text style={styles.phaseTitle}>{result.fish.name.toUpperCase()}</Text>
              <Text style={styles.fishDesc}>{result.fish.desc}</Text>
              <Text style={styles.coinsEarned}>{`+${result.coins} 🪙`}</Text>
              <TouchableOpacity
                style={[styles.actionBtn, cooldownSec > 0 && styles.actionBtnDisabled]}
                onPress={handleReset}
                disabled={cooldownSec > 0}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>
                  {cooldownSec > 0 ? `⏳  RESTIN'... ${formatTime(cooldownSec)}` : '🎣  FISH AGAIN'}
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
  safe: { flex: 1, backgroundColor: '#0A1628' },
  container: { flex: 1, backgroundColor: '#0A1628' },
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
    backgroundColor: '#0C3E7A',
  },
  birdFly: {
    position: 'absolute',
    top: 22,
    fontSize: 18,
  },
  fishShadowRow: {
    position: 'absolute',
    top: 186,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fishShadow: {
    fontSize: 20,
    opacity: 0.7,
    letterSpacing: 4,
  },
  bobberWrap: {
    position: 'absolute',
    top: 155,
    left: '50%',
    marginLeft: -11,
    alignItems: 'center',
  },
  bobberStick: {
    width: 3,
    height: 28,
    backgroundColor: '#CCCCCC',
  },
  bobberRed: {
    width: 22,
    height: 13,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    backgroundColor: '#DD2222',
  },
  bobberWhite: {
    width: 22,
    height: 13,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    backgroundColor: '#EEEEEE',
  },
  rippleRing: {
    position: 'absolute',
    top: 208,
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(100,220,220,0.6)',
  },
  bubbles: {
    position: 'absolute',
    top: 228,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 8,
  },
  waterLabel: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.sm,
    color: '#4A9AAA',
    letterSpacing: 2,
  },
  catchEmoji: {
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 64,
  },
  controlArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  controlBox: { alignItems: 'center', gap: Theme.spacing.md },
  fullWidth: { width: '100%' },
  phaseTitle: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  biteTitle: { color: '#FF4444' },
  phaseSub: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  fishDesc: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 280,
  },
  fishPreviewRow: { flexDirection: 'row', gap: 12, marginTop: Theme.spacing.sm },
  fishPreview: { fontSize: 28 },
  powerBarOuter: {
    width: '100%',
    height: 26,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    position: 'relative',
  },
  powerBarInner: { height: '100%', borderRadius: Theme.borderRadius.full },
  sweetSpotMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '72%',
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  powerPct: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginTop: -Theme.spacing.xs,
  },
  biteTimerBar: {
    width: '100%',
    height: 16,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CC3333',
  },
  biteTimerFill: { height: '100%', borderRadius: Theme.borderRadius.full },
  reelBarOuter: {
    width: '100%',
    height: 22,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  reelBarInner: { height: '100%', borderRadius: Theme.borderRadius.full },
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
  actionBtnBlue: { backgroundColor: '#1A6B8A' },
  hookBtn: { backgroundColor: '#CC2222', paddingVertical: 18 },
  reelBtn: { backgroundColor: '#1A6B8A', paddingVertical: 22 },
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
