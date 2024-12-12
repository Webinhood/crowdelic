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
  personaId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

interface TestResponsesProps {
  messages: TestMessageType[];
  personas: Persona[];
  personaStatus?: PersonaStatus[];
  isRunning: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

const MotionBox = motion(Box);
const MotionProgress = motion(Progress);

const TestResponses: React.FC<TestResponsesProps> = ({
  messages,
  personas,
  personaStatus = [],
  isRunning,
  onDeleteMessage,
}) => {
  const { t } = useTranslation();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'time'>('time');

  // Agrupar mensagens por persona
  const messagesByPersona = React.useMemo(() => {
    console.log('Agrupando mensagens por persona:', { messages, personas });
    const grouped = new Map<string, TestMessageType[]>();
    
    // Inicializar o map com arrays vazios para todas as personas
    personas.forEach(persona => {
      grouped.set(persona.id, []);
    });
    
    // Adicionar mensagens aos respectivos grupos
    if (Array.isArray(messages)) {
      messages.forEach(message => {
        if (message && message.persona_id) {
          const personaMessages = grouped.get(message.persona_id) || [];
          personaMessages.push(message);
          grouped.set(message.persona_id, personaMessages);
        }
      });
    }
    
    console.log('Mensagens agrupadas:', Object.fromEntries(grouped));
    return grouped;
  }, [messages, personas]);

  // Filtrar e ordenar personas
  const filteredPersonas = React.useMemo(() => {
    console.log('Filtrando personas:', { personas, searchTerm, sortBy });
    return personas
      .filter(persona => {
        const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            persona.occupation.toLowerCase().includes(searchTerm.toLowerCase());
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
            const latestA = messagesA.length ? new Date(messagesA[messagesA.length - 1].created_at).getTime() : 0;
            const latestB = messagesB.length ? new Date(messagesB[messagesB.length - 1].created_at).getTime() : 0;
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
    if (!personaStatus.length) return 0;
    const completed = personaStatus.filter(s => s.status === 'completed').length;
    return (completed / personaStatus.length) * 100;
  }, [personaStatus]);

  return (
    <Box>
      {/* Barra de progresso geral */}
      <AnimatePresence>
        {isRunning && (
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            mb={4}
          >
            <MotionProgress
              value={progress}
              size="sm"
              colorScheme="blue"
              hasStripe
              isAnimated
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
            />
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Barra de filtros e busca */}
      <Box mb={4} p={4} bg={bgColor} borderRadius="md" borderWidth={1} borderColor={borderColor}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <HStack>
            <FaSearch />
            <Input
              placeholder={t('test.search_personas')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </HStack>
          <HStack>
            <FaSort />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'time')}
            >
              <option value="time">{t('test.sort.time')}</option>
              <option value="name">{t('test.sort.name')}</option>
            </Select>
          </HStack>
        </SimpleGrid>
      </Box>

      {/* Lista de personas com accordion */}
      <Accordion allowMultiple>
        <AnimatePresence>
          {filteredPersonas.map(persona => {
            const personaMessages = messagesByPersona.get(persona.id) || [];
            const status = personaStatus.find(s => s.personaId === persona.id);
            
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
                    <HStack flex="1" spacing={4}>
                      <Avatar name={persona.name} src={persona.avatar} size="sm" />
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">{persona.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {persona.occupation} • {personaMessages.length} {t('test.messages.count')}
                        </Text>
                      </Box>
                      {renderStatusBadge(status?.status)}
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <VStack spacing={4} align="stretch">
                      {personaMessages.map((message, index) => (
                        <TestMessage
                          key={message.id || index}
                          message={message}
                          persona={persona}
                          timestamp={new Date(message.created_at)}
                          onDelete={onDeleteMessage}
                        />
                      ))}
                      {status?.status === 'running' && (
                        <ThinkingMessage persona={persona} />
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </Accordion>
    </Box>
  );
};

export default TestResponses;
