export type PaginationResultDto = {
    totalAmountRecords?: number;
    totalAmountPages?: number;
    currentPage?: number;
    recordsPerPage?: number;
    pageIndex?: number;
};

export type PaginationDto = {
    page?: number;
    recordsPerPage?: number;
};

export type SortDto = {
    orderingField?: string;
    ascendingOrder?: boolean;
};

export type PaginationSortableDto = PaginationDto & SortDto;

export type ServiceResponse<T> = {
    data?: T;
    isSuccess?: boolean;
    message?: string;
    code?: number;
    exceptionMessage?: string;
    serverDateTime?: string;
};

export type ServiceResponsePagination<T> = ServiceResponse<T> & PaginationResultDto;
