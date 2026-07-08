'use server';

import { listCards } from '@/lib/db';
import type { EmployeeCard } from '@/lib/types';

export type { EmployeeCard };

export async function getCards(): Promise<EmployeeCard[]> {
  return listCards();
}
