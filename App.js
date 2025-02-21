import React from "react";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import store from './src/redux/store';
import * as SplashScreen from "expo-splash-screen"; // Optional for handling splash screen
import Toast from "react-native-toast-message";
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {  

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
        <Toast />
      </GestureHandlerRootView>
    </Provider>
  );}