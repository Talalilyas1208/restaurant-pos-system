'use client';

import React from 'react';
import { message } from 'antd';
import { MenuItem, Hotel } from '../../types';
import ItemModifierModal from '../ItemModifierModal';
import SplitBillModal from '../SplitBillModal';
import ReceiptModal from '../ReceiptModal';

interface POSModalsProps {
  hotel?: Hotel | null;
  selectedItemForMod: MenuItem | null;
  onCloseModifierModal: () => void;
  onConfirmModifier: (payload: { item: MenuItem; quantity: number; modifiers: any[]; instructions: string }) => void;
  isSplitModalOpen: boolean;
  onCloseSplitModal: () => void;
  grandTotal: number;
  isReceiptModalOpen: boolean;
  onCloseReceiptModal: () => void;
  lastPaidOrder: any;
  paymentMethod: string;
  cashTendered: number;
  cardData: any;
  roomData: any;
  bankQRData: any;
}

export default function POSModals({
  hotel,
  selectedItemForMod,
  onCloseModifierModal,
  onConfirmModifier,
  isSplitModalOpen,
  onCloseSplitModal,
  grandTotal,
  isReceiptModalOpen,
  onCloseReceiptModal,
  lastPaidOrder,
  paymentMethod,
  cashTendered,
  cardData,
  roomData,
  bankQRData,
}: POSModalsProps) {
  return (
    <>
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={onCloseReceiptModal}
        order={lastPaidOrder}
        hotel={hotel || null}
        tenderedAmount={paymentMethod === 'cash' ? cashTendered : grandTotal}
        changeDue={paymentMethod === 'cash' ? Math.max(0, cashTendered - grandTotal) : 0}
        paymentMethod={paymentMethod}
        cardBrand={paymentMethod === 'credit_card' ? cardData.cardBrand : undefined}
        cardLast4={paymentMethod === 'credit_card' ? cardData.cardLast4 : undefined}
        authCode={paymentMethod === 'credit_card' ? cardData.authCode : undefined}
        roomNumber={paymentMethod === 'room_charge' ? roomData.roomNumber : undefined}
        transferRef={paymentMethod === 'bank_transfer' ? bankQRData.transferRef : undefined}
      />

      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={onCloseSplitModal}
        totalAmount={grandTotal}
        onSettleSplit={(shares) =>
          message.success(`Bill split into ${shares.length} parts of $${shares[0].toFixed(2)} each!`)
        }
      />

      <ItemModifierModal
        item={selectedItemForMod}
        isOpen={!!selectedItemForMod}
        onClose={onCloseModifierModal}
        onConfirm={onConfirmModifier}
      />
    </>
  );
}

