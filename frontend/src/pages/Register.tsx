import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  Link,
  HStack,
  Icon,
  useColorModeValue,
  Card,
  VStack,
  Heading,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@hooks/useAuth';
import { FormInput } from '@components/FormInput';
import { ThemeToggle } from '@components/ThemeToggle';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
  password: Yup.string()
    .min(6, 'Must be at least 6 characters')
    .required('Required'),
  company: Yup.string().required('Required'),
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { name: string; email: string; password: string; company: string }) => {
    try {
      await register(values.name, values.email, values.password, values.company);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.700');
  const bgIcons = useColorModeValue('teal.200', 'rgba(255, 255, 255, 0.5)');
  const buttonBgColor = useColorModeValue('teal.500', 'teal.200');
  const buttonHoverBgColor = useColorModeValue('teal.600', 'teal.300');
  const buttonTextColor = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="100vh" w="100%" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
      <HStack position="absolute" top={4} right={4}>
        <ThemeToggle />
      </HStack>
      <Container maxW="md">
        <Card
          bg={useColorModeValue('white', 'navy.800')}
          borderRadius="2xl"
          boxShadow="xl"
          p={8}
        >
          <VStack spacing={8} align="stretch">
            <VStack spacing={2}>
              <Heading size="xl" color={useColorModeValue('gray.800', 'white')}>
                Welcome!
              </Heading>
              <Text
                fontSize="md"
                color={useColorModeValue('gray.600', 'gray.300')}
                textAlign="center"
              >
                Create your account to start using Crowdelic
              </Text>
            </VStack>

            <VStack spacing={6}>
              <Text
                fontSize="lg"
                color={useColorModeValue('gray.700', 'white')}
                fontWeight="medium"
              >
                Register With
              </Text>

              <HStack spacing={4} justify="center">
                {[
                  { icon: FaGoogle, label: 'Google' },
                  { icon: FaFacebook, label: 'Facebook' },
                  { icon: FaApple, label: 'Apple' }
                ].map((provider) => (
                  <IconButton
                    key={provider.label}
                    aria-label={`Sign up with ${provider.label}`}
                    icon={<Icon as={provider.icon} boxSize={5} />}
                    size="lg"
                    variant="outline"
                    borderRadius="xl"
                    borderWidth={2}
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _hover={{
                      borderColor: useColorModeValue('gray.400', 'gray.400'),
                      bg: useColorModeValue('gray.50', 'gray.700')
                    }}
                  />
                ))}
              </HStack>

              <HStack w="100%">
                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />
                <Text
                  px={4}
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  or
                </Text>
                <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />
              </HStack>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  company: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form style={{ width: '100%' }}>
                    <VStack spacing={4} w="100%">
                      <FormInput
                        name="name"
                        label="Name"
                        placeholder="Your name"
                      />
                      <FormInput
                        name="email"
                        label="Email"
                        placeholder="Your email address"
                      />
                      <FormInput
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Your password"
                      />
                      <FormInput
                        name="company"
                        label="Company"
                        placeholder="Your company name"
                      />
                      <Button
                        type="submit"
                        bg={buttonBgColor}
                        color={buttonTextColor}
                        _hover={{ bg: buttonHoverBgColor }}
                        size="lg"
                        w="100%"
                        h="50px"
                        borderRadius="xl"
                        isLoading={isSubmitting}
                        mt={2}
                      >
                        Sign Up
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </VStack>

            <HStack justify="center" spacing={1}>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Already have an account?
              </Text>
              <Link
                as={RouterLink}
                to="/login"
                color={useColorModeValue('teal.500', 'teal.200')}
                fontWeight="medium"
                _hover={{
                  color: useColorModeValue('teal.600', 'teal.300'),
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
            </HStack>
          </VStack>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
