import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  HStack,
  Text,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import TypingIndicator from './TypingIndicator';

interface ThinkingMessageProps {
  persona: {
    name: string;
    avatar?: string;
    occupation: string;
  };
  isVisible: boolean;
}

const ThinkingMessage: React.FC<ThinkingMessageProps> = ({ persona, isVisible }) => {
  const { t } = useTranslation();
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const thinkingStates = [
    'analyzing',
    'reflecting',
    'organizing',
    'elaborating',
    'reviewing',
    'writing',
    'finishing'
  ];

  const clearCurrentInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startThinkingAnimation = () => {
    clearCurrentInterval();
    setCurrentStateIndex(0);

    intervalRef.current = setInterval(() => {
      setCurrentStateIndex(prevIndex => {
        const nextIndex = prevIndex >= thinkingStates.length - 1 
          ? thinkingStates.length - 1 
          : prevIndex + 1;

        if (nextIndex === thinkingStates.length - 1) {
          clearCurrentInterval();
        }

        return nextIndex;
      });
    }, 2500);
  };

  useEffect(() => {
    if (isVisible) {
      startThinkingAnimation();
    } else {
      clearCurrentInterval();
      setCurrentStateIndex(0);
    }

    return () => {
      clearCurrentInterval();
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      p={4}
      mb={4}
      width="100%"
    >
      <HStack spacing={4} align="flex-start">
        <Avatar
          size="md"
          name={persona.name}
          src={persona.avatar}
        />
        <Box flex={1}>
          <Text fontWeight="medium" fontSize="sm">{persona.name}</Text>
          <Text fontSize="xs" color={secondaryTextColor} mb={2}>{persona.occupation}</Text>
          <HStack spacing={2} align="center">
            <TypingIndicator />
            <Text fontSize="sm" color={secondaryTextColor}>
              {t(`test.thinking.states.${thinkingStates[currentStateIndex]}`)}
            </Text>
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default ThinkingMessage;
