/** @format */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isConnected: boolean;
  username: string | null;
}

const initialState: AuthState = {
  isConnected: false,
  username: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isConnected = true;
      state.username = action.payload;
    },
    logout: (state) => {
      state.isConnected = false;
      state.username = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
