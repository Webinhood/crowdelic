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
      await register(values);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const bgIcons = useColorModeValue('pink.100', 'whiteAlpha.200');
  const buttonBgColor = useColorModeValue('pink.500', 'pink.400');
  const buttonHoverBgColor = useColorModeValue('pink.600', 'pink.500');
  const buttonTextColor = useColorModeValue('white', 'white');

  return (
    <Box minH="100vh" w="100%" 
      bgGradient={useColorModeValue(
        'linear(to-br, gray.50, pink.50)',
        'linear(to-br, gray.900, purple.900)'
      )} 
      py={8}>
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
                Bem-vindo!
              </Heading>
              <Text
                fontSize="md"
                color={useColorModeValue('gray.600', 'gray.300')}
                textAlign="center"
              >
                Crie sua conta e comece a usar o Crowdelic
              </Text>
            </VStack>

            <VStack spacing={6}>
              <Text
                fontSize="lg"
                color={useColorModeValue('gray.700', 'white')}
                fontWeight="medium"
              >
                Crie sua conta com
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
                    borderColor={useColorModeValue('gray.200', 'pink.700')}
                    _hover={{
                      borderColor: useColorModeValue('pink.400', 'pink.500'),
                      bg: useColorModeValue('pink.50', 'whiteAlpha.100')
                    }}
                  />
                ))}
              </HStack>

              <HStack w="100%">
                <Divider borderColor={useColorModeValue('gray.200', 'pink.700')} />
                <Text
                  px={4}
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  ou
                </Text>
                <Divider borderColor={useColorModeValue('gray.200', 'pink.700')} />
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
                        label="Nome"
                        placeholder="Seu nome"
                      />
                      <FormInput
                        name="email"
                        label="Email"
                        placeholder="Seu email"
                      />
                      <FormInput
                        name="password"
                        label="Senha"
                        type="password"
                        placeholder="Sua senha"
                      />
                      <FormInput
                        name="company"
                        label="Empresa"
                        placeholder="Nome da sua empresa"
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
                        Cadastrar
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </VStack>

            <HStack justify="center" spacing={1}>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                já tem uma conta?
              </Text>
              <Link
                as={RouterLink}
                to="/login"
                color={useColorModeValue('pink.500', 'pink.200')}
                fontWeight="medium"
                _hover={{
                  color: useColorModeValue('pink.600', 'pink.300'),
                  textDecoration: 'none'
                }}
              >
                Entrar
              </Link>
            </HStack>
          </VStack>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
