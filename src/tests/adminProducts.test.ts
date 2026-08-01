import { describe, expect, it } from "vitest";
import { removeProductById } from "../utils/adminProducts";

describe("removeProductById", () => {
  it("debe eliminar un producto del listado por su id", () => {
    const products = [
      { id: "1", name: "Cuy Chactado" },
      { id: "2", name: "Qapchi" },
    ];

    expect(removeProductById(products, "1")).toEqual([{ id: "2", name: "Qapchi" }]);
  });
});
