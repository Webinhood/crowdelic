export class ApiError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(message: string, status: number, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromAxiosError(error: any): ApiError {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    
    // Extract meaningful information from the error
    const message = data.message || error.message || 'An unexpected error occurred';
    const code = data.code || `HTTP_${status}`;
    const details = data.details || undefined;

    return new ApiError(message, status, code, details);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details
    };
  }
}

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
};
