import NDK from "@nostrband/ndk";
import { createSlice } from "@reduxjs/toolkit";
type connectionType = {
  ndk: NDK;
  ndkAll: NDK;
};

const initialState: connectionType = {
  ndk: new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] }),
  ndkAll: new NDK({ explicitRelayUrls: ["wss://relay.nostr.band/all"] }),
};

export const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setNdk(state, action) {
      state = { ...state, ndk: action.payload };
      return state;
    },
    setNdkAll(state, action) {
      state = { ...state, ndk: action.payload };
      return state;
    },
  },
});

export default connectionSlice.reducer;
