export const removeProductById = <T extends { id: string }>(products: T[], productId: string) =>
  products.filter((product) => product.id !== productId);
