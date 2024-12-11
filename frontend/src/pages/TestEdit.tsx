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
    queryFn: () => getTest(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateTestData) => {
      const updatedData = {
        ...data,
        targetAudience: {
          ageRange: data.targetAudience?.ageRange || '',
          location: data.targetAudience?.location || '',
          income: data.targetAudience?.income || '',
          interests: data.targetAudience?.interests?.filter(i => i.trim()) || [],
          painPoints: data.targetAudience?.painPoints?.filter(p => p.trim()) || [],
          needs: data.targetAudience?.needs?.filter(n => n.trim()) || []
        },
        language: data.language || 'pt-BR',
        topics: data.topics?.filter(t => t.trim()) || [],
        personaIds: data.personaIds?.filter(Boolean) || []
      };
      return await updateTest(id!, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['test', id]);
      queryClient.invalidateQueries(['tests']);
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
              toast({
                title: t('test.edit.messages.success'),
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
              navigate('/tests');
            } catch (error) {
              toast({
                title: t('test.edit.messages.error'),
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
  );
};

export default TestEdit;
