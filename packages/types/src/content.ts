import { Genre } from './genre';

export interface Content {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  releaseYear: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentWithGenres extends Content {
  genres: Genre[];
}

export interface ContentResponseDto {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  releaseYear: number;
  genres: Genre[];
  isWishlisted?: boolean;
  lastPosition?: number;
}

export interface ContentListResponseDto {
  id: number;
  title: string;
  thumbnailUrl: string;
  releaseYear: number;
  isWishlisted?: boolean;
}

export interface ContentCreateDto {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  releaseYear: number;
  genreIds: number[];
}

export interface ContentUpdateDto {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  releaseYear?: number;
  genreIds?: number[];
}

