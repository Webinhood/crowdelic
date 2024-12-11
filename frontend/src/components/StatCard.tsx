import React from 'react';
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';

interface StatCardProps {
  label: string;
  value?: string | number | null;
  helpText?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  helpText,
  isLoading = false,
}) => {
  const bg = useColorModeValue('white', 'gray.700');
  const displayValue = value ?? '-';
  
  return (
    <Box
      p={5}
      shadow="base"
      borderWidth="1px"
      borderRadius="lg"
      bg={bg}
      transition="all 0.2s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      position="relative"
      overflow="hidden"
      role="group"
    >
      <Skeleton isLoaded={!isLoading}>
        <Stat>
          <StatLabel fontSize="sm" color="gray.500" mb={1}>
            {label}
          </StatLabel>
          <StatNumber
            fontSize="2xl"
            fontWeight="bold"
            transition="color 0.2s"
            _groupHover={{ color: 'brand.500' }}
          >
            {displayValue}
          </StatNumber>
          {helpText && (
            <StatHelpText
              fontSize="sm"
              color="gray.500"
              mt={1}
              transition="opacity 0.2s"
              _groupHover={{ opacity: 0.8 }}
            >
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </Skeleton>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="2px"
        bg="brand.500"
        transform="scaleX(0)"
        transformOrigin="left"
        transition="transform 0.3s ease-in-out"
        _groupHover={{ transform: 'scaleX(1)' }}
      />
    </Box>
  );
};

export default StatCard;
