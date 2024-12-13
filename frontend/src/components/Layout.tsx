import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  useColorModeValue,
  IconButton,
  Text,
  HStack,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { FeedbackProvider } from '../contexts/FeedbackContext';
import { Sidebar } from './Sidebar';
import LanguageSelector from './LanguageSelector';

export const Layout = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');

  const onToggle = () => {
    // You need to implement the onToggle function
  };

  return (
    <FeedbackProvider>
      <Box display="flex" minH="100vh" bg={bg}>
        <Sidebar />
        <Box
          flex="1"
          ml={{ base: 0, md: '240px' }}
          transition=".3s ease"
          position="relative"
          zIndex={1}
        >
          <Flex
            ml={{ base: 0, md: 4 }}
            px={{ base: 4, md: 8 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onToggle}
              variant="outline"
              aria-label="open menu"
              icon={<FiMenu />}
            />

            <Text
              display={{ base: 'flex', md: 'none' }}
              fontSize="2xl"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Crowdelic
            </Text>

            <HStack spacing={{ base: '0', md: '6' }}>
              <LanguageSelector />
            </HStack>
          </Flex>

          <Box p={4}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </FeedbackProvider>
  );
};
