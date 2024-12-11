import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { isApiError, getErrorMessage } from '../utils/errors';

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = useCallback((error: any) => {
    const message = getErrorMessage(error);
    
    // Customize toast based on error type
    const toastProps = {
      title: isApiError(error) ? `Error ${error.status}` : 'Error',
      description: message,
      status: 'error' as const,
      duration: 5000,
      isClosable: true,
      position: 'top-right' as const,
    };

    // Show error toast
    toast(toastProps);

    // Log only if it's not an API error (since API errors are already logged)
    if (!isApiError(error)) {
      console.error('Application Error:', error);
    }
  }, [toast]);

  return handleError;
};
