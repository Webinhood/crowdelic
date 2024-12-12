import { motion } from 'framer-motion';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  SimpleGrid,
  Image,
  IconButton,
  Icon,
  UnorderedList,
  ListItem,
  ListIcon,
  useBreakpointValue,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaUsers,
  FaLightbulb,
  FaChartLine,
  FaCog,
  FaRocket,
  FaBrain,
  FaPuzzlePiece,
  FaPiggyBank,
  FaTools,
  FaExpandArrowsAlt,
  FaCheckCircle,
  FaRobot,
} from 'react-icons/fa';

interface Colors {
  primary: string;
  secondary: string;
  dark: string;
  light: string;
}

interface CarouselStyles {
  wrapper: React.CSSProperties & {
    position: 'relative';
    display: 'flex';
    flexDirection: 'column';
  };
  nicheSelector: React.CSSProperties & {
    display: 'flex';
  };
  nicheButton: Record<string, any>;
  navigationContainer: React.CSSProperties;
  navigationButton: Record<string, any>;
  container: React.CSSProperties & {
    position: 'relative';
  };
  card: React.CSSProperties & {
    position: 'absolute';
  };
}

interface FloatingCardsStyles {
  card: React.CSSProperties & {
    position: 'absolute';
    animation?: string;
  };
}

const colors: Colors = {
  primary: '#472781',
  secondary: '#F42A80',
  dark: '#2D2D2D',
  light: '#E0DEDF'
};

const ExampleCard = ({ 
  title, 
  situation, 
  problem, 
  withCrowdelic, 
  result 
}: { 
  title: string; 
  situation: string;
  problem: string;
  withCrowdelic: string[];
  result: string;
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
      transition="all 0.3s"
    >
      <Box p={6}>
        <Heading size="md" color={useColorModeValue('teal.600', 'teal.200')} mb={4}>
          {title}
        </Heading>
        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>Situação:</Text>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>{situation}</Text>
        </Box>
        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>Problema:</Text>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>{problem}</Text>
        </Box>
        <Box mb={4}>
          <Text fontWeight="bold" mb={2}>Com Crowdelic:</Text>
          <UnorderedList spacing={2} styleType="none" ml={0}>
            {withCrowdelic.map((item, index) => (
              <ListItem key={index} display="flex" alignItems="center">
                <ListIcon as={FaCheckCircle} color="teal.500" />
                <Text color={useColorModeValue('gray.600', 'gray.400')}>{item}</Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>Resultado:</Text>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>{result}</Text>
        </Box>
      </Box>
    </Box>
  );
};

const Feature = ({ title, text, icon }: { title: string; text: string; icon: React.ElementType }) => {
  return (
    <Box>
      <Flex align="center" mb={4}>
        <Box
          p={2}
          bg="rgba(244, 42, 128, 0.1)"
          borderRadius="lg"
          color="#F42A80"
          mr={4}
        >
          <Icon as={icon} boxSize={5} />
        </Box>
        <Heading size="md" color="white">{title}</Heading>
      </Flex>
      <Text color="whiteAlpha.800">{text}</Text>
    </Box>
  );
};

const StepCard = ({ number, title, items }: { number: number; title: string; items: string[] }) => {
  return (
    <Box
      p={6}
      borderRadius="xl"
      bg="rgba(244, 42, 128, 0.03)"
      border="1px solid"
      borderColor="rgba(244, 42, 128, 0.1)"
      _hover={{
        transform: 'translateY(-4px)',
        bg: 'rgba(244, 42, 128, 0.05)',
        borderColor: 'rgba(244, 42, 128, 0.2)',
      }}
      transition="all 0.3s"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w={10}
        h={10}
        borderRadius="full"
        bg="rgba(244, 42, 128, 0.1)"
        color="#F42A80"
        fontSize="lg"
        fontWeight="bold"
        mb={4}
      >
        {number}
      </Box>
      <Heading size="md" color="white" mb={4}>{title}</Heading>
      <UnorderedList spacing={2} styleType="none" ml={0}>
        {items.map((item, index) => (
          <ListItem
            key={index}
            color="whiteAlpha.800"
            display="flex"
            alignItems="center"
            _before={{
              content: '""',
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: 'full',
              bg: '#F42A80',
              mr: 3,
            }}
          >
            {item}
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
};

const DifferentialCard = ({ title, items, icon }: { title: string; items: string[]; icon: React.ElementType }) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={8}
      position="relative"
      _hover={{ 
        transform: 'translateY(-4px)',
        shadow: 'lg',
      }}
      transition="all 0.3s"
      height="full"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        bgGradient: `linear(to-r, ${colors.primary}, ${colors.secondary})`
      }}
    >
      <VStack align="start" spacing={6}>
        <Flex
          w={14}
          h={14}
          align="center"
          justify="center"
          color="white"
          rounded="lg"
          bg={colors.primary}
        >
          <Icon as={icon} w={6} h={6} />
        </Flex>
        <Heading 
          size="md" 
          color={colors.dark}
          fontWeight="semibold"
          letterSpacing="tight"
        >
          {title}
        </Heading>
        <VStack align="start" spacing={3} w="full">
          {items.map((item, index) => (
            <HStack key={index} align="start" spacing={3}>
              <Icon 
                as={FaCheckCircle} 
                color={colors.secondary}
                w={5} 
                h={5}
                mt={1} 
              />
              <Text 
                color={colors.dark}
                fontSize="md"
              >
                {item}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

const UseCaseCard = ({ 
  title, 
  situation, 
  problem, 
  withCrowdelic, 
  result 
}: { 
  title: string; 
  situation: string;
  problem: string;
  withCrowdelic: string[];
  result: string;
}) => {
  return (
    <Box
      w="100%"
      h="550px"
      bg="rgb(42, 22, 80)"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
      display="flex"
      flexDirection="column"
    >
      <Box flex="1" p={8}>
        <VStack spacing={6} align="stretch">
          <VStack spacing={4} align="start">
            <Text color="whiteAlpha.800" fontSize="md" fontWeight="normal" lineHeight="tall">
              {situation}
            </Text>
          </VStack>

          <VStack spacing={3} align="start">
            <Heading
              as="h3"
              fontSize="2xl"
              fontWeight="bold"
              color="white"
              lineHeight="shorter"
            >
              {title}
            </Heading>
            <Text fontSize="md" color="#F42A80" fontWeight="medium">
              {problem}
            </Text>
          </VStack>

          <Box>
            <Text fontSize="sm" color="whiteAlpha.700" mb={3}>
              Com a Crowdelic:
            </Text>
            <VStack spacing={3} align="stretch">
              {withCrowdelic.map((item, index) => (
                <HStack key={index} spacing={3}>
                  <Icon as={FaCheckCircle} color="#F42A80" boxSize={4} />
                  <Text color="whiteAlpha.900" fontSize="sm">{item}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Box>

      <Box
        p={4}
        bg="rgba(244, 42, 128, 0.1)"
        borderTop="1px solid"
        borderColor="rgba(244, 42, 128, 0.2)"
      >
        <HStack spacing={3}>
          <Icon as={FaLightbulb} color="#F42A80" boxSize={4} />
          <Text color="white" fontSize="sm" fontWeight="medium">
            Resultado: {result}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};

const useCases = {
  produto: {
    title: "Time de banco validando novo cartão",
    situation: "Lançamento de cartão para público jovem",
    problem: "Como validar features sem expor ao mercado?",
    withCrowdelic: [
      "Testa benefícios com 50 personas de 18-25 anos",
      "Valida comunicação do produto",
      "Identifica pontos de resistência",
      "Otimiza processo de solicitação"
    ],
    result: "Lançamento otimizado baseado em dados"
  },
  agencias: {
    title: "Agência criando campanha de cerveja",
    situation: "Novo posicionamento para marca premium",
    problem: "Como testar conceitos sem gastar com grupos focais?",
    withCrowdelic: [
      "Testa 5 conceitos diferentes",
      "Valida com personas de diferentes classes sociais",
      "Analisa percepção de valor",
      "Refina mensagens-chave"
    ],
    result: "Apresentação para cliente com dados concretos"
  },
  ecommerce: {
    title: "Loja de cosméticos naturais",
    situation: "Produtos não estão convertendo bem",
    problem: "Por que pessoas abandonam o carrinho?",
    withCrowdelic: [
      "Testa diferentes descrições de produto",
      "Valida fotos e apresentação",
      "Analisa objeções de compra",
      "Otimiza argumentos de venda"
    ],
    result: "Aumento nas conversões"
  },
  criadores: {
    title: "Canal de finanças no YouTube",
    situation: "Planejamento de série sobre investimentos",
    problem: "Que temas vão engajar mais?",
    withCrowdelic: [
      "Testa 20 ideias de títulos",
      "Valida estrutura dos vídeos",
      "Valida roteiros",
      "Analisa gatilhos de interesse",
      "Otimiza thumbnails"
    ],
    result: "Série planejada com base em dados"
  },
  marketing: {
    title: "Lançamento de curso online",
    situation: "Sequência de emails para vendas",
    problem: "Como otimizar antes de enviar?",
    withCrowdelic: [
      "Testa diferentes assuntos",
      "Valida copywriting",
      "Analisa pontos de objeção",
      "Otimiza calls-to-action"
    ],
    result: "Sequência validada antes do envio"
  },
  negocios: {
    title: "Cafeteria local",
    situation: "Novo cardápio de inverno",
    problem: "Como validar preços e itens?",
    withCrowdelic: [
      "Testa descrições dos pratos",
      "Valida faixas de preço",
      "Analisa combinações",
      "Otimiza promoções"
    ],
    result: "Cardápio otimizado para o público"
  },
  copywriters: {
    title: "Landing page de serviço",
    situation: "Página de captação para consultoria",
    problem: "Como maximizar conversões?",
    withCrowdelic: [
      "Testa diferentes headlines",
      "Valida argumentos de venda",
      "Valida objeções e dores",
      "Analisa pontos de fricção",
      "Otimiza formulário"
    ],
    result: "Página validada antes do lançamento"
  },
  social: {
    title: "Marca de moda sustentável",
    situation: "Campanha de consciência ambiental",
    problem: "Como engajar sem parecer forçado?",
    withCrowdelic: [
      "Testa tons de mensagem",
      "Valida hashtags",
      "Analisa relevância",
      "Otimiza calls-to-action"
    ],
    result: "Campanha alinhada com público-alvo"
  }
};

const howItWorks = [
  {
    title: "Escolha seu caso de uso",
    items: [
      "Selecione o tipo de teste",
      "Defina objetivos",
      "Escolha métricas"
    ]
  },
  {
    title: "Configure suas personas",
    items: [
      "Use templates prontos por indústria ou crie do zero",
      "Customize características",
      "Defina comportamentos específicos"
    ]
  },
  {
    title: "Execute os testes",
    items: [
      "Adicione seu conteúdo",
      "Defina cenários",
      "Receba feedback em minutos"
    ]
  },
  {
    title: "Interaja",
    items: [
      "Itere o quanto quiser individualmente ou em grupo",
      "Converse com as personas",
      "Rode grupos focais de personas que conversam entre si"
    ]
  },
  {
    title: "Analise resultados",
    items: [
      "Veja feedback e relatórios detalhados",
      "Receba sugestões práticas"
    ]
  }
];

const differentials = [
  {
    title: "Velocidade e escala",
    icon: FaClock,
    items: [
      "De semanas para minutos",
      "Teste com centenas de personas simultaneamente",
      "Iterações e ajustes instantâneos"
    ]
  },
  {
    title: "Simulação realista",
    icon: FaUsers,
    items: [
      "Personas que interagem entre si",
      "Comportamentos genuínos e contextualizados",
      "Simulação de cenários complexos",
      "Feedback natural e detalhado"
    ]
  },
  {
    title: "Personalização avançada",
    icon: FaLightbulb,
    items: [
      "Personas altamente customizáveis",
      "Cenários específicos por indústria",
      "Ambientes de teste controlados",
      "Templates especializados por setor"
    ]
  },
  {
    title: "Custo-benefício",
    icon: FaChartLine,
    items: [
      "Economia de +90% vs métodos tradicionais",
      "Sem custos de recrutamento"
    ]
  },
  {
    title: "Praticidade e controle",
    icon: FaCog,
    items: [
      "Interface intuitiva",
      "Resultados estruturados",
      "Condições de teste controláveis",
      "Análises detalhadas",
      "Exportação de insights"
    ]
  },
  {
    title: "Inteligência coletiva",
    icon: FaBrain,
    items: [
      "Personas interagem em grupo",
      "Simulação de dinâmicas sociais",
      "Discussões em grupo",
      "Feedback multilateral"
    ]
  },
  {
    title: "Flexibilidade de uso",
    icon: FaExpandArrowsAlt,
    items: [
      "Múltiplos casos de uso",
      "Adaptável a diferentes indústrias",
      "Customização por necessidade",
      "Escalável conforme demanda"
    ]
  }
];

const carouselStyles: CarouselStyles = {
  wrapper: {
    position: 'relative' as const,
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
    marginTop: '-40px',
  },
  
  nicheSelector: {
    display: 'flex' as const,
    gap: '12px',
    marginBottom: '20px',
    zIndex: 20,
    position: 'relative' as const,
  },

  nicheButton: {
    bg: 'rgba(71, 39, 129, 0.1)',
    color: 'white',
    px: '24px',
    py: '12px',
    borderRadius: 'full',
    fontSize: 'md',
    fontWeight: 'medium',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s',
    border: '1px solid',
    borderColor: 'rgba(71, 39, 129, 0.2)',
    _hover: {
      bg: 'rgba(244, 42, 128, 0.1)',
      borderColor: 'rgba(244, 42, 128, 0.4)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(244, 42, 128, 0.15)',
    },
    _active: {
      bg: 'rgba(244, 42, 128, 0.15)',
      transform: 'translateY(0)',
    },
    _selected: {
      bg: 'rgba(244, 42, 128, 0.1)',
      borderColor: 'rgba(244, 42, 128, 0.4)',
      boxShadow: '0 0 15px rgba(244, 42, 128, 0.2)',
    },
  },
  
  navigationContainer: {
    position: 'relative',
    display: 'flex',
    gap: '24px',
    zIndex: 30,
    padding: '12px 24px',
    borderRadius: 'full',
    background: 'linear-gradient(135deg, rgba(71, 39, 129, 0.4) 0%, rgba(244, 42, 128, 0.4) 100%)',
    backdropFilter: 'blur(10px)',
    margin: '0 auto',
    marginTop: '-60px',
    width: 'fit-content',
    border: '1px solid',
    borderColor: 'rgba(244, 42, 128, 0.2)',
    boxShadow: '0 4px 16px rgba(31, 38, 135, 0.15)',
  },
  
  navigationButton: {
    bg: 'rgba(71, 39, 129, 0.3)',
    color: 'white',
    _hover: { 
      bg: 'rgba(244, 42, 128, 0.3)',
      transform: 'scale(1.05)',
      boxShadow: '0 0 8px rgba(244, 42, 128, 0.3)',
    },
    _active: {
      bg: 'rgba(244, 42, 128, 0.4)',
      transform: 'scale(0.95)',
    },
    size: 'md',
    width: '36px',
    height: '36px',
    borderRadius: 'full',
    transition: 'all 0.3s',
    border: '1px solid',
    borderColor: 'rgba(244, 42, 128, 0.2)',
  },
  
  container: {
    position: 'relative' as const,
    height: '650px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    marginBottom: '40px',
  },
  
  card: {
    position: 'absolute' as const,
    width: '400px',
    height: '600px',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform, opacity',
  },
};

const floatingCardsStyles: FloatingCardsStyles = {
  card: {
    position: 'absolute' as const,
    borderRadius: '2xl',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(244, 42, 128, 0.15)',
    border: '1px solid',
    borderColor: 'rgba(244, 42, 128, 0.2)',
    transform: 'perspective(1000px) rotateY(-10deg)',
    transition: 'all 0.3s ease-in-out',
    _hover: {
      transform: 'perspective(1000px) rotateY(-5deg) translateY(-5px)',
      boxShadow: '0 0 30px rgba(244, 42, 128, 0.25)',
    },
    animation: 'float 6s ease-in-out infinite',
    width: { base: '150px', lg: '250px' },
    display: { base: 'none', lg: 'block' },
  },
};

const keyframes = {
  float: {
    '0%, 100%': { transform: 'perspective(1000px) rotateY(-10deg) translateY(0px)' },
    '50%': { transform: 'perspective(1000px) rotateY(-10deg) translateY(-20px)' },
  },
};

const niches = [
  { id: 'produto', label: 'Produto' },
  { id: 'agencias', label: 'Agências' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'criadores', label: 'Criadores' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'negocios', label: 'Negócios' },
  { id: 'copywriters', label: 'Copywriters' },
  { id: 'social', label: 'Social' },
];

const LandingPage = () => {
  const [selectedUseCase, setSelectedUseCase] = useState(Object.keys(useCases)[0]);
  const [prevSelectedUseCase, setPrevSelectedUseCase] = useState(selectedUseCase);
  const logo = useColorModeValue('/logo/crowdelic-logo-light-mode.png', '/logo/crowdelic-logo-dark-mode.png');

  const handleUseCaseChange = (newUseCase: string) => {
    setPrevSelectedUseCase(selectedUseCase);
    setSelectedUseCase(newUseCase);
  };

  const getCircularIndex = (index: number, length: number) => {
    return ((index % length) + length) % length;
  };

  const prevSlide = () => {
    const keys = Object.keys(useCases);
    const currentIndex = keys.indexOf(selectedUseCase);
    const prevIndex = getCircularIndex(currentIndex - 1, keys.length);
    handleUseCaseChange(keys[prevIndex]);
  };

  const nextSlide = () => {
    const keys = Object.keys(useCases);
    const currentIndex = keys.indexOf(selectedUseCase);
    const nextIndex = getCircularIndex(currentIndex + 1, keys.length);
    handleUseCaseChange(keys[nextIndex]);
  };

  const getCardStyle = (index: number) => {
    const keys = Object.keys(useCases);
    const currentIndex = keys.indexOf(selectedUseCase);
    let position = index - currentIndex;
    
    console.log('Debug - Card Style Calculation:', {
      index,
      keys,
      currentIndex,
      position,
      selectedUseCase
    });
    
    // Ajusta a posição para criar o efeito infinito
    if (position < -2) {
      position = position + keys.length;
    } else if (position > 2) {
      position = position - keys.length;
    }
    
    let translateX = '0%';
    let scale = 1;
    let opacity = 1;
    let zIndex = 10;
    
    if (position === 0) {
      translateX = '-50%';
      scale = 1;
      opacity = 1;
      zIndex = 10;
    } else if (position === -1) {
      translateX = '-130%';
      scale = 0.85;
      opacity = 0.15;
      zIndex = 5;
    } else if (position === 1) {
      translateX = '30%';
      scale = 0.85;
      opacity = 0.15;
      zIndex = 5;
    } else if (position === -2) {
      translateX = '-190%';
      scale = 0.7;
      opacity = 0.1;
      zIndex = 1;
    } else if (position === 2) {
      translateX = '90%';
      scale = 0.7;
      opacity = 0.1;
      zIndex = 1;
    } else {
      opacity = 0;
      scale = 0.6;
      zIndex = 0;
      translateX = position < 0 ? '-200%' : '100%';
    }

    const style = {
      transform: `translateX(${translateX}) scale(${scale})`,
      opacity,
      zIndex,
      left: '50%',
      pointerEvents: position === 0 ? 'auto' : 'none',
    };

    console.log('Debug - Final Card Style:', style);
    return style;
  };

  return (
    <Box minH="100vh" bg="#0F0F0F" color="white" position="relative" overflow="hidden">
      {/* Hero Section */}
      <Box
        position="relative"
        minH="90vh"
        overflow="visible"
        bg="#080808"
        _before={{
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '120%',
          height: '200%',
          background: `
            conic-gradient(
              from 45deg at 50% 50%,
              #472781 0deg,
              #F42A80 90deg,
              #472781 180deg,
              #F42A80 270deg,
              #472781 360deg
            )
          `,
          opacity: 0.5,
          filter: 'blur(80px)',
          transform: 'rotate(-12deg)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
        sx={{
          '@keyframes pulse': {
            '0%, 100%': { transform: 'rotate(-12deg) scale(1)' },
            '50%': { transform: 'rotate(-8deg) scale(1.05)' },
          }
        }}
      >
        {/* Glassmorphism overlay */}
        <Box
          position="absolute"
          inset={0}
          backdropFilter="blur(100px)"
          bg="rgba(8, 8, 8, 0.5)"
        />

        <Container 
          maxW="container.xl" 
          position="relative"
          zIndex={2}
          overflow="visible"
        >
          <Stack
            direction={{ base: 'column', lg: 'row' }}
            spacing={{ base: 10, lg: 20 }}
            align="center"
            justify="space-between"
            pt={{ base: 20, lg: 32 }}
            pb={{ base: 16, lg: 24 }}
            overflow="visible"
            position="relative"
            w="100%"
          >
            {/* Left Content */}
            <VStack
              spacing={8}
              align={{ base: 'center', lg: 'start' }}
              maxW={{ base: '100%', lg: '35%' }}
              textAlign={{ base: 'center', lg: 'left' }}
              zIndex={2}
            >
              <Image 
                src={logo} 
                alt="Crowdelic" 
                maxH="60px"
                alignSelf={{ base: 'center', lg: 'flex-start' }}
              />
              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '5xl', lg: '5xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, white, #F42A80)"
                bgClip="text"
                letterSpacing="tight"
                lineHeight="1.2"
              >
                Teste suas ideias com personas de IA e receba insights poderosos
              </Heading>
              <Text
                fontSize={{ base: 'lg', lg: 'xl' }}
                color="whiteAlpha.800"
                lineHeight="tall"
              >
                A Crowdelic é uma plataforma que simula interações humanas através de personas de IA altamente customizáveis, permitindo que empresas e profissionais testem e validem seus produtos, campanhas e conteúdo antes do lançamento.
              </Text>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={4}
                w={{ base: 'full', sm: 'auto' }}
              >
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  px={8}
                  py={7}
                  fontSize="lg"
                  bg="#F42A80"
                  color="white"
                  _hover={{
                    bg: '#d62470',
                    transform: 'translateY(-2px)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                >
                  Começar agora
                </Button>
                <Button
                  as="a"
                  href="#sobre"
                  size="lg"
                  px={8}
                  py={7}
                  fontSize="lg"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    transform: 'translateY(-2px)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Saiba mais
                </Button>
              </Stack>
            </VStack>

            {/* Right Content - Platform Preview */}
            <Box
              position="absolute"
              width={{ base: 'full', lg: '90%' }}
              right={{ lg: '-35%' }}
              bottom={{ lg: '-100px' }}
              zIndex={1}
              transform="translateZ(0)"
              top={{ lg: '150px' }}
            >
              <Box
                position="relative"
                overflow="visible"
                borderRadius="3xl"
                boxShadow="0 0 50px rgba(244, 42, 128, 0.2)"
                bg="#0F0F0F"
                border="1px solid"
                borderColor="rgba(244, 42, 128, 0.3)"
                transform={{ base: 'none', lg: 'perspective(1500px) rotateY(-15deg)' }}
                transition="all 0.3s ease-in-out"
                _hover={{
                  transform: { base: 'none', lg: 'perspective(1500px) rotateY(-12deg)' },
                  boxShadow: '0 0 70px rgba(244, 42, 128, 0.3)',
                  borderColor: 'rgba(244, 42, 128, 0.5)',
                }}
                minW={{ lg: '900px' }}
              >
                {/* Floating Cards */}
                <Box
                  as={motion.div}
                  {...floatingCardsStyles.card}
                  top="-100px"
                  left="-80px"
                  animation="float 6s ease-in-out infinite"
                >
                  <Image src="/images/cards-1.png" alt="Módulo 1" w="full" h="auto" />
                </Box>
                <Box
                  as={motion.div}
                  {...floatingCardsStyles.card}
                  top="10px"
                  left="-20px"
                  animation="float 6s ease-in-out infinite 1s"
                >
                  <Image src="/images/cards-2.png" alt="Módulo 2" w="full" h="auto" />
                </Box>
                <Box
                  as={motion.div}
                  {...floatingCardsStyles.card}
                  top="100px"
                  left="-100px"
                  animation="float 6s ease-in-out infinite 2s"
                >
                  <Image src="/images/cards-3.png" alt="Módulo 3" w="full" h="auto" />
                </Box>
                <Box
                  as={motion.div}
                  {...floatingCardsStyles.card}
                  top="200px"
                  left="-40px"
                  animation="float 6s ease-in-out infinite 3s"
                >
                  <Image src="/images/cards-4.png" alt="Módulo 4" w="full" h="auto" />
                </Box>
                <Box
                  as={motion.div}
                  {...floatingCardsStyles.card}
                  top="380px"
                  left="-120px"
                  animation="float 6s ease-in-out infinite 1.5s"
                >
                  <Image src="/images/cards-5.png" alt="Módulo 5" w="full" h="auto" />
                </Box>
                <Box
                  as={motion.div}
                  {...floatingCardsStyles.card}
                  top="520px"
                  left="-60px"
                  animation="float 6s ease-in-out infinite 2.5s"
                >
                  <Image src="/images/cards-6.png" alt="Módulo 6" w="full" h="auto" />
                </Box>
                <Box
                  as={motion.div}
                  {...floatingCardsStyles.card}
                  top="660px"
                  left="-90px"
                  animation="float 6s ease-in-out infinite 3.5s"
                >
                  <Image src="/images/cards-7.png" alt="Módulo 7" w="full" h="auto" />
                </Box>

                <Image
                  src="/images/print-plataforma.png"
                  alt="Plataforma Crowdelic"
                  w="full"
                  maxW="none"
                  display="block"
                  borderRadius="3xl"
                />
                <Box
                  position="absolute"
                  inset={0}
                  bg="linear-gradient(180deg, transparent 0%, rgba(8, 8, 8, 0.7) 100%)"
                  borderRadius="3xl"
                />
                <Box
                  position="absolute"
                  inset={0}
                  bg="radial-gradient(circle at center, rgba(244, 42, 128, 0.15) 0%, transparent 70%)"
                  mixBlendMode="overlay"
                  borderRadius="3xl"
                />
                <Box
                  position="absolute"
                  inset={0}
                  bg="linear-gradient(45deg, rgba(244, 42, 128, 0.1), rgba(71, 39, 129, 0.1))"
                  mixBlendMode="overlay"
                  borderRadius="3xl"
                />
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box 
        {...carouselStyles.wrapper}
        bg="#0F0F0F"
        pt={16}
        pb={20}
        position="relative"
        mt={0}
        zIndex={2}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          bg: 'linear-gradient(to right, transparent, whiteAlpha.300, transparent)',
        }}
      >
        <VStack spacing={4} textAlign="center" mb={4}>
          <Heading
            as="h2"
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, white, #F42A80)"
            bgClip="text"
          >
            Casos de Uso
          </Heading>
          <Text fontSize="xl" color="whiteAlpha.800">
            Descubra como o Crowdelic pode ajudar em diferentes cenários
          </Text>
        </VStack>

        {/* Niche Selector */}
        <Box {...carouselStyles.nicheSelector}>
          {niches.map((niche) => (
            <Button
              key={niche.id}
              onClick={() => handleUseCaseChange(niche.id)}
              {...carouselStyles.nicheButton}
              {...(selectedUseCase === niche.id && { 
                bg: 'rgba(244, 42, 128, 0.1)',
                borderColor: 'rgba(244, 42, 128, 0.4)',
                boxShadow: '0 0 15px rgba(244, 42, 128, 0.2)',
              })}
            >
              {niche.label}
            </Button>
          ))}
        </Box>

        {/* Carousel Container */}
        <Box {...carouselStyles.container}>
          {Object.entries(useCases).map(([key, data], index) => (
            <Box
              key={key}
              {...carouselStyles.card}
              style={getCardStyle(index)}
            >
              <UseCaseCard {...data} />
            </Box>
          ))}
        </Box>

        {/* Navigation Buttons */}
        <Box {...carouselStyles.navigationContainer}>
          <IconButton
            aria-label="Previous slide"
            icon={<Icon as={FaArrowLeft} boxSize={3} />}
            {...carouselStyles.navigationButton}
            onClick={prevSlide}
          />
          <IconButton
            aria-label="Next slide"
            icon={<Icon as={FaArrowRight} boxSize={3} />}
            {...carouselStyles.navigationButton}
            onClick={nextSlide}
          />
        </Box>
      </Box>

      {/* Seção Sobre */}
      <Box
        as="section"
        id="sobre"
        py={{ base: '16', lg: '32' }}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(130deg, #1A0B2E 0%, #1A0B2E 40%, #2B0B3A 100%)"
      >
        {/* Elementos decorativos */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          bgImage="url('/images/grid.png')"
          bgRepeat="repeat"
          bgSize="30px"
        />
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          width="40%"
          height="40%"
          background="radial-gradient(circle at bottom right, rgba(244, 42, 128, 0.15) 0%, rgba(244, 42, 128, 0) 70%)"
          filter="blur(60px)"
        />
        <Box
          position="absolute"
          bottom="-20%"
          left="-10%"
          width="40%"
          height="40%"
          background="radial-gradient(circle at bottom right, rgba(93, 52, 233, 0.15) 0%, rgba(93, 52, 233, 0) 70%)"
          filter="blur(60px)"
        />

        <Container maxW="container.xl" position="relative">
          <SimpleGrid 
            columns={{ base: 1, lg: 2 }} 
            spacing={{ base: '10', lg: '20' }}
            alignItems="center"
            minH={{ lg: '60vh' }}
          >
            {/* Coluna da chamada */}
            <VStack 
              align="start" 
              spacing="6"
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Heading
                fontSize={{ base: '3xl', lg: '4xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, white, brand.100)"
                bgClip="text"
                lineHeight="shorter"
              >
                Em vez de lançar algo e torcer para dar certo, você pode testar, ajustar e otimizar antes, 
                economizando tempo e dinheiro.
              </Heading>
            </VStack>

            {/* Coluna do texto */}
            <VStack 
              align="start" 
              spacing="8"
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Text fontSize={{ base: 'lg', lg: 'xl' }} color="gray.300" lineHeight="tall">
                Nossa tecnologia permite que personas de IA interajam com diferentes cenários, 
                proporcionando feedback genuíno e insights valiosos - como um grupo focal virtual 
                disponível 24/7.
              </Text>
              
              <Text fontSize={{ base: 'lg', lg: 'xl' }} color="gray.300" lineHeight="tall">
                Diferente de soluções tradicionais de IA que apenas respondem perguntas, 
                nossas personas são projetadas para simular comportamentos humanos, com personalidades, 
                interesses e objetivos específicos, permitindo testes em condições controladas que 
                geram resultados práticos e acionáveis.
              </Text>
              
              <Text fontSize={{ base: 'lg', lg: 'xl' }} color="gray.300" lineHeight="tall">
                Seja uma agência testando campanhas, um e-commerce otimizando descrições de produtos 
                ou um criador de conteúdo validando sua estratégia, a Crowdelic oferece uma maneira 
                rápida, acessível e eficiente de entender como seu público-alvo realmente pensa e 
                se comporta.
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>


      {/* Diferenciais Section */}
      <Box
        bg="#0F0F0F"
        position="relative"
        py={20}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          bg: 'linear-gradient(to right, transparent, whiteAlpha.300, transparent)',
        }}
      >
        <Container maxW="container.xl">
          <VStack spacing={16}>
            {/* Section Header */}
            <VStack spacing={4} textAlign="center">
              <Heading
                as="h2"
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, white, #F42A80)"
                bgClip="text"
              >
                Diferenciais principais
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.800" maxW="3xl">
                Descubra por que o Crowdelic é a escolha ideal para validar suas ideias
              </Text>
            </VStack>

            {/* Diferenciais Grid */}
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
              w="full"
            >
              {[
                {
                  title: "Velocidade e escala",
                  icon: FaRocket,
                  items: [
                    "De semanas para minutos",
                    "Teste com muitas personas simultaneamente",
                    "Iterações e ajustes instantâneos"
                  ]
                },
                {
                  title: "Simulação realista",
                  icon: FaBrain,
                  items: [
                    "Comportamentos genuínos e contextualizados",
                    "Simulação de cenários complexos",
                    "Feedback natural e detalhado"
                  ]
                },
                {
                  title: "Personalização avançada",
                  icon: FaPuzzlePiece,
                  items: [
                    "Personas altamente customizáveis",
                    "Ambientes de teste controlados",
                    "Templates especializados por setor"
                  ]
                },
                {
                  title: "Custo-benefício",
                  icon: FaPiggyBank,
                  items: [
                    "Economia de +90% vs métodos tradicionais",
                    "Sem custos de recrutamento"
                  ]
                },
                {
                  title: "Praticidade e controle",
                  icon: FaTools,
                  items: [
                    "Interface intuitiva",
                    "Resultados estruturados",
                    "Análises detalhadas",
                    "Exportação de insights"
                  ]
                },
                {
                  title: "Flexibilidade de uso",
                  icon: FaExpandArrowsAlt,
                  items: [
                    "Múltiplos casos de uso",
                    "Adaptável a diferentes indústrias",
                    "Customização por necessidade"
                  ]
                }
              ].map((diferencial, index) => (
                <Box
                  key={index}
                  position="relative"
                  p={8}
                  borderRadius="2xl"
                  bg="rgba(244, 42, 128, 0.03)"
                  border="1px solid"
                  borderColor="rgba(244, 42, 128, 0.1)"
                  _hover={{
                    transform: 'translateY(-4px)',
                    bg: 'rgba(244, 42, 128, 0.05)',
                    borderColor: 'rgba(244, 42, 128, 0.2)',
                  }}
                  transition="all 0.3s"
                  overflow="hidden"
                >
                  {/* Icon */}
                  <Box
                    className="icon-wrapper"
                    mb={6}
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    p={4}
                    borderRadius="xl"
                    bg="rgba(244, 42, 128, 0.1)"
                    color="#F42A80"
                    transition="all 0.3s"
                  >
                    <Icon as={diferencial.icon} boxSize={6} />
                  </Box>

                  {/* Content */}
                  <VStack align="start" spacing={4}>
                    <Heading
                      as="h3"
                      fontSize="xl"
                      color="white"
                      fontWeight="bold"
                    >
                      {diferencial.title}
                    </Heading>
                    <UnorderedList spacing={2} styleType="none" ml={0}>
                      {diferencial.items.map((item, itemIndex) => (
                        <ListItem
                          key={itemIndex}
                          color="whiteAlpha.800"
                          display="flex"
                          alignItems="center"
                          _before={{
                            content: '""',
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: 'full',
                            bg: '#F42A80',
                            mr: 3,
                          }}
                        >
                          {item}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </VStack>

                  {/* Decorative Elements */}
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    width="150px"
                    height="150px"
                    bg="radial-gradient(circle at bottom right, rgba(244, 42, 128, 0.1), transparent 70%)"
                    pointerEvents="none"
                  />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Como Funciona Section */}
      <Box
        id="como-funciona"
        bg="#0F0F0F"
        position="relative"
        py={20}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          bg: 'linear-gradient(to right, transparent, whiteAlpha.300, transparent)',
        }}
      >
        <Container maxW="container.xl">
          <VStack spacing={16}>
            {/* Section Header */}
            <VStack spacing={4} textAlign="center">
              <Heading
                as="h2"
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, white, #F42A80)"
                bgClip="text"
              >
                Como Funciona
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.800" maxW="3xl">
                Um processo simples e eficiente para validar suas ideias com personas de IA
              </Text>
            </VStack>

            {/* Steps Grid */}
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
              w="full"
            >
              {howItWorks.map((step, index) => (
                <Box
                  key={index}
                  position="relative"
                  p={8}
                  borderRadius="2xl"
                  bg="rgba(244, 42, 128, 0.03)"
                  border="1px solid"
                  borderColor="rgba(244, 42, 128, 0.1)"
                  _hover={{
                    transform: 'translateY(-4px)',
                    bg: 'rgba(244, 42, 128, 0.05)',
                    borderColor: 'rgba(244, 42, 128, 0.2)',
                  }}
                  transition="all 0.3s"
                  overflow="hidden"
                >
                  {/* Step Number */}
                  <Box
                    className="step-number"
                    position="absolute"
                    top={4}
                    right={4}
                    bg="rgba(244, 42, 128, 0.1)"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                    transition="all 0.3s"
                  >
                    {index + 1}
                  </Box>

                  {/* Content */}
                  <VStack align="start" spacing={4}>
                    <Heading
                      as="h3"
                      fontSize="xl"
                      color="white"
                      fontWeight="bold"
                    >
                      {step.title}
                    </Heading>
                    <UnorderedList spacing={2} styleType="none" ml={0}>
                      {step.items.map((item, itemIndex) => (
                        <ListItem
                          key={itemIndex}
                          color="whiteAlpha.800"
                          display="flex"
                          alignItems="center"
                          _before={{
                            content: '""',
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: 'full',
                            bg: '#F42A80',
                            mr: 3,
                          }}
                        >
                          {item}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </VStack>

                  {/* Decorative Elements */}
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    width="150px"
                    height="150px"
                    bg="radial-gradient(circle at bottom right, rgba(244, 42, 128, 0.1), transparent 70%)"
                    pointerEvents="none"
                  />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export const Landing = React.memo(LandingPage);
export default Landing;
