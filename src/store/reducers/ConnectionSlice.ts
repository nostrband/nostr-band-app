import NDK from "@nostrband/ndk";
import { createSlice } from "@reduxjs/toolkit";
type connectionType = {
  ndk: NDK;
};

const initialState: connectionType = {
  ndk: new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] }),
};

export const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setNdk(state, action) {
      state = { ...state, ndk: action.payload };
      return state;
    },
  },
});

export default connectionSlice.reducer;
