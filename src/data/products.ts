export type ProductType = 'split' | 'multi-split';

export interface Product {
  id: number;
  brand: string;
  model: string;
  type: ProductType;
  powerKw: number;
  areaCoverage: string;
  price: number;
  installationPrice: number;
  energyClass: string;
  features: string[];
  btu: number;
  brandColor: string;
  image?: string;
}
