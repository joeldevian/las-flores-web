import { useState, useEffect } from "react";
import { X, Loader2, Utensils, DollarSign, FileText, Image as ImageIcon, Tag, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { compressImageToWebP } from "../lib/webp-compressor";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null; // Null means create new
  categories: any[];
  onSave: () => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
}

export function AdminProductModal({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
  onDelete,
}: AdminProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressStats, setCompressStats] = useState<{ origKb: number; compKb: number } | null>(null);
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
      setCompressStats(null);
      setErrorMsg("");
    }
  }, [isOpen, product, categories]);

  if (!isOpen) return null;

  // Handle file selection and automatic WebP compression (RLF-175, RLF-178, RLF-185)
  const handleFileCompress = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setErrorMsg("");

    try {
      const result = await compressImageToWebP(file, 1200, 1200, 0.85);
      setImageUrl(result.dataUrl);
      setCompressStats({
        origKb: result.originalSizeKb,
        compKb: result.compressedSizeKb,
      });
    } catch (err: any) {
      console.error("Error al comprimir imagen:", err);
      setErrorMsg("No se pudo comprimir la imagen seleccionada.");
    } finally {
      setCompressing(false);
    }
  };

  // Delete product logic (RLF-172)
  const handleDeleteProduct = async () => {
    if (!product) return;
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar permanentemente "${product.name}"?`);
    if (!confirmDelete) return;

    setDeleting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;

      if (onDelete) {
        await onDelete(product.id);
      } else {
        await onSave();
      }
      onClose();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      setErrorMsg(err.message || "No se pudo eliminar el producto.");
    } finally {
      setDeleting(false);
    }
  };

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
        // Update (RLF-171)
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);

        if (error) throw error;
      } else {
        // Create (RLF-165)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="bg-[#14231D] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <Utensils className="text-[#D4AF37]" size={20} />
            <h2 className="font-serif text-lg font-bold">
              {product ? "Editar Plato en Carta" : "Crear Nuevo Plato"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText size={13} className="text-emerald-700" /> Nombre del Plato *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Puca Picante con Chicharrón"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D] focus:bg-white transition-all font-semibold"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag size={13} className="text-emerald-700" /> Categoría *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D] focus:bg-white transition-all font-semibold"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign size={13} className="text-emerald-700" /> Precio (S/) *
              </label>
              <input
                type="number"
                step="0.10"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="35.00"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D] focus:bg-white transition-all font-bold text-emerald-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Descripción Corta / Ingredientes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Preparado tradicional con maní molido, ají puca y panceta crocante..."
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D] focus:bg-white transition-all"
            />
          </div>

          {/* Image Option: URL or Compressed WebP Upload */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ImageIcon size={13} className="text-emerald-700" /> Imagen del Plato
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Compresor WebP Integrado
              </span>
            </label>

            {/* Direct File Upload with Auto-WebP Compression */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:bg-gray-100/80 transition-colors">
              <Upload size={18} className="text-emerald-700 shrink-0" />
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileCompress}
                  disabled={compressing}
                  className="text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#14231D] file:text-white hover:file:bg-[#1E322A] cursor-pointer"
                />
                {compressing && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <Loader2 size={12} className="animate-spin" /> Comprimiendo a WebP óptimo...
                  </p>
                )}
                {compressStats && (
                  <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 mt-1">
                    <CheckCircle2 size={12} /> {compressStats.origKb} KB ➔ {compressStats.compKb} KB (WebP Optimizado)
                  </p>
                )}
              </div>
            </div>

            {/* URL input fallback */}
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="O ingresa la URL: /imagenes-reales/RECOMENDACIONES-CHEF/puca.webp"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#14231D]"
            />
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Disponibilidad en Carta</span>
              <span className="text-[11px] text-gray-500">¿El plato se puede pedir en la web?</span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                isAvailable ? "bg-emerald-600" : "bg-gray-300"
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
          <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-6">
            
            {/* Delete button (RLF-172) */}
            {product ? (
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Eliminar Plato
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving || compressing}
                className="px-6 py-2.5 rounded-xl bg-[#14231D] hover:bg-[#1E322A] text-[#FAF8F5] text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin text-[#D4AF37]" /> : null}
                {product ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
