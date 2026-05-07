import type { CustomerData, FootTrafficEntry, UserProfile, UserRole } from '../types';

export interface SalespersonProfileRow {
  id: string;
  auth_user_id: string | null;
  email: string;
  display_name: string;
  salesperson_id: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  created_at: string;
  salesperson_profile_id: string;
  payload: CustomerData;
}

export interface FootTrafficRow {
  id: string;
  created_at: string;
  salesperson_profile_id: string;
  payload: FootTrafficEntry;
}

export function mapProfileRow(row: SalespersonProfileRow): UserProfile {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
    displayName: row.display_name,
    salespersonId: row.salesperson_id,
    role: row.role,
    active: row.active,
  };
}

export function mapLeadRows(rows: LeadRow[]) {
  return rows.map((row) => ({
    ...row.payload,
    id: row.payload.id || row.id,
    timestamp: row.payload.timestamp || row.created_at,
  }));
}

export function mapFootTrafficRows(rows: FootTrafficRow[]) {
  return rows.map((row) => ({
    ...row.payload,
    id: row.payload.id || row.id,
    timestamp: row.payload.timestamp || row.created_at,
  }));
}
