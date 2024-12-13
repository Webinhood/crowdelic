import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  useToast,
  UseToastOptions,
  Spinner,
  Box,
  Portal,
  Fade,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

interface FeedbackContextType {
  showToast: (options: UseToastOptions) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0); }
  to { opacity: 1; backdrop-filter: blur(8px); }
`;

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  const showToast = useCallback(
    (options: UseToastOptions) => {
      toast({
        position: 'top-right',
        duration: 5000,
        isClosable: true,
        variant: 'solid',
        ...options,
      });
    },
    [toast]
  );

  const showSuccess = useCallback(
    (title: string, description?: string) => {
      showToast({
        title,
        description,
        status: 'success',
        duration: 3000,
      });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, description?: string) => {
      showToast({
        title,
        description,
        status: 'error',
        duration: 5000,
      });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string) => {
      showToast({
        title,
        description,
        status: 'info',
        duration: 4000,
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, description?: string) => {
      showToast({
        title,
        description,
        status: 'warning',
        duration: 4000,
      });
    },
    [showToast]
  );

  const showLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage('');
  }, []);

  return (
    <FeedbackContext.Provider
      value={{
        showToast,
        showLoading,
        hideLoading,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      <Portal>
        <Fade in={loading}>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
            animation={`${fadeIn} 0.2s ease-in-out`}
            bg="blackAlpha.300"
            backdropFilter="blur(8px)"
          >
            <Box
              bg={bgColor}
              color={textColor}
              px={8}
              py={6}
              borderRadius="xl"
              boxShadow="xl"
              display="flex"
              alignItems="center"
              gap={4}
            >
              <Spinner
                thickness="3px"
                speed="0.65s"
                color="brand.500"
                size="lg"
              />
              {loadingMessage}
            </Box>
          </Box>
        </Fade>
      </Portal>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
