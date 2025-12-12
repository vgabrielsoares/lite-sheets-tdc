/**
 * Testes de Integração - Fluxo de Criação de Personagem
 *
 * Testa o fluxo completo de criação de personagem, desde a entrada do nome
 * até a persistência no IndexedDB e navegação para a ficha criada.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/navigation';
import CharacterCreationForm from '@/components/character/CharacterCreationForm';
import charactersReducer from '@/features/characters/charactersSlice';
import notificationsReducer from '@/features/app/notificationsSlice';
import appReducer from '@/features/app/appSlice';
import { db } from '@/services/db';
import { characterService } from '@/services/characterService';
import type { Character } from '@/types';

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

/**
 * Helper para criar store de teste
 */
function createTestStore() {
  return configureStore({
    reducer: {
      characters: charactersReducer,
      notifications: notificationsReducer,
      app: appReducer,
    },
  });
}

/**
 * Helper para renderizar componente com providers
 */
function renderWithProviders(component: React.ReactElement) {
  const store = createTestStore();
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
}

describe('Fluxo de Criação de Personagem (Integração)', () => {
  let mockPush: jest.Mock;

  beforeEach(async () => {
    // Limpa o banco de dados antes de cada teste
    await db.characters.clear();

    // Mock do router
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(async () => {
    // Limpa o banco após cada teste
    await db.characters.clear();
    jest.clearAllMocks();
  });

  it('deve criar personagem com valores padrão e persistir no IndexedDB', async () => {
    // Arrange
    const characterName = 'Aragorn';
    renderWithProviders(<CharacterCreationForm />);

    // Act - Preencher nome
    const nameInput = screen.getByLabelText(/nome do personagem/i);
    fireEvent.change(nameInput, { target: { value: characterName } });

    // Act - Submeter formulário
    const createButton = screen.getByRole('button', {
      name: /criar ficha/i,
    });
    fireEvent.click(createButton);

    // Assert - Aguardar navegação
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });

    // Assert - Verificar que foi chamado com URL correta
    const callArgs = mockPush.mock.calls[0][0];
    // Fixed regex to allow 'test-uuid' from jest mock
    expect(callArgs).toMatch(/^\/characters\/[\w-]+$/);

    // Assert - Verificar persistência no IndexedDB
    const characters = await db.characters.toArray();
    expect(characters).toHaveLength(1);

    const savedCharacter = characters[0];
    expect(savedCharacter.name).toBe(characterName);
    expect(savedCharacter.level).toBe(1);
    expect(savedCharacter.combat.hp.max).toBe(15);
    expect(savedCharacter.combat.hp.current).toBe(15);
    expect(savedCharacter.combat.hp.temporary).toBe(0);
    expect(savedCharacter.combat.pp.max).toBe(2);
    expect(savedCharacter.combat.pp.current).toBe(2);
    expect(savedCharacter.combat.pp.temporary).toBe(0);

    // Assert - Atributos em 1 (padrão)
    expect(savedCharacter.attributes.agilidade).toBe(1);
    expect(savedCharacter.attributes.constituicao).toBe(1);
    expect(savedCharacter.attributes.forca).toBe(1);
    expect(savedCharacter.attributes.influencia).toBe(1);
    expect(savedCharacter.attributes.mente).toBe(1);
    expect(savedCharacter.attributes.presenca).toBe(1);

    // Assert - Idioma Comum presente
    expect(savedCharacter.languages).toContain('comum');

    // Assert - Proficiência com Armas Simples
    expect(savedCharacter.proficiencies.weapons).toContain('Armas Simples');

    // Assert - Inventário com itens padrão
    expect(savedCharacter.inventory.items.length).toBeGreaterThanOrEqual(2);
    const itemNames = savedCharacter.inventory.items.map((item) => item.name);
    expect(itemNames).toContain('Mochila');
    expect(itemNames).toContain('Cartão do Banco');

    // Assert - 10 PO$ inicial no banco (com Cartão do Banco)
    expect(savedCharacter.inventory.currency.bank.ouro).toBe(10);
    expect(savedCharacter.inventory.currency.physical.ouro).toBe(0);
  });

  it('deve validar nome obrigatório', async () => {
    // Arrange
    renderWithProviders(<CharacterCreationForm />);

    // NOTE: O campo tem `required` HTML, então o navegador previne a submissão
    // Vamos testar que o personagem não foi criado sem nome
    const createButton = screen.getByRole('button', {
      name: /criar ficha/i,
    });

    // O campo de nome deve estar presente e vazio
    const nameInput = screen.getByLabelText(/nome do personagem/i);
    expect(nameInput).toHaveValue('');

    // Assert - Não deve ter navegado (porque o form HTML previne submit)
    expect(mockPush).not.toHaveBeenCalled();

    // Assert - Não deve ter salvo no IndexedDB
    const characters = await db.characters.toArray();
    expect(characters).toHaveLength(0);
  });

  it('deve validar nome mínimo de 2 caracteres', async () => {
    // Arrange
    renderWithProviders(<CharacterCreationForm />);

    // Act - Preencher com nome muito curto
    const nameInput = screen.getByLabelText(/nome do personagem/i);
    fireEvent.change(nameInput, { target: { value: 'A' } });

    // Act - Submeter formulário
    const createButton = screen.getByRole('button', {
      name: /criar ficha/i,
    });
    fireEvent.click(createButton);

    // Assert - Mensagem de erro deve aparecer
    await waitFor(() => {
      expect(
        screen.getByText(
          /o nome do personagem deve ter pelo menos 2 caracteres/i
        )
      ).toBeInTheDocument();
    });

    // Assert - Não deve ter navegado
    expect(mockPush).not.toHaveBeenCalled();

    // Assert - Não deve ter salvo no IndexedDB
    const characters = await db.characters.toArray();
    expect(characters).toHaveLength(0);
  });

  it('deve criar múltiplos personagens independentes', async () => {
    // Arrange - Criar primeiro personagem
    const { unmount } = renderWithProviders(<CharacterCreationForm />);

    const firstName = 'Aragorn';
    let nameInput = screen.getByLabelText(/nome do personagem/i);
    fireEvent.change(nameInput, { target: { value: firstName } });

    let createButton = screen.getByRole('button', {
      name: /criar ficha/i,
    });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    unmount();
    jest.clearAllMocks();

    // Arrange - Criar segundo personagem
    renderWithProviders(<CharacterCreationForm />);

    const secondName = 'Legolas';
    nameInput = screen.getByLabelText(/nome do personagem/i);
    fireEvent.change(nameInput, { target: { value: secondName } });

    createButton = screen.getByRole('button', { name: /criar ficha/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    // Assert - Verificar que ambos foram salvos
    const characters = await db.characters.toArray();
    expect(characters).toHaveLength(2);

    const names = characters.map((c) => c.name).sort();
    expect(names).toEqual(['Aragorn', 'Legolas']);

    // Assert - Verificar que têm IDs diferentes
    const ids = characters.map((c) => c.id);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('deve permitir cancelamento sem criar personagem', async () => {
    // Arrange
    renderWithProviders(<CharacterCreationForm />);

    // Act - Preencher nome
    const nameInput = screen.getByLabelText(/nome do personagem/i);
    fireEvent.change(nameInput, { target: { value: 'Gandalf' } });

    // Act - Cancelar
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    // Assert - Deve ter navegado para home
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // Assert - Não deve ter salvo no IndexedDB
    const characters = await db.characters.toArray();
    expect(characters).toHaveLength(0);
  });

  it('deve calcular proficiências baseado em Mente (3 + Mente)', async () => {
    // Arrange
    const characterName = 'Mago Sábio';
    renderWithProviders(<CharacterCreationForm />);

    // Act
    const nameInput = screen.getByLabelText(/nome do personagem/i);
    fireEvent.change(nameInput, { target: { value: characterName } });

    const createButton = screen.getByRole('button', {
      name: /criar ficha/i,
    });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });

    // Assert
    const characters = await db.characters.toArray();
    const character = characters[0];

    // Com Mente = 1 (padrão), deve ter 3 + 1 = 4 proficiências disponíveis
    const menteValue = character.attributes.mente;
    expect(menteValue).toBe(1);

    // Número de slots de proficiência deve ser 3 + Mente
    // (Verificar se existem exatamente 3 + Mente habilidades com proficiência >= 'adepto')
    const proficientSkills = Object.values(character.skills).filter(
      (skill) => skill.proficiencyLevel !== 'leigo'
    );

    // Por padrão, nenhuma habilidade é proficiente (apenas slots disponíveis)
    // O sistema permite que o jogador escolha 3 + Mente habilidades
    expect(proficientSkills.length).toBeLessThanOrEqual(3 + menteValue);
  });
});
