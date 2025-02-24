import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';



const ScreenWrapper = ({ children, useScrollView = true }) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {useScrollView ? (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.contentContainer}>
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16, // ריווח פנימי לכל המסכים
  },
});

export default ScreenWrapper;
