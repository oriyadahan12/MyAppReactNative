import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/login/Login';
import Register from '../screens/login/Register';
import Family from '../screens/family/Family';
import UpdateDetails from '../screens/family/UpdateDetails';
import AddChild from '../screens/family/AddChild';
import ChildCard from '../screens/children/ChildCard';

import MileStones from '../screens/children/MileStones';
import UpdateChild from '../screens/children/UpdateChild';

import ScreenWrapper from '../components/ScreenWrapper'; // הוספת ה-Wrapper

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login">
          {() => (
            <ScreenWrapper>
              <Login />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {() => (
            <ScreenWrapper>
              <Register />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Family">
          {() => (
            <ScreenWrapper>
              <Family />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="UpdateDetails">
          {() => (
            <ScreenWrapper>
              <UpdateDetails />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="AddChild">
          {() => (
            <ScreenWrapper>
              <AddChild />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="ChildCard">
          {() => (
            <ScreenWrapper>
              <ChildCard />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="MileStones">
          {() => (
            <ScreenWrapper>
              <MileStones />
            </ScreenWrapper>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
