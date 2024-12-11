import React from 'react';
import {
  Box,
  Flex,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(0.95); }
  50% { transform: scale(1.05); }
  100% { transform: scale(0.95); }
`;

export const LoadingScreen: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const spinnerColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      zIndex={9999}
    >
      <Box
        textAlign="center"
        animation={`${pulse} 2s ease-in-out infinite`}
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color={spinnerColor}
          size="xl"
          mb={4}
        />
        <Text
          color={textColor}
          fontSize="lg"
          fontWeight="medium"
        >
          Loading...
        </Text>
      </Box>
    </Flex>
  );
};

export default LoadingScreen;
