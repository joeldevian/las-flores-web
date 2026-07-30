import { useState, useEffect, useRef } from "react";
import { X, Loader2, Utensils, DollarSign, FileText, Image as ImageIcon, Tag, Upload, Trash2, CheckCircle2, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
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
  const [isCustomizable, setIsCustomizable] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(product.price ? product.price.toString() : "");
        setCategoryId(product.category_id || (categories[0]?.id || ""));
        setImageUrl(product.image_url || "");
        setIsAvailable(product.is_available ?? true);
        setIsCustomizable(product.is_customizable ?? (product.name?.toLowerCase().includes("desayuno ayacuchano") || false));
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setCategoryId(categories[0]?.id || "");
        setImageUrl("");
        setIsAvailable(true);
        setIsCustomizable(false);
      }
      setUploadSuccessMsg("");
      setErrorMsg("");
    }
  }, [isOpen, product, categories]);

  if (!isOpen) return null;

  // Zero-IT Staff Image Upload: Compress & Upload to Supabase Storage automatically
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    setUploadSuccessMsg("");

    try {
      // 1. Compress image to optimized WebP in browser
      const compressed = await compressImageToWebP(file, 1200, 1200, 0.85);

      // 2. Try uploading to Supabase Storage bucket 'products'
      const cleanFileName = `plato_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("products")
        .upload(cleanFileName, compressed.blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        // Successfully stored in Supabase Storage CDN!
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(cleanFileName);

        setImageUrl(publicUrlData.publicUrl);
        setUploadSuccessMsg(`¡Imagen optimizada (${compressed.originalSizeKb}KB ➔ ${compressed.compressedSizeKb}KB WebP) y subida con éxito!`);
      } else {
        // Fallback: If bucket is not public/ready, use compressed Data URL directly
        console.warn("Storage upload fallback to compressed Data URL:", uploadErr);
        setImageUrl(compressed.dataUrl);
        setUploadSuccessMsg(`¡Foto optimizada a WebP (${compressed.compressedSizeKb} KB) y lista para guardar!`);
      }
    } catch (err: any) {
      console.error("Error al procesar la foto:", err);
      setErrorMsg("No se pudo procesar la foto seleccionada. Intenta con otra imagen.");
    } finally {
      setUploading(false);
    }
  };

  // Delete product logic
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
        is_customizable: isCustomizable,
      };

      if (product) {
        // Update
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from("products")
          .insert([payload]);

        if (error) throw error;
      }

      await onSave();
      onClose();
    } catch (err: any) {
      console.error("Error saving product:", err);
      setErrorMsg(err.message || "Error al guardar el plato.");
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
              {product ? "Editar / Actualizar Plato" : "Nuevo Lanzamiento o Promoción"}
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText size={13} className="text-emerald-700" /> Nombre del Plato o Promoción *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Promoción Fiestas Patrias - Cuy Chactado"
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
              Descripción o Detalles de la Promoción
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del plato, ingredientes o términos del lanzamiento..."
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D] focus:bg-white transition-all"
            />
          </div>

          {/* Staff Image Upload Section */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ImageIcon size={14} className="text-emerald-700" /> Foto del Plato / Promoción
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Almacenamiento Automático
              </span>
            </label>

            {/* Current Image Preview & Change Button */}
            {imageUrl ? (
              <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0 shadow-sm">
                  <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Imagen Cargar y Lista
                  </span>
                  <p className="text-[11px] text-gray-500 line-clamp-1 break-all">{imageUrl}</p>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-1 px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {uploading ? <Loader2 size={12} className="animate-spin text-emerald-700" /> : <RefreshCw size={12} className="text-emerald-700" />}
                    <span>Actualizar / Cambiar Foto</span>
                  </button>
                </div>
              </div>
            ) : (
              /* One-Click Upload Area for Staff */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-emerald-600/40 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl text-center cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                </div>
                <span className="text-xs font-bold text-[#14231D] block">
                  {uploading ? "Optimizando y Subiendo Foto..." : "Haga clic aquí para Seleccionar Foto (Celular o PC)"}
                </span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  El sistema comprime la foto automáticamente y genera su enlace permanente.
                </span>
              </div>
            )}

            {/* Hidden Input File */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Manual URL Fallback / Google Drive converter */}
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-800 font-semibold py-1">
                ¿Prefieres ingresar o pegar un enlace manualmente?
              </summary>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  const inputVal = e.target.value;
                  if (inputVal.includes("drive.google.com")) {
                    const match = inputVal.match(/\/d\/([a-zA-Z0-9_-]+)/) || inputVal.match(/id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      setImageUrl(`https://drive.google.com/uc?export=view&id=${match[1]}`);
                      return;
                    }
                  }
                  setImageUrl(inputVal);
                }}
                placeholder="Pega la URL de la foto o enlace público de Google Drive..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#14231D]"
              />
            </details>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Disponibilidad en Carta Web</span>
              <span className="text-[11px] text-gray-500">¿El plato o promoción está activo para clientes?</span>
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

          {/* Customization Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <div>
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-600" /> ¿Es un plato personalizable? (Arma tu plato / Ronda)
              </span>
              <span className="text-[11px] text-amber-800/80 block mt-0.5">
                Permite al cliente seleccionar opciones (Bebidas, Acompañamientos, etc.) antes de agregar.
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsCustomizable(!isCustomizable)}
              className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${
                isCustomizable ? "bg-amber-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isCustomizable ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-6">
            
            {/* Delete button */}
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
                disabled={saving || uploading}
                className="px-6 py-2.5 rounded-xl bg-[#14231D] hover:bg-[#1E322A] text-[#FAF8F5] text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin text-[#D4AF37]" /> : null}
                {product ? "Guardar Cambios" : "Publicar en Carta"}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
