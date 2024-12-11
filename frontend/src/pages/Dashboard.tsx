import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  Flex,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  IconButton,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiSquare, FiTrash2, FiPlay } from 'react-icons/fi';
import { FaChartLine, FaUsers, FaStar, FaChartBar } from 'react-icons/fa';
import { Card } from '@components/Card';
import TestStatusBadge from '@components/TestStatusBadge';
import EmptyState from '@components/EmptyState';
import { getTests } from '@services/test';
import { getPersonas } from '@services/persona';
import { Test } from '@services/test';
import { Persona } from '@services/persona';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const buttonBgColor = useColorModeValue('teal.400', 'teal.200');
  const buttonHoverBgColor = useColorModeValue('teal.500', 'teal.300');
  const cardBgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const { data: tests, isLoading: isTestsLoading, error: testsError } = useQuery({
    queryKey: ['tests'],
    queryFn: getTests,
    retry: 1,
  });

  const { data: personas, isLoading: isPersonasLoading, error: personasError } = useQuery({
    queryKey: ['personas'],
    queryFn: getPersonas,
    retry: 1,
  });

  const isLoading = isTestsLoading || isPersonasLoading;
  const error = testsError || personasError;

  const testsArray = tests || [];
  const personasArray = personas || [];

  const recentTests = testsArray.slice(0, 5);
  const completedTests = testsArray.filter((test) => test.status === 'completed').length;
  const activePersonas = personasArray.length;
  const runningTests = testsArray.filter((test) => test.status === 'running').length;

  const stats = [
    {
      label: t('dashboard.stats.totalTests'),
      value: testsArray.length,
      change: completedTests,
      changeText: t('dashboard.stats.completed'),
      icon: FaChartLine,
      color: 'teal',
    },
    {
      label: t('dashboard.stats.activePersonas'),
      value: activePersonas,
      icon: FaUsers,
      color: 'cyan',
    },
    {
      label: t('dashboard.stats.runningTests'),
      value: runningTests,
      icon: FiPlay,
      color: 'purple',
    },
    {
      label: t('dashboard.stats.successRate'),
      value: completedTests ? ((completedTests / testsArray.length) * 100).toFixed(0) + '%' : '0%',
      icon: FaChartBar,
      color: 'green',
    },
  ];

  const handleStopTest = (id) => {
    // implement stop test logic
  };

  const handleRunTest = (id) => {
    // implement run test logic
  };

  const handleDeleteClick = (id) => {
    // implement delete test logic
  };

  return (
    <Box minH="100vh" w="100%" bg={bgColor}>
      <Container maxW="100%" px={8} py={8}>
        <VStack spacing={8} align="stretch" w="100%">
          <Flex justify="space-between" align="center" w="100%">
            <Box>
              <Heading size="lg" color={textColor}>
                {t('dashboard.overview.title')}
              </Heading>
              <Text color={secondaryTextColor} mt={1}>
                {t('dashboard.overview.description')}
              </Text>
            </Box>
            <HStack spacing={4}>
              <Button
                leftIcon={<FiPlus />}
                onClick={() => navigate('/personas/new')}
                variant="outline"
                colorScheme="teal"
              >
                {t('dashboard.create.persona')}
              </Button>
              <Button
                leftIcon={<FiPlus />}
                onClick={() => navigate('/tests/new')}
                colorScheme="teal"
              >
                {t('dashboard.create.test')}
              </Button>
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {stats.map((stat, index) => (
              <Card
                key={index}
                bg={cardBgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                p={6}
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
                      {stat.change && (
                        <Text fontSize="sm" color={secondaryTextColor}>
                          {stat.change} {stat.changeText}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </VStack>
              </Card>
            ))}
          </SimpleGrid>

          <Card
            bg={cardBgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={6}
          >
            <Box>
              <Heading size="md" mb={4} color={textColor}>
                {t('dashboard.recentTests.title')}
              </Heading>
              {recentTests.length === 0 ? (
                <EmptyState
                  icon={FiPlus}
                  title={t('dashboard.recentTests.empty')}
                  description={t('dashboard.recentTests.createFirst')}
                  button={{
                    label: t('dashboard.create.test'),
                    onClick: () => navigate('/tests/new'),
                  }}
                />
              ) : (
                <VStack spacing={4} align="stretch">
                  {recentTests.map((test) => (
                    <Box
                      key={test.id}
                      p={4}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      transition="all 0.2s"
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700'), cursor: 'pointer' }}
                      onClick={() => navigate(`/tests/${test.id}`)}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Grid templateColumns="1fr auto" gap={4} alignItems="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" color={textColor}>
                            {test.title || 'Untitled Test'}
                          </Text>
                          <Text fontSize="sm" color={secondaryTextColor} noOfLines={2}>
                            {test.objective || 'No objective defined'}
                          </Text>
                        </VStack>
                        <HStack spacing={2} style={{ pointerEvents: 'auto' }}>
                          <TestStatusBadge status={test.status} />
                          <IconButton
                            icon={<FiEdit2 />}
                            aria-label="Edit test"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tests/${test.id}/edit`);
                            }}
                          />
                          <IconButton
                            icon={test.status === 'running' ? <FiSquare /> : <FiPlay />}
                            aria-label={test.status === 'running' ? 'Stop test' : 'Run test'}
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              test.status === 'running' ? handleStopTest(test.id) : handleRunTest(test.id);
                            }}
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Delete test"
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
              )}
            </Box>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
