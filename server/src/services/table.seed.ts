import { DiningTable } from '../types/index.js';

export let fallbackTables: DiningTable[] = [
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-01', section: 'Main Dining', capacity: 2, qrCodeToken: 'gh-tbl-01', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-02', section: 'Main Dining', capacity: 4, qrCodeToken: 'gh-tbl-02', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-03', section: 'Main Dining', capacity: 4, qrCodeToken: 'gh-tbl-03', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-04', section: 'Main Dining', capacity: 6, qrCodeToken: 'gh-tbl-04', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-05', section: 'Patio Garden', capacity: 2, qrCodeToken: 'gh-tbl-05', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-06', section: 'Patio Garden', capacity: 4, qrCodeToken: 'gh-tbl-06', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-07', section: 'Patio Garden', capacity: 6, qrCodeToken: 'gh-tbl-07', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-08', section: 'Rooftop Terrace', capacity: 4, qrCodeToken: 'gh-tbl-08', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-09', section: 'VIP Lounge', capacity: 8, qrCodeToken: 'gh-tbl-09', status: 'available', activeOrderId: null },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10', hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tableNumber: 'T-10', section: 'Bar Counter', capacity: 2, qrCodeToken: 'gh-tbl-10', status: 'available', activeOrderId: null },
];

export function setFallbackTables(tables: DiningTable[]): void {
  fallbackTables = tables;
}

export function getFallbackTables(): DiningTable[] {
  return fallbackTables;
}
