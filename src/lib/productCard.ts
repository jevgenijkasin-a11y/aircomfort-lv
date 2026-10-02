// Product card data: only what a card shows. Built on the server, so client
// components (catalog, calculator) never receive full product objects with
// descriptions, features and specs.
import { type SupabaseProduct, productName, productImages } from './types';
import { areaLabel, roomCount, asLoc } from './productSeo';
import { fanSpec } from './fanCoil';

export type CardProduct = {
  id: string;
  brand: string;
  /** Name in the page language */
  name: string;
  category: string;
  power_kw: number;
  price: number;
  discount_percent: number | null;
  energy_class: string;
  is_hit: boolean;
  is_promo: boolean;
  /** First photo or null */
  image: string | null;
  /** Localized served area without unit ("20–30"), or null */
  area: string | null;
  /** Multi-split: number of rooms, or null */
  rooms: number | null;
  /** Fan coils: "2" / "4" pipes and AC / EC motor ('' otherwise) */
  pipes: string;
  motor: string;
};

export function toCard(p: SupabaseProduct, locale: string): CardProduct {
  return {
    id: p.id,
    brand: p.brand,
    name: productName(p, locale),
    category: p.category,
    power_kw: p.power_kw,
    price: p.price,
    discount_percent: p.discount_percent ?? null,
    energy_class: p.energy_class,
    is_hit: !!p.is_hit,
    is_promo: !!p.is_promo,
    image: productImages(p)[0] ?? null,
    area: areaLabel(p, asLoc(locale)),
    rooms: roomCount(p),
    pipes: fanSpec(p, 'pipe_system'),
    motor: fanSpec(p, 'fan_motor'),
  };
}

export const toCards = (list: SupabaseProduct[], locale: string) => list.map((p) => toCard(p, locale));
