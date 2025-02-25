import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { getProfileById } from "../utils/ProfileUtils";
import LottieView from "lottie-react-native";
import ProfileBar from "../components/ProfileBar";
import { calculateFontSize } from "../utils/FontUtils";
import { useState, useEffect, useRef } from "react";
import CreateReward from "../components/CreateReward";
import { FlatList } from "react-native-gesture-handler";
import { rewardsOptions, getContentByReward } from "../utils/RewardUtils";
import CreateTargets from "../components/CreateTargets";
import * as Animatable from "react-native-animatable";
import {
  setReduxRewards,
  updateReduxReward,
  setReduxTarget,
  updateReduxTarget,
  getReduxRewards,
  getReduxProfiles,
  updateProfilePoints,
  setUser,
} from "../Redux/userSlice";
import { uploadUserData } from "../utils/UploadData";
import { updateProfile } from "firebase/auth";
import { selectRewards, selectProfiles } from "../Redux/userSelectors";
import { updateProfileAndRewards } from "../utils/UploadData";
import * as Progress from "react-native-progress";
import CountdownTimer from "../components/CountdownTimer";
import { getSecondsRemaining } from "../utils/TimeUtils";
import Toast from "react-native-toast-message";

const RewardsScreen = () => {
  const { width, height } = Dimensions.get("screen");
  const user = useSelector((state) => state.user.user);
  const selectedUser = useSelector(
    (state) => state.selectedProfile.selectedProfileId
  );

  const [rewardsList, setRewardsList] = useState(
    user.rewards.length > 0 ? user.rewards : []
  );
  const [reward, setReward] = useState("");
  const [target, setTarget] = useState(user.target? user.target:'');

  const [filteredRewards, setFilteredRewards] = useState(
    rewardsList.filter((item) => item.status === "ACTIVE")
  );

  const dispatch = useDispatch();

  const profile = getProfileById(user, selectedUser);
  const parental = profile.role === "parent" ? true : false;

  const [show, setShowModal] = useState(false);
  const [showTargets, setShowTargets] = useState(false);

  const animationRewardRef = useRef(null);
  const animationTargetRef = useRef(null);
  const animationPurchaseRef = useRef(null);

  const [purchasedAnimation, setPurchasedAnimation] = useState(false);

  const handleRewardAnimationFinish = () => {
    // Open the modal once the animation finishes
    setShowModal(true);
  };
  const handleTargetAnimationFinish = () => {
    // Open the modal once the animation finishes
    setShowTargets(true);
  };

  const handlePressAddRewards = () => {
    if (animationRewardRef.current) {
      animationRewardRef.current.play(); // Play the animation on press
    }
  };

  const handlePressSetTargets = () => {
    if (Object.keys(target).length === 0 || !target.active || completedTarget) {
      if (animationTargetRef.current) {
        animationTargetRef.current.play(); // Play the animation on press
      }
    } else {
      alert("Target is already active");
    }
  };

  //Filter to render only Active tasks
  useEffect(() => {
    setFilteredRewards(rewardsList.filter((item) => item.status === "ACTIVE"));
  }, [rewardsList]);

  const [selectedReward, setSelectedReward] = useState();
  const [purchaseModal, setPurchaseModal] = useState(false);

  const handleBuyReward = (reward) => {
    console.log("buying reward...");
    setSelectedReward(reward);
    setPurchaseModal(true);
  };

  const handleCancelPurchase = () => {
    setPurchaseModal(false);
  };

  const handlePurchaseAnimationFinish = () => {
    // Close the purchase modal
    setPurchasedAnimation(false);
  };

  const formatDate = (dateString) => {
    // Extract only the date portion (YYYY-MM-DD)
    const dateOnly = dateString.split("T")[0]; // Get the part before the 'T'

    // Split the date string into components (year, month, day)
    const [year, month, day] = dateOnly.split("-");

    // Return the reformatted date
    return `${day}/${month}/${year}`;
  };

  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTarget, setCompletedTarget] = useState(
    totalTasks / Number(target.target) === 1
  );

  useEffect(() => {
    // Ensure user.profiles exists and is an array
    if (user?.profiles && Array.isArray(user.profiles)) {
      // Parse dates from user.target
      const deadlineDate = new Date(user.target?.deadline);
      const startedDate = new Date(user.target?.started);

      // Check for invalid dates or inactive target
      if (isNaN(deadlineDate) || isNaN(startedDate) || !user.target?.active) {
        console.warn("Invalid target data or inactive target.");
        return;
      }

      if (!target.active) {
        return;
      }

      let count = 0;

      // Iterate over profiles
      user.profiles.forEach((profile) => {
        if (profile.tasks_completed && Array.isArray(profile.tasks_completed)) {
          // Filter tasks completed between startedDate and deadlineDate
          const completedTasks = profile.tasks_completed.filter((task) => {
            const taskCompletionDate = new Date(task.completed_at); // Parse the task's completion date

            // Check if the task was completed between startedDate and deadlineDate
            return (
              startedDate <= taskCompletionDate &&
              taskCompletionDate <= deadlineDate
            );
          });

          count += completedTasks.length; // Increment count by the number of completed tasks
        }
      });

      setTotalTasks(count); // Update state with the total task count
      setCompletedTarget(totalTasks / Number(target.target) === 1);
    } else {
      console.warn("User profiles not available or not an array.");
    }
  }, [user]); // Recalculate when user changes

  //Purchase function
  const handlePurchase = async () => {
    if (profile.points >= selectedReward.price) {
      console.log("Purchasing...");
      const newAmount = selectedReward.amount - 1; // Decrementing the amount properly

      // Update the amount of the selected reward
      const updatedReward = {
        ...selectedReward,
        amount: newAmount,
        status: newAmount > 0 ? "ACTIVE" : "SOLD_OUT", // Update the status based on new amount
      };

      const rewardIndex = rewardsList.findIndex(
        (r) => r.reward_id === updatedReward.reward_id
      );

      // If the reward exists in the list, update it immutably
      if (rewardIndex !== -1) {
        const updatedList = [...rewardsList]; // Create a copy of the current list
        updatedList[rewardIndex] = updatedReward; // Update the reward at the found index
        setRewardsList(updatedList); // Set the new array to the state
      }

      // Create a new reward object for the profile's rewards list
      const newReward = {
        ...selectedReward,
        amount: 1,
        pid: profile.rewards.length + 1,
        date: new Date().toDateString(), // Correct the date method call
      };

      // Add the new reward to the profile's rewards
      const updatedProfileRewards = [...profile.rewards, newReward];

      // Update the profile with the new reward and points deduction
      const updatedProfile = {
        ...profile,
        rewards: updatedProfileRewards,
        points: profile.points - selectedReward.price, // Fix reward price reference
      };

      try {
        // Pass the updated profile and reward to update function
        const updatedData = await updateProfileAndRewards(
          user.uid,
          updatedProfile,
          updatedReward
        );
        // Update Redux state manually after Firebase update
        dispatch(updateProfile(updatedProfile)); // Ensure you dispatch the correct updatedProfile
        dispatch(updateReduxReward(updatedReward)); // Ensure the reward is correctly dispatched
      } catch (error) {
        console.error("Error updating profile and rewards:", error);
      } finally {
        setPurchaseModal(false);
        setPurchasedAnimation(true);
        Toast.show({
          type: "success",
          text1: "Purchase completed! 🥳",
        });
        if (animationPurchaseRef.current) {
          animationPurchaseRef.current.play();
        }
      }
    } else {
      alert("Not enough points yet.");
      // Close the purchase modal
      setPurchaseModal(false);
    }
  };

  //after creation reward added to the list
  useEffect(() => {
    if (reward) {
      const updatedReward = {
        ...reward,
        reward_id: rewardsList.length + 1,
      };
      const newRewardsList = [...rewardsList, updatedReward];
      setRewardsList(newRewardsList);

      const uploadRewards = async () => {
        try {
          await uploadUserData(user.uid, { rewards: newRewardsList });
          dispatch(setReduxRewards(newRewardsList));
        } catch (error) {
          console.error("Failed to upload rewards:", error);
          Toast.show({
            type: "success",
            text1: "Reward failed...",
            style: {
              backgroundColor: "#dc3545", // Custom background color
            },
          });
        }finally{
          Toast.show({
            type: "success",
            text1: "Reward created!!",
            style: {
              backgroundColor: "#dc3545", // Custom background color
            },
          });
        }
      };

      uploadRewards();
      setReward("");
    }
  }, [reward]); // Runs when `reward` changes

  useEffect(() => {
    if (target) {
      console.log("target added");
    }
    const newTarget = target;

    const uploadTarget = async () => {
      try {
        await uploadUserData(user.uid, { target: newTarget });
        dispatch(setReduxTarget(newTarget));
      } catch (error) {
        console.error("Failed to upload rewards:", error);
      }finally{
        Toast.show({
          type: "success",
          text1: "Target set!!!",
          style: {
            backgroundColor: "#dc3545", // Custom background color
          },
        });
      }
    };

    uploadTarget();
  }, [target]); // Runs when `reward` changes

  const renderReward = ({ item }) => {
    const height = 80;
    const width = 80;

    return (
      <TouchableOpacity
        style={styles.rewardAnimation}
        disabled={parental}
        onPress={() => handleBuyReward(item)}
      >
        <LottieView
          source={getContentByReward(item.reward)}
          style={{ width: width, height: height }}
          autoPlay={true}
          loop={true}
        />
        <Text
          style={[
            styles.rewardText,
            { alignSelf: "center", textAlign: "center" },
          ]}
        >
          {item.reward}
        </Text>
        <View style={{ flexDirection: "row", alignSelf: "center" }}>
          <Animatable.View
            animation="swing"
            duration={1500}
            iterationCount="infinite"
            style={styles.coinStyle}
          >
            <Text style={[styles.rewardText, { alignSelf: "center" }]}>$</Text>
          </Animatable.View>
          <Text style={[styles.rewardText, { marginTop: 4 }]}>
            {" "}
            {item.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={styles.container}
      // source={require("../assets/backgrounds/pattern_2.png")}
      // resizeMode="cover"
    >
      <LottieView
        source={require("../assets/animations/background-shapes.json")}
        style={{
          top: -175,
          width: width,
          height: height,
          position: "absolute",
        }}
        autoPlay={true}
        loop={true}
        speed={0.35}
      />
      <View style={{ marginTop: "5%" }}>
        <ProfileBar profile={profile} points={profile.points} />
      </View>
      <View style={{ height: 15 }} />
      {parental && (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={handlePressAddRewards}>
            <View style={styles.createCompetition}>
              <LottieView
                ref={animationRewardRef}
                source={require("../assets/animations/rewards/present.json")}
                style={{ width: 70, height: 70 }}
                autoPlay={false}
                loop={false}
                onAnimationFinish={handleRewardAnimationFinish} // Trigger on finish
              />
              <Text style={styles.createText}>Add rewards</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePressSetTargets}>
            <View style={styles.createCompetition}>
              <LottieView
                ref={animationTargetRef}
                source={require("../assets/animations/target.json")}
                style={{ width: 70, height: 70 }}
                autoPlay={false}
                loop={false}
                speed={0.7}
                onAnimationFinish={handleTargetAnimationFinish} // Trigger on finish
              />
              <Text style={styles.createText}>Set targets</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 10 }} />
      {Object.keys(target).length !== 0 && (
        <View style={[styles.rewardContainer, { alignItems: "center" }]}>
          <Text style={[styles.rewardText, { alignSelf: "center" }]}>
            {parental ? "Suggested reward:" : "Complete tasks as a family"}
          </Text>
          {!parental && (
            <Text style={[styles.rewardText, { alignSelf: "center" }]}>
              to get:
            </Text>
          )}
          <LottieView
            source={
              completedTarget
                ? require("../assets/animations/fireworks.json")
                : require("../assets/animations/trophy.json")
            }
            style={{ alignSelf: "center", width: 100, height: 100 }}
            autoPlay={true}
            loop={true}
          />
          <Text style={[styles.rewardText, { alignSelf: "center" }]}>
            Reward: {target.reward}
          </Text>
          <Text style={[styles.rewardText, { alignSelf: "center" }]}>
            Completed: {totalTasks}/{target.target} tasks
          </Text>
          <Text style={[styles.rewardText, { alignSelf: "center" }]}>
            Available until: {formatDate(target.deadline)}
          </Text>
          <View style={{ marginTop: 5 }}>
            <Progress.Bar
              progress={totalTasks / Number(target.target)}
              width={200}
              height={12}
              color="#6200ee"
            />
          </View>
        </View>
      )}
      <View style={{ height: 10 }} />
      <Text style={styles.SemiBoldText}>Reward Catalogue:</Text>
      <View style={{ height: 10 }} />
      <View style={{ maxHeight: 310 }}>
        <FlatList
          data={filteredRewards}
          renderItem={renderReward}
          keyExtractor={(item) => String(item.id)}
          numColumns={4} // Three avatars per row
          contentContainerStyle={styles.rewardList}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 14,
                marginHorizontal: 10,
              }}
            />
          )}
        />
      </View>
      <CreateReward
        show={show}
        setShowModal={setShowModal}
        reward={reward}
        setReward={setReward}
      />
      <CreateTargets
        show={showTargets}
        setShowModal={setShowTargets}
        target={target}
        setTarget={setTarget}
      />
      {purchasedAnimation && (
        <View style={styles.lottieContainer} pointerEvents="box-none">
          <LottieView
            source={require("../assets/animations/confetti-purchase.json")}
            style={{
              top: -175,
              width: width,
              height: height,
              position: "absolute",
            }}
            ref={animationPurchaseRef}
            autoPlay={true}
            loop={false}
            speed={0.7}
            pointerEvents="none" // Ensures it doesn't block touches
            onAnimationFinish={handlePurchaseAnimationFinish} // Trigger on finish
          />
        </View>
      )}
      {purchaseModal && (
        <Modal visible={purchaseModal} transparent={true} animationType="slide">
          <View style={styles.purchaseContainer}>
            <View style={styles.purchaseContent}>
              <TouchableOpacity style={{ alignSelf: "center" }}>
                <LottieView
                  source={getContentByReward(selectedReward.reward)}
                  style={{ width: 80, height: 80 }}
                  autoPlay={true}
                  loop={true}
                />
              </TouchableOpacity>
              <Text style={[styles.rewardText, { alignSelf: "center" }]}>
                {selectedReward.reward}
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <TouchableOpacity
                  style={styles.purchaseButtons}
                  onPress={handlePurchase}
                >
                  <Text style={[styles.rewardText, { marginTop: 4 }]}>
                    Purchase{" "}
                  </Text>
                  <Animatable.View
                    animation="swing"
                    duration={1500}
                    iterationCount="infinite"
                    style={styles.coinStyle}
                  >
                    <Text style={[styles.rewardText, { alignSelf: "center" }]}>
                      $
                    </Text>
                  </Animatable.View>
                  <Text style={[styles.rewardText, { marginTop: 4 }]}>
                    {" "}
                    {selectedReward.price}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.purchaseButtons}
                  onPress={handleCancelPurchase}
                >
                  <Text style={[styles.rewardText, { marginTop: 4 }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E4F1F4",
    alignItems: "center",
    padding: "2",
    zIndex: -2,
  },
  button: {
    height: "50%",
    width: "50%",
  },
  createCompetition: {
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgb(253, 253, 253)", // Adjust the color and transparency
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    elevation: 10,
    shadowColor: "rgba(0, 0, 0, 0.93)",
    shadowRadius: 4,
    marginLeft: 10,
  },
  createText: {
    fontSize: calculateFontSize(20),
    fontFamily: "Fredoka-Medium",
    maxWidth: 90,
    alignContent: "center",
  },
  rewardList: {},
  rewardText: {
    fontFamily: "Fredoka-Medium",
    alignSelf: "flex-start",
    fontSize: calculateFontSize(14),
  },
  rewardAnimation: {
    backgroundColor: "white",
    padding: 5,
    marginRight: 4,
    marginLeft: 4,
    elevation: 8,
    borderRadius: 12,
    maxWidth: 120,
  },
  coinStyle: {
    backgroundColor: "#F3C623",
    borderRadius: 50,
    padding: 3,
    borderColor: "black",
    borderWidth: 2,
    height: 25,
    width: 25,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardContainer: {
    backgroundColor: "white",
    padding: 10,
    elevation: 8,
    borderRadius: 12,
  },
  purchaseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  purchaseContent: {
    width: 250,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
  },
  purchaseButtons: {
    marginTop: 5,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#D5EEFF",
    borderRadius: 10,
    elevation: 10,
    padding: 5,
    marginHorizontal: 10,
  },
  lottieContainer: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure it's behind the TouchableOpacity
  },
  SemiBoldText: {
    fontFamily: "Fredoka-Regular",
    fontSize: calculateFontSize(28),
  },
});

export default RewardsScreen;
