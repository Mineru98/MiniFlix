import { ContentListResponse } from "@/infrastructure/api";

export interface ContentRowProps {
  title: string;
  contents: ContentListResponse[];
  isLoading?: boolean;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
}
