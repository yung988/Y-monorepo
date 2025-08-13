import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type PickupPoint } from "@/types/pickup-points";

interface PickupPointState {
  point: PickupPoint | null;
}

const initialState: PickupPointState = {
  point: null,
};

const pickupPointSlice = createSlice({
  name: "pickupPoint",
  initialState,
  reducers: {
    setPickupPoint(state, action: PayloadAction<PickupPoint>) {
      state.point = action.payload;
    },
    clearPickupPoint(state) {
      state.point = null;
    },
  },
});

export const { setPickupPoint, clearPickupPoint } = pickupPointSlice.actions;
export default pickupPointSlice.reducer;
