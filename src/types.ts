export interface Card {
  id: string;
  english: string;
  russian: string;
  category?: string;
  image?: string;
  description?: string;
}

export type DirectionMode = 'EN_TO_RU' | 'RU_TO_EN';
