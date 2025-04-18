export interface Genre {
  id: number;
  name: string;
  description: string;
}

export interface GenreResponseDto {
  id: number;
  name: string;
}

export interface GenreCreateDto {
  name: string;
  description: string;
}

export interface GenreUpdateDto {
  name?: string;
  description?: string;
} 