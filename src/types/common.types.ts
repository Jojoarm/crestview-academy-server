export type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
