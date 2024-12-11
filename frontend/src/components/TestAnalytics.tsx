import React from 'react';
import {
  Box,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TestMessage, TestAnalyticsData } from '../types/test';
import { Persona } from '../types/persona';

interface TestAnalyticsProps {
  messages: TestMessage[];
  personas: Persona[];
}

const TestAnalytics: React.FC<TestAnalyticsProps> = ({ messages, personas }) => {
  const { t } = useTranslation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const analytics: TestAnalyticsData = React.useMemo(() => {
    // Calcular estatísticas
    const stats = personas.map(persona => {
      const personaMessages = messages.filter(m => m.personaId === persona.id);
      const sentiments = personaMessages
        .map(m => m.metadata?.sentiment || 0)
        .filter(s => s > 0);

      return {
        personaId: persona.id,
        messageCount: personaMessages.length,
        averageSentiment: sentiments.length > 0
          ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
          : 0
      };
    });

    // Calcular sentimento geral
    const allSentiments = messages
      .map(m => m.metadata?.sentiment || 0)
      .filter(s => s > 0);
    const overallSentiment = allSentiments.length > 0
      ? allSentiments.reduce((a, b) => a + b, 0) / allSentiments.length
      : 0;

    return {
      overallSentiment,
      participationStats: stats
    };
  }, [messages, personas]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 4) return 'green';
    if (sentiment >= 3) return 'blue';
    if (sentiment >= 2) return 'yellow';
    return 'red';
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Estatísticas Gerais */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <Stat>
            <StatLabel>{t('test.analytics.overallSentiment.label')}</StatLabel>
            <StatNumber>
              <Badge colorScheme={getSentimentColor(analytics.overallSentiment)}>
                {analytics.overallSentiment.toFixed(1)}
              </Badge>
            </StatNumber>
            <StatHelpText>{t('test.analytics.overallSentiment.help')}</StatHelpText>
          </Stat>
        </Box>

        <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <Stat>
            <StatLabel>{t('test.analytics.totalMessages.label')}</StatLabel>
            <StatNumber>{messages.length}</StatNumber>
            <StatHelpText>{t('test.analytics.totalMessages.help')}</StatHelpText>
          </Stat>
        </Box>

        <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <Stat>
            <StatLabel>{t('test.analytics.activePersonas.label')}</StatLabel>
            <StatNumber>{personas.length}</StatNumber>
            <StatHelpText>{t('test.analytics.activePersonas.help')}</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export default TestAnalytics;
