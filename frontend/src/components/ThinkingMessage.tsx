import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  HStack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import TypingIndicator from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';

const MotionText = motion(Text);

interface ThinkingMessageProps {
  persona: {
    name: string;
    avatar?: string;
    occupation: string;
  };
  isVisible: boolean;
  compact?: boolean;
}

const ThinkingMessage: React.FC<ThinkingMessageProps> = ({ persona, isVisible, compact = false }) => {
  const { t } = useTranslation();
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const thinkingStates = [
    'Analisando conteúdo',  
    'Refletindo sobre o objetivo',
    'Organizando pensamentos',
    'Elaborando resposta',
    'Revisando detalhes',
    'Escrevendo resposta',
    'Finalizando'
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

  if (compact) {
    return (
      <AnimatePresence mode="wait">
        <HStack spacing={2} align="center">
          <MotionText
            fontSize="sm"
            color={secondaryTextColor}
            key={currentStateIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {thinkingStates[currentStateIndex]}
          </MotionText>
          <TypingIndicator size="sm" />
        </HStack>
      </AnimatePresence>
    );
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
        <Box flex={1}>
          <AnimatePresence mode="wait">
            <HStack spacing={2} align="center">
              <MotionText
                fontSize="sm"
                color={secondaryTextColor}
                key={currentStateIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {thinkingStates[currentStateIndex]}
              </MotionText>
              <TypingIndicator size="sm" />
            </HStack>
          </AnimatePresence>
        </Box>
      </HStack>
    </Box>
  );
};

export default ThinkingMessage;
