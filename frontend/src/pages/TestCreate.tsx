import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  useToast,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { createTest } from '@services/test';
import type { CreateTestData } from '@services/test';
import TestForm from '@components/TestForm';
import { FiClipboard } from 'react-icons/fi';

const defaultValues: CreateTestData = {
  title: '',
  description: '',
  objective: '',
  settings: {
    maxIterations: 5,
    responseFormat: 'detailed',
    interactionStyle: 'natural',
  },
  topics: [],
  personaIds: [],
  targetAudience: {
    ageRange: '',
    location: '',
    income: '',
    interests: [],
    painPoints: [],
    needs: []
  },
  language: 'pt'
};

const TestCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  const mutation = useMutation({
    mutationFn: async (data: CreateTestData) => {
      console.log('Mutation starting with data:', data);
      try {
        // Remover campos desnecessários e formatar dados
        const formattedData = {
          title: data.title,
          description: data.description,
          objective: data.objective,
          settings: data.settings,
          topics: data.topics,
          personaIds: data.personaIds,
          target_audience: data.targetAudience,
          language: data.language
        };
        
        console.log('Formatted data:', formattedData);
        const result = await createTest(formattedData);
        console.log('Mutation completed successfully:', result);
        return result;
      } catch (error: any) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Mutation onSuccess called');
      queryClient.invalidateQueries(['tests']);
    },
    onError: (error: any) => {
      console.error('Mutation onError called:', error);
    },
  });

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Flex align="center" mb={2}>
              <Heading size="lg" color={textColor}>
                {t('test.create.title')}
              </Heading>
            </Flex>
            <Text color={secondaryTextColor}>
              {t('test.create.description')}
            </Text>
          </Box>

          <TestForm
            initialValues={defaultValues}
            onSubmit={async (data) => {
              try {
                await mutation.mutateAsync(data);
                toast({
                  title: t('test.create.messages.success'),
                  status: 'success',
                  duration: 5000,
                  isClosable: true,
                });
                navigate('/tests');
              } catch (error) {
                toast({
                  title: t('test.create.messages.error'),
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
              }
            }}
            submitLabel={t('test.form.submit')}
            isSubmitting={mutation.isLoading}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default TestCreate;
