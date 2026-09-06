import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, SelectedModifier } from '../../types';

export interface CartItem {
  id: string; // generated unique key (menuItemId + serialized modifiers)
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedModifiers?: SelectedModifier[];
  specialInstructions?: string;
  imageUrl?: string;
}

export interface CartState {
  items: CartItem[];
  tableId: string | null;
  tableNumber: string | null;
  customerName: string;
  customerPhone: string;
  customerNotes: string;
  orderType: 'dine_in' | 'room_service' | 'takeaway' | 'delivery';
  discountPercent: number;
}

const initialState: CartState = {
  items: [],
  tableId: null,
  tableNumber: null,
  customerName: 'Guest',
  customerPhone: '',
  customerNotes: '',
  orderType: 'dine_in',
  discountPercent: 0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setTable: (state, action: PayloadAction<{ tableId: string | null; tableNumber: string | null }>) => {
      state.tableId = action.payload.tableId;
      state.tableNumber = action.payload.tableNumber;
    },
    setCustomerInfo: (
      state,
      action: PayloadAction<{ customerName?: string; customerPhone?: string; customerNotes?: string }>
    ) => {
      if (action.payload.customerName !== undefined) state.customerName = action.payload.customerName;
      if (action.payload.customerPhone !== undefined) state.customerPhone = action.payload.customerPhone;
      if (action.payload.customerNotes !== undefined) state.customerNotes = action.payload.customerNotes;
    },
    setOrderType: (state, action: PayloadAction<'dine_in' | 'room_service' | 'takeaway' | 'delivery'>) => {
      state.orderType = action.payload;
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discountPercent = Math.max(0, Math.min(100, action.payload));
    },
    addToCart: (
      state,
      action: PayloadAction<{
        item: MenuItem;
        quantity?: number;
        modifiers?: SelectedModifier[];
        instructions?: string;
      }>
    ) => {
      const { item, quantity = 1, modifiers = [], instructions = '' } = action.payload;
      const modTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
      const unitPrice = item.price + modTotal;
      const keyModifiers = modifiers.map((m) => `${m.groupName}:${m.optionName}`).sort().join('|');
      const cartItemId = `${item.id}-${keyModifiers}-${instructions}`;

      const existingIndex = state.items.findIndex((ci) => ci.id === cartItemId);
      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
        state.items[existingIndex].totalPrice = state.items[existingIndex].quantity * unitPrice;
      } else {
        state.items.push({
          id: cartItemId,
          menuItemId: item.id,
          name: item.name,
          unitPrice,
          quantity,
          totalPrice: unitPrice * quantity,
          selectedModifiers: modifiers,
          specialInstructions: instructions,
          imageUrl: item.imageUrl,
        });
      }
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) {
          item.quantity = quantity;
          item.totalPrice = item.quantity * item.unitPrice;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.customerNotes = '';
      state.discountPercent = 0;
    },
  },
});

export const {
  setTable,
  setCustomerInfo,
  setOrderType,
  setDiscount,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
