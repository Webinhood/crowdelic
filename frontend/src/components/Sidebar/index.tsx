import React from 'react';
import {
  Box,
  useColorModeValue,
  Icon,
  Text,
  Stack,
  Button,
  Flex,
  Divider,
  HStack,
  Image,
  useColorMode,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiClipboard,
  FiDollarSign,
  FiUserPlus,
  FiLogOut,
  FiPlus,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '@hooks/useAuth';
import { ThemeToggle } from '../ThemeToggle';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../../contexts/NavigationContext';

const NavItem = ({
  icon,
  children,
  to = '/',
  hasSubItems,
  isExpanded,
  onToggle,
  isSubItem,
  ...rest
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  hasSubItems?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  isSubItem?: boolean;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeColor = useColorModeValue('gray.700', 'white');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');

  const isActive = location.pathname === to;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hasSubItems) {
      navigate(to);
    } else if (onToggle) {
      onToggle();
    }
  };

  return (
    <Box
      as="button"
      onClick={handleClick}
      display="flex"
      alignItems="center"
      w="100%"
      p={2}
      pl={isSubItem ? 10 : 3}
      borderRadius="lg"
      role="group"
      cursor="pointer"
      bg={isActive ? hoverBg : 'transparent'}
      color={isActive ? activeColor : inactiveColor}
      _hover={{
        bg: hoverBg,
        color: activeColor,
      }}
      transition="all 0.2s"
      {...rest}
    >
      {icon && <Icon as={icon} mr={4} boxSize="4" />}
      <Text flex={1} textAlign="left" fontSize={isSubItem ? "sm" : "md"}>
        {children}
      </Text>
      {hasSubItems && !isExpanded && (
        <Icon
          as={FiChevronRight}
          w={4}
          h={4}
        />
      )}
      {hasSubItems && isExpanded && (
        <Icon
          as={FiChevronDown}
          w={4}
          h={4}
        />
      )}
    </Box>
  );
};

const Links = [
  { name: 'Início', icon: FiHome, to: '/dashboard' },
  {
    name: 'Personas',
    icon: FiUsers,
    to: '/personas',
    subItems: [
      { name: 'Lista', icon: FiClipboard, to: '/personas' },
      { name: 'Criar', icon: FiPlus, to: '/personas/create' },
    ],
  },
  {
    name: 'Testes',
    icon: FiClipboard,
    to: '/tests',
    subItems: [
      { name: 'Lista', icon: FiClipboard, to: '/tests' },
      { name: 'Criar', icon: FiPlus, to: '/tests/create' },
    ],
  },
  { name: 'Custos', icon: FiDollarSign, to: '/costs' },
  { name: 'Usuários', icon: FiUserPlus, to: '/users' },
];

export const Sidebar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { onOpen } = useDisclosure();
  const { expandedItems, toggleExpanded } = useNavigation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="100vh"
      pb="10"
      overflowX="hidden"
      overflowY="hidden"
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w="60"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Image 
          src={colorMode === 'dark' ? '/logo/crowdelic-logo-dark-mode.png' : '/logo/crowdelic-logo-light-mode.png'} 
          alt="Logo" 
          h="45px" 
        />
      </Flex>

      <Flex
        direction="column"
        as="nav"
        fontSize="sm"
        color="gray.600"
        aria-label="Main Navigation"
        h="calc(100vh - 80px)"
        justify="space-between"
      >
        <Stack spacing={0} px="4">
          {Links.map((link) => (
            <React.Fragment key={link.name}>
              <NavItem
                icon={link.icon}
                to={link.to}
                hasSubItems={!!link.subItems}
                isExpanded={expandedItems[link.name]}
                onToggle={() => toggleExpanded(link.name)}
              >
                {link.name}
              </NavItem>
              
              <Collapse in={expandedItems[link.name]} animateOpacity>
                <Stack spacing={0.5} mt={0.5}>
                  {link.subItems?.map((subItem) => (
                    <NavItem
                      key={subItem.name}
                      icon={subItem.icon}
                      to={subItem.to}
                      isSubItem
                    >
                      {subItem.name}
                    </NavItem>
                  ))}
                </Stack>
              </Collapse>
            </React.Fragment>
          ))}
        </Stack>

        <Stack px="4" pb="4">
          <Divider />
          <HStack justify="space-between" py={4}>
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={handleLogout}
              leftIcon={<Icon as={FiLogOut} />}
              size="sm"
            >
              Sair
            </Button>
          </HStack>
        </Stack>
      </Flex>
    </Box>
  );
};
