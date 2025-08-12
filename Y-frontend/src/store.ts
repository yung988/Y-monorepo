import { configureStore } from "@reduxjs/toolkit";
import pickupPointReducer from "./slices/pickupPointSlice";

export const store = configureStore({
  reducer: {
    pickupPoint: pickupPointReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
