import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  VStack,
  Heading,
  useColorModeValue,
  useToast,
  Flex,
  Button,
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import PersonaForm from '@components/PersonaForm';
import { createPersona } from '@services/persona';
import type { CreatePersonaData } from '@services/persona';
import { useTranslation } from 'react-i18next';

const PersonaCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'white');
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: async (data: CreatePersonaData) => {
      try {
        return await createPersona(data);
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast({
        title: t('persona.messages.createSuccess', 'Persona criada com sucesso'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/personas');
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Erro'),
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  return (
    <Box minH="100vh" w="100%" bg={bgColor} p={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color={textColor}>
              {t('persona.actions.create')}
            </Heading>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/personas')}
            >
              {t('persona.actions.back')}
            </Button>
          </Flex>

          <PersonaForm
            onSubmit={mutation.mutateAsync}
            submitLabel={t('persona.actions.create')}
            isSubmitting={mutation.isPending}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default PersonaCreate;
