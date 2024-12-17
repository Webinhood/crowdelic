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
  GridItem,
  Stack
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
import TestResponses from '../components/TestResponses'; // Import the TestResponses component
import { useWebSocket } from '../hooks/useWebSocket';
import { useTranslation } from 'react-i18next';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Test } from '@types/test';
import { Persona } from '@types/persona';
import { TestViewOptions, TestMessage as TestMessageType } from '../types/test';
import { useNavigation } from '../contexts/NavigationContext';

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHandleTestDetailNavigate } = useNavigation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { t } = useTranslation();

  useEffect(() => {
    setHandleTestDetailNavigate((path: string) => {
      navigate(path);
    });
    return () => {
      setHandleTestDetailNavigate(undefined);
    };
  }, [navigate, setHandleTestDetailNavigate]);

  const [liveMessages, setLiveMessages] = React.useState<TestMessageType[]>([]);
  const [viewOptions, setViewOptions] = React.useState<TestViewOptions>({
    viewMode: 'timeline',
    groupBy: 'persona',
    sortBy: 'time'
  });
  const [thinkingPersonas, setThinkingPersonas] = useState<Set<string>>(new Set());
  const [personaStatus, setPersonaStatus] = useState<Array<{
    personaId: string;
    status: 'pending' | 'running' | 'completed' | 'error';
  }>>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Theme hooks
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  // Queries
  const { data: test, isLoading: isLoadingTest } = useQuery({
    queryKey: ['test', id],
    queryFn: async () => {
      console.log('[TestDetail] Fetching test data for id:', id);
      const result = await getTest(id!);
      console.log('[TestDetail] Test data received:', result);
      return result;
    },
    enabled: !!id,
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['testMessages', id],
    queryFn: async () => {
      console.log('[TestDetail] Fetching test messages for id:', id);
      const result = await getTestMessages(id!);
      console.log('[TestDetail] Test messages received:', result);
      return result;
    },
    enabled: !!id,
    refetchInterval: test?.status === 'running' ? 1000 : false,
    staleTime: 0, // Sempre considerar os dados como stale
    cacheTime: 0  // Não manter cache
  });

  const { data: personas = [], isLoading: isLoadingPersonas } = useQuery({
    queryKey: ['personas', test?.personaIds],
    queryFn: async () => {
      console.log('[TestDetail] Starting persona query with test:', test);
      console.log('[TestDetail] personaIds from test:', test?.personaIds);
      
      if (!test?.personaIds?.length) {
        console.log('[TestDetail] No persona IDs available in test data');
        return [];
      }
      console.log('[TestDetail] Fetching personas for IDs:', test.personaIds);
      try {
        const result = await getPersonasByIds(test.personaIds);
        console.log('[TestDetail] Fetched personas:', result);
        return result;
      } catch (error) {
        console.error('[TestDetail] Error fetching personas:', error);
        throw error;
      }
    },
    enabled: !!test?.personaIds?.length,
    staleTime: 0,
    cacheTime: 0
  });

  // Atualizar thinkingPersonas quando o teste estiver em execução
  useEffect(() => {
    console.log('[TestDetail] Effect - Test Status Changed:', {
      testStatus: test?.status,
      personaIds: personas.map(p => p.id),
      currentThinkingPersonas: Array.from(thinkingPersonas)
    });
    
    if (test?.status === 'running') {
      // Adicionar todas as personas ao conjunto de "thinking"
      const newThinkingPersonas = new Set(personas.map(p => p.id));
      console.log('[TestDetail] Setting thinking personas:', Array.from(newThinkingPersonas));
      setThinkingPersonas(newThinkingPersonas);
    } else {
      console.log('[TestDetail] Clearing thinking personas');
      setThinkingPersonas(new Set());
    }
  }, [test?.status, personas]);

  // Atualizar thinkingPersonas quando receber novas mensagens
  useEffect(() => {
    if (test?.status === 'running' && messages.length > 0) {
      // Pegar o último timestamp de mensagem para cada persona
      const latestMessageByPersona = new Map<string, Date>();
      messages.forEach(message => {
        if (!message.persona_id) return;
        const currentLatest = latestMessageByPersona.get(message.persona_id);
        const messageDate = new Date(message.created_at);
        if (!currentLatest || messageDate > currentLatest) {
          latestMessageByPersona.set(message.persona_id, messageDate);
        }
      });

      // Se uma persona tem uma mensagem nos últimos 5 segundos, não deve estar "thinking"
      const now = new Date();
      const newThinkingPersonas = new Set(thinkingPersonas);
      personas.forEach(persona => {
        const latestMessage = latestMessageByPersona.get(persona.id);
        if (latestMessage && (now.getTime() - latestMessage.getTime() < 5000)) {
          newThinkingPersonas.delete(persona.id);
        } else if (test.status === 'running') {
          newThinkingPersonas.add(persona.id);
        }
      });

      console.log('[TestDetail] Atualizando thinking personas:', {
        old: Array.from(thinkingPersonas),
        new: Array.from(newThinkingPersonas)
      });
      
      setThinkingPersonas(newThinkingPersonas);
    }
  }, [test?.status, messages, personas]);

  // Atualizar status das personas quando o teste estiver em execução
  useEffect(() => {
    if (test?.status === 'running') {
      // Todas as personas começam como "running"
      const newStatus = personas.map(p => ({
        personaId: p.id,
        status: 'running' as const
      }));
      setPersonaStatus(newStatus);
    } else if (test?.status === 'completed') {
      // Todas as personas são marcadas como "completed"
      const newStatus = personas.map(p => ({
        personaId: p.id,
        status: 'completed' as const
      }));
      setPersonaStatus(newStatus);
    } else {
      // Limpar status quando o teste não estiver rodando
      setPersonaStatus([]);
    }
  }, [test?.status, personas]);

  // Atualizar status quando receber mensagens
  useEffect(() => {
    if (test?.status === 'running') {
      setPersonaStatus(prev => {
        const newStatus = [...prev];
        messages.forEach(message => {
          const statusIndex = newStatus.findIndex(s => s.personaId === message.persona_id);
          if (statusIndex !== -1) {
            // Se a persona está pensando, mantenha como running
            newStatus[statusIndex].status = thinkingPersonas.has(message.persona_id) ? 'running' : 'completed';
          }
        });
        return newStatus;
      });
    }
  }, [messages, test?.status, thinkingPersonas]);

  // WebSocket setup
  const { onTestMessage, onTestError, onTestUpdate, onTestComplete } = useWebSocket(id || '');

  useEffect(() => {
    if (!id) return;

    console.log('[TestDetail] Setting up WebSocket listeners for test:', id);

    // Set up message handler
    const messageHandler = (message: TestMessageType | TestMessageType[]) => {
      console.log('[TestDetail] WebSocket message received:', message);
      console.log('[TestDetail] Current thinkingPersonas:', Array.from(thinkingPersonas));
      
      // Adicionar mensagem ao estado local imediatamente
      if (!Array.isArray(message)) {
        setLiveMessages(prev => [...prev, message]);
      }
      // Invalidar a query de mensagens para buscar a nova mensagem do banco
      queryClient.invalidateQueries(['testMessages', id]);
      queryClient.refetchQueries(['testMessages', id]);
    };

    // Set up update handler
    const updateHandler = (update: any) => {
      console.log('[TestDetail] Received test update:', update);
      if (update.status === 'running') {
        console.log('[TestDetail] Test status is running, invalidating queries');
        // Invalidate queries to refresh test data
        queryClient.invalidateQueries(['test', id]);
        queryClient.refetchQueries(['test', id]);
      }
    };

    // Set up complete handler
    const completeHandler = (results: any) => {
      console.log('[TestDetail] Test completed:', results);
      // Limpar thinking personas
      console.log('[TestDetail] Clearing thinking personas');
      setThinkingPersonas(new Set());
      // Invalidar e forçar refetch das queries
      console.log('[TestDetail] Invalidating and refetching queries after completion');
      queryClient.invalidateQueries(['test', id]);
      queryClient.invalidateQueries(['testMessages', id]);
      queryClient.refetchQueries(['test', id]);
      queryClient.refetchQueries(['testMessages', id]);
      // Atualizar status das personas
      setPersonaStatus(prev => prev.map(p => ({ ...p, status: 'completed' as const })));
      // Mostrar toast de sucesso
      toast({
        title: 'Teste concluído',
        description: 'O teste foi concluído com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    };

    // Set up error handler
    const errorHandler = (error: any) => {
      console.log('[TestDetail] Received error:', error);
      handleError(error);
    };

    console.log('[TestDetail] Registering WebSocket handlers');
    onTestMessage(messageHandler);
    onTestError(errorHandler);
    onTestUpdate(updateHandler);
    onTestComplete(completeHandler);

    return () => {
      console.log('[TestDetail] Cleaning up WebSocket handlers');
    };
  }, [id, onTestMessage, onTestUpdate, onTestError, onTestComplete, handleError, queryClient]);

  const deleteMessageMutation = useMutation({
    mutationFn: ({ testId, messageId }: { testId: string; messageId: string }) =>
      deleteTestMessage(testId, messageId),
    onSuccess: (_, { messageId }) => {
      // Atualiza o cache imediatamente removendo a mensagem
      queryClient.setQueryData(['testMessages', id], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((message: any) => message.id !== messageId);
      });
      
      // Invalida a query para buscar dados atualizados do servidor
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
    mutationFn: async () => {
      console.log('[TestDetail] Starting test execution');
      const runTestData = {
        ...test,
        personaIds: personas.map(p => p.id),
      };
      return runTest(id!, runTestData);
    },
    onMutate: async () => {
      console.log('[TestDetail] onMutate - Preparing execution');
      toast.closeAll();
      const previousTest = queryClient.getQueryData(['test', id]);
      return { previousTest };
    },
    onError: (error) => {
      console.error('[TestDetail] Test execution error:', error);
      handleError(error);
      queryClient.setQueryData(['test', id], context?.previousTest);
    },
    onSuccess: () => {
      console.log('[TestDetail] Test started successfully');
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
    if (!id || !messageId) {
      console.error('ID do teste ou da mensagem não fornecido');
      return;
    }
    console.log('Deletando mensagem:', { testId: id, messageId });
    deleteMessageMutation.mutate({ testId: id, messageId });
  };

  const renderMessages = () => {
    if (!personas.length) {
      return null;
    }

    return (
      <Box flex="1">
        {console.log('[TestDetail] Rendering TestResponses:', {
          testStatus: test?.status,
          isRunning: test?.status === 'running',
          personaCount: personas.length,
          thinkingPersonasSize: thinkingPersonas.size
        })}
        <TestResponses
          messages={messages}
          personas={personas}
          personaStatus={personaStatus}
          is_running={test?.status === 'running'}
          thinking_personas={thinkingPersonas}
          onDeleteMessage={handleDeleteMessage}
          testId={id!} // Passar o ID do teste
        />
      </Box>
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

  // Adicionar log para monitorar alterações no test.status
  useEffect(() => {
    console.log('[TestDetail] Test status changed:', {
      status: test?.status,
      thinkingPersonasSize: thinkingPersonas.size,
      personaCount: personas.length
    });
  }, [test?.status]);

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
          {/* Barra de Navegação */}
          <HStack spacing={4} justify="space-between" w="100%">
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/tests')}
            >
              {t('common.back')}
            </Button>
            <HStack>
              <Button
                leftIcon={<FaEdit />}
                colorScheme="blue"
                variant="ghost"
                onClick={() => navigate(`/tests/${id}/edit`)}
              >
                {t('common.edit')}
              </Button>
            </HStack>
          </HStack>

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
                      <Text fontWeight="bold" mb={2}>{t('test.details.objective')}</Text>
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
                      <VStack spacing={4} mt={4} align="stretch">
                        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                          <Box>
                            <Text fontSize="sm" color={textColor} fontWeight="bold">{t('test.details.ageRange')}</Text>
                            <Text color={secondaryTextColor}>{test.targetAudience?.age_range}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color={textColor} fontWeight="bold">{t('test.details.location')}</Text>
                            <Text color={secondaryTextColor}>{test.targetAudience.location}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color={textColor} fontWeight="bold">{t('test.details.income')}</Text>
                            <Text color={secondaryTextColor}>{test.targetAudience.income}</Text>
                          </Box>
                        </Grid>
                        
                        <Box>
                          <Text fontSize="sm" color={textColor} mb={2} fontWeight="bold">{t('test.details.interests')}</Text>
                          <Wrap spacing={2}>
                            {test.targetAudience.interests?.map((interest, index) => (
                              <Tag 
                                key={index} 
                                size="md" 
                                borderRadius="full" 
                                variant="subtle" 
                                colorScheme="green"
                                fontWeight="normal"
                              >
                                {interest}
                              </Tag>
                            ))}
                          </Wrap>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color={textColor} mb={2} fontWeight="bold">{t('test.details.painPoints')}</Text>
                          <Wrap spacing={2}>
                            {test.targetAudience?.pain_points?.map((point, index) => (
                              <Tag 
                                key={index} 
                                size="md" 
                                borderRadius="full" 
                                variant="subtle" 
                                colorScheme="red"
                              >
                                {point}
                              </Tag>
                            ))}
                          </Wrap>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" color={textColor} mb={2} fontWeight="bold">{t('test.details.needs')}</Text>
                          <Wrap spacing={2}>
                            {test.targetAudience.needs?.map((need, index) => (
                              <Tag 
                                key={index} 
                                size="md" 
                                borderRadius="full" 
                                variant="subtle" 
                                colorScheme="purple"
                                fontWeight="normal"
                              >
                                {need}
                              </Tag>
                            ))}
                          </Wrap>
                        </Box>
                      </VStack>
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