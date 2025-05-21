import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import QuestCard from '../components/QuestCard';
import ProfileHeader from '../components/ProfileHeader';
import {
  Button,
  Modal,
  Portal,
  TextInput,
} from 'react-native-paper';

export default function HomeScreen() {
  const [completedCoreTasks, setCompletedCoreTasks] = useState([]);


  const [quests, setQuests] = useState([]);
  const [coreTasks, setCoreTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [xpMax, setXpMax] = useState(100);
  const [modalVisible, setModalVisible] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestXp, setNewQuestXp] = useState('');
  const [newQuestRank, setNewQuestRank] = useState('E');
  const [isLoading, setIsLoading] = useState(false);
  const [completedToday, setCompletedToday] = useState([]);


  const userIdHeader = { headers: { "X-User-ID": "user123" } };

  const getTitle = (level) => {
    if (level >= 100) return "Shadow Monarch";
    if (level >= 90) return "Transcendent One";
    if (level >= 80) return "Ruler of Shadows";
    if (level >= 70) return "Monarch of Plagues";
    if (level >= 60) return "Monarch of Frost";
    if (level >= 50) return "Monarch of Beasts";
    if (level >= 45) return "S-Rank Nightbringer";
    if (level >= 40) return "Shadow Commander";
    if (level >= 35) return "Monarch's Disciple";
    if (level >= 30) return "Dungeon Reaper";
    if (level >= 25) return "A-Rank Phantom Walker";
    if (level >= 20) return "Shadow Initiate";
    if (level >= 15) return "B-Rank Slayer";
    if (level >= 10) return "C-Rank Combatant";
    if (level >= 5) return "D-Rank Adventurer";
    return "Rookie Hunter";
  };

  useEffect(() => {
    axios.get("http://192.168.1.220:5000/api/streak")
      .then(res => setStreak(res.data.streak))
      .catch(err => console.error("Failed to get streak", err));

    axios.get("http://192.168.1.220:5000/api/quests")
      .then(res => setQuests(res.data))
      .catch(err => console.error("Failed to get quests", err));

    axios.get("http://192.168.1.220:5000/api/core-tasks/completed", userIdHeader)
  .then(res => setCompletedCoreTasks(res.data.completed || []))
  .catch(err => console.error("Failed to get completed core tasks", err));

    refreshCoreTasks();
  }, []);
const completeCoreTask = async (task) => {
  try {
    await axios.post("http://192.168.1.220:5000/api/core-tasks/completed", {
      title: task.title,
    }, userIdHeader);

    setCompletedCoreTasks(prev => [...prev, task.title]);
  } catch (err) {
    console.error("Failed to mark task complete", err);
  }
};

  const refreshCoreTasks = () => {
    axios.get("http://192.168.1.220:5000/api/core-tasks", userIdHeader)
      .then(res => setCoreTasks(res.data))
      .catch(err => console.error("Failed to get core tasks", err));
  };
const handleCompleteCoreTask = async (task) => {
  try {
    await axios.post("http://192.168.1.220:5000/api/core-tasks/completed", {
      title: task.title
    }, userIdHeader);
    loadCompletedTasks();
  } catch (err) {
    console.error("Failed to complete task", err);
  }
};

  const completeQuest = async (quest) => {
    const xpGained = quest.xp;
    let newXp = xp + xpGained;
    let newLevel = level;

    if (newXp >= xpMax) {
      newLevel += 1;
      newXp -= xpMax;
    }

    setXp(newXp);
    setLevel(newLevel);
    setQuests(prev => prev.filter(q => q.id !== quest.id));

    try {
      await axios.post("http://192.168.1.220:5000/api/ai-complete", {}, { timeout: 60000 });

      const res = await axios.get("http://192.168.1.220:5000/api/streak-advice", {
        timeout: 60000,
      });

      const message = res.data.message;
      const streakMilestones = [5, 10, 30];
      if (message && streakMilestones.some(n => message.includes(`${n}`))) {
        Alert.alert("🎉 Milestone!", message);
      }
    } catch (err) {
      console.error("Error updating quest, XP, or streak:", err);
      alert("Something went wrong while saving your progress. Try again.");
    }
  };

  const deleteQuest = (quest) => {
    setQuests(prev => prev.filter(q => q.id !== quest.id));
  };
const loadCompletedTasks = async () => {
  try {
    const res = await axios.get("http://192.168.1.220:5000/api/core-tasks/completed", userIdHeader);
    setCompletedToday(res.data.completed || []);
  } catch (err) {
    console.error("Failed to load completed tasks", err);
  }
};

useEffect(() => {
  refreshCoreTasks();
  loadCompletedTasks();
}, []);

  const handleAddCoreTask = async () => {
    if (!newQuestTitle || !newQuestXp) return;

    try {
      await axios.post("http://192.168.1.220:5000/api/core-tasks", {
        title: newQuestTitle,
        xp: parseInt(newQuestXp),
        difficulty: "medium",
      }, userIdHeader);

      setNewQuestTitle('');
      setNewQuestXp('');
      refreshCoreTasks();
    } catch (err) {
      console.error("Failed to add core task", err);
      alert("Failed to add core task.");
    }
  };

  return (
    <View style={styles.container}>
      <ProfileHeader
        level={level}
        xp={xp}
        xpMax={xpMax}
        rank={getTitle(level)}
        streak={streak}
      />

      <Text style={styles.title}>🔥 Core Tasks</Text>
      <FlatList
  data={coreTasks}
  keyExtractor={(item, index) => item.title || `core-${index}`}
  renderItem={({ item }) => (
    <QuestCard
      quest={item}
      isCompleted={completedCoreTasks.includes(item.title)}
      onComplete={() => completeCoreTask(item)}
    />
  )}
  ListEmptyComponent={<Text style={styles.empty}>No core tasks set.</Text>}
/>


      <Text style={styles.title}>🧠 Daily Quests</Text>
      <FlatList
        data={quests}
        keyExtractor={(item, index) => item.id?.toString() || `quest-${index}`}
        renderItem={({ item }) => (
          <QuestCard quest={item} onComplete={completeQuest} onDelete={deleteQuest} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No quests available. Check back later!</Text>}
      />

      <Button
        mode="contained"
        onPress={() => setModalVisible(true)}
        style={styles.addButton}
        labelStyle={{ fontFamily: 'OrbitronBold', fontSize: 14 }}
      >
        + Add Task
      </Button>

      <Button
        mode="contained"
        onPress={async () => {
          try {
            setIsLoading(true);
            const res = await axios.get("http://192.168.1.220:5000/api/ai-quest", { timeout: 60000 });
            const aiQuest = res.data.quest;

            setQuests(prev => [...prev, {
              id: Date.now(),
              title: aiQuest,
              xp: 30,
              rank: "AI",
            }]);
          } catch (err) {
            console.error("Failed to fetch AI quest:", err);
            alert("Failed to fetch AI quest. Try again later.");
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? "Fetching..." : "Get AI Quest"}
      </Button>

      {/* Add Core Task Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <TextInput
            label="Task Title"
            value={newQuestTitle}
            onChangeText={setNewQuestTitle}
            style={styles.input}
          />
          <TextInput
            label="XP Reward"
            value={newQuestXp}
            onChangeText={setNewQuestXp}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={() => {
            handleAddCoreTask();
            setModalVisible(false);
          }}>
            Add Core Task
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    color: '#ffffff',
    fontFamily: 'OrbitronBold',
    textAlign: 'left',
    marginVertical: 10,
  },
  empty: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#00ffcc',
    marginTop: 20,
    borderRadius: 6,
  },
  modalContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 10,
  },
});
