import {
  ContentDetailResponse,
  ContentListResponse,
} from "@/infrastructure/api";

export interface BannerProps {
  content: Partial<ContentDetailResponse> | ContentListResponse;
  fallbackImageUrl?: string;
}
