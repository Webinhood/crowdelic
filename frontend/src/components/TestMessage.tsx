import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Wrap,
  WrapItem,
  useColorModeValue,
  IconButton,
  Tooltip,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FiStar, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiHelpCircle, 
  FiZap,
  FiHash,
  FiTrash2
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface TestMessageProps {
  message: {
    id?: string;
    test_id: string;
    persona_id: string;
    first_impression: string;
    personal_context: {
      digitalComfort: string;
      routineAlignment: string;
      locationRelevance: string;
      familyConsideration: string;
      financialPerspective: string;
    };
    benefits: string[];
    concerns: string[];
    decision_factors: string[];
    suggestions: string[];
    target_audience_alignment: {
      ageMatch: string;
      locationMatch: string;
      incomeMatch: string;
      interestOverlap: string;
      painPointRelevance: string;
    };
    tags: {
      negative: string[];
      positive: string[];
      opportunity: string[];
    };
    metadata: {
      sentiment: number;
      confidence: number;
      valueProposition: number;
      personalRelevance: number;
      implementationFeasibility: number;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  persona: {
    name: string;
    avatar?: string;
    occupation: string;
  };
  timestamp?: Date;
  onDelete?: (messageId: string) => void;
}

const TestMessage: React.FC<TestMessageProps> = ({ message, persona, timestamp, onDelete }) => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const sectionBgColor = useColorModeValue('gray.50', 'gray.700');
  const { t } = useTranslation();

  console.log('=== TestMessage Debug Logs ===');
  console.log('1. Raw message:', message);

  // Garantir que temos um objeto de conteúdo válido
  const content = React.useMemo(() => {
    console.log('2. Processing message content');
    
    if (!message) {
      console.log('No message found');
      return null;
    }

    // O conteúdo já deve ser um objeto
    console.log('3. Content:', message);
    return message;
  }, [message]);

  // Processar metadata separadamente
  const metadata = React.useMemo(() => {
    console.log('5. Processing metadata');
    
    if (!content.metadata) {
      console.log('No metadata found');
      return {};
    }

    // Metadata já deve ser um objeto
    console.log('6. Metadata:', content.metadata);
    return content.metadata;
  }, [content]);

  if (!content) {
    console.log('8. No valid content to display');
    return (
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Text color="red.500">Error: Unable to display message content</Text>
        <Text as="pre" fontSize="sm" mt={2}>
          Raw content: {JSON.stringify(message, null, 2)}
        </Text>
      </Box>
    );
  }

  // Extrair campos do conteúdo
  const {
    first_impression,
    personal_context,
    benefits = [],
    concerns = [],
    decision_factors = [],
    suggestions = [],
    target_audience_alignment = {},
    tags = {
      negative: [],
      positive: [],
      opportunity: []
    }
  } = content;

  const renderStars = (rating: number = 5) => {
    const normalizedRating = Math.max(1, Math.min(5, Math.ceil(rating / 2)));
    return Array(5)
      .fill('')
      .map((_, i) => (
        <FiStar
          key={i}
          fill={i < normalizedRating ? 'gold' : 'none'}
          color={i < normalizedRating ? 'gold' : 'gray.300'}
        />
      ));
  };

  const renderTags = (tags: string[] = [], color: string) => {
    return (tags || []).map((tag, index) => (
      <WrapItem key={index}>
        <Badge colorScheme={color} borderRadius="full" px={3} py={1}>
          <HStack spacing={1} align="center">
            <FiHash />
            <Text>{tag.replace('#', '')}</Text>
          </HStack>
        </Badge>
      </WrapItem>
    ));
  };

  const calculateOverallScore = () => {
    const scores = [
      metadata.sentiment,
      metadata.confidence,
      metadata.personalRelevance,
      metadata.valueProposition,
      metadata.implementationFeasibility
    ].filter(Boolean);
    
    return scores.length === 0 ? 0 : Math.max(1, Math.min(10, Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)));
  };

  const renderMetric = (label: string, value: number) => (
    <Box 
      p={2} 
      borderRadius="md" 
      borderWidth="1px" 
      borderColor={borderColor}
      bg={bgColor}
      width="100%"
      minW={0}
    >
      <VStack spacing={0} align="center">
        <Text 
          fontSize="2xs" 
          color="gray.500" 
          fontWeight="medium"
          textAlign="center"
          noOfLines={1}
          mb={1}
          px={1}
        >
          {label}
        </Text>
        <Box transform="scale(0.8)" transformOrigin="center">
          <HStack spacing={0} justify="center">
            {renderStars(value)}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );

  const handleDelete = (messageId: string) => {
    try {
      onDelete?.(messageId);
    } catch (error) {
      console.error('Failed to delete message:', messageId);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      p={6}
      mb={4}
      shadow="md"
    >
      {/* Header */}
      <HStack spacing={4} mb={6}>
        <Avatar name={persona.name} src={persona.avatar} />
        <Box flex="1">
          <Text fontWeight="bold">{persona.name}</Text>
          <Text fontSize="sm" color="gray.500">{persona.occupation}</Text>
        </Box>
        <HStack spacing={1}>
          {renderStars(calculateOverallScore())}
          {content.id && onDelete && (
            <Tooltip label={t('test.message.deleteTooltip')} placement="top">
              <IconButton
                aria-label={t('test.message.deleteButton')}
                icon={<FiTrash2 />}
                size="sm"
                variant="outline"
                colorScheme="red"
                ml={2}
                borderWidth="1px"
                onClick={() => handleDelete(content.id!)}
              />
            </Tooltip>
          )}
        </HStack>
      </HStack>

      {/* First Impression */}
      {first_impression && (
        <Box bg={sectionBgColor} p={4} borderRadius="md" mb={6}>
          <Text fontSize="lg" fontWeight="medium" mb={2}>{t('test.message.firstImpression')}</Text>
          <Text>{first_impression}</Text>
        </Box>
      )}

      {/* Benefits */}
      {benefits?.length > 0 && (
        <VStack spacing={4} align="stretch" mb={6}>
          <Text fontSize="lg" fontWeight="medium">{t('test.message.benefits')}</Text>
          <List spacing={3}>
            {benefits.map((benefit, index) => (
              <ListItem key={index}>
                <HStack align="start">
                  <ListIcon as={FiCheckCircle} color="green.500" mt={1} />
                  <Text>{benefit}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      )}

      {/* Concerns */}
      {concerns?.length > 0 && (
        <VStack spacing={4} align="stretch" mb={6}>
          <Text fontSize="lg" fontWeight="medium">{t('test.message.concerns')}</Text>
          <List spacing={3}>
            {concerns.map((concern, index) => (
              <ListItem key={index}>
                <HStack align="start">
                  <ListIcon as={FiAlertCircle} color="red.500" mt={1} />
                  <Text>{concern}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      )}

      {/* Decision Factors */}
      {decision_factors?.length > 0 && (
        <VStack spacing={4} align="stretch" mb={6}>
          <Text fontSize="lg" fontWeight="medium">{t('test.message.decisionFactors')}</Text>
          <List spacing={3}>
            {decision_factors.map((factor, index) => (
              <ListItem key={index}>
                <HStack align="start">
                  <ListIcon as={FiHelpCircle} color="blue.500" mt={1} />
                  <Text>{factor}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <VStack spacing={4} align="stretch" mb={6}>
          <Text fontSize="lg" fontWeight="medium">{t('test.message.suggestions')}</Text>
          <List spacing={3}>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <HStack align="start">
                  <ListIcon as={FiZap} color="yellow.500" mt={1} />
                  <Text>{suggestion}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      )}

      {/* Personal Context */}
      {personal_context && (
        <Box mb={6}>
          <Text fontSize="lg" fontWeight="medium" mb={4}>{t('test.personalContext.title')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {Object.entries(personal_context).map(([key, value]) => (
              <Box
                key={key}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
              >
                <Text fontWeight="medium" mb={2}>
                  {t(`test.personalContext.${key}`)}
                </Text>
                <Text fontSize="sm">{value}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Target Audience Alignment */}
      {target_audience_alignment && (
        <Box mb={6}>
          <Text fontSize="lg" fontWeight="medium" mb={4}>{t('test.message.targetAudience.title')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {Object.entries(target_audience_alignment).map(([key, value]) => (
              <Box
                key={key}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
              >
                <Text fontWeight="medium" mb={2}>
                  {t(`test.message.targetAudience.${key}`)}
                </Text>
                <Text fontSize="sm">{value}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Tags */}
      {tags && Object.keys(tags).length > 0 && (
        <Box>
          <Text fontSize="lg" fontWeight="medium" mb={4}>{t('test.message.tags.title')}</Text>
          <VStack spacing={4} align="stretch">
            {tags.positive?.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2} color="green.500">{t('test.message.tags.positive')}</Text>
                <Wrap spacing={2}>
                  {renderTags(tags.positive, 'green')}
                </Wrap>
              </Box>
            )}
            {tags.negative?.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2} color="red.500">{t('test.message.tags.negative')}</Text>
                <Wrap spacing={2}>
                  {renderTags(tags.negative, 'red')}
                </Wrap>
              </Box>
            )}
            {tags.opportunity?.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2} color="blue.500">{t('test.message.tags.opportunity')}</Text>
                <Wrap spacing={2}>
                  {renderTags(tags.opportunity, 'blue')}
                </Wrap>
              </Box>
            )}
          </VStack>
        </Box>
      )}

      {/* Metrics */}
      {metadata && Object.keys(metadata).length > 0 && (
        <Box mt={6}>
          <Text fontSize="lg" fontWeight="medium" mb={4}>{t('test.message.metrics.title')}</Text>
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            {metadata.sentiment && renderMetric(t('test.message.metrics.sentiment'), metadata.sentiment)}
            {metadata.confidence && renderMetric(t('test.message.metrics.confidence'), metadata.confidence)}
            {metadata.personalRelevance && renderMetric(t('test.message.metrics.relevance'), metadata.personalRelevance)}
            {metadata.valueProposition && renderMetric(t('test.message.metrics.value'), metadata.valueProposition)}
            {metadata.implementationFeasibility && renderMetric(t('test.message.metrics.feasibility'), metadata.implementationFeasibility)}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default TestMessage;
