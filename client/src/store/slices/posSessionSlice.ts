import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PosSessionState {
  cashierName: string;
  terminalId: string;
  selectedCategory: string | null;
  searchQuery: string;
  isOnline: boolean;
  activeView: 'grid' | 'table_map';
  soundEnabled: boolean;
}

const initialState: PosSessionState = {
  cashierName: 'Cashier Main',
  terminalId: 'POS-TERM-01',
  selectedCategory: null,
  searchQuery: '',
  isOnline: true,
  activeView: 'grid',
  soundEnabled: true,
};

export const posSessionSlice = createSlice({
  name: 'posSession',
  initialState,
  reducers: {
    setCashierName: (state, action: PayloadAction<string>) => {
      state.cashierName = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveView: (state, action: PayloadAction<'grid' | 'table_map'>) => {
      state.activeView = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const {
  setCashierName,
  setSelectedCategory,
  setSearchQuery,
  setActiveView,
  toggleSound,
  setOnlineStatus,
} = posSessionSlice.actions;

export default posSessionSlice.reducer;
