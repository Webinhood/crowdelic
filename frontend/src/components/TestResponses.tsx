import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import TestMessage from './TestMessage';
import ThinkingMessage from './ThinkingMessage';
import { TestMessage as TestMessageType } from '../types/test';
import { Persona } from '../types/persona';
import { FaFilter, FaSearch, FaSort } from 'react-icons/fa';

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
}) => {
  const { t } = useTranslation();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'time'>('time');

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
          grouped.set(message.persona_id, personaMessages.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
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
                      <VStack flex="1" align="stretch" spacing={2}>
                        <HStack flex="1" spacing={4}>
                          <Avatar 
                            name={persona.name} 
                            src={persona.avatar} 
                            size="sm"
                            loading="lazy"
                          />
                          <VStack flex="1" align="start" spacing={1}>
                            <Text fontWeight="bold">{persona.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {persona.occupation} • {personaMessages.length} {t('test.messages.count')}
                            </Text>
                          </VStack>
                          <Box display="flex" alignItems="center">
                            {renderStatusBadge(status?.status)}
                            <AccordionIcon ml={2} />
                          </Box>
                        </HStack>
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
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack spacing={4} align="stretch">
                        {personaMessages.map((message, index) => (
                          <TestMessage
                            key={message.id || index}
                            message={message}
                            persona={persona}
                            timestamp={message.created_at ? new Date(message.created_at) : undefined}
                            onDelete={onDeleteMessage}
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
