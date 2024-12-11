import React from 'react';
import { Box, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      p={8}
      borderWidth="1px"
      borderRadius="lg"
      borderStyle="dashed"
      textAlign="center"
    >
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="medium">
          {title}
        </Text>
        <Text color="gray.500">{description}</Text>
        {actionLabel && onAction && (
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="brand"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState;
