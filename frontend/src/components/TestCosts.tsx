import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { getTestUsageStats } from '@services/costs';

interface TestCostsProps {
  testId: string;
}

const TestCosts: React.FC<TestCostsProps> = ({ testId }) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['test-costs', testId],
    queryFn: () => getTestUsageStats(testId),
    enabled: !!testId,
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return null;
  }

  if (error) {
    return null;
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(value);
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="md"
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Stat>
          <StatLabel>Custo Total</StatLabel>
          <StatNumber>{formatCurrency(stats.total_cost)}</StatNumber>
          <StatHelpText>{stats.total_tokens.toLocaleString()} tokens</StatHelpText>
        </Stat>

        <Divider />

        <Text fontSize="sm" fontWeight="medium">
          Detalhamento por Modelo
        </Text>

        {stats.model_breakdown.map((model, index) => (
          <HStack key={index} justify="space-between">
            <Text fontSize="sm">{model.model}</Text>
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="sm" fontWeight="medium">
                {formatCurrency(model.cost)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {model.tokens.toLocaleString()} tokens
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default TestCosts;
