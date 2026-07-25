import { describe, it, expect } from "vitest";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function calculateCartTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

describe("Pruebas Unitarias de Lógica de Carrito de Compras", () => {
  it("debe calcular el total de ítems y precio de forma exacta", () => {
    const items: CartItem[] = [
      { id: "1", name: "Leche de Tigre", price: 25.0, quantity: 2 },
      { id: "2", name: "Cuy Chactado", price: 45.0, quantity: 1 },
    ];

    const { totalItems, totalPrice } = calculateCartTotals(items);
    expect(totalItems).toBe(3);
    expect(totalPrice).toBe(95.0);
  });

  it("debe retornar 0 en cantidad y total cuando el carrito está vacío", () => {
    const { totalItems, totalPrice } = calculateCartTotals([]);
    expect(totalItems).toBe(0);
    expect(totalPrice).toBe(0.0);
  });
});
