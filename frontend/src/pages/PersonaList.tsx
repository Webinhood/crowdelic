import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  VStack,
  SimpleGrid,
  Progress,
  Avatar,
  Wrap,
  Tag,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiPause } from 'react-icons/fi';
import { FaUsers, FaRobot, FaComments, FaPlay, FaChartLine } from 'react-icons/fa';
import { Card } from '@components/Card';
import EmptyState from '@components/EmptyState';
import { getPersonas, deletePersona } from '@services/persona';
import type { Persona } from '@services/persona';
import { useTranslation } from 'react-i18next';

const PersonaList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string>('');
  const { t } = useTranslation();

  const buttonBgColor = useColorModeValue('teal.400', 'teal.200');
  const buttonHoverBgColor = useColorModeValue('teal.500', 'teal.300');
  const cardBgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { data: personas = [], isLoading, error } = useQuery({
    queryKey: ['personas'],
    queryFn: getPersonas,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast({
        title: t('persona.messages.deleted'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: t('persona.messages.deleteError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    },
  });

  const handleDelete = (id: string) => {
    setSelectedPersonaId(id);
    onOpen();
  };

  const confirmDelete = () => {
    if (selectedPersonaId) {
      deleteMutation.mutate(selectedPersonaId);
    }
  };

  return (
    <Box minH="100vh" w="100%" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="100%" px={4} py={8}>
        <VStack spacing={8} align="stretch" w="100%">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color={textColor}>
              {t('persona.title')}
            </Heading>
            <Button
              leftIcon={<FiPlus />}
              onClick={() => navigate('/personas/new')}
              colorScheme="teal"
              size="md"
            >
              {t('persona.actions.create')}
            </Button>
          </Flex>

          {isLoading && <Progress size="xs" isIndeterminate />}

          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{t('persona.messages.loadError')}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && personas.length === 0 && (
            <EmptyState
              icon={FaUsers}
              title={t('persona.empty.title')}
              description={t('persona.empty.description')}
              button={{
                label: t('persona.empty.action'),
                onClick: () => navigate('/personas/new'),
              }}
            />
          )}

          {!isLoading && !error && personas.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {personas.map((persona: Persona) => (
                <Box
                  key={persona.id}
                  bg={useColorModeValue('white', 'gray.700')}
                  p={4}
                  borderRadius="md"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  _hover={{ 
                    bg: useColorModeValue('gray.50', 'gray.600'),
                    borderColor: useColorModeValue('gray.300', 'gray.500'),
                    boxShadow: 'md'
                  }}
                  width="100%"
                >
                  <HStack justify="space-between" align="start" w="100%">
                    <VStack align="start" spacing={2} flex={1}>
                      <Text color={useColorModeValue('gray.800', 'white')} fontWeight="bold" fontSize="lg">{persona.name}</Text>
                      <HStack spacing={2} color={useColorModeValue('gray.600', 'gray.300')} fontSize="sm">
                        <Text>{persona.age} {t('persona.units.years')}</Text>
                        <Text>•</Text>
                        <Text>{persona.occupation}</Text>
                        <Text>•</Text>
                        <Text>{persona.location}</Text>
                      </HStack>
                      <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm" noOfLines={2}>
                        {persona.description}
                      </Text>
                      {persona.traits && persona.traits.length > 0 && (
                        <Wrap spacing={1}>
                          {persona.traits.slice(0, 3).map((trait, idx) => (
                            <Tag key={idx} size="sm" colorScheme="purple" variant="subtle">
                              {trait}
                            </Tag>
                          ))}
                        </Wrap>
                      )}
                    </VStack>
                    <HStack spacing={1}>
                      <IconButton
                        icon={<FiEdit2 />}
                        aria-label={t('persona.actions.edit')}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => navigate(`/personas/${persona.id}/edit`)}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label={t('persona.actions.delete')}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(persona.id)}
                      />
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('persona.deleteDialog.title')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('persona.deleteDialog.message')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('persona.actions.cancel')}
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                {t('persona.actions.confirm')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PersonaList;
