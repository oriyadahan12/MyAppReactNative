import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addReduxTask } from "../Redux/userSlice";
import { uploadUserData } from "../utils/UploadData";
import { getProfileById } from "../utils/ProfileUtils";
import ProfileBar from "../components/ProfileBar";
import CreateTask from "../components/CreateTask";
import Task from "../components/Task";
import { LinearGradient } from "expo-linear-gradient";
import { FlatList } from "react-native-gesture-handler";
import * as taskUtils from "../utils/TaskUtils";

const Home = ({ navigation }) => {
  const user = useSelector((state) => state.user.user);
  const selectedUser = useSelector(
    (state) => state.selectedProfile.selectedProfileId
  );
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const profile = getProfileById(user, selectedUser);
  const parental = profile ? profile.role === "parent" : true;
  const [task, setNewTask] = useState();

  const tasks = useSelector((state) => state.user.user.tasks || []);
  const [sortedTasks, setSortedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterChild, setFilterChild] = useState(null);

   // Reset filters whenever selectedUser changes
   useEffect(() => {
    // Reset filters
    setFilterType(null);
    setFilterStatus(null);
    setFilterChild(parental? null: profile.name);

    // Optionally reset tasks here if needed
    setFilteredTasks(sortedTasks);
  }, [selectedUser]); // Dependency array to trigger effect when selectedUser changes

  const taskTypes = [
    ...new Set(tasks.map((task) => task.type || "Uncategorized")),
  ];
  const taskStatusOptions = ["Active","Expired","Waiting","Completed"];
  const childrenId = [
    ...new Set(tasks.map((task) => task.assignedTo || "Unknown")),
  ];

  useEffect(() => {
    const uploadTask = async () => {
      if (task && !loading) {
        try {
          setLoading(true);
          await dispatch(addReduxTask(task));
          await uploadUserData(user.uid, { ...user, tasks: [...tasks, task] });
        } catch (error) {
          console.error("Error uploading task:", error);
        } finally {
          setLoading(false);
          setNewTask(null);
        }
      }
    };

    const sorted = [...tasks].sort((a, b) => {
      const now = new Date();
      const endTimeA = new Date(a.endTime);
      const endTimeB = new Date(b.endTime);

      if (endTimeA > now && endTimeB > now) return endTimeA - endTimeB;
      if (endTimeA > now) return -1;
      if (endTimeB > now) return 1;
      return endTimeA - endTimeB;
    });

    setSortedTasks(sorted);
    uploadTask();
  }, [task, dispatch, tasks, loading, user.uid]);

  useEffect(() => {
    let filtered = sortedTasks;

    if (filterType) {
      filtered = filtered.filter((task) => task.type === filterType);
    }

    if (filterStatus) {
      if (filterStatus === "Active") {
        filtered = filtered.filter((task) => task.status!=='EXPIRED');
      } else if (filterStatus === "Expired") {
        filtered = filtered.filter((task) => task.status==='EXPIRED');
      }else if(filterStatus ==='Waiting'){
        filtered = filtered.filter((task) => task.status==='WAITING_COMPLETE');
      }else if(filterStatus ==='Complete'){
        filtered = filtered.filter((task) => task.status==='COMPLETED');
      }
    }
    if(!parental){
      setFilterChild(selectedUser)
    }
    if (filterChild) {
      filtered = filtered.filter((task) => task.assignedTo === filterChild);
    }

    setFilteredTasks(filtered);
  }, [filterType, filterStatus, filterChild, sortedTasks]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => openTaskScreen({ taskID: item.id })}
        style={{ padding: 5 }}
      >
        <Task task={{ item }} />
      </TouchableOpacity>
    );
  };

  const openTaskScreen = ({ taskID }) => {
    navigation.navigate("TaskScreen", { taskID: taskID });
  };

  return (
    <ImageBackground
      style={styles.container}
      source={require("../assets/backgrounds/pattern_1.png")}
      resizeMode="cover"
      imageStyle={{ opacity: 0.2 }} // Adjust opacity here
    >
      <View style={{ marginTop: "5%"}}>
        <ProfileBar profile={profile} points={profile.points} />
      </View>
      {showModal && parental && (
        <CreateTask
          showModal={showModal}
          setShowModal={setShowModal}
          user={{ user }}
          profile={{ profile }}
          task={task}
          setNewTask={setNewTask}
        />
      )}
      {true && (
        <View style={styles.filtersView}>
          <FlatList
            data={[
              { key: "All Types", type: null },
              ...taskTypes.map((type) => ({
                key: taskUtils.taskTypes[type],
                type,
              })),
              { key: "All Status", type: null },
              ...taskStatusOptions.map((status) => ({
                key: status,
                type: status,
              })),
              ...(parental
                ? [
                    { key: "All Profiles", type: null },
                    ...childrenId.map((child) => ({
                      key: getProfileById(user, child).name,
                      type: child,
                    })),
                  ]
                : []),
            ]}
            horizontal
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.filterBarContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  (filterType === item.type ||
                    filterStatus === item.type ||
                    filterChild === item.type) &&
                    styles.filterButtonActive,
                ]}
                onPress={() => {
                  if (item.type === null) {
                    if (item.key === "All Types") setFilterType(null);
                    if (item.key === "All Status") setFilterStatus(null);
                    if (item.key === "All Profiles") setFilterChild(null);
                  } else {
                    if (taskTypes.includes(item.type)) setFilterType(item.type);
                    else if (taskStatusOptions.includes(item.type))
                      setFilterStatus(item.type);
                    else setFilterChild(item.type);
                  }
                }}
              >
                <Text style={styles.filterButtonText}>{item.key}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <View style={styles.tasksContainer}>
        <FlatList
          numColumns={2}
          data={filteredTasks.length>0 ? filteredTasks : sortedTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainerStyle}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      {parental && (
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{ padding: 10 }}
        >
          <LinearGradient
            style={styles.createTaskButton}
            colors={['#4CAF00', '#4CAF50', '#2E8B57']}
          >
            <Text
              style={{
                fontFamily: "Fredoka-SemiBold",
                fontSize: 20,
                padding: 10,
                textAlign: "center",
              }}
            >
              Create new task
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E4F1F4",
    alignItems: "center",
    padding: "2",
  },
  filterBarContainer: {
    backgroundColor: "red",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: "#444",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
  },
  filterButtonActive: {
    backgroundColor: "#615DEC",
  },
  filterButtonText: {
    fontFamily: "Fredoka-Bold",
    fontSize: 14,
    color: "#fff",
  },
  tasksContainer: {
    flex: 1,  // Allow the container to take full available space
    width: "90%",
    borderRadius: 10,

  },
  createTaskButton: {
    borderRadius: 10,
    width: "90%",
  },
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: "center",
  },
  separator: {
    height: "2%",
    width: "90%",
    backgroundColor: "#aaa",
    alignSelf: "center",
  },
  filterBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
  },
  filterButtonActive: {
    backgroundColor: "#615DEC",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#fff",
  },filtersView:{
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
    width:'90%',
    overflow:'scroll'
  }
});

export default Home;
