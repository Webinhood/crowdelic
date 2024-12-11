import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Card,
  IconButton,
  Divider,
  useToast,
  Wrap,
  WrapItem,
  Tag,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Avatar,
  Tooltip,
  Badge,
  Spinner,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Select,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { FaRobot, FaUser, FaComments, FaPlay, FaStop, FaEdit, FaArrowLeft, FaClock, FaLayerGroup, FaFileAlt, FaEye, FaEyeSlash, FaChevronDown, FaHeart, FaThumbsUp, FaThumbsDown, FaTags, FaLink } from 'react-icons/fa';
import { getTest, runTest, stopTest, getTestResults, getLiveMessages, updateTest, getTestMessages } from '@services/test';
import { deleteTestMessage } from '@services/api';
import { getPersonasByIds } from '@services/persona';
import TestStatusBadge from '@components/TestStatusBadge';
import TestAnalytics from '@components/TestAnalytics';
import TestCosts from '@components/TestCosts';
import TestMessage from '../components/TestMessage';
import ThinkingMessage from '../components/ThinkingMessage';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTranslation } from 'react-i18next';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Test } from '@types/test';
import { Persona } from '@types/persona';
import { TestViewOptions, TestMessage as TestMessageType } from '../types/test';

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { t } = useTranslation();

  const [liveMessages, setLiveMessages] = React.useState<TestMessageType[]>([]);
  const [viewOptions, setViewOptions] = React.useState<TestViewOptions>({
    viewMode: 'timeline',
    groupBy: 'persona',
    sortBy: 'time'
  });
  const [thinkingPersonas, setThinkingPersonas] = useState<Set<string>>(new Set());
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Theme hooks
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  // Queries
  const { data: test, isLoading: isLoadingTest } = useQuery({
    queryKey: ['test', id],
    queryFn: () => getTest(id!),
    enabled: !!id,
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['testMessages', id],
    queryFn: () => getTestMessages(id!),
    enabled: !!id,
    refetchInterval: test?.status === 'running' ? 1000 : false,
  });

  const { data: personas = [], isLoading: isLoadingPersonas } = useQuery({
    queryKey: ['personas', test?.personaIds],
    queryFn: async () => {
      if (!test?.personaIds?.length) {
        console.log('No persona IDs available');
        return [];
      }
      console.log('Fetching personas for IDs:', test.personaIds);
      const result = await getPersonasByIds(test.personaIds);
      console.log('Fetched personas:', result);
      return result;
    },
    enabled: !!test?.personaIds?.length
  });

  // Atualizar thinkingPersonas quando o teste estiver em execução
  useEffect(() => {
    if (test?.status === 'running') {
      // Adicionar todas as personas ao conjunto de "thinking"
      const newThinkingPersonas = new Set(personas.map(p => p.id));
      setThinkingPersonas(newThinkingPersonas);
    } else {
      // Limpar o conjunto quando o teste não estiver em execução
      setThinkingPersonas(new Set());
    }
  }, [test?.status, personas]);

  // WebSocket setup
  const { onTestMessage, onTestError, onTestUpdate } = useWebSocket(id || '');

  useEffect(() => {
    if (!id) return;

    console.log('Setting up WebSocket listeners for test:', id);

    // Set up message handler
    const messageHandler = (message: TestMessageType | TestMessageType[]) => {
      console.log('WebSocket message received:', message);
      // Remover a persona da lista de "thinking" quando receber uma mensagem
      if (!Array.isArray(message)) {
        setThinkingPersonas(prev => {
          const next = new Set(prev);
          next.delete(message.personaId);
          return next;
        });
      }
      // Invalidar a query de mensagens para buscar a nova mensagem do banco
      queryClient.invalidateQueries(['testMessages', id]);
    };

    // Set up update handler
    const updateHandler = (update: any) => {
      console.log('Received test update:', update);
      if (update.status === 'running') {
        // Invalidate queries to refresh test data
        queryClient.invalidateQueries({ queryKey: ['test', id] });
        queryClient.invalidateQueries({ queryKey: ['testMessages', id] });
      }
    };

    // Set up error handler
    const errorHandler = (error: any) => {
      handleError(error);
    };

    onTestMessage(messageHandler);
    onTestUpdate(updateHandler);
    onTestError(errorHandler);
  }, [id, onTestMessage, onTestUpdate, onTestError, handleError]);

  const deleteMessageMutation = useMutation({
    mutationFn: ({ testId, messageId }: { testId: string; messageId: string }) =>
      deleteTestMessage(testId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['testMessages', id]);
      toast({
        title: t('test.messages.deleted'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: handleError
  });

  const runMutation = useMutation({
    mutationFn: () => runTest(id!),
    onMutate: async () => {
      toast.closeAll();
      const previousTest = queryClient.getQueryData(['test', id]);
      return { previousTest };
    },
    onError: (error) => {
      handleError(error);
      queryClient.setQueryData(['test', id], context?.previousTest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test', id] });
      queryClient.invalidateQueries({ queryKey: ['testMessages', id] });
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => stopTest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test', id] });
      toast({
        title: t('test.messages.stopped'),
        status: 'info',
        duration: 3000,
      });
    },
    onError: handleError
  });

  const updateTestMutation = useMutation({
    mutationFn: (updates: Partial<Test>) => updateTest(id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['test', id]);
      toast({
        title: t('test.messages.updated'),
        status: 'success',
        duration: 3000,
      });
    },
    onError: handleError
  });

  const handleDeleteMessage = (messageId: string) => {
    if (!id) return;
    deleteMessageMutation.mutate({ testId: id, messageId });
  };

  const renderMessages = () => {
    if (!personas.length) {
      console.log('No personas available');
      return null;
    }

    console.log('Rendering messages:', messages);
    console.log('Available personas:', personas);
    
    return (
      <VStack spacing={4} align="stretch">
        {messages.map((message, index) => {
          console.log('Processing message for render:', message);
          
          // Encontrar a persona correspondente
          const persona = personas.find(p => p.id === message.persona_id);
          if (!persona) {
            console.log('No persona found for message:', message);
            console.log('Looking for persona_id:', message.persona_id);
            console.log('Available persona IDs:', personas.map(p => p.id));
            return null;
          }

          return (
            <Box key={message.id || index} width="100%">
              <TestMessage
                message={message}
                persona={{
                  name: persona.name,
                  avatar: persona.avatar,
                  occupation: persona.occupation
                }}
                timestamp={new Date(message.timestamp)}
                onDelete={handleDeleteMessage}
              />
            </Box>
          );
        })}
        
        {/* Indicadores de "pensando" */}
        {test?.status === 'running' && personas.map(persona => {
          if (!thinkingPersonas.has(persona.id)) return null;
          
          return (
            <ThinkingMessage
              key={`thinking-${persona.id}`}
              persona={{
                name: persona.name,
                avatar: persona.avatar,
                occupation: persona.occupation
              }}
              isVisible={thinkingPersonas.has(persona.id)}
            />
          );
        })}
      </VStack>
    );
  };

  const renderAnalysis = () => {
    if (!test?.analysis) return null;

    // Extrair apenas os campos que queremos mostrar
    const { summary, detailed } = test.analysis;
    if (!summary && !detailed) return null;

    return (
      <Card p={6} bg={cardBgColor} borderRadius="xl" borderWidth={1} borderColor={borderColor}>
        <VStack align="stretch" spacing={4}>
          <Heading size="md">{t('test.analysis.title')}</Heading>
          
          {/* Sumário */}
          {summary && (
            <Box>
              <Text fontWeight="bold" mb={2}>{t('test.analysis.summary')}</Text>
              <Text>{summary}</Text>
            </Box>
          )}

          {/* Análise Detalhada */}
          {detailed && (
            <Accordion allowToggle>
              <AccordionItem border="none">
                <AccordionButton px={0}>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">{t('test.analysis.detailed')}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} px={0}>
                  <Text whiteSpace="pre-wrap">{detailed}</Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </VStack>
      </Card>
    );
  };

  if (isLoadingTest || !test) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" w="100%" bg={useColorModeValue('gray.50', 'gray.900')} p={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Controles do Teste */}
          <Card p={6} bg={cardBgColor} borderRadius="xl" borderWidth={1} borderColor={borderColor}>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Heading size="md" color={textColor}>{t('test.status.title')}</Heading>
                  <TestStatusBadge status={test.status} />
                </VStack>
                <HStack>
                  <Button
                    leftIcon={<FaPlay />}
                    colorScheme="blue"
                    isLoading={runMutation.isLoading}
                    onClick={() => runMutation.mutate()}
                    isDisabled={test.status === 'running'}
                  >
                    {t('test.actions.start')}
                  </Button>
                  <Button
                    leftIcon={<FaStop />}
                    colorScheme="red"
                    isLoading={stopMutation.isLoading}
                    onClick={() => stopMutation.mutate()}
                    isDisabled={test.status !== 'running'}
                  >
                    {t('test.actions.stop')}
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </Card>

          {/* Grid Principal */}
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
            {/* Coluna da Esquerda: Detalhes, Analytics e Personas */}
            <VStack align="stretch" spacing={6}>
              {/* Detalhes do Teste */}
              <Card p={6} bg={cardBgColor} borderRadius="xl" borderWidth={1} borderColor={borderColor}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color={textColor}>{t('test.details.title')}</Heading>
                  <Text color={secondaryTextColor}>{test.description}</Text>
                  
                  {test.objective && (
                    <>
                      <Divider />
                      <Text fontWeight="bold" color={textColor}>{t('test.details.objective')}</Text>
                      <Text color={secondaryTextColor}>{test.objective}</Text>
                    </>
                  )}

                  {test.topics && test.topics.length > 0 && (
                    <>
                      <Divider />
                      <Text fontWeight="bold" color={textColor}>{t('test.details.topics')}</Text>
                      <Wrap spacing={2}>
                        {test.topics.map((topic, index) => (
                          <WrapItem key={index}>
                            <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                              {topic}
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </>
                  )}

                  {test.targetAudience && (
                    <>
                      <Divider />
                      <Text fontWeight="bold" color={textColor}>{t('test.details.targetAudience')}</Text>
                      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        <Box>
                          <Text fontSize="sm" color={textColor}>{t('test.details.ageRange')}</Text>
                          <Text color={secondaryTextColor}>{test.targetAudience.ageRange}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color={textColor}>{t('test.details.location')}</Text>
                          <Text color={secondaryTextColor}>{test.targetAudience.location}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color={textColor}>{t('test.details.income')}</Text>
                          <Text color={secondaryTextColor}>{test.targetAudience.income}</Text>
                        </Box>
                      </Grid>
                      
                      <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
                        {test.targetAudience.interests?.length > 0 && (
                          <Box>
                            <Text fontSize="sm" color={textColor} mb={2}>{t('test.details.interests')}</Text>
                            <Wrap spacing={2}>
                              {test.targetAudience.interests.map((interest, index) => (
                                <WrapItem key={index}>
                                  <Tag size="md" borderRadius="full" variant="subtle" colorScheme="green">
                                    {interest}
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        )}
                        
                        {test.targetAudience.painPoints?.length > 0 && (
                          <Box>
                            <Text fontSize="sm" color={textColor} mb={2}>{t('test.details.painPoints')}</Text>
                            <Wrap spacing={2}>
                              {test.targetAudience.painPoints.map((point, index) => (
                                <WrapItem key={index}>
                                  <Tag size="md" borderRadius="full" variant="subtle" colorScheme="red">
                                    {point}
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        )}
                        
                        {test.targetAudience.needs?.length > 0 && (
                          <Box>
                            <Text fontSize="sm" color={textColor} mb={2}>{t('test.details.needs')}</Text>
                            <Wrap spacing={2}>
                              {test.targetAudience.needs.map((need, index) => (
                                <WrapItem key={index}>
                                  <Tag size="md" borderRadius="full" variant="subtle" colorScheme="purple">
                                    {need}
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        )}
                      </Grid>
                    </>
                  )}
                </VStack>
              </Card>

              {/* Análise da Simulação */}
              {renderAnalysis()}

              {/* Analytics */}
              <Card p={6} bg={cardBgColor} borderRadius="xl" borderWidth={1} borderColor={borderColor}>
                <TestAnalytics
                  messages={messages}
                  personas={personas}
                />
              </Card>

              {/* Lista de Personas */}
              <Card p={6} bg={cardBgColor} borderRadius="xl" borderWidth={1} borderColor={borderColor}>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md" color={textColor}>{t('test.personas.title')} ({personas.length})</Heading>
                  </HStack>
                  <Box
                    maxH="300px"
                    overflowY="auto"
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'gray.500',
                        borderRadius: '24px',
                      },
                    }}
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      {personas?.map((persona) => (
                        <Box
                          key={persona.id}
                          p={3}
                          borderWidth="1px"
                          borderColor={useColorModeValue('gray.100', 'gray.600')}
                          borderRadius="lg"
                          bg={useColorModeValue('white', 'gray.700')}
                          transition="all 0.2s"
                          _hover={{
                            bg: useColorModeValue('gray.50', 'gray.600'),
                            transform: 'translateY(-1px)',
                            shadow: 'sm'
                          }}
                        >
                          <HStack spacing={2}>
                            <VStack spacing={0} align="start" flex={1}>
                              <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                                {persona.name}
                              </Text>
                              <Text color={secondaryTextColor} fontSize="xs">
                                {persona.age} • {persona.occupation}
                              </Text>
                            </VStack>
                            <IconButton
                              icon={<FaEdit />}
                              aria-label="Editar persona"
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => navigate(`/personas/${persona.id}/edit`)}
                            />
                          </HStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              </Card>
            </VStack>

            {/* Coluna da Direita: Área de Mensagens */}
            <Card p={6} bg={cardBgColor} borderRadius="xl" borderWidth={1} borderColor={borderColor}>
              <VStack align="stretch" spacing={4} h="full">
                <HStack justify="space-between">
                  <Heading size="md" color={textColor}>{t('test.conversation.title')}</Heading>
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<FaChevronDown />}
                      size="sm"
                      variant="outline"
                    >
                      {viewOptions.viewMode === 'timeline' ? t('test.conversation.timeline') :
                       viewOptions.viewMode === 'grouped' ? t('test.conversation.grouped') : t('test.conversation.summary')}
                    </MenuButton>
                    <MenuList>
                      <MenuItem
                        onClick={() => setViewOptions(prev => ({ ...prev, viewMode: 'timeline' }))}
                        icon={<FaClock />}
                      >
                        {t('test.conversation.timeline')}
                      </MenuItem>
                      <MenuItem
                        onClick={() => setViewOptions(prev => ({ ...prev, viewMode: 'grouped' }))}
                        icon={<FaLayerGroup />}
                      >
                        {t('test.conversation.grouped')}
                      </MenuItem>
                      <MenuItem
                        onClick={() => setViewOptions(prev => ({ ...prev, viewMode: 'summary' }))}
                        icon={<FaFileAlt />}
                      >
                        {t('test.conversation.summary')}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                {renderMessages()}
              </VStack>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default TestDetail;
