import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import { updateTest, getTest } from '@services/test';
import type { CreateTestData } from '@services/test';
import TestForm from '@components/TestForm';
import { Card } from '@components/Card';
import { useTranslation } from '@hooks/useTranslation';

const TestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'white');
  const { t } = useTranslation();

  const { data: test, isLoading } = useQuery({
    queryKey: ['test', id],
    queryFn: async () => {
      console.log('=== DEBUG TEST EDIT QUERY ===');
      const response = await getTest(id!);
      console.log('Dados brutos do backend:', response);
      console.log('target_audience:', response.target_audience);
      console.log('persona_ids:', response.persona_ids);
      
      // Garantir que os dados estejam no formato correto para o formulário
      const formattedData = {
        ...response,
        target_audience: {
          age_range: response.targetAudience?.age_range || '',
          location: response.targetAudience?.location || '',
          income: response.targetAudience?.income || '',
          interests: Array.isArray(response.targetAudience?.interests) ? response.targetAudience.interests : [],
          pain_points: Array.isArray(response.targetAudience?.pain_points) ? response.targetAudience.pain_points : [],
          needs: Array.isArray(response.targetAudience?.needs) ? response.targetAudience.needs : []
        },
        persona_ids: Array.isArray(response.personaIds) ? response.personaIds : [],
        topics: Array.isArray(response.topics) ? response.topics : [],
      };
      
      console.log('Dados formatados para o formulário:', formattedData);
      console.log('target_audience formatado:', formattedData.target_audience);
      console.log('persona_ids formatado:', formattedData.persona_ids);
      return formattedData;
    },
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateTestData) => {
      console.log('=== DEBUG TEST EDIT MUTATION ===');
      console.log('Dados recebidos para atualização:', JSON.stringify(data, null, 2));
      
      // Enviar os dados como estão, sem modificar
      const response = await updateTest(id!, data);
      console.log('Resposta da atualização:', JSON.stringify(response, null, 2));
      return response;
    },
    onSuccess: () => {
      console.log('Atualização bem sucedida, invalidando queries...');
      queryClient.invalidateQueries(['test', id]);
      queryClient.invalidateQueries(['tests']);
      toast({
        title: t('test.edit.messages.success'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      console.error('Erro na atualização:', error);
      toast({
        title: t('test.edit.messages.error'),
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="40px" width="200px" />
          <Skeleton height="600px" />
        </VStack>
      </Container>
    );
  }

  if (!test) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg" color={textColor}>
            {t('test.notFound')}
          </Heading>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" color={textColor}>
            {t('test.edit.title')}
          </Heading>
          <Text color={textColor}>
            {t('test.edit.description')}
          </Text>
        </Box>

        <TestForm
          initialValues={test}
          onSubmit={async (data) => {
            try {
              await mutation.mutateAsync(data);
              navigate('/tests');
            } catch (error) {
              // error already handled by onError callback
            }
          }}
          submitLabel={t('test.edit.submit')}
          isSubmitting={mutation.isLoading}
        />
      </VStack>
    </Container>
  );
};

export default TestEdit;
