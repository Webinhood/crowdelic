import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue as useChakraColorModeValue,
} from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const ErrorUI: React.FC<{ error: Error | undefined; onReset: () => void }> = ({ error, onReset }) => {
  const bgColor = useChakraColorModeValue('gray.50', 'gray.900');
  const boxBgColor = useChakraColorModeValue('white', 'gray.800');

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      bg={bgColor}
    >
      <VStack spacing={6} maxW="600px" textAlign="center">
        <Heading size="xl">Oops! Something went wrong</Heading>
        <Text color={useChakraColorModeValue('gray.600', 'gray.400')}>
          We're sorry, but something unexpected happened. Please try reloading the page or go back to the home page.
        </Text>
        {process.env.NODE_ENV === 'development' && error && (
          <Box
            p={4}
            bg={boxBgColor}
            borderRadius="md"
            shadow="sm"
            width="100%"
            overflowX="auto"
          >
            <Text fontFamily="monospace" fontSize="sm" whiteSpace="pre-wrap">
              {error.toString()}
            </Text>
          </Box>
        )}
        <Box>
          <Button
            colorScheme="brand"
            onClick={onReset}
            mr={4}
          >
            Reload Page
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorUI error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
