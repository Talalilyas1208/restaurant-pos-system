'use client';

import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setTable,
  setDiscount,
  setCustomerInfo,
  setOrderType,
} from '../../store/slices/cartSlice';
import { setOnlineStatus } from '../../store/slices/posSessionSlice';
import { MenuItem } from '../../types';
import POSTopBar from '../../components/pos/POSTopBar';
import POSCatalogView from '../../components/pos/POSCatalogView';
import POSTablesView from '../../components/pos/POSTablesView';
import POSTicketSidebar from '../../components/pos/POSTicketSidebar';
import POSPaymentModal from '../../components/pos/POSPaymentModal';
import POSModals from '../../components/pos/POSModals';
import FloatingCartBar from '../../components/menu/FloatingCartBar';
import { usePOSTransactions } from '../../hooks/usePOSTransactions';
import { usePOSData } from '../../hooks/usePOSData';

export default function POSTerminalPage() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const isOnline = useAppSelector((state) => state.posSession.isOnline);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'cart'>('menu');
  const [selectedItemForMod, setSelectedItemForMod] = useState<MenuItem | null>(null);

  const pos = usePOSData(cart);
  const tx = usePOSTransactions();

  useEffect(() => {
    const handleOnline = () => { dispatch(setOnlineStatus(true)); message.success({ content: 'Back online — data syncing…', key: 'connectivity', duration: 2 }); };
    const handleOffline = () => { dispatch(setOnlineStatus(false)); message.warning({ content: 'You are offline', key: 'connectivity', duration: 0 }); };
    dispatch(setOnlineStatus(navigator.onLine));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [dispatch]);

  useEffect(() => {
    document.title = pos.totalCartQty > 0 ? `(${pos.totalCartQty}) Order Ticket — POS Project` : 'POS Project Terminal';
  }, [pos.totalCartQty]);

  const filteredItems = pos.menuItems.filter((item) => {
    const matchesCat = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleItemClick = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedItemForMod(item);
    } else {
      dispatch(addToCart({ item }));
      message.success({ content: `Added ${item.name} to cart`, duration: 1 });
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100 text-slate-900 relative">
      <div className={`flex-1 flex-col h-full overflow-hidden border-r border-slate-200 bg-slate-50 ${activeTab === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        <POSTopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tableNumber={cart.tableNumber}
          totalCartQty={pos.totalCartQty}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isOnline={isOnline}
        />
        {activeTab === 'menu' ? (
          <POSCatalogView
            categories={pos.categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            menuItemsCount={pos.menuItems.length}
            filteredItems={filteredItems}
            cartItems={cart.items}
            onItemClick={handleItemClick}
          />
        ) : (
          <POSTablesView
            tables={pos.tables}
            selectedTableId={cart.tableId}
            onSelectTable={(tbl) => {
              dispatch(setTable({ tableId: tbl.id, tableNumber: tbl.tableNumber }));
              setActiveTab('menu');
              message.info(`Assigned to Table ${tbl.tableNumber}`);
            }}
          />
        )}
      </div>

      <POSTicketSidebar
        activeTab={activeTab}
        onBackToMenu={() => setActiveTab('menu')}
        cart={cart}
        activeStaff={pos.activeStaff}
        selectedWaiter={pos.selectedWaiter}
        onSelectWaiter={pos.setSelectedWaiter}
        onClearCart={() => dispatch(clearCart())}
        onChangeOrderType={(val) => dispatch(setOrderType(val))}
        onChangeCustomerName={(val) => dispatch(setCustomerInfo({ customerName: val }))}
        onRemoveItem={(id) => dispatch(removeFromCart(id))}
        onUpdateQuantity={(id, qty) => dispatch(updateQuantity({ id, quantity: qty }))}
        subtotal={pos.subtotal}
        taxRate={pos.taxRate}
        tax={pos.tax}
        serviceChargeRate={pos.serviceChargeRate}
        serviceCharge={pos.serviceCharge}
        discountAmount={pos.discountAmount}
        grandTotal={pos.grandTotal}
        onSetDiscount={(d) => dispatch(setDiscount(d))}
        onOpenSplitModal={() => tx.setIsSplitModalOpen(true)}
        onCheckout={() => {
          if (cart.items.length === 0) return;
          tx.setCashTendered(pos.grandTotal);
          tx.setIsPaymentModalOpen(true);
        }}
      />

      <POSPaymentModal
        isOpen={tx.isPaymentModalOpen}
        onClose={() => tx.setIsPaymentModalOpen(false)}
        grandTotal={pos.grandTotal}
        hotel={pos.hotel}
        paymentMethod={tx.paymentMethod}
        onChangeMethod={tx.setPaymentMethod}
        cashTendered={tx.cashTendered}
        onChangeCashTendered={tx.setCashTendered}
        cardData={tx.cardData}
        onChangeCardData={tx.setCardData}
        roomData={tx.roomData}
        onChangeRoomData={tx.setRoomData}
        bankQRData={tx.bankQRData}
        onChangeBankQRData={tx.setBankQRData}
        onConfirmPayment={() => tx.confirmPayment({
          hotel: pos.hotel,
          cart,
          selectedWaiter: pos.selectedWaiter,
          subtotal: pos.subtotal,
          tax: pos.tax,
          serviceCharge: pos.serviceCharge,
          discountAmount: pos.discountAmount,
          grandTotal: pos.grandTotal,
        })}
      />

      <POSModals
        hotel={pos.hotel}
        selectedItemForMod={selectedItemForMod}
        onCloseModifierModal={() => setSelectedItemForMod(null)}
        onConfirmModifier={(p) => {
          dispatch(addToCart({ item: p.item, quantity: p.quantity, modifiers: p.modifiers, instructions: p.instructions }));
          message.success({ content: `Added ${p.item.name} with modifiers`, duration: 1.5 });
        }}
        isSplitModalOpen={tx.isSplitModalOpen}
        onCloseSplitModal={() => tx.setIsSplitModalOpen(false)}
        grandTotal={pos.grandTotal}
        isReceiptModalOpen={tx.isReceiptModalOpen}
        onCloseReceiptModal={() => tx.setIsReceiptModalOpen(false)}
        lastPaidOrder={tx.lastPaidOrder}
        paymentMethod={tx.paymentMethod}
        cashTendered={tx.cashTendered}
        cardData={tx.cardData}
        roomData={tx.roomData}
        bankQRData={tx.bankQRData}
      />

      {activeTab !== 'cart' && (
        <div className="lg:hidden">
          <FloatingCartBar
            totalCount={pos.totalCartQty}
            subtotal={pos.grandTotal}
            currencySymbol={pos.hotel?.currencySymbol || '$'}
            onOpenCart={() => setActiveTab('cart')}
          />
        </div>
      )}
    </div>
  );
}
