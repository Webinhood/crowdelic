import { Box, BoxProps, useStyleConfig } from '@chakra-ui/react';
import React from 'react';

interface CardProps extends BoxProps {
  variant?: 'regular' | 'elevated';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ variant = 'regular', children, ...rest }) => {
  const styles = useStyleConfig('Card', { variant });

  return (
    <Box
      __css={styles}
      {...rest}
    >
      {children}
    </Box>
  );
};
