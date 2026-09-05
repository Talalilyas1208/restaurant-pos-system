'use client';

import { useState } from 'react';
import { message } from 'antd';
import { MenuItem, SelectedModifier } from '../types';
import { CartLineItem } from '../components/menu/CartCheckoutDrawer';
import { useFoodOrder } from './useFoodOrder';
import { CardState, MobileWalletState } from '../components/payment/PaymentMethodSelector';

export function useTableCart() {
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNotes, setTableNotes] = useState<string>('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'easypaisa' | 'jazzcash'>('cash');
  const [cardState, setCardState] = useState<CardState>({ cardNumber: '', cardholderName: '', expiry: '', cvv: '' });
  const [easypaisaState, setEasypaisaState] = useState<MobileWalletState>({ senderMobile: '', transactionRef: '' });
  const [jazzcashState, setJazzcashState] = useState<MobileWalletState>({ senderMobile: '', transactionRef: '' });

  const { placeFoodOrder, activePlacedOrder, isSyncing } = useFoodOrder();

  const addDirect = (item: MenuItem, quantity: number, modifiers: SelectedModifier[], instructions: string) => {
    const modTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
    const unitPrice = item.price + modTotal;
    const keyMods = modifiers.map((m) => `${m.groupName}:${m.optionName}`).sort().join('|');
    const id = `${item.id}-${keyMods}-${instructions}`;

    setCartItems((prev) => {
      const idx = prev.findIndex((ci) => ci.id === id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        updated[idx].totalPrice = updated[idx].quantity * unitPrice;
        return updated;
      }
      return [...prev, { id, item, quantity, modifiers, instructions, totalPrice: unitPrice * quantity }];
    });
    message.success({ content: `Added ${item.name} to table cart`, duration: 1.5 });
  };

  const removeItem = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);

  const checkout = async (hotelId: string, tableId?: string, tableNumber = 'Table 1') => {
    if (cartItems.length === 0) return;
    try {
      await placeFoodOrder({
        hotelId,
        tableId,
        tableNumber,
        orderType: 'dine_in',
        source: 'qr_customer',
        customerName,
        customerNotes: tableNotes,
        subtotal,
        total: subtotal,
        paymentMethod,
        paymentDetails: {
          senderMobile: paymentMethod === 'easypaisa' ? easypaisaState.senderMobile : paymentMethod === 'jazzcash' ? jazzcashState.senderMobile : undefined,
          transactionRef: paymentMethod === 'easypaisa' ? easypaisaState.transactionRef : paymentMethod === 'jazzcash' ? jazzcashState.transactionRef : undefined,
          cardholderName: cardState.cardholderName,
          cardLast4: cardState.cardNumber.slice(-4),
        },
        items: cartItems.map((ci) => ({
          menuItemId: ci.item.id,
          name: ci.item.name,
          unitPrice: ci.totalPrice / ci.quantity,
          quantity: ci.quantity,
          totalPrice: ci.totalPrice,
          selectedModifiers: ci.modifiers,
          specialInstructions: ci.instructions,
        })),
      });
      setCartItems([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error('Failed to checkout:', err);
    }
  };

  return {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    customerName,
    setCustomerName,
    tableNotes,
    setTableNotes,
    paymentMethod,
    setPaymentMethod,
    cardState,
    setCardState,
    easypaisaState,
    setEasypaisaState,
    jazzcashState,
    setJazzcashState,
    activePlacedOrder,
    isSyncing,
    totalCount,
    subtotal,
    addDirect,
    removeItem,
    checkout,
  };
}
