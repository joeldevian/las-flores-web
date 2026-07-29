import { useState, useEffect } from "react";
import { X, Loader2, Utensils, DollarSign, FileText, Image as ImageIcon, Tag } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null; // Null means create new
  categories: any[];
  onSave: () => Promise<void>;
}

export function AdminProductModal({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
}: AdminProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(product.price ? product.price.toString() : "");
        setCategoryId(product.category_id || (categories[0]?.id || ""));
        setImageUrl(product.image_url || "");
        setIsAvailable(product.is_available ?? true);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setCategoryId(categories[0]?.id || "");
        setImageUrl("");
        setIsAvailable(true);
      }
      setErrorMsg("");
    }
  }, [isOpen, product, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) {
      setErrorMsg("Por favor completa los campos requeridos (Nombre, Precio, Categoría).");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category_id: categoryId,
        image_url: imageUrl.trim() || null,
        is_available: isAvailable,
      };

      if (product) {
        // Update
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("products")
          .insert([payload]);

        if (error) throw error;
      }

      await onSave();
      onClose();
    } catch (err: any) {
      console.error("Error saving product:", err);
      setErrorMsg(err.message || "Error al guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#14231D] text-cream px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-retama">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cream">
                {product ? "Editar Producto" : "Nuevo Producto en la Carta"}
              </h2>
              <p className="text-xs text-cream/70">
                {product ? "Modifica los datos del plato" : "Agrega un nuevo platillo o bebida al menú"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-cream/80 hover:text-cream flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Nombre del Plato *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Puca Picante con Chicharrón"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-eucalipto focus:bg-white transition-all"
            />
          </div>

          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag size={13} className="text-eucalipto" /> Categoría *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-eucalipto focus:bg-white transition-all"
              >
                <option value="">Selecciona categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign size={13} className="text-eucalipto" /> Precio (S/) *
              </label>
              <input
                type="number"
                step="0.10"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25.00"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-eucalipto focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText size={13} className="text-eucalipto" /> Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredientes principales, historia o detalles del sabor..."
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-eucalipto focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <ImageIcon size={13} className="text-eucalipto" /> URL de Imagen
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/imagenes-reales/RECOMENDACIONES-CHEF/puca.webp"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-eucalipto focus:bg-white transition-all"
            />
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <div>
              <span className="text-xs font-bold text-gray-800 block">Disponibilidad en la Carta</span>
              <span className="text-[11px] text-gray-500">¿El plato se puede pedir activamente?</span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                isAvailable ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isAvailable ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-eucalipto hover:bg-eucalipto-dark text-cream text-sm font-bold shadow-md shadow-eucalipto/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {product ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
