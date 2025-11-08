/**
 * Teste básico para verificar se o ambiente de testes está funcionando
 */
describe('Environment Setup', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should perform basic math operations', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
  });

  it('should handle arrays correctly', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
