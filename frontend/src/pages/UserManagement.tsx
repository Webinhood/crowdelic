import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import api from '@services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, formData);
        toast({
          title: 'Usuário atualizado',
          status: 'success',
          duration: 3000,
        });
      } else {
        await api.post('/users', formData);
        toast({
          title: 'Usuário criado',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      fetchUsers();
      resetForm();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o usuário.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    onOpen();
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast({
          title: 'Usuário excluído',
          status: 'success',
          duration: 3000,
        });
        fetchUsers();
      } catch (error) {
        toast({
          title: 'Erro ao excluir usuário',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
    });
  };

  const handleAddNew = () => {
    resetForm();
    onOpen();
  };

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">Gerenciamento de Usuários</Text>
        <Button
          leftIcon={<FaUserPlus />}
          colorScheme="blue"
          onClick={handleAddNew}
        >
          Adicionar Usuário
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Email</Th>
            <Th>Função</Th>
            <Th>Data de Criação</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map(user => (
            <Tr key={user.id}>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge
                  colorScheme={user.role === 'admin' ? 'purple' : 'green'}
                >
                  {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                </Badge>
              </Td>
              <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Editar usuário"
                    icon={<FaEdit />}
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleEdit(user)}
                  />
                  <IconButton
                    aria-label="Excluir usuário"
                    icon={<FaTrash />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(user.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Nome</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Senha</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={selectedUser ? '(Deixe em branco para manter a mesma)' : ''}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Função</FormLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {selectedUser ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement;
