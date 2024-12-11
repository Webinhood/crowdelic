import React, { Suspense } from 'react';
import { Center, Spinner } from '@chakra-ui/react';

export const SuspenseLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense
      fallback={
        <Center h="100vh">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Center>
      }
    >
      {children}
    </Suspense>
  );
};
