import React from 'react';
import { Box, HStack, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
`;

interface TypingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ size = 'md' }) => {
  const dotColor = useColorModeValue('gray.500', 'gray.400');
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  
  const dotSizes = {
    sm: '4px',
    md: '6px',
    lg: '8px',
  };

  const containerSizes = {
    sm: '24px',
    md: '32px',
    lg: '40px',
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="full"
      p={size === 'sm' ? 1 : 2}
      width={containerSizes[size]}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <HStack spacing={1}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            width={dotSizes[size]}
            height={dotSizes[size]}
            borderRadius="full"
            bg={dotColor}
            sx={{
              animation: `${bounce} 1.4s infinite ease-in-out both`,
              animationDelay: `${i * 0.16}s`
            }}
          />
        ))}
      </HStack>
    </Box>
  );
};

export default TypingIndicator;
