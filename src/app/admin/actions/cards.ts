'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface EmployeeCard {
  id: number;
  slug: string;
  token: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getCards(): Promise<EmployeeCard[]> {
  const { data, error } = await supabaseAdmin
    .from('employees_cards')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as EmployeeCard[];
}

export async function createCard(card: Omit<EmployeeCard, 'id' | 'created_at' | 'token'>) {
  const { error } = await supabaseAdmin.from('employees_cards').insert(card);
  if (error) throw error;
  revalidatePath('/card');
}

export async function updateCard(id: number, card: Partial<Omit<EmployeeCard, 'id' | 'created_at'>>) {
  const { error } = await supabaseAdmin.from('employees_cards').update(card).eq('id', id);
  if (error) throw error;
  revalidatePath('/card');
}

export async function deleteCard(id: number) {
  const { error } = await supabaseAdmin.from('employees_cards').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/card');
}
