export type PaginationQueryParams = {
  page: number;
  size: number;
};

export type ResponseWithMetadata<T = Record<string, any>> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type ResponsePagingWithMetadata<T = Record<string, any>> = {
  success: boolean;
  message?: string;
  data: {
    content: T[];
    pageable: {
      pageNumber: number; // 현재 페이지
      pageSize: number; // 페이지당 요소 수
      offset: number; // 오프셋
    };
    totalPages: number; // 전체 페이지 수
    totalElements: number; // 전체 요소 수
    last: boolean; // 마지막 페이지인지 여부
    size: number; // 페이지당 요소 수
    number: number; // 현재 페이지
    numberOfElements: number; // 현재 페이지의 요소 수
    first: boolean; // 첫 페이지인지 여부
    empty: boolean; // 비어있는지 여부
  };
};
