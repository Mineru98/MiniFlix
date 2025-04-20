import { ContentListResponse } from "@/infrastructure/api";

export interface ContentCardProps {
  content: ContentListResponse;
  fallbackImageUrl?: string;
}
