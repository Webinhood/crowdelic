import React from 'react';
import {
  Badge,
  Tooltip,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiClock, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

interface TestStatusBadgeProps {
  status: 'running' | 'completed' | 'failed' | 'pending';
  previousStatus?: 'running' | 'completed' | 'failed' | 'pending';
}

const TestStatusBadge: React.FC<TestStatusBadgeProps> = ({ 
  status,
}) => {
  const { t } = useTranslation();

  // Garantir que o status seja um dos valores válidos
  const validStatus = ['running', 'completed', 'failed', 'pending'].includes(status) ? status : 'pending';

  const statusConfig = {
    running: {
      icon: FiLoader,
      color: 'blue',
    },
    completed: {
      icon: FiCheckCircle,
      color: 'green',
    },
    failed: {
      icon: FiXCircle,
      color: 'red',
    },
    pending: {
      icon: FiClock,
      color: 'orange',
    },
  };

  const config = statusConfig[validStatus];
  const iconColor = useColorModeValue(
    `${config.color}.500`,
    `${config.color}.200`
  );

  return (
    <Tooltip
      label={t(`test.status.tooltip.${validStatus}`)}
      placement="top"
      hasArrow
    >
      <HStack spacing={2}>
        <Icon
          as={config.icon}
          color={iconColor}
          boxSize="1.2em"
        />
        <Badge
          colorScheme={config.color}
          variant="solid"
        >
          {t(`test.status.${validStatus}`)}
        </Badge>
      </HStack>
    </Tooltip>
  );
};

export default TestStatusBadge;
