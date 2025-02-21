// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';

// Reducer definition
const initialState = {
  user: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create store with configureStore
const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
