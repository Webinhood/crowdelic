import React, { useState, KeyboardEvent } from 'react';
import {
  FormControl,
  Input,
  InputProps,
  useColorModeValue,
  FormErrorMessage,
  Box,
  Text,
  Textarea,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/react';
import { Field, FieldProps } from 'formik';

interface Option {
  value: string;
  label: string;
}

interface FormInputProps extends Omit<InputProps, 'name'> {
  name: string;
  label?: string;
  description?: string;
  helperText?: string;
  as?: 'input' | 'textarea' | 'select';
  type?: string;
  rows?: number;
  options?: Option[];
  InputRightElement?: React.ReactNode;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  name, 
  description, 
  helperText,
  as = 'input',
  type,
  rows = 3,
  options = [],
  placeholder,
  InputRightElement,
  onKeyPress,
  ...props 
}) => {
  const inputBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBorderColor = useColorModeValue('blue.500', 'blue.400');
  const errorColor = useColorModeValue('red.500', 'red.400');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const [tagInput, setTagInput] = useState('');

  // Função para obter o valor do campo aninhado
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : '';
    }, obj);
  };

  const handleTagKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    field: any,
    form: any
  ) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...(field.value || []), tagInput.trim()];
      form.setFieldValue(name, newTags);
      setTagInput('');
    }
  };

  const removeTag = (index: number, field: any, form: any) => {
    const newTags = field.value.filter((_: string, i: number) => i !== index);
    form.setFieldValue(name, newTags);
  };

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => {
        const error = getNestedValue(form.errors, name);
        const touched = getNestedValue(form.touched, name);
        const value = getNestedValue(form.values, name);
        
        console.log(`Field ${name}:`, { value, error, touched });
        
        return (
          <FormControl 
            isInvalid={!!error && touched}
            mb={4}
          >
            <Box mb={2}>
              {label && (
                <FormLabel htmlFor={name} color={textColor} mb={0}>
                  {label}
                </FormLabel>
              )}
              {description && (
                <Text fontSize="sm" color="gray.400" mb={2}>
                  {description}
                </Text>
              )}
            </Box>

            {type === 'tags' ? (
              <Box>
                <Input
                  {...field}
                  id={name}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => handleTagKeyDown(e, field, form)}
                  placeholder={placeholder}
                  bg={inputBg}
                  color={textColor}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: hoverBorderColor }}
                  _focus={{ borderColor: hoverBorderColor }}
                />
                {helperText && (
                  <FormHelperText color={labelColor} fontSize="xs">
                    {helperText}
                  </FormHelperText>
                )}
                <HStack spacing={2} mt={2} wrap="wrap">
                  {field.value?.map((tag: string, index: number) => (
                    <Tag
                      key={index}
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                      mb={2}
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton
                        onClick={() => removeTag(index, field, form)}
                      />
                    </Tag>
                  ))}
                </HStack>
              </Box>
            ) : as === 'textarea' ? (
              <Textarea
                {...field}
                id={name}
                placeholder={placeholder}
                rows={rows}
                bg={inputBg}
                borderColor={borderColor}
                _hover={{ borderColor: hoverBorderColor }}
                color={textColor}
                {...props}
              />
            ) : as === 'select' ? (
              <Select
                {...field}
                id={name}
                placeholder={placeholder}
                bg={inputBg}
                borderColor={borderColor}
                _hover={{ borderColor: hoverBorderColor }}
                color={textColor}
                {...props}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                {...field}
                id={name}
                type={type}
                placeholder={placeholder}
                bg={inputBg}
                borderColor={borderColor}
                _hover={{ borderColor: hoverBorderColor }}
                color={textColor}
                value={value || ''}
                onChange={(e) => {
                  const fieldPath = name.split('.');
                  if (fieldPath.length > 1) {
                    const newValue = { ...form.values };
                    let current = newValue;
                    for (let i = 0; i < fieldPath.length - 1; i++) {
                      if (!current[fieldPath[i]]) {
                        current[fieldPath[i]] = {};
                      }
                      current = current[fieldPath[i]];
                    }
                    current[fieldPath[fieldPath.length - 1]] = e.target.value;
                    form.setValues(newValue);
                  } else {
                    field.onChange(e);
                  }
                }}
                onBlur={(e) => {
                  field.onBlur(e);
                  if (props.onBlur) {
                    props.onBlur(e);
                  }
                }}
                {...props}
              />
            )}

            {helperText && !error && (
              <FormHelperText color={labelColor}>
                {helperText}
              </FormHelperText>
            )}
            
            {error && touched && (
              <FormErrorMessage>{error}</FormErrorMessage>
            )}
          </FormControl>
        );
      }}
    </Field>
  );
};
