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
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiPlay, FiRefreshCw, FiCheckSquare } from 'react-icons/fi';
import { FaChartLine, FaUsers, FaStar, FaPlay } from 'react-icons/fa';
import { Card } from '@components/Card';
import TestStatusBadge from '@components/TestStatusBadge';
import EmptyState from '@components/EmptyState';
import { getTests, deleteTest, runTest, stopTest } from '@services/test';
import type { Test } from '@services/test';
import { useTranslation } from 'react-i18next';

const TestList = () => {
  const { t } = useTranslation();
  const buttonBgColor = useColorModeValue('teal.500', 'teal.300');
  const buttonHoverBgColor = useColorModeValue('teal.600', 'teal.400');
  const buttonTextColor = useColorModeValue('white', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [selectedTestId, setSelectedTestId] = React.useState<string>('');

  const { data: tests = [], isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: getTests,
    staleTime: 1000 * 60, // 1 minuto
    refetchOnWindowFocus: false
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast({
        title: t('tests.deleteSuccess', 'Teste excluído'),
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
        title: t('common.error', 'Erro'),
        description: t('tests.deleteError', 'Falha ao excluir teste'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    },
  });

  const runMutation = useMutation({
    mutationFn: runTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast({
        title: t('tests.startSuccess', 'Teste iniciado'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error', 'Erro'),
        description: t('tests.startError', 'Falha ao iniciar teste'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    },
  });

  const stopMutation = useMutation({
    mutationFn: stopTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast({
        title: t('tests.stopSuccess', 'Teste parado'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error', 'Erro'),
        description: t('tests.stopError', 'Falha ao parar teste'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        variant: 'solid',
      });
    },
  });

  const handleDelete = (id: string) => {
    setSelectedTestId(id);
    onOpen();
  };

  const confirmDelete = () => {
    if (selectedTestId) {
      deleteMutation.mutate(selectedTestId);
    }
  };

  const handleRunTest = (id: string) => {
    runMutation.mutate(id);
  };

  const handleStopTest = (id: string) => {
    stopMutation.mutate(id);
  };

  const handleDeleteClick = (id: string) => {
    handleDelete(id);
  };

  const completedTests = tests.filter((test) => test.status === 'completed').length;
  const runningTests = tests.filter((test) => test.status === 'running').length;
  const averageRating = tests.length
    ? tests.reduce((acc, test) => {
        let ratings = [];
        try {
          if (test.results) {
            if (Array.isArray(test.results)) {
              ratings = test.results
                .filter(result => result && typeof result.rating === 'number')
                .map(result => result.rating);
            }
          }
        } catch (e) {
          console.error('Error processing test results:', e);
        }
        
        const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        return acc + avgRating;
      }, 0) / tests.length
    : null;

  const stats = [
    {
      label: t('tests.stats.total', 'Total de Testes'),
      value: tests.length,
      helpText: `${completedTests} ${t('tests.stats.completed', 'concluídos')}`,
      icon: FaChartLine,
      color: 'teal',
    },
    {
      label: t('tests.stats.completed', 'Testes Concluídos'),
      value: completedTests,
      icon: FiCheckSquare,
      color: 'green',
    },
    {
      label: t('tests.stats.running', 'Testes em Execução'),
      value: runningTests,
      icon: FaPlay,
      color: 'purple',
    },
    {
      label: t('tests.stats.averageRating', 'Média de Avaliação'),
      value: averageRating !== null ? averageRating.toFixed(1) : null,
      helpText: t('tests.stats.outOf', 'De 5.0'),
      icon: FaStar,
      color: 'yellow',
    },
  ];

  if (error) {
    return (
      <Container maxW="100%" px={4} py={8}>
        <Card p={8} bg={cardBgColor} borderWidth="1px" borderColor={borderColor} borderRadius="2xl">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            bg="transparent"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {t('tests.errorLoading', 'Erro ao Carregar Testes')}
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {error instanceof Error ? error.message : t('tests.errorLoading', 'Erro ao Carregar Testes')}
            </AlertDescription>
            <Button
              mt={4}
              onClick={() => window.location.reload()}
              leftIcon={<Icon as={FiRefreshCw} />}
              bg={buttonBgColor}
              color={buttonTextColor}
              _hover={{
                bg: buttonHoverBgColor,
              }}
            >
              {t('tests.tryAgain', 'Tentar Novamente')}
            </Button>
          </Alert>
        </Card>
      </Container>
    );
  }

  return (
    <Box minH="100vh" w="100%" bg={bgColor}>
      <Container maxW="100%" px={4} py={8}>
        <VStack spacing={8} align="stretch" w="100%">
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="lg" color={textColor}>
                {t('tests.list.title')}
              </Heading>
              <Text color={secondaryTextColor} mt={1}>
                {t('tests.list.description')}
              </Text>
            </Box>
            <Button
              leftIcon={<FiPlus />}
              onClick={() => navigate('/tests/create')}
              colorScheme="teal"
              size="md"
            >
              {t('tests.create.button')}
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
            {stats.map((stat, index) => (
              <Card
                key={index}
                bg={cardBgColor}
                p={6}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ transform: 'translateY(-2px)' }}
              >
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4} align="center">
                    <Box
                      p={3}
                      bg={useColorModeValue(`${stat.color}.50`, `${stat.color}.900`)}
                      color={useColorModeValue(`${stat.color}.500`, `${stat.color}.200`)}
                      rounded="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w="48px"
                      h="48px"
                    >
                      <Icon as={stat.icon} boxSize="24px" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        {stat.label}
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {stat.value}
                      </Text>
                      {stat.helpText && (
                        <Text fontSize="sm" color={secondaryTextColor}>
                          {stat.helpText}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </VStack>
              </Card>
            ))}
          </SimpleGrid>

          {error ? (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <AlertTitle>{t('tests.errorLoading', 'Erro ao Carregar Testes')}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : tests.length === 0 ? (
            <Card
              bg={cardBgColor}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <EmptyState
                title={t('tests.noTests', 'Nenhum Teste Encontrado')}
                description={t('tests.createFirstTest', 'Crie seu primeiro teste para começar')}
                icon={FiPlus}
                action={{
                  label: t('tests.newTest', 'Novo Teste'),
                  onClick: () => navigate('/tests/new')
                }}
              />
            </Card>
          ) : (
            <Card
              bg={cardBgColor}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <VStack spacing={4} align="stretch">
                {tests.map((test) => (
                  <Box
                    key={test.id}
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    _hover={{ transform: 'translateY(-2px)' }}
                    onClick={() => navigate(`/tests/${test.id}`)}
                    cursor="pointer"
                    role="group"
                  >
                    <Grid templateColumns="1fr auto" gap={4} alignItems="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" color={textColor}>
                          {test.title || t('tests.untitledTest', 'Teste sem Título')}
                        </Text>
                        <Text fontSize="sm" color={secondaryTextColor} noOfLines={2}>
                          {test.objective || t('tests.noObjective', 'Nenhum objetivo definido')}
                        </Text>
                      </VStack>
                      <HStack spacing={2} style={{ pointerEvents: 'auto' }}>
                        <TestStatusBadge status={test.status} />
                        <IconButton
                          icon={<FiEdit2 />}
                          aria-label={t('tests.editTest', 'Editar Teste')}
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tests/${test.id}/edit`);
                          }}
                        />
                        <IconButton
                          icon={test.status === 'running' ? <FiSquare /> : <FiPlay />}
                          aria-label={test.status === 'running' ? t('tests.stopTest', 'Parar Teste') : t('tests.runTest', 'Executar Teste')}
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            test.status === 'running' ? handleStopTest(test.id) : handleRunTest(test.id);
                          }}
                        />
                        <IconButton
                          icon={<FiTrash2 />}
                          aria-label={t('tests.deleteTest', 'Excluir Teste')}
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(test.id);
                          }}
                        />
                      </HStack>
                    </Grid>
                  </Box>
                ))}
              </VStack>
            </Card>
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
              {t('tests.deleteTest', 'Excluir Teste')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('tests.confirmDelete', 'Tem certeza? Essa ação não pode ser desfeita.')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('tests.cancel', 'Cancelar')}
              </Button>
              <Button
                colorScheme="red"
                onClick={() => deleteMutation.mutate(selectedTestId)}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                {t('tests.delete', 'Excluir')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TestList;
