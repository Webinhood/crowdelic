import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  VStack,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  ScaleFade,
  SlideFade,
  Select,
  Divider,
  Text,
  SimpleGrid,
  Wrap,
  WrapItem,
  Icon,
  InputRightElement,
  useColorModeValue
} from '@chakra-ui/react';
import { FiPlus, FiCheck, FiUser, FiTarget, FiX } from 'react-icons/fi';
import { PersonaSchema } from '@utils/validation';
import type { CreatePersonaData } from '@services/persona';
import { Card } from './Card';
import { FormInput } from './FormInput';
import { useTranslation } from 'react-i18next';

interface PersonaFormProps {
  initialValues?: CreatePersonaData;
  onSubmit: (values: CreatePersonaData) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  showSubmitButton?: boolean;
}

const defaultValues: CreatePersonaData = {
  name: '',
  description: '',
  age: '',
  occupation: '',
  income: '',
  location: '',
  family_status: '',
  education: '',
  daily_routine: '',
  challenges: '',
  goals: [],
  frustrations: '',
  interests: [],
  habits: '',
  digital_skills: '',
  spending_habits: '',
  decision_factors: '',
  personality_traits: '',
  background_story: '',
  traits: []
};

const PersonaForm: React.FC<PersonaFormProps> = ({
  initialValues = defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  showSubmitButton = true,
}) => {
  const { t } = useTranslation();
  const toast = useToast();

  return (
    <Card>
      <Formik
        initialValues={initialValues}
        validationSchema={PersonaSchema}
        onSubmit={async (values, { setSubmitting }) => {
          console.log('Raw form values:', values);
          try {
            // Clean up arrays to remove any empty strings
            const submissionData = {
              ...values,
              goals: values.goals?.filter(g => g.trim()) || [],
              interests: values.interests?.filter(i => i.trim()) || [],
              challenges: values.challenges,
              frustrations: values.frustrations,
              habits: values.habits,
              decision_factors: values.decision_factors,
              age: Number(values.age) // Converter age para número
            };
            console.log('Transformed data for submission:', submissionData);
            
            console.log('Calling parent onSubmit');
            await onSubmit(submissionData);
            console.log('Parent onSubmit completed');
          } catch (error: any) {
            console.error('Form submission error:', error);
            toast({
              title: t('toast.error.title'),
              description: error.response?.data?.details || error.message || t('toast.error.description'),
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            throw error; // Re-throw to trigger mutation error handler
          }
        }}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isSubmitting: formIsSubmitting, values, setFieldValue, errors, touched, handleSubmit }) => {
          const [newGoal, setNewGoal] = React.useState('');
          const [newInterest, setNewInterest] = React.useState('');

          const handleAddGoal = () => {
            if (newGoal.trim()) {
              setFieldValue('goals', [...values.goals, newGoal.trim()]);
              setNewGoal('');
            }
          };

          const handleAddInterest = () => {
            if (newInterest.trim()) {
              setFieldValue('interests', [...values.interests, newInterest.trim()]);
              setNewInterest('');
            }
          };

          return (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Form submit event triggered');
                console.log('Current form values:', values);
                console.log('Current validation errors:', errors);
                
                // Check for validation errors
                if (Object.keys(errors).length > 0) {
                  console.log('Form has validation errors:', errors);
                  toast({
                    title: t('toast.error.title'),
                    description: t('toast.error.description'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  });
                  return;
                }

                // If no errors, submit the form
                console.log('Form is valid, submitting...');
                handleSubmit(e);
              }}
              noValidate
            >
              <VStack spacing={6} align="stretch" bg={useColorModeValue('white', 'gray.900')} p={8} borderRadius="xl">
                {/* Seção Principal */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiUser} color={useColorModeValue('teal.500', 'teal.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('persona.sections.personal')}</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormInput
                      name="name"
                      label={t('persona.fields.name.label')}
                      placeholder={t('persona.fields.name.placeholder')}
                      description={t('persona.fields.name.description')}
                    />
                    <FormInput
                      name="age"
                      label={t('persona.fields.age.label')}
                      placeholder={t('persona.fields.age.placeholder')}
                      description={t('persona.fields.age.description')}
                    />
                    <FormInput
                      name="occupation"
                      label={t('persona.fields.occupation.label')}
                      placeholder={t('persona.fields.occupation.placeholder')}
                      description={t('persona.fields.occupation.description')}
                    />
                    <FormInput
                      name="education"
                      label={t('persona.fields.education.label')}
                      placeholder={t('persona.fields.education.placeholder')}
                      description={t('persona.fields.education.description')}
                    />
                  </SimpleGrid>
                </Box>
                
                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção Financeira e Localização */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiTarget} color={useColorModeValue('purple.500', 'purple.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('persona.sections.location')}</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormInput
                      name="income"
                      label={t('persona.fields.income.label')}
                      placeholder={t('persona.fields.income.placeholder')}
                      description={t('persona.fields.income.description')}
                    />
                    <FormInput
                      name="location"
                      label={t('persona.fields.location.label')}
                      placeholder={t('persona.fields.location.placeholder')}
                      description={t('persona.fields.location.description')}
                    />
                    <FormInput
                      name="family_status"
                      label={t('persona.fields.family_status.label')}
                      placeholder={t('persona.fields.family_status.placeholder')}
                      description={t('persona.fields.family_status.description')}
                    />
                    <FormInput
                      name="description"
                      label={t('persona.fields.description.label')}
                      placeholder={t('persona.fields.description.placeholder')}
                      description={t('persona.fields.description.description')}
                      as="textarea"
                      rows={4}
                    />
                  </SimpleGrid>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção Rotina Diária */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiCheck} color={useColorModeValue('green.500', 'green.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('persona.sections.daily')}</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
                    <FormInput
                      name="daily_routine"
                      label={t('persona.fields.daily_routine.label')}
                      as="textarea"
                      rows={3}
                      placeholder={t('persona.fields.daily_routine.placeholder')}
                      description={t('persona.fields.daily_routine.description')}
                    />
                    <FormInput
                      name="digital_skills"
                      label={t('persona.fields.digital_skills.label')}
                      as="textarea"
                      rows={2}
                      placeholder={t('persona.fields.digital_skills.placeholder')}
                      description={t('persona.fields.digital_skills.description')}
                    />
                    <FormInput
                      name="spending_habits"
                      label={t('persona.fields.spending_habits.label')}
                      as="textarea"
                      rows={2}
                      placeholder={t('persona.fields.spending_habits.placeholder')}
                      description={t('persona.fields.spending_habits.description')}
                    />
                    <FormInput
                      name="habits"
                      label={t('persona.fields.habits.label')}
                      as="textarea"
                      rows={2}
                      placeholder={t('persona.fields.habits.placeholder')}
                      description={t('persona.fields.habits.description')}
                    />
                  </SimpleGrid>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção Personalidade */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiUser} color={useColorModeValue('blue.500', 'blue.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('persona.sections.personality')}</Text>
                  </HStack>
                  <VStack spacing={6}>
                    <FormInput
                      name="personality_traits"
                      label={t('persona.fields.personality_traits.label')}
                      placeholder={t('persona.fields.personality_traits.placeholder')}
                      description={t('persona.fields.personality_traits.description')}
                      as="textarea"
                      rows={4}
                    />
                    <FormInput
                      name="background_story"
                      label={t('persona.fields.background_story.label')}
                      placeholder={t('persona.fields.background_story.placeholder')}
                      description={t('persona.fields.background_story.description')}
                      as="textarea"
                      rows={4}
                    />
                    <Box w="100%">
                      <FormControl isInvalid={!!errors.traits && touched.traits}>
                        <FormLabel color={useColorModeValue('gray.800', 'white')}>{t('persona.fields.traits.label')}
                        <FormHelperText color={useColorModeValue('gray.600', 'gray.400')}>
                          {t('persona.fields.traits.description')}
                        </FormHelperText>
                        </FormLabel>
                        <HStack mb={2}>
                          <Field
                            as="input"
                            name="newTrait"
                            value={newGoal}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoal(e.target.value)}
                            placeholder={t('persona.fields.traits.placeholder')}
                            style={{
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #4A5568',
                              background: 'transparent',
                              color: 'white',
                              width: '100%'
                            }}
                          />
                          <IconButton
                            aria-label="Add trait"
                            icon={<FiPlus />}
                            onClick={() => {
                              if (newGoal.trim()) {
                                setFieldValue('traits', [...values.traits, newGoal.trim()]);
                                setNewGoal('');
                              }
                            }}
                            colorScheme="blue"
                          />
                        </HStack>
                        <Wrap spacing={2} mb={2}>
                          {values.traits.map((trait, index) => (
                            <WrapItem key={index}>
                              <Tag
                                size="md"
                                borderRadius="full"
                                variant="subtle"
                                colorScheme="blue"
                              >
                                <TagLabel>{trait}</TagLabel>
                                <TagCloseButton
                                  onClick={() => {
                                    const newTraits = values.traits.filter((_, i) => i !== index);
                                    setFieldValue('traits', newTraits);
                                  }}
                                />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </FormControl>
                    </Box>
                  </VStack>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção Motivações e Desafios */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiTarget} color={useColorModeValue('yellow.500', 'yellow.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('persona.sections.motivations')}</Text>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
                    <FormInput
                      name="challenges"
                      label={t('persona.fields.challenges.label')}
                      as="textarea"
                      rows={3}
                      placeholder={t('persona.fields.challenges.placeholder')}
                      description={t('persona.fields.challenges.description')}
                    />
                    <FormInput
                      name="frustrations"
                      label={t('persona.fields.frustrations.label')}
                      as="textarea"
                      rows={2}
                      placeholder={t('persona.fields.frustrations.placeholder')}
                      description={t('persona.fields.frustrations.description')}
                    />
                    <FormInput
                      name="decision_factors"
                      label={t('persona.fields.decision_factors.label')}
                      as="textarea"
                      rows={2}
                      placeholder={t('persona.fields.decision_factors.placeholder')}
                      description={t('persona.fields.decision_factors.description')}
                    />
                  </SimpleGrid>
                </Box>

                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />

                {/* Seção Objetivos e Interesses */}
                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiTarget} color={useColorModeValue('red.500', 'red.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('persona.sections.goals')}</Text>
                  </HStack>
                  <Box w="100%">
                    <FormControl>
                      <FormLabel color={useColorModeValue('gray.800', 'white')}>{t('persona.fields.goals.label')}
                      <FormHelperText color={useColorModeValue('gray.600', 'gray.400')}>
                        {t('persona.fields.goals.description')}
                      </FormHelperText>
                      </FormLabel>
                      <HStack mb={2}>
                        <Field
                          as="input"
                          name="newGoal"
                          value={newGoal}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoal(e.target.value)}
                          placeholder={t('persona.fields.goals.placeholder')}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddGoal();
                            }
                          }}
                          style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #4A5568',
                            background: 'transparent',
                            color: 'white',
                            width: '100%'
                          }}
                        />
                        <IconButton
                          aria-label="Add goal"
                          icon={<FiPlus />}
                          onClick={handleAddGoal}
                          colorScheme="blue"
                        />
                      </HStack>
                      <Wrap spacing={2} mb={2}>
                        {values.goals?.map((goal, index) => (
                          <WrapItem key={index}>
                            <Tag
                              size="md"
                              borderRadius="full"
                              variant="subtle"
                              colorScheme="blue"
                            >
                              <TagLabel>{goal}</TagLabel>
                              <TagCloseButton
                                onClick={() => {
                                  const newGoals = values.goals?.filter((_, i) => i !== index);
                                  setFieldValue('goals', newGoals);
                                }}
                              />
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </FormControl>
                  </Box>
                </Box>

                <Box>
                  <HStack mb={6} align="center">
                    <Icon as={FiTarget} color={useColorModeValue('purple.500', 'purple.300')} boxSize={5} />
                    <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>{t('persona.sections.interests')}</Text>
                  </HStack>
                  <Box w="100%">
                    <FormControl>
                      <FormLabel color={useColorModeValue('gray.800', 'white')}>{t('persona.fields.interests.label')}
                      <FormHelperText color={useColorModeValue('gray.600', 'gray.400')}>
                        {t('persona.fields.interests.description')}
                      </FormHelperText>
                      </FormLabel>
                      <HStack mb={2}>
                        <Field
                          as="input"
                          name="newInterest"
                          value={newInterest}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInterest(e.target.value)}
                          placeholder={t('persona.fields.interests.placeholder')}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInterest();
                            }
                          }}
                          style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #4A5568',
                            background: 'transparent',
                            color: 'white',
                            width: '100%'
                          }}
                        />
                        <IconButton
                          aria-label="Add interest"
                          icon={<FiPlus />}
                          onClick={handleAddInterest}
                          colorScheme="blue"
                        />
                      </HStack>
                      <Wrap spacing={2} mb={2}>
                        {values.interests?.map((interest, index) => (
                          <WrapItem key={index}>
                            <Tag
                              size="md"
                              borderRadius="full"
                              variant="subtle"
                              colorScheme="blue"
                            >
                              <TagLabel>{interest}</TagLabel>
                              <TagCloseButton
                                onClick={() => {
                                  const newInterests = values.interests?.filter((_, i) => i !== index);
                                  setFieldValue('interests', newInterests);
                                }}
                              />
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </FormControl>
                  </Box>
                </Box>

                {showSubmitButton && (
                  <Box mt={6}>
                    <Button
                      type="submit"
                      colorScheme="teal"
                      size="lg"
                      width="100%"
                      isLoading={formIsSubmitting || isSubmitting}
                      loadingText={t('button.loading')}
                    >
                      {submitLabel}
                    </Button>
                  </Box>
                )}
              </VStack>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
};

export default PersonaForm;
