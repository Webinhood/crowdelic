import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Icon,
  HStack,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Container,
  Card,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { FaEnvelope, FaLock, FaUserCircle, FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { useAuth } from '@hooks/useAuth';
import { LoginSchema } from '@utils/validation';
import { ThemeToggle } from '@components/ThemeToggle';
import { FormInput } from '@components/FormInput';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const buttonBgColor = useColorModeValue('pink.500', 'pink.400');
  const buttonHoverBgColor = useColorModeValue('pink.600', 'pink.500');
  const buttonTextColor = useColorModeValue('white', 'white');
  const textColor = useColorModeValue('gray.700', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('pink.200', 'pink.700');

  return (
    <Box minH="100vh" w="100%" 
      bg={useColorModeValue('gray.50', 'gray.900')} 
      display="flex" alignItems="center" justifyContent="center"
      bgGradient={useColorModeValue(
        'linear(to-br, gray.50, pink.50)',
        'linear(to-br, gray.900, purple.900)'
      )}>
      <HStack position="absolute" top={4} right={4}>
        <ThemeToggle />
      </HStack>
      
      <Container maxW="md">
        <Card
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="2xl"
          boxShadow="xl"
          p={8}
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'pink.800')}
          _hover={{
            borderColor: useColorModeValue('pink.200', 'pink.700'),
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <VStack spacing={8} align="stretch">
            <VStack spacing={2}>
              <Heading size="xl" color={useColorModeValue('gray.800', 'white')}>
                Bem vindo!
              </Heading>
              <Text
                fontSize="md"
                color={useColorModeValue('gray.600', 'gray.300')}
                textAlign="center"
              >
                Faça login para continuar no Crowdelic
              </Text>
            </VStack>

            <VStack spacing={6}>
              <Text
                fontSize="lg"
                color={useColorModeValue('gray.700', 'white')}
                fontWeight="medium"
              >
                Entrar com
              </Text>

              <HStack spacing={4} justify="center">
                {[
                  { icon: FaGoogle, label: 'Google' },
                  { icon: FaFacebook, label: 'Facebook' },
                  { icon: FaApple, label: 'Apple' }
                ].map((provider) => (
                  <IconButton
                    key={provider.label}
                    aria-label={`Sign in with ${provider.label}`}
                    icon={<Icon as={provider.icon} boxSize={5} />}
                    size="lg"
                    variant="outline"
                    borderRadius="xl"
                    borderWidth={2}
                    borderColor={useColorModeValue('gray.200', 'pink.700')}
                    _hover={{
                      borderColor: useColorModeValue('pink.400', 'pink.500'),
                      bg: useColorModeValue('pink.50', 'whiteAlpha.100')
                    }}
                  />
                ))}
              </HStack>

              <HStack w="100%">
                <Divider borderColor={useColorModeValue('gray.200', 'pink.600')} />
                <Text
                  px={4}
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  ou
                </Text>
                <Divider borderColor={useColorModeValue('gray.200', 'pink.600')} />
              </HStack>

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    console.log('Form submitted with:', values);
                    await login({ email: values.email, password: values.password });
                    console.log('Login successful, navigating to /');
                    navigate('/', { replace: true });
                  } catch (error: any) {
                    console.error('Login form error:', error);
                    toast({
                      title: 'Error',
                      description: error.message || 'Failed to login',
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                    });
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form style={{ width: '100%' }}>
                    <VStack spacing={4} w="100%">
                      <FormInput
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="Seu email"
                      />

                      <FormInput
                        name="password"
                        label="Senha"
                        type="password"
                        placeholder="Sua senha"
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
                        Entrar
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </VStack>

            <HStack justify="center" spacing={1}>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Não tem uma conta?
              </Text>
              <Link
                as={RouterLink}
                to="/register"
                color={useColorModeValue('pink.500', 'pink.400')}
                fontWeight="medium"
                _hover={{
                  color: useColorModeValue('pink.600', 'pink.500'),
                  textDecoration: 'none'
                }}
              >
                Cadastrar
              </Link>
            </HStack>
          </VStack>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
