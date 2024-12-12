import React from 'react';
import {
  Box,
  useColorModeValue,
  Icon,
  Text,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Divider,
  HStack,
  Image,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FaUser, FaHome, FaUsers, FaClipboardList, FaChartLine } from 'react-icons/fa';
import { useAuth } from '@hooks/useAuth';
import { ThemeToggle } from '../ThemeToggle';
import { useTranslation } from 'react-i18next';

const NavItem = ({ icon, children, to }: { icon: React.ElementType; children: React.ReactNode; to: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeColor = useColorModeValue('teal.600', 'teal.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const iconBg = useColorModeValue('teal.50', 'gray.700');
  const activeIconBg = useColorModeValue('teal.100', 'teal.700');

  return (
    <RouterLink to={to}>
      <Flex
        align="center"
        p="3"
        mx="3"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        position="relative"
        color={isActive ? activeColor : inactiveColor}
        bg={isActive ? useColorModeValue('teal.50', 'gray.800') : 'transparent'}
        _hover={{
          bg: hoverBg,
          color: activeColor,
        }}
      >
        {isActive && (
          <Box
            position="absolute"
            left="0"
            top="50%"
            transform="translateY(-50%)"
            w="3px"
            h="70%"
            bg={activeColor}
            borderRightRadius="sm"
          />
        )}
        <Flex
          align="center"
          justify="center"
          w="32px"
          h="32px"
          borderRadius="md"
          bg={isActive ? activeIconBg : iconBg}
          mr="3"
          ml={isActive ? "2" : "0"}
        >
          <Icon
            fontSize="18"
            as={icon}
            color={isActive ? useColorModeValue('white', 'teal.200') : undefined}
          />
        </Flex>
        <Text fontSize="md" fontWeight={isActive ? "semibold" : "normal"}>
          {children}
        </Text>
      </Flex>
    </RouterLink>
  );
};

const SidebarSection = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <Box>
    {title && (
      <Text
        px="6"
        mb="3"
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wider"
        color={useColorModeValue('gray.600', 'gray.400')}
      >
        {title}
      </Text>
    )}
    {children}
  </Box>
);

const Links = [
  { name: 'menu.home', icon: FaHome, to: '/' },
  { name: 'menu.personas', icon: FaUsers, to: '/personas' },
  { name: 'menu.tests', icon: FaClipboardList, to: '/tests' },
  { name: 'menu.costs', icon: FaChartLine, to: '/costs' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="100vh"
      w={{ base: '240px' }}
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      display={{ base: 'none', md: 'block' }}
      zIndex={2}
      transition=".3s ease"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: borderColor,
          borderRadius: '24px',
        },
      }}
    >
      <Flex direction="column" h="full" py={3}>
        {/* Logo or Brand */}
        <Box px={6} mb={6}>
          <Image
            src={useColorModeValue('/logo/crowdelic-logo-light-mode.png', '/logo/crowdelic-logo-dark-mode.png')}
            alt="Crowdelic Logo"
            maxH="50px"
            objectFit="contain"
          />
        </Box>

        {/* Navigation Links */}
        <SidebarSection>
          {Links.map((link) => (
            <NavItem key={link.name} icon={link.icon} to={link.to}>
              {t(link.name)}
            </NavItem>
          ))}
        </SidebarSection>

        <Box flex={1} />

        <Divider mb={3} borderColor={borderColor} />

        {/* User Section */}
        <Box px={3}>
          <Menu>
            <MenuButton
              as={Button}
              w="full"
              h="auto"
              py={2}
              variant="ghost"
              justifyContent="start"
            >
              <HStack spacing={3}>
                <Flex
                  align="center"
                  justify="center"
                  w="32px"
                  h="32px"
                  borderRadius="md"
                  bg={useColorModeValue('teal.50', 'gray.700')}
                >
                  <Icon
                    as={FaUser}
                    fontSize="16"
                    color={useColorModeValue('teal.500', 'teal.200')}
                  />
                </Flex>
                <Text fontSize="sm" fontWeight="medium">
                  {user?.email?.split('@')[0]}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={logout}>{t('menu.logout')}</MenuItem>
            </MenuList>
          </Menu>
          <Box mt={3}>
            <ThemeToggle />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};
