import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./types";

interface UserState {
  users: User[];
  currentUser: User | null;
  isPending: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  isPending: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isPending = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUsers,
  setCurrentUser,
  addUser,
  updateUser,
  removeUser,
  setLoading,
  setError,
} = userSlice.actions;

export { userSlice };
