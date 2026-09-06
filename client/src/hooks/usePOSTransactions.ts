import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppDispatch } from '../store';
import { clearCart, CartState, CartItem } from '../store/slices/cartSlice';
import { api } from '../lib/api';
import { Order, Hotel } from '../types';
import { CardPaymentData, RoomChargeData, BankTransferQRData } from '../components/payment';

export function usePOSTransactions() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'room_charge' | 'bank_transfer'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [lastPaidOrder, setLastPaidOrder] = useState<Order | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  // Sub-payment form states
  const [cardData, setCardData] = useState<CardPaymentData>({
    mode: 'terminal',
    cardBrand: 'Visa',
    cardLast4: '4242',
    authCode: 'AUTH-8921',
    transactionRef: 'TRX-1001',
  });

  const [roomData, setRoomData] = useState<RoomChargeData>({
    roomNumber: 'Room 204',
    guestName: 'Guest',
    folioId: 'FOLIO-101',
    isVerified: true,
  });

  const [bankQRData, setBankQRData] = useState<BankTransferQRData>({
    transferRef: 'UTR-9842109',
    senderName: 'Guest',
  });

  const confirmPayment = async ({
    hotel,
    cart,
    selectedWaiter,
    subtotal,
    tax,
    serviceCharge,
    discountAmount,
    grandTotal,
  }: {
    hotel?: Hotel;
    cart: CartState;
    selectedWaiter?: { id: string; name: string };
    subtotal: number;
    tax: number;
    serviceCharge: number;
    discountAmount: number;
    grandTotal: number;
  }) => {
    if (cart.items.length === 0) return;

    // 1. Instant complete receipt in memory (< 5ms)
    const generatedOrderNumber = `#POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const instantReceiptOrder: Order = {
      id: `ord-${Date.now()}`,
      hotelId: hotel?.id || '',
      tableId: cart.tableId || undefined,
      tableNumber: cart.tableNumber || (cart.orderType === 'room_service' ? `Room ${roomData.roomNumber}` : 'Takeaway'),
      orderNumber: generatedOrderNumber,
      orderType: cart.orderType,
      source: 'pos',
      status: 'completed',
      customerName: cart.customerName || 'Guest',
      customerNotes: cart.customerNotes,
      serverStaffId: selectedWaiter?.id,
      serverStaffName: selectedWaiter?.name,
      subtotal,
      tax,
      serviceCharge,
      discountAmount,
      total: grandTotal,
      paymentStatus: 'paid',
      items: cart.items.map((i: CartItem, idx: number) => ({
        id: `oi-${Date.now()}-${idx}`,
        menuItemId: i.menuItemId,
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
        selectedModifiers: i.selectedModifiers,
        specialInstructions: i.specialInstructions,
        status: 'served' as const,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLastPaidOrder(instantReceiptOrder);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    dispatch(clearCart());
    message.success('Receipt generated and ready to print!');

    // 2. Background checkout sync
    try {
      const checkoutPayload = {
        order: {
          hotelId: hotel?.id,
          tableId: cart.tableId || undefined,
          tableNumber: instantReceiptOrder.tableNumber,
          orderNumber: generatedOrderNumber,
          orderType: cart.orderType,
          source: 'pos' as const,
          customerName: cart.customerName || 'Guest',
          customerNotes: cart.customerNotes,
          serverStaffId: selectedWaiter?.id,
          serverStaffName: selectedWaiter?.name,
          subtotal,
          tax,
          serviceCharge,
          discountAmount,
          total: grandTotal,
          items: instantReceiptOrder.items,
        },
        payment: {
          hotelId: hotel?.id || '',
          paymentMethod,
          amount: grandTotal,
          tenderedAmount: paymentMethod === 'cash' ? cashTendered : grandTotal,
          changeDue: paymentMethod === 'cash' ? Math.max(0, cashTendered - grandTotal) : 0,
          roomNumber: paymentMethod === 'room_charge' ? roomData.roomNumber : undefined,
          guestName: paymentMethod === 'room_charge' ? roomData.guestName : bankQRData.senderName || undefined,
          cardBrand: paymentMethod === 'credit_card' ? cardData.cardBrand : undefined,
          cardLast4: paymentMethod === 'credit_card' ? cardData.cardLast4 : undefined,
          authCode: paymentMethod === 'credit_card' ? cardData.authCode : undefined,
          transactionRef: paymentMethod === 'credit_card'
            ? (cardData.transactionRef || cardData.authCode)
            : paymentMethod === 'bank_transfer'
            ? bankQRData.transferRef
            : undefined,
        },
      };

      const result = await api.checkoutOrder(checkoutPayload);
      if (result?.order) {
        setLastPaidOrder(result.order);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    } catch (err: any) {
      console.warn('Background checkout sync:', err?.message || err);
    }
  };

  return {
    paymentMethod,
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    lastPaidOrder,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    isSplitModalOpen,
    setIsSplitModalOpen,
    cardData,
    setCardData,
    roomData,
    setRoomData,
    bankQRData,
    setBankQRData,
    confirmPayment,
  };
}
