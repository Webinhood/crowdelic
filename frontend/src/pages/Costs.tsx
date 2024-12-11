import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  VStack,
  Heading,
  SimpleGrid,
  Card,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link as RouterLink } from 'react-router-dom';
import { getUsageStats, getTestUsageStats } from '@services/costs';
import { getTests } from '@services/test';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Costs: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [selectedTestId, setSelectedTestId] = React.useState<string | null>(null);
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['usage'],
    queryFn: getUsageStats,
  });

  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['tests'],
    queryFn: getTests,
  });

  const { data: testStats, isLoading: testStatsLoading } = useQuery({
    queryKey: ['test-costs', selectedTestId],
    queryFn: () => selectedTestId ? getTestUsageStats(selectedTestId) : null,
    enabled: !!selectedTestId,
  });

  if (statsLoading || testsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (statsError) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {t('costs.error')}
        </Alert>
      </Container>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" mb={4}>
          {t('costs.title')}
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card p={6} bg={cardBg} borderColor={borderColor}>
            <Stat>
              <StatLabel>{t('costs.usageStats.totalCost')}</StatLabel>
              <StatNumber>{formatCurrency(stats?.total_usage || 0)}</StatNumber>
            </Stat>
          </Card>
          <Card p={6} bg={cardBg} borderColor={borderColor}>
            <Stat>
              <StatLabel>{t('costs.usageStats.messagesExchanged')}</StatLabel>
              <StatNumber>-</StatNumber>
            </Stat>
          </Card>
          <Card p={6} bg={cardBg} borderColor={borderColor}>
            <Stat>
              <StatLabel>{t('costs.usageStats.averageCost')}</StatLabel>
              <StatNumber>-</StatNumber>
            </Stat>
          </Card>
          <Card p={6} bg={cardBg} borderColor={borderColor}>
            <Stat>
              <StatLabel>{t('costs.usageStats.tokensUsed')}</StatLabel>
              <StatNumber>-</StatNumber>
            </Stat>
          </Card>
        </SimpleGrid>

        {/* Charts */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Daily Usage Chart */}
          <Card p={6} bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <Heading size="md" mb={4}>{t('costs.dailyUsage')}</Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.daily_costs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={formatDate}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>

          {/* Model Distribution Chart */}
          <Card p={6} bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <Heading size="md" mb={4}>{t('costs.modelDistribution')}</Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.model_costs}
                    dataKey="cost"
                    nameKey="model"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ model }) => model}
                  >
                    {stats?.model_costs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </SimpleGrid>

        {/* Tests Usage Table */}
        <Card p={6} bg={cardBg} borderWidth={1} borderColor={borderColor}>
          <Heading size="md" mb={4}>{t('costs.testsUsage.title')}</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>{t('costs.testsUsage.test')}</Th>
                <Th>{t('costs.testsUsage.date')}</Th>
                <Th isNumeric>{t('costs.testsUsage.cost')}</Th>
                <Th>{t('costs.testsUsage.actions')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tests?.map((test) => (
                <Tr key={test.id}>
                  <Td>
                    <Link as={RouterLink} to={`/tests/${test.id}`}>
                      {test.title}
                    </Link>
                  </Td>
                  <Td>{formatDate(test.createdAt)}</Td>
                  <Td isNumeric>{formatCurrency(test.cost || 0)}</Td>
                  <Td>
                    <Button
                      size="sm"
                      onClick={() => setSelectedTestId(test.id)}
                    >
                      {t('costs.testsUsage.details')}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </VStack>

      {/* Test Details Modal */}
      <Modal isOpen={!!selectedTestId} onClose={() => setSelectedTestId(null)}>
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>{t('costs.testDetails.title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {testStatsLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Spinner />
              </Box>
            ) : testStats ? (
              <VStack spacing={4} align="stretch">
                {/* Test usage details here */}
              </VStack>
            ) : (
              <Alert status="info">
                <AlertIcon />
                {t('costs.testDetails.noData')}
              </Alert>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Costs;
