'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface EmployeeCard {
  id: string;
  slug: string;
  token: string;
  name: string;
  title: string;
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
