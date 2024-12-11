import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  VStack,
  Heading,
  useColorModeValue,
  useToast,
  Skeleton,
  Flex,
} from '@chakra-ui/react';
import { updatePersona, getPersona } from '@services/persona';
import type { CreatePersonaData } from '@services/persona';
import PersonaForm from '@components/PersonaForm';
import { Card } from '@components/Card';
import { FaArrowLeft } from 'react-icons/fa';
import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const PersonaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'white');
  const { t } = useTranslation();

  const { data: persona, isLoading } = useQuery({
    queryKey: ['persona', id],
    queryFn: () => getPersona(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePersonaData) => {
      console.log('Submitting persona data:', data);
      return updatePersona(id!, data);
    },
    onSuccess: () => {
      console.log('Persona update successful');
      queryClient.invalidateQueries({ queryKey: ['persona', id] });
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      toast({
        title: 'Success',
        description: 'Persona updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/personas');
    },
    onError: (error: any) => {
      console.error('Persona update error:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update persona',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  if (isLoading) {
    return (
      <Box minH="100vh" w="100%" bg={bgColor} p={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Card p={6}>
              <Skeleton height="40px" width="200px" />
            </Card>
            <Card p={6}>
              <VStack spacing={4}>
                <Skeleton height="60px" />
                <Skeleton height="60px" />
                <Skeleton height="100px" />
              </VStack>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!persona) {
    return null;
  }

  const initialValues = {
    id: persona.id,
    name: persona.name,
    description: persona.description || '',  // Garantindo que description nunca seja undefined
    age: persona.age || null,
    occupation: persona.occupation || '',
    income: persona.income || '',
    location: persona.location || '',
    family_status: persona.family_status || '',
    education: persona.education || '',
    daily_routine: persona.daily_routine || '',
    challenges: persona.challenges || '',
    goals: Array.isArray(persona.goals) ? persona.goals : [],
    frustrations: persona.frustrations || '',
    interests: Array.isArray(persona.interests) ? persona.interests : [],
    habits: persona.habits || '',
    digital_skills: persona.digital_skills || '',
    spending_habits: persona.spending_habits || '',
    decision_factors: persona.decision_factors || '',
    personality_traits: persona.personality_traits || '',
    background_story: persona.background_story || '',
    traits: Array.isArray(persona.traits) ? persona.traits : []
  };

  return (
    <Box minH="100vh" w="100%" bg={bgColor} p={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color={textColor}>
              {t('persona.actions.editTitle')}
            </Heading>
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={() => navigate('/personas')}
              variant="ghost"
              colorScheme="teal"
            >
              {t('persona.actions.back')}
            </Button>
          </Flex>

          <PersonaForm
            initialValues={initialValues}
            onSubmit={async (values) => {
              toast({
                title: 'Updating Persona',
                description: 'Starting update process...',
                status: 'info',
                duration: 2000,
                position: 'top-right',
              });
              
              try {
                // Ensure arrays are properly formatted and description is present
                const formattedValues = {
                  ...values,
                  description: values.description || '',  // Garantindo que description nunca seja undefined
                  goals: Array.isArray(values.goals) ? values.goals : [],
                  interests: Array.isArray(values.interests) ? values.interests : [],
                  traits: Array.isArray(values.traits) ? values.traits : [],
                  age: values.age ? parseInt(values.age.toString(), 10) : null
                };
                
                console.log('Formatted values being sent:', formattedValues);
                await mutation.mutateAsync(formattedValues);
                
                toast({
                  title: 'Success',
                  description: 'Persona updated successfully',
                  status: 'success',
                  duration: 2000,
                  position: 'top-right',
                });
              } catch (error: any) {
                toast({
                  title: 'Error',
                  description: `Failed to update persona: ${error?.message || 'Unknown error'}`,
                  status: 'error',
                  duration: 5000,
                  position: 'top-right',
                });
                throw error;
              }
            }}
            submitLabel="Update Persona"
            isSubmitting={mutation.isPending}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default PersonaEdit;
