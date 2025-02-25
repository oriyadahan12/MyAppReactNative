import React, { useEffect, useState } from 'react';
import { Alert ,FlatList, Text, View, StyleSheet , TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { calculateFontSize } from '../utils/FontUtils';
import { firebase } from '../../firebase';
import { PasswordsComponent,UserFamilyComponent,EmailComponent,GenderNameBDay, ProfilePictureSelector } from '../components/LogSignCmpnts';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { CreateNewProfile } from '../utils/ProfileUtils';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../Redux/userSlice';


const validateFields = (user) => {
  const { familyName, userName, email, password, profiles } = user;
  if (!familyName || !userName || !email || !password || profiles.length === 0) {
    return false;
  }
  return true;
};

const signUp = async ({ user, navigation, dispatch }) => {
  // Get a reference to the Firestore database
  const db = firebase.firestore();
  const usersRef = db.collection('users');

  if (!validateFields(user)) {
    Alert.alert('Please fill in all fields');
    return;
  }

  if (user.email !== '' && user.password !== '') {
    console.log('Attempting to sign up...');

    try {
      // Create user with Firebase Authentication
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
      const newUser = userCredential.user.uid;
      console.log('User created successfully (UID):', newUser);

      // Set user document in Firestore
      await usersRef.doc(newUser).set({
        uid: newUser,
        familyName: user.familyName,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        partnerEmail: user.partnerEmail,
        profiles: user.profiles,
        tasks: user.tasks,
        rewards: user.rewards
      });

      console.log('User document created successfully in Firestore');

      // Dispatch to Redux store
      const reduxUser = {
        uid: newUser,
        familyName: user.familyName,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        partnerEmail: user.partnerEmail,
        profiles: user.profiles,
        tasks: user.tasks,
        reward: user.rewards
      };
      dispatch(setUser(reduxUser));

      // Navigate to the next screen
      navigation.navigate('Drawer', user);

    } catch (error) {
      console.error('Error occurred:', error);

      if (error.code === 'auth/email-already-in-use') {
        console.warn('That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        console.warn('That email address is invalid!');
      } else if (error.code === 'auth/weak-password') {
        console.warn('Password is too weak!');
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  } else {
    console.warn('Username and password cannot be empty');
  }
};

// Example components
const HeaderComponent = ({}) => (
  <View style={styles.header}>
    <Text style={styles.textHead}>Create your <Text style={styles.brandText}>FamilyNest</Text> account!</Text>
  </View>
);

const PersonalDetailsText = ({}) => (
  <View>
    <Text style={styles.stepText}>Account Information:</Text>
  </View>
);

const CreatorStep = ({ }) => (
  <View>
    <Text style={styles.stepText}>Create your parent profile:</Text>
  </View>
);

const PartnerStep = ({onCheckboxChange}) => {
  const [isChecked, setIsChecked] = useState(false); // Define state

  const handlePress = (isChecked) => {
    setIsChecked(!isChecked); // Toggle state
    console.log(isChecked);
    onCheckboxChange(isChecked);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center'}}>
      <Text style={styles.stepText}>Send partner invitation:</Text>
      <BouncyCheckbox
        size={calculateFontSize(20)}
        fillColor="#9EDF9C"
        unFillColor="#E4F1F4"
        text=""
        iconStyle={{ borderColor: "#9EDF9C" }}
        innerIconStyle={{ borderWidth: 2 }}
        onPress={(isChecked) => handlePress(isChecked)} // Correct onPress
      />
    </View>
  );
};

const SignUpButtonComponent = ({ onSignUp }) => (
  <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
    <Text style={styles.signUpText}>Sign Up</Text>
  </TouchableOpacity>
);






// Main component
export default function App() {

  const navigation = useNavigation();
  const dispatch = useDispatch()

  const [user, setUser]= useState(
    {
      uid:'',
      familyName:'',
      userName:'',
      email:'',
      password:'',
      phoneNumber:'',
      partnerEmail:'',
      profiles: [],
      tasks: [],
      rewards:[],
      target:{},
    }
  );

  const [Familyname, setFamilyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendPartnerInvitation,setShowPartnerInvitation]=useState(false);
  const [partnerEmail,setPartnerEmail]= useState('')
  const [gender,setGender]=useState('1')
  const [date,setDate]=useState(new Date())
  const [passkey,setPasskey]=useState('')
  const [imageURI,setImageURI]=useState('')
  const [imageID,setImageID]=useState(1)

  console.log("Selected Date",date)
  //console.log("Family Name:",Familyname)
  //console.log("First Name:",firstName)

  // Flat List dataset
const data = [
  { id: '1', type: 'header'},
  { id: '2', type: 'personal-step'},
  { id: '3', type: 'user-family'},
  { id: '4', type: 'email-address',},
  { id: '5', type: 'passwords',},
  // TODO phone number.
  { id: '6', type: 'creator-step'},
  { id: '7', type: 'profile-picture'},
  { id: '8', type: 'creator-profile'},
  { id: '9', type: 'gender-name-bday-profile-picture'},
  { id: '12', type: 'sign-up-button'},
];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return <HeaderComponent />;
      case 'personal-step':
        return <PersonalDetailsText />;
      case 'user-family':
        return (
          <UserFamilyComponent
            Familyname={Familyname}
            setFamilyName={setFamilyName}
            userName={userName}
            setUserName={setUserName}
          />
        );
      case 'email-address':
        return <EmailComponent email={email} setEmail={setEmail} placeholder={"Email-address"}/>;
      case 'passwords':
        return (
          <PasswordsComponent
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          />
        );
        case 'creator-step':
          return <CreatorStep/>
        case 'creator-profile':
          return <GenderNameBDay firstName={firstName} setFirstName={setFirstName} gender={gender}
              setGender={setGender} date={date} setDate={setDate}
              passkey={passkey} setPasskey={setPasskey}/>
        case 'partner-step':
          return <PartnerStep onCheckboxChange={setShowPartnerInvitation}/>
        case 'partner-invite':
          return <EmailComponent placeholder={"Your partner email address"} email={partnerEmail} setEmail={setPartnerEmail}/>
        case 'sign-up-button':
          user.familyName=Familyname
          user.userName=userName
          user.email=email
          user.password=password
          user.profiles = [CreateNewProfile({id:1,gender,role:'parent',name:firstName,birth_day:date,avatarURI:imageID,passkey:passkey,imageID:imageID})]
          user
          return <SignUpButtonComponent onSignUp={()=>signUp({user, navigation,dispatch})} />;
        case 'profile-picture':
          return <ProfilePictureSelector imageURI={imageURI} setImageURI={setImageURI} imageID={imageID} setImageID={setImageID}/>
      default:
        return null;
    }
  };

  return (
    <FlatList
    style={{ backgroundColor: '#E4F1F4' }}
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      //ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

// Styles
const styles = StyleSheet.create({
  header: { padding: 16},
  headerText: { fontWeight: 'bold', fontSize: 18 },
  separator: { height: 1, backgroundColor: '#ccc' },
  textHead: {
    textAlign: 'center',
    marginTop:5,
    fontSize: calculateFontSize(22),
    //fontWeight: 'bold',
    fontFamily:'Fredoka-Bold',
  },brandText:{
    color:"#B85455",
    fontFamily:'Fredoka-Bold'
  },stepText:{
    marginTop:'3%',
    textAlign: 'left',
    paddingStart:'5%',
    fontWeight:'600',
    marginBottom:'1%',
    fontSize: calculateFontSize(20),
    fontFamily:'Fredoka-Bold',
  },ufComponent:{
    flexDirection:'row',
    justifyContent:'center',
    //marginTop:'2%'
  },familyNameComponent:{
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      width:'35%',
      marginStart:'0%',
      elevation:10,
      borderRadius: 18,
  },userNameComponent:{
      backgroundColor: "#FFFFFF",
      width:'42%',
      flexDirection: "row",
      marginStart:'2%',
      elevation:10,
      borderRadius: 18,
  },inputComponent:{
      fontSize:calculateFontSize(18),
      marginStart:'2%'
  },inputIcon: {
      marginLeft: '4%',
      alignSelf: "baseline",
      paddingTop:'7'
  },passwordsContainer:{
    flexDirection:'column',
    justifyContent:'center',
  },
  signUpButton: {
    backgroundColor: '#B85455',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  signUpText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
