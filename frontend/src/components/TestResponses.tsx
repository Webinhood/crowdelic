import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Progress,
  Badge,
  useColorModeValue,
  Avatar,
  HStack,
  Input,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  IconButton,
  Tooltip,
  Button,
  SimpleGrid,
  Tag,
  Wrap,
  WrapItem,
  Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import TestMessage from './TestMessage';
import ThinkingMessage from './ThinkingMessage';
import { TestMessage as TestMessageType } from '../types/test';
import { 
  FaFilter, 
  FaSearch, 
  FaSort, 
  FaUser, 
  FaBirthdayCake, 
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaEnvelope,
  FaBriefcase,
  FaInfoCircle,
  FaTags,
  FaComment
} from 'react-icons/fa';

interface Persona {
  id: string;
  name: string;
  avatar?: string;
  occupation: string;
  age?: string;
  location?: string;
  bio?: string;
  characteristics?: string[];
  income?: string;
  family_status?: string;
  description?: string;
}

interface PersonaStatus {
  persona_id: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

interface TestResponsesProps {
  messages: TestMessageType[];
  personas: Persona[];
  persona_status?: PersonaStatus[];
  is_running: boolean;
  thinking_personas: Set<string>;
  onDeleteMessage?: (message_id: string) => void;
  testId: string;
}

const MotionBox = motion(Box);
const MotionProgress = motion(Progress);

const TestResponses: React.FC<TestResponsesProps> = ({
  messages,
  personas,
  persona_status = [],
  is_running = false,
  thinking_personas = new Set(),
  onDeleteMessage,
  testId,
}) => {
  const { t } = useTranslation();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'time'>('time');
  
  // Inicializar viewedMessages do localStorage
  const [viewedMessages, setViewedMessages] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`viewedMessages_${testId}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Salvar no localStorage quando viewedMessages mudar
  useEffect(() => {
    localStorage.setItem(`viewedMessages_${testId}`, JSON.stringify([...viewedMessages]));
  }, [viewedMessages, testId]);

  // Atualizar viewedMessages quando novas mensagens chegarem
  useEffect(() => {
    if (messages && messages.length > 0) {
      const currentMessageIds = new Set(messages.map(m => m.id));
      setViewedMessages(prev => {
        const newSet = new Set(prev);
        currentMessageIds.forEach(id => {
          if (!prev.has(id)) {
            // Não adiciona automaticamente à lista de vistos
            // Será adicionado quando a mensagem for expandida
          }
        });
        return newSet;
      });
    }
  }, [messages]);

  // Debug logs
  console.log('TestResponses - Messages recebidas:', messages);

  // Agrupar mensagens por persona com validação
  const messagesByPersona = React.useMemo(() => {
    const grouped = new Map<string, TestMessageType[]>();
    
    // Debug
    console.log('Agrupando mensagens por persona:', messages);
    
    // Inicializar o map com arrays vazios para todas as personas
    personas.forEach(persona => {
      grouped.set(persona.id, []);
    });
    
    // Validar e adicionar mensagens aos respectivos grupos
    if (Array.isArray(messages)) {
      messages.forEach(message => {
        if (message && message.persona_id && grouped.has(message.persona_id)) {
          const personaMessages = grouped.get(message.persona_id) || [];
          // Debug
          console.log('Mensagem para persona', message.persona_id, ':', message);
          personaMessages.push(message);
          // Ordenar mensagens por data em ordem decrescente
          personaMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          grouped.set(message.persona_id, personaMessages);
        } else {
          console.warn('TestResponses: Mensagem inválida ou persona_id não encontrado:', message);
        }
      });
    }
    
    return grouped;
  }, [messages, personas]);

  // Filtrar e ordenar personas com validação
  const filteredPersonas = React.useMemo(() => {
    if (!Array.isArray(personas)) {
      console.error('TestResponses: Lista de personas inválida:', personas);
      return [];
    }

    return personas
      .filter(persona => {
        if (!persona || !persona.name || !persona.occupation) {
          console.warn('TestResponses: Persona com dados incompletos:', persona);
          return false;
        }
        const matchesSearch = (persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             persona.occupation.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'time':
          default:
            const messagesA = messagesByPersona.get(a.id) || [];
            const messagesB = messagesByPersona.get(b.id) || [];
            const latestA = messagesA.length ? new Date(messagesA[0].created_at).getTime() : 0;
            const latestB = messagesB.length ? new Date(messagesB[0].created_at).getTime() : 0;
            return latestB - latestA;
        }
      });
  }, [personas, searchTerm, sortBy, messagesByPersona]);

  // Renderizar badge de status
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge colorScheme="gray">{t('test.status.pending')}</Badge>;
      case 'running':
        return <Badge colorScheme="blue">{t('test.status.running')}</Badge>;
      case 'completed':
        return <Badge colorScheme="green">{t('test.status.completed')}</Badge>;
      case 'error':
        return <Badge colorScheme="red">{t('test.status.error')}</Badge>;
      default:
        return null;
    }
  };

  // Calcular progresso geral
  const progress = React.useMemo(() => {
    if (!persona_status.length) return 0;
    const completed = persona_status.filter(s => s.status === 'completed').length;
    return (completed / persona_status.length) * 100;
  }, [persona_status]);

  return (
    <Box>
      {/* Barra de filtros e busca */}
      <Box mb={4} p={4} bg={bgColor} borderRadius="md" borderWidth={1} borderColor={borderColor}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <HStack>
            <FaSearch />
            <Input
              placeholder={t('test.search_personas')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={t('test.search_personas')}
            />
          </HStack>
          <HStack>
            <FaSort />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'time')}
              aria-label={t('test.sort.label')}
            >
              <option value="time">{t('test.sort.time')}</option>
              <option value="name">{t('test.sort.name')}</option>
            </Select>
          </HStack>
        </SimpleGrid>
      </Box>

      {/* Lista de personas com accordion */}
      {filteredPersonas.length > 0 ? (
        <Accordion allowMultiple>
          <AnimatePresence>
            {filteredPersonas.map(persona => {
              const personaMessages = messagesByPersona.get(persona.id) || [];
              const status = persona_status.find(s => s.persona_id === persona.id);
              const isThinking = is_running && thinking_personas.has(persona.id);
                            
              return (
                <MotionBox
                  key={persona.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AccordionItem
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    mb={4}
                    bg={bgColor}
                  >
                    <AccordionButton p={4}>
                      <HStack flex="1" spacing={4} align="start">
                        <Avatar 
                          name={persona.name} 
                          src={persona.avatar} 
                          size="md"
                          loading="lazy"
                        />
                        <VStack flex="1" align="start" spacing={1}>
                          <HStack>
                            <Text fontWeight="bold" fontSize="lg">{persona.name}</Text>
                            {renderStatusBadge(status?.status)}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {persona.occupation}{persona.age ? `, ${persona.age} anos` : ''}
                          </Text>
                          {persona.location && (
                            <Text fontSize="sm" color="gray.500">
                              {persona.location}
                            </Text>
                          )}
                          {isThinking && (
                            <Box>
                              <ThinkingMessage
                                persona={{
                                  name: persona.name,
                                  avatar: persona.avatar,
                                  occupation: persona.occupation
                                }}
                                isVisible={true}
                                compact={true}
                              />
                            </Box>
                          )}
                        </VStack>
                        <HStack spacing={2}>
                          <Box 
                            border="1px" 
                            borderColor={useColorModeValue('gray.100', 'gray.700')} 
                            borderRadius="full" 
                            px={2} 
                            py={1}
                            bg={useColorModeValue('gray.50', 'gray.800')}
                          >
                            <HStack spacing={1}>
                              <Icon 
                                as={FaEnvelope} 
                                color={useColorModeValue('gray.400', 'gray.500')} 
                                boxSize={3} 
                              />
                              <Text 
                                fontSize="sm" 
                                color={useColorModeValue('gray.500', 'gray.400')}
                              >
                                {personaMessages.length}
                              </Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </HStack>
                      </HStack>
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack spacing={4} align="stretch">
                        {personaMessages.map((message, index) => (
                          <TestMessage
                            key={message.id || index}
                            message={message}
                            persona={persona}
                            timestamp={message.created_at ? new Date(message.created_at) : undefined}
                            messageNumber={personaMessages.length - index}
                            onDelete={onDeleteMessage}
                            isNew={!viewedMessages.has(message.id)}
                            onMessageViewed={() => {
                              setViewedMessages(prev => new Set([...prev, message.id]));
                            }}
                          />
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </MotionBox>
              );
            })}
          </AnimatePresence>
        </Accordion>
      ) : (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">{t('test.messages.noResults')}</Text>
        </Box>
      )}
    </Box>
  );
};

export default TestResponses;
