import { ContentDetailResponse } from "@/infrastructure/api/content/dtos";

export interface ContentDetailProps {
  contentId: number;
}

export interface ContentDetailViewProps {
  content?: ContentDetailResponse;
  isLoading: boolean;
  isError: boolean;
}
