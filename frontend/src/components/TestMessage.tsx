import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
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
  Icon,
  Collapse,
  Spacer,
} from '@chakra-ui/react';
import {
  FiStar,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
  FiZap,
  FiHash,
  FiTrash2,
} from 'react-icons/fi';
import { 
  FaUser, 
  FaBrain, 
  FaComments, 
  FaHandshake,
  FaLaptop,           // digital comfort
  FaClock,            // routine
  FaMapMarkerAlt,     // location
  FaUsers,            // family
  FaWallet,           // financial
  FaBirthdayCake,     // age
  FaMapPin,           // location match
  FaMoneyBillWave,    // income
  FaStar,             // interests
  FaBandAid,          // pain points
  FaChevronDown, 
  FaChevronRight,
  FaCopy,
  FaTrash,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useToast } from '@chakra-ui/react';

interface TestMessageProps {
  message: {
    id?: string;
    test_id: string;
    persona_id: string;
    first_impression: string;
    benefits: string[];
    concerns: string[];
    decision_factors: string[];
    suggestions: string[];
    tags: {
      negative: string[];
      positive: string[];
      opportunity: string[];
    };
    personal_context: {
      digital_comfort: string;
      routine_alignment: string;
      location_relevance: string;
      family_consideration: string;
      financial_perspective: string;
    };
    target_audience_alignment: {
      age_match: string;
      location_match: string;
      income_match: string;
      interest_overlap: string;
      pain_point_relevance: string;
    };
    metadata: {
      sentiment: number;
      confidence: number;
      value_proposition: number;
      personal_relevance: number;
      implementation_feasibility: number;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  messageNumber: number;
  persona: {
    name: string;
    avatar?: string;
    occupation: string;
  };
  timestamp?: Date;
  onDelete?: (messageId: string) => void;
  isNew?: boolean;
  onMessageViewed?: () => void;
}

const TestMessage: React.FC<TestMessageProps> = ({
  message,
  messageNumber,
  persona,
  timestamp,
  onDelete,
  isNew = false,
  onMessageViewed,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(isNew);

  useEffect(() => {
    setShowNewBadge(isNew);
  }, [isNew]);

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (newExpandedState && showNewBadge) {
      setShowNewBadge(false);
      onMessageViewed?.();
    }
  };

  const { t } = useTranslation();
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const highlightBgColor = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    if (isExpanded && showNewBadge) {
      setShowNewBadge(false);
    }
  }, [isExpanded]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.first_impression);
    toast({
      title: t('common.copied'),
      status: 'success',
      duration: 2000,
    });
  };

  // Garantir que temos um objeto de conteúdo válido
  const content = React.useMemo(() => {
    if (!message) {
      console.error('TestMessage: Mensagem inválida recebida:', message);
      return null;
    }

    // Validar campos obrigatórios
    if (!message.persona_id || !message.test_id) {
      console.error('TestMessage: Campos obrigatórios ausentes:', message);
      return null;
    }

    return message;
  }, [message]);

  // Processar metadata separadamente
  const metadata = React.useMemo(() => {
    if (!content?.metadata) {
      console.debug('TestMessage: Sem metadata disponível');
      return {};
    }
    return content.metadata;
  }, [content]);

  if (!content) {
    return (
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Text color="red.500">{t('test.message.error.invalidContent')}</Text>
      </Box>
    );
  }

  // Extrair dados relevantes
  const {
    first_impression,
    benefits = [],
    concerns = [],
    decision_factors = [],
    suggestions = [],
    tags = {},
    personal_context = {},
    target_audience_alignment = {},
  } = message || {};

  // Remover console.logs de debug que não são mais necessários
  const calculateOverallScore = () => {
    if (!metadata) return 0;

    const {
      sentiment = 0,
      confidence = 0,
      value_proposition = 0,
      personal_relevance = 0,
      implementation_feasibility = 0,
    } = metadata;

    return (
      sentiment +
      confidence +
      value_proposition +
      personal_relevance +
      implementation_feasibility
    ) / 5;
  };

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

  const personalContextLabels = {
    digital_comfort: 'Conforto Digital',
    routine_alignment: 'Alinhamento de Rotina',
    location_relevance: 'Relevância de Localização',
    family_consideration: 'Consideração Familiar',
    financial_perspective: 'Perspectiva Financeira',
  };

  const targetAudienceLabels = {
    age_match: 'Alinhamento de Idade',
    location_match: 'Alinhamento de Localização',
    income_match: 'Alinhamento de Renda',
    interest_overlap: 'Sobreposição de Interesses',
    pain_point_relevance: 'Relevância de Pontos de Dor',
  };

  const getPersonalContextIcon = (key: string) => {
    switch (key) {
      case 'digital_comfort':
        return FaLaptop;
      case 'routine_alignment':
        return FaClock;
      case 'location_relevance':
        return FaMapMarkerAlt;
      case 'family_consideration':
        return FaUsers;
      case 'financial_perspective':
        return FaWallet;
      default:
        return FaUsers;
    }
  };

  const getTargetAudienceIcon = (key: string) => {
    switch (key) {
      case 'age_match':
        return FaBirthdayCake;
      case 'location_match':
        return FaMapPin;
      case 'income_match':
        return FaMoneyBillWave;
      case 'interest_overlap':
        return FaStar;
      case 'pain_point_relevance':
        return FaBandAid;
      default:
        return FaUsers;
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      p={4}
      mb={0}
      position="relative"
    >
      {/* Cabeçalho da mensagem sempre visível */}
      <HStack spacing={4} mb={isExpanded ? 4 : 0} onClick={toggleExpand} cursor="pointer">
        <Icon
          as={isExpanded ? FaChevronDown : FaChevronRight}
          color={secondaryTextColor}
        />
        <Text fontWeight="bold" color={textColor}>
          Mensagem {messageNumber}
        </Text>
        {showNewBadge && (
          <Badge colorScheme="green" variant="solid">
            Nova
          </Badge>
        )}
        <Text fontSize="sm" color={secondaryTextColor}>
          {timestamp ? new Date(timestamp).toLocaleString('pt-BR') : ''}
        </Text>
        <Spacer />
        <HStack>
          <Tooltip label="Copiar mensagem" placement="top">
            <IconButton
              aria-label="Copy message"
              icon={<FaCopy />}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
            />
          </Tooltip>
          {onDelete && (
            <Tooltip label="Excluir mensagem" placement="top">
              <IconButton
                aria-label="Delete message"
                icon={<FaTrash />}
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(message.id);
                }}
              />
            </Tooltip>
          )}
        </HStack>
      </HStack>

      {/* Conteúdo colapsável */}
      <Collapse in={isExpanded} animateOpacity>
        <Box mb={6}>
          <Box 
            p={4} 
            bg={highlightBgColor} 
            borderRadius="md" 
            mb={4}
          >
            <Text color={textColor} whiteSpace="pre-wrap">
              {message.first_impression}
            </Text>
          </Box>
        </Box>

        {/* Contexto Pessoal */}
        <Box mb={6}>
          <Text fontSize="md" fontWeight="medium" mb={3}>{t('Contexto Pessoal')}</Text>
          <VStack align="stretch" spacing={3}>
            {Object.entries(message.personal_context || {}).map(([key, value]) => (
              <Box 
                key={key} 
                p={3} 
                borderWidth="1px" 
                borderColor={borderColor} 
                borderRadius="md"
              >
                <HStack spacing={2} mb={1}>
                  <Icon as={getPersonalContextIcon(key)} color="blue.500" />
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>{personalContextLabels[key] || t(key)}</Text>
                </HStack>
                <Text>{value}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Alinhamento com Público-Alvo */}
        <Box mb={6}>
          <Text fontSize="md" fontWeight="medium" mb={3}>{t('Alinhamento com Público-Alvo')}</Text>
          <VStack align="stretch" spacing={3}>
            {Object.entries(message.target_audience_alignment || {}).map(([key, value]) => (
              <Box 
                key={key} 
                p={3} 
                borderWidth="1px" 
                borderColor={borderColor} 
                borderRadius="md"
              >
                <HStack spacing={2} mb={1}>
                  <Icon as={getTargetAudienceIcon(key)} color="green.500" />
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>{targetAudienceLabels[key] || t(key)}</Text>
                </HStack>
                <Text>{value}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Benefícios */}
        {message.benefits?.length > 0 && (
          <Box mb={6}>
            <Text fontSize="md" fontWeight="medium" mb={3}>
              {t('test.message.benefits')}
            </Text>
            <List spacing={2}>
              {message.benefits.map((benefit, index) => (
                <ListItem key={index}>
                  <HStack align="start">
                    <ListIcon as={FiCheckCircle} color="green.500" mt={1} />
                    <Text>{benefit}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Preocupações */}
        {message.concerns?.length > 0 && (
          <Box mb={6}>
            <Text fontSize="md" fontWeight="medium" mb={3}>
              {t('test.message.concerns')}
            </Text>
            <List spacing={2}>
              {message.concerns.map((concern, index) => (
                <ListItem key={index}>
                  <HStack align="start">
                    <ListIcon as={FiAlertCircle} color="red.500" mt={1} />
                    <Text>{concern}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Sugestões */}
        {message.suggestions?.length > 0 && (
          <Box mb={6}>
            <Text fontSize="md" fontWeight="medium" mb={3}>
              {t('test.message.suggestions')}
            </Text>
            <List spacing={2}>
              {message.suggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <HStack align="start">
                    <ListIcon as={FiZap} color="yellow.500" mt={1} />
                    <Text>{suggestion}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Fatores de Decisão */}
        {message.decision_factors?.length > 0 && (
          <Box mb={6}>
            <Text fontSize="md" fontWeight="medium" mb={3}>
              {t('Fatores de Decisão')}
            </Text>
            <List spacing={2}>
              {message.decision_factors.map((factor, index) => (
                <ListItem key={index}>
                  <HStack align="start">
                    <ListIcon as={FiCheckCircle} color="purple.500" mt={1} />
                    <Text>{factor}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Tags */}
        {message.tags && Object.keys(message.tags).length > 0 && (
          <Box mb={6}>
            <Text fontSize="md" fontWeight="medium" mb={3}>
              {t('test.message.tags.title')}
            </Text>
            <VStack spacing={3} align="stretch">
              {message.tags.positive?.length > 0 && (
                <Box>
                  <Text fontSize="sm" color="green.500" mb={1}>
                    {t('test.message.tags.positive')}
                  </Text>
                  <Wrap spacing={2}>
                    {renderTags(message.tags.positive, 'green')}
                  </Wrap>
                </Box>
              )}
              {message.tags.negative?.length > 0 && (
                <Box>
                  <Text fontSize="sm" color="red.500" mb={1}>
                    {t('test.message.tags.negative')}
                  </Text>
                  <Wrap spacing={2}>
                    {renderTags(message.tags.negative, 'red')}
                  </Wrap>
                </Box>
              )}
              {message.tags.opportunity?.length > 0 && (
                <Box>
                  <Text fontSize="sm" color="blue.500" mb={1}>
                    {t('test.message.tags.opportunity')}
                  </Text>
                  <Wrap spacing={2}>
                    {renderTags(message.tags.opportunity, 'blue')}
                  </Wrap>
                </Box>
              )}
            </VStack>
          </Box>
        )}

        {/* Métricas */}
        {metadata && Object.keys(metadata).length > 0 && (
          <Box>
            <Text fontSize="md" fontWeight="medium" mb={3}>
              {t('test.message.metrics.title')}
            </Text>
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
              {metadata.sentiment && renderMetric(t('test.message.metrics.sentiment'), metadata.sentiment)}
              {metadata.confidence && renderMetric(t('test.message.metrics.confidence'), metadata.confidence)}
              {metadata.personal_relevance && renderMetric(t('test.message.metrics.relevance'), metadata.personal_relevance)}
              {metadata.value_proposition && renderMetric(t('test.message.metrics.value'), metadata.value_proposition)}
              {metadata.implementation_feasibility && renderMetric(t('test.message.metrics.feasibility'), metadata.implementation_feasibility)}
            </SimpleGrid>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default TestMessage;
