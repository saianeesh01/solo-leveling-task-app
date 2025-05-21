import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, Image, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

export default function ProfileHeader({ level, xp, xpMax, rank, streak }) {
  const progress = xp / xpMax;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [rank]); // re-animate when rank changes

  return (
    <View style={styles.container}>
      {streak !== undefined && (
        <Text style={styles.streak}>🔥 Streak: {streak} days</Text>
      )}

      <View style={styles.row}>
        <Image
          source={require('../assets/avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.stats}>
          <Text style={styles.level}>Lv. {level}</Text>
          <Text style={styles.label}>EXP</Text>
          <ProgressBar progress={progress} color="#ff5c5c" style={styles.bar} />
          <Text style={styles.xp}>{xp}/{xpMax}</Text>
          <View style={styles.rankBox}>
            <Animated.Text style={[styles.rankText, { opacity: fadeAnim }]}>
              {rank}
            </Animated.Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d0d18',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#3a3f5c',
    marginRight: 16,
  },
  stats: {
    flex: 1,
  },
  level: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'OrbitronBold',
  },
  label: {
    color: '#bbb',
    fontSize: 12,
    fontFamily: 'Orbitron',
    marginTop: 6,
  },
  bar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#2e2e2e',
    marginVertical: 6,
  },
  xp: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Orbitron',
  },
  rankBox: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#202c50',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'OrbitronBold',
  },
  streak: {
    color: '#ffaa00',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'OrbitronBold',
    textAlign: 'center',
  },
});
