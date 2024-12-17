import React, { useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  FormLabel,
  HStack,
  IconButton,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useToast,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { FiPlus, FiUsers, FiX, FiCheck, FiTarget } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FormInput } from './FormInput';
import { CreateTestData } from '../services/test';
import { getPersonas } from '../services/persona';
import { TestSchema } from '../utils/validation';

interface TestFormProps {
  initialValues?: CreateTestData;
  onSubmit: (values: CreateTestData) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  showSubmitButton?: boolean;
}

const defaultValues: CreateTestData = {
  title: '',
  description: '',
  objective: '',
  language: 'pt',
  settings: {
    max_iterations: 5,
    response_format: 'detailed',
    interaction_style: 'natural',
  },
  topics: [],
  persona_ids: [],
  target_audience: {
    age_range: '',
    location: '',
    income: '',
    interests: [],
    pain_points: [],
    needs: []
  }
};

const TestForm: React.FC<TestFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  showSubmitButton = true,
}) => {
  const [newTopic, setNewTopic] = React.useState('');
  const [isPersonaModalOpen, setIsPersonaModalOpen] = React.useState(false);
  const [isTitleChecking, setIsTitleChecking] = React.useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Referência para o timeout do debounce
  const titleCheckTimeout = React.useRef<NodeJS.Timeout>();

  // Função para verificar o título com debounce
  const checkTitle = useCallback(async (title: string, setFieldError: any, values: any) => {
    if (titleCheckTimeout.current) {
      clearTimeout(titleCheckTimeout.current);
    }

    if (!title?.trim()) return;

    titleCheckTimeout.current = setTimeout(async () => {
      setIsTitleChecking(true);
      try {
        const exists = await checkTitleExists(title, values.id);
        if (exists) {
          setFieldError('title', 'Este título já está em uso');
        }
      } catch (error) {
        console.error('Error checking title:', error);
      } finally {
        setIsTitleChecking(false);
      }
    }, 500);
  }, []);

  // Garantir que os valores iniciais sejam corretamente mesclados
  const formInitialValues = useMemo(() => {
    console.log('=== DEBUG FORM INITIAL VALUES ===');
    console.log('Valores iniciais recebidos:', JSON.stringify(initialValues, null, 2));
    if (!initialValues) return defaultValues;
    
    // Garantir que todos os campos obrigatórios existam
    const mergedValues = {
      ...defaultValues,
      ...initialValues,
      settings: {
        ...defaultValues.settings,
        ...(initialValues.settings || {}),
      },
      target_audience: {
        age_range: initialValues.target_audience?.age_range || '',
        location: initialValues.target_audience?.location || '',
        income: initialValues.target_audience?.income || '',
        interests: Array.isArray(initialValues.target_audience?.interests) ? initialValues.target_audience.interests : [],
        pain_points: Array.isArray(initialValues.target_audience?.pain_points) ? initialValues.target_audience.pain_points : [],
        needs: Array.isArray(initialValues.target_audience?.needs) ? initialValues.target_audience.needs : []
      },
      persona_ids: Array.isArray(initialValues.persona_ids) ? initialValues.persona_ids : [],
      topics: Array.isArray(initialValues.topics) ? initialValues.topics : [],
      language: initialValues.language || 'pt'
    };

    console.log('Valores mesclados:', JSON.stringify(mergedValues, null, 2));
    return mergedValues;
  }, [initialValues]);

  const { data: personas = [], isLoading: isLoadingPersonas } = useQuery({
    queryKey: ['personas'],
    queryFn: getPersonas,
  });

  const handleFormSubmit = useCallback(async (values: CreateTestData, { setSubmitting }: any) => {
    console.log('=== DEBUG FORM SUBMIT ===');
    console.log('Valores do formulário:', JSON.stringify(values, null, 2));
    try {
      const submissionData = {
        title: values.title,
        description: values.description,
        objective: values.objective,
        language: values.language,
        settings: {
          max_iterations: Number(values.settings.max_iterations),
          response_format: values.settings.response_format,
          interaction_style: values.settings.interaction_style
        },
        topics: values.topics?.filter(t => t.trim()) || [],
        persona_ids: values.persona_ids || [],
        target_audience: values.target_audience ? {
          age_range: values.target_audience.age_range || '',
          location: values.target_audience.location || '',
          income: values.target_audience.income || '',
          interests: values.target_audience.interests?.filter(i => i.trim()) || [],
          pain_points: values.target_audience.pain_points?.filter(p => p.trim()) || [],
          needs: values.target_audience.needs?.filter(n => n.trim()) || []
        } : undefined
      };
      console.log('Dados formatados para envio:', JSON.stringify(submissionData, null, 2));
      await onSubmit(submissionData);
    } catch (error: any) {
      console.error('Erro durante o envio do formulário:', error);
      toast({
        title: t('test.form.error'),
        description: error.message || t('test.form.error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setSubmitting(false);
      throw error;
    }
  }, [onSubmit, toast, t]);

  const handlePersonaSelect = useCallback((values: CreateTestData, setFieldValue: any, personaId: string) => {
    const currentPersonaIds = Array.isArray(values.persona_ids) ? values.persona_ids : [];
    if (currentPersonaIds.includes(personaId)) {
      setFieldValue('persona_ids', currentPersonaIds.filter(id => id !== personaId));
    } else {
      setFieldValue('persona_ids', [...currentPersonaIds, personaId]);
    }
  }, []);

  const handleSelectAllPersonas = useCallback((values: CreateTestData, setFieldValue: any) => {
    const allPersonaIds = personas.map(p => p.id);
    setFieldValue('persona_ids', allPersonaIds);
  }, [personas]);

  const handleDeselectAllPersonas = useCallback((values: CreateTestData, setFieldValue: any) => {
    setFieldValue('persona_ids', []);
  }, []);

  return (
    <Card p={6}>
      <Formik
        initialValues={formInitialValues}
        validationSchema={TestSchema}
        onSubmit={handleFormSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, errors, touched, handleSubmit }) => {
          console.log('Erros do formulário:', JSON.stringify(errors, null, 2));
          console.log('Campos tocados:', JSON.stringify(touched, null, 2));
          return (
            <Form>
              <VStack spacing={6} align="stretch" bg={useColorModeValue('white', 'gray.900')} p={8} borderRadius="xl">
                {/* Seção Principal */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiPlus} color={useColorModeValue('teal.500', 'teal.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('test.form.sections.basic')}</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormInput
                      name="title"
                      label={t('test.form.title.label')}
                      description={t('test.form.title.description')}
                      placeholder={t('test.form.title.placeholder')}
                      onChange={(e) => {
                        const field = e.target;
                        field.setCustomValidity('');
                        checkTitle(e.target.value, setFieldValue, values);
                      }}
                    />
                    <FormInput
                      name="objective"
                      label={t('test.form.objective.label')}
                      description={t('test.form.objective.description')}
                      placeholder={t('test.form.objective.placeholder')}
                    />
                  </SimpleGrid>
                  <Box mt={6}>
                    <FormInput
                      name="description"
                      label={t('test.form.description.label')}
                      description={t('test.form.description.description')}
                      placeholder={t('test.form.description.placeholder')}
                      as="textarea"
                      rows={12}
                      sx={{
                        minHeight: '300px',
                        resize: 'vertical'
                      }}
                    />
                  </Box>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção de Configurações */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiCheck} color={useColorModeValue('green.500', 'green.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('test.form.sections.settings')}</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormInput
                      name="settings.max_iterations"
                      label={t('test.form.settings.maxIterations.label')}
                      description={t('test.form.settings.maxIterations.description')}
                      placeholder={t('test.form.settings.maxIterations.placeholder')}
                      type="number"
                    />
                    <FormInput
                      name="settings.response_format"
                      label={t('test.form.settings.responseFormat.label')}
                      description={t('test.form.settings.responseFormat.description')}
                      placeholder={t('test.form.settings.responseFormat.placeholder')}
                    />
                  </SimpleGrid>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
                    <FormInput
                      name="settings.interaction_style"
                      label={t('test.form.settings.interactionStyle.label')}
                      description={t('test.form.settings.interactionStyle.description')}
                      placeholder={t('test.form.settings.interactionStyle.placeholder')}
                    />
                  </SimpleGrid>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção de Tópicos */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiTarget} color={useColorModeValue('purple.500', 'purple.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('test.form.sections.topics')}</Text>
                  </HStack>
                  <FormLabel color={useColorModeValue('gray.800', 'white')}>{t('test.form.topics.label')}</FormLabel>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>
                    {t('test.form.topics.description')}
                  </Text>
                  <HStack>
                    <FormInput
                      name="newTopic"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder={t('test.form.topics.placeholder')}
                    />
                    <IconButton
                      aria-label="Adicionar tópico"
                      icon={<Icon as={FiPlus} />}
                      onClick={() => {
                        if (newTopic.trim()) {
                          setFieldValue('topics', [...values.topics, newTopic.trim()]);
                          setNewTopic('');
                        }
                      }}
                    />
                  </HStack>
                  <Wrap mt={2}>
                    {values.topics.map((topic, index) => (
                      <WrapItem key={index}>
                        <Tag size="md" variant="subtle" colorScheme="blue">
                          <TagLabel>{topic}</TagLabel>
                          <TagCloseButton
                            onClick={() =>
                              setFieldValue(
                                'topics',
                                values.topics.filter((_, i) => i !== index)
                              )
                            }
                          />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção de Personas */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiUsers} color={useColorModeValue('blue.500', 'blue.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('test.form.sections.personas')}</Text>
                  </HStack>
                  <FormLabel color={useColorModeValue('gray.800', 'white')}>{t('test.form.personas.label')}</FormLabel>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>
                    {t('test.form.personas.description')}
                  </Text>
                  <Button
                    leftIcon={<Icon as={FiUsers} />}
                    onClick={() => setIsPersonaModalOpen(true)}
                    variant="outline"
                    w="100%"
                  >
                    {t('test.form.personas.select')}
                  </Button>
                  <Wrap mt={2}>
                    {values.persona_ids.map((personaId) => {
                      const persona = personas.find((p) => p.id === personaId);
                      return (
                        persona && (
                          <WrapItem key={personaId}>
                            <Tag size="md" variant="subtle" colorScheme="blue">
                              <TagLabel>{persona.name}</TagLabel>
                              <TagCloseButton
                                onClick={() =>
                                  setFieldValue(
                                    'persona_ids',
                                    values.persona_ids.filter((id) => id !== personaId)
                                  )
                                }
                              />
                            </Tag>
                          </WrapItem>
                        )
                      );
                    })}
                  </Wrap>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção de Público Alvo */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiTarget} color={useColorModeValue('yellow.500', 'yellow.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('test.form.sections.targetAudience')}</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
                    {/* Coluna da Esquerda */}
                    <VStack spacing={6} align="stretch">
                      <FormInput
                        name="target_audience.age_range"
                        label={t('test.form.targetAudience.ageRange.label')}
                        description={t('test.form.targetAudience.ageRange.description')}
                        placeholder={t('test.form.targetAudience.ageRange.placeholder')}
                      />
                      <FormInput
                        name="target_audience.income"
                        label={t('test.form.targetAudience.income.label')}
                        description={t('test.form.targetAudience.income.description')}
                        placeholder={t('test.form.targetAudience.income.placeholder')}
                      />
                      <Box>
                        <FormLabel color={useColorModeValue('gray.800', 'white')} mb={0}>{t('test.form.targetAudience.painPoints.label')}</FormLabel>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>
                          {t('test.form.targetAudience.painPoints.description')}
                        </Text>
                        <HStack>
                          <FormInput
                            name="newPainPoint"
                            placeholder={t('test.form.targetAudience.painPoints.placeholder')}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  setFieldValue('target_audience.pain_points', [
                                    ...values.target_audience.pain_points,
                                    value,
                                  ]);
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                          <IconButton
                            aria-label="Adicionar ponto de dor"
                            icon={<Icon as={FiPlus} />}
                            onClick={(e) => {
                              const input = document.querySelector('input[name="newPainPoint"]') as HTMLInputElement;
                              const value = input?.value.trim();
                              if (value) {
                                setFieldValue('target_audience.pain_points', [
                                  ...values.target_audience.pain_points,
                                  value,
                                ]);
                                input.value = '';
                              }
                            }}
                          />
                        </HStack>
                        <Wrap mt={2}>
                          {values.target_audience.pain_points.map((painPoint, index) => (
                            <WrapItem key={index}>
                              <Tag size="md" borderRadius="full" variant="solid" colorScheme="red">
                                <TagLabel>{painPoint}</TagLabel>
                                <TagCloseButton
                                  onClick={() =>
                                    setFieldValue(
                                      'target_audience.pain_points',
                                      values.target_audience.pain_points.filter((_, i) => i !== index)
                                    )
                                  }
                                />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    </VStack>

                    {/* Coluna da Direita */}
                    <VStack spacing={6} align="stretch">
                      <FormInput
                        name="target_audience.location"
                        label={t('test.form.targetAudience.location.label')}
                        description={t('test.form.targetAudience.location.description')}
                        placeholder={t('test.form.targetAudience.location.placeholder')}
                      />
                      <Box>
                        <FormLabel color={useColorModeValue('gray.800', 'white')} mb={0}>{t('test.form.targetAudience.interests.label')}</FormLabel>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>
                          {t('test.form.targetAudience.interests.description')}
                        </Text>
                        <HStack>
                          <FormInput
                            name="newInterest"
                            placeholder={t('test.form.targetAudience.interests.placeholder')}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  setFieldValue('target_audience.interests', [
                                    ...values.target_audience.interests,
                                    value,
                                  ]);
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                          <IconButton
                            aria-label="Adicionar interesse"
                            icon={<Icon as={FiPlus} />}
                            onClick={(e) => {
                              const input = document.querySelector('input[name="newInterest"]') as HTMLInputElement;
                              const value = input?.value.trim();
                              if (value) {
                                setFieldValue('target_audience.interests', [
                                  ...values.target_audience.interests,
                                  value,
                                ]);
                                input.value = '';
                              }
                            }}
                          />
                        </HStack>
                        <Wrap mt={2}>
                          {values.target_audience.interests.map((interest, index) => (
                            <WrapItem key={index}>
                              <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                                <TagLabel>{interest}</TagLabel>
                                <TagCloseButton
                                  onClick={() =>
                                    setFieldValue(
                                      'target_audience.interests',
                                      values.target_audience.interests.filter((_, i) => i !== index)
                                    )
                                  }
                                />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                      <Box>
                        <FormLabel color={useColorModeValue('gray.800', 'white')} mb={0}>{t('test.form.targetAudience.needs.label')}</FormLabel>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>
                          {t('test.form.targetAudience.needs.description')}
                        </Text>
                        <HStack>
                          <FormInput
                            name="newNeed"
                            placeholder={t('test.form.targetAudience.needs.placeholder')}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  setFieldValue('target_audience.needs', [
                                    ...values.target_audience.needs,
                                    value,
                                  ]);
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                          <IconButton
                            aria-label="Adicionar necessidade"
                            icon={<Icon as={FiPlus} />}
                            onClick={(e) => {
                              const input = document.querySelector('input[name="newNeed"]') as HTMLInputElement;
                              const value = input?.value.trim();
                              if (value) {
                                setFieldValue('target_audience.needs', [
                                  ...values.target_audience.needs,
                                  value,
                                ]);
                                input.value = '';
                              }
                            }}
                          />
                        </HStack>
                        <Wrap mt={2}>
                          {values.target_audience.needs.map((need, index) => (
                            <WrapItem key={index}>
                              <Tag size="md" borderRadius="full" variant="solid" colorScheme="green">
                                <TagLabel>{need}</TagLabel>
                                <TagCloseButton
                                  onClick={() =>
                                    setFieldValue(
                                      'target_audience.needs',
                                      values.target_audience.needs.filter((_, i) => i !== index)
                                    )
                                  }
                                />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {showSubmitButton && (
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={isSubmitting}
                    loadingText={t('common.submitting')}
                  >
                    {submitLabel || t('test.form.submit')}
                  </Button>
                )}
              </VStack>

              {/* Modal de Seleção de Personas */}
              <Modal isOpen={isPersonaModalOpen} onClose={() => setIsPersonaModalOpen(false)} size="4xl">
                <ModalOverlay />
                <ModalContent bg={useColorModeValue('white', 'gray.800')} maxH="80vh">
                  <ModalHeader color={useColorModeValue('gray.800', 'white')} display="flex" alignItems="center" justifyContent="space-between" pr={16}>
                    <Text>{t('test.form.personas.modalTitle')}</Text>
                    <Button
                      size="sm"
                      onClick={() => {
                        const allPersonaIds = personas.map(p => p.id);
                        const shouldSelectAll = values.persona_ids.length < personas.length;
                        if (shouldSelectAll) {
                          handleSelectAllPersonas(values, setFieldValue);
                        } else {
                          handleDeselectAllPersonas(values, setFieldValue);
                        }
                      }}
                      colorScheme={values.persona_ids.length === personas.length ? "teal" : "gray"}
                    >
                      {values.persona_ids.length === personas.length 
                        ? t('test.form.personas.deselectAll')
                        : t('test.form.personas.selectAll')}
                    </Button>
                    <ModalCloseButton position="absolute" right={4} top={4} color={useColorModeValue('gray.800', 'white')} />
                  </ModalHeader>
                  <ModalBody pb={6} overflowY="auto">
                    {isLoadingPersonas ? (
                      <VStack spacing={4}>
                        <Skeleton height="60px" width="100%" />
                        <Skeleton height="60px" width="100%" />
                        <Skeleton height="60px" width="100%" />
                      </VStack>
                    ) : personas.length === 0 ? (
                      <Text color={useColorModeValue('gray.600', 'gray.400')}>{t('test.form.personas.noPersonas')}</Text>
                    ) : (
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                        {personas.map((persona) => (
                          <Box
                            key={persona.id}
                            as="button"
                            onClick={() => {
                              handlePersonaSelect(values, setFieldValue, persona.id);
                            }}
                            bg={values?.persona_ids?.includes(persona.id) 
                              ? useColorModeValue('teal.50', 'teal.800') 
                              : useColorModeValue('gray.50', 'gray.700')}
                            p={4}
                            borderRadius="md"
                            _hover={{ 
                              bg: values?.persona_ids?.includes(persona.id)
                                ? useColorModeValue('teal.100', 'teal.700')
                                : useColorModeValue('gray.100', 'gray.600')
                            }}
                            width="100%"
                            textAlign="left"
                          >
                            <HStack justify="space-between" align="start" w="100%">
                              <VStack align="start" spacing={2} flex={1}>
                                <Text color={useColorModeValue('gray.800', 'white')} fontWeight="bold" fontSize="lg">{persona.name}</Text>
                                <HStack spacing={2} color={useColorModeValue('gray.600', 'gray.300')} fontSize="sm">
                                  <Text>{persona.age} {t('test.form.personas.years')}</Text>
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
                              {values?.persona_ids?.includes(persona.id) && (
                                <Icon as={FiCheck} color={useColorModeValue('teal.500', 'teal.300')} boxSize={5} flexShrink={0} />
                              )}
                            </HStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
};

export default TestForm;
