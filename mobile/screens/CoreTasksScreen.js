// CoreTasksScreen.js
const [coreTasks, setCoreTasks] = useState([]);
const [newTask, setNewTask] = useState("");

useEffect(() => {
  axios.get("http://<ip>:5000/api/core-tasks")
    .then(res => setCoreTasks(res.data))
    .catch(console.error);
}, []);

const addTask = async () => {
  if (!newTask) return;
  await axios.post("http://<ip>:5000/api/core-tasks", {
    title: newTask,
    xp: 20, // default XP
    difficulty: "medium"
  });
  setNewTask("");
  refreshTasks();
};

const deleteTask = async (title) => {
  await axios.delete("http://<ip>:5000/api/core-tasks?title=" + title);
  refreshTasks();
};

const refreshTasks = async () => {
  const res = await axios.get("http://<ip>:5000/api/core-tasks");
  setCoreTasks(res.data);
};
