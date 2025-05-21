import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

const QuestCard = ({ quest, onComplete, onDelete, isCompleted }) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.details}>
            Rank: {quest.rank || '—'} | XP: +{quest.xp}
          </Text>
        </View>
        {onDelete && (
          <Pressable onPress={() => onDelete(quest)}>
            <MaterialIcons name="delete" size={24} color="#ff5c5c" />
          </Pressable>
        )}
      </View>

      <View style={styles.rightSection}>
        {isCompleted ? (
          <MaterialIcons name="check-circle" size={24} color="limegreen" />
        ) : (
          <Button onPress={() => onComplete(quest)} mode="outlined">
            Complete
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e2f',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'OrbitronBold',
    color: '#fff',
  },
  details: {
    fontSize: 12,
    fontFamily: 'Orbitron',
    color: '#aaa',
    marginTop: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#00ffcc',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1e1e2f',
    fontWeight: 'bold',
    fontFamily: 'OrbitronBold',
  },
  rightSection: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
});

export default QuestCard;
