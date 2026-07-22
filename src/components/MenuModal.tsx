import { useState, useEffect } from 'react';
import { Plus, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

/* ─── Paleta Retablo Ayacuchano ─── */
const R = {
  rojo: "#C0392B",
  verde: "#2A6135",
  morado: "#3b0944",
  amarillo: "#F4C430",
  crema: "#FBF5E6",
  blanco: "#FFFFFF",
};

export interface Dish {
  name: string;
  description: string;
  price: string;
  image?: string;
}

export interface Category {
  id: string;
  label: string;
  dishes: Dish[];
}

export const categories: Category[] = [
    {
    id: 'desayuno',
    label: 'Arma tu Desayuno',
    dishes: [
      { name: 'Desayuno Ayacuchano Completo', description: 'Puede elegir una bebida caliente, una fría, un sándwich y un acompañamiento.', price: 'S/ 40.00', image: 'https://images.unsplash.com/photo-1564920090325-d7b8522250ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },
    {
    id: 'entradas',
    label: 'Entradas',
    dishes: [
      { name: 'SERVICIO PAN (MASA MADRE)', description: '4 tipos de pan artesanal de masa madre, acompañado de mantequilla saborizada y mermelada de fresas y tomate. ', price: 'S/ 16.00', image: 'https://images.unsplash.com/photo-1584747295311-5d129b60411e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CALDO DE CUY', description: 'Concentrado de cuy con alto valor protéico acompañado con perejil, cebolla china y orégano molido. ', price: 'S/ 5.00', image: 'https://images.unsplash.com/photo-1584747295311-5d129b60411e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CALDO ACEVICHADO', description: 'Renovamos nuestro caldo de cuy clásico para fusionarlo con un aliño de limón aromatizado, acompañado de una sarsa de la casa y papa nativa. ', price: 'S/ 9.00', image: 'https://images.unsplash.com/photo-1567030492990-950d9855154b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'QAPCHI HUAMANGUINO', description: 'Queso aplastado, saborizado con cebolla china, muña, huacatay, leche y trozos de ají rocoto, acompañado con papas nativas sancochadas. ', price: 'S/ 14.00', image: 'https://images.unsplash.com/photo-1567030492990-950d9855154b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'QAPCHI LAS FLORES', description: 'Crema de queso y huacatay, creado en nuestras cocinas hace más de 30 años, acompañado de papas nativas doradas. ', price: 'S/ 14.00', image: 'https://images.unsplash.com/photo-1535400875775-0269e7a919af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'TRIPITAS DE CUY', description: 'Icónico plato a base de tripitas crocantes, acompañado con papas   cocktail salteadas en mantequilla artesanal y especias, qapchi, mote y ensalada criolla. (consultar stock) ', price: 'S/ 32.00', image: 'https://images.unsplash.com/photo-1746716447103-e1618bbd0669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },  
  {
    id: 'tipicos',
    label: 'Platos Típicos',
    dishes: [
      { name: 'ESCABECHE DE GALLINA TRES GENERACIONES', description: 'Plato tradicional de la cocina ayacuchana, preparado con gallina, ajíes y cebolla que le dan un sabor intenso y equilibrado, servido con camote. Una receta que viene de tres generaciones atrás y que hoy preservamos en Las Flores como parte de nuestra identidad. ', price: 'S/ 42.00', image: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CHORIZO AYACUCHANO ', description: 'Plato elaborado a base de carne molida de chancho y res, en una cama de lechuga acompañado de papa blanca sancochada porción de choclo y ensalada regional. ', price: 'S/ 28.00', image: 'https://images.unsplash.com/photo-1613626630502-182579c0432c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'PUCA PICANTE ', description: 'Guiso de papa vieja en salsa de ají panca con maní tostado, trozos de carne de cerdo y especias, servido con arroz blanco, ensalada regional y una presa de chicharrón huamanguino. ', price: 'S/ 28.00', image: 'https://images.unsplash.com/photo-1571139318929-bb90d382dbd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },
  {
    id: 'chef',
    label: 'Recomendación del Chef',
    dishes: [
      { name: 'LECHE DE TIGRE ', description: 'Extracto concentrado de trucha salmonada, limón y ají, con un equilibrio preciso entre acidez y frescura. ', price: 'S/ 25.00', image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'},
      { name: 'CEVICHE DE TRUCHA', description: '200 gr. de trucha salmonada cortados en trozo, marinada en jugo de tumbo y limón fresco, acompañado de cebolla morada, cilantro y ají limo.', price: 'S/ 34.00', image: 'https://images.unsplash.com/photo-1583953623787-ada99d338235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'},
      { name: 'CHICHARRÓN DE TRUCHA', description: 'Es crujiente por fuera, jugosa por dentro. Nuestra seleccionada trucha salmonada es cuidadosamente sazonada y acompañada con papas doradas y sarza criolla. ', price: 'S/ 36.00', image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'},
      { name: 'LOMO SALTADO', description: 'El ícono de nuestra cocina. El lomo saltado es ese encuentro perfecto entre historia y fuego, donde el wok abraza cortes jugosos de carne, ', price: 'S/ 40.00', image: 'https://images.unsplash.com/photo-1583953623787-ada99d338235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'},
      { name: 'MILANESA DE POLLO', description: 'Jugosa milanesa de pollo empanizada con panko, frita al punto dorado perfecto y servida con nuestra salsa especial Las Flores, que realza su sabor con un toque casero y equilibrado.', price: 'S/ 34.00', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },


  {
    id: 'especialidades',
    label: 'Especialidades',
    dishes: [
      { name: 'CUY LAS FLORES', description: 'Plato insignia, acompañado con papas nativas doradas, qapchi, choclo salteado en especias, ensalada criolla y chips de papas.', price: 'S/ 68.00', image: 'https://images.unsplash.com/photo-1613626630502-182579c0432c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CUY LAS FLORES (DESHUESADO)', description: 'Nuestra versión deshuesada del tradicional cuy frito conserva su sabor auténtico, con una textura más delicada y una experiencia práctica y elegante.', price: 'S/ 42.00', image: 'https://images.unsplash.com/photo-1559688665-040666a2f326?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CHICHARRÓN HUAMANGUINO', description: 'Trozos de carne de cerdo dorados en su propia manteca, acompañado de papas sancochadas, qapchi, chips de camote y ensalada criolla.', price: 'S/ 36.00', image: 'https://images.unsplash.com/photo-1613626630502-182579c0432c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'MIXTO (CUY + CHICHARRÓN)', description: 'Medio cuy frito y trozos de chicharrón, acompañado de mix de papas nativas ,qapchi, choclo salteado y ensalada criolla.', price: 'S/ 52.00', image: 'https://images.unsplash.com/photo-1559688665-040666a2f326?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CHANCHO ASADO LAS FLORES', description: 'Carne de cerdo macerado en distintas especies, acompañado de pastel de papa, crema de pimentón, chips de camote y ensalada hawaiana.', price: 'S/ 36.00', image: 'https://images.unsplash.com/photo-1571139318929-bb90d382dbd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'TRUCHA ANDINA', description: 'Trucha deshuesada, empanizada con maíz molido u hojuelas de quinua, acompañado de arroz a la jardinera, chips de papas, ensalada mixta orgánica. ', price: 'S/ 32.00', image: 'https://images.unsplash.com/photo-1571139318929-bb90d382dbd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },
  {
    id: 'grill',
    label: 'Al Grill',
    dishes: [
      { name: 'GRAN FILET MIGNON', description: '500 gramos del corte más suave de la res, cocido a la parrilla para lograr una experiencia jugosa, tierna. Se acompaña con guarnición a elección: Papas fritas francesas o papas salteadas en mantequilla, ensalada orgánica o sancochada.', price: 'S/ 80.00', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'SUPREMA DE POLLO', description: 'Jugosa pechuga de pollo a la parrilla, servida con papas fritas doradas, ensalada fresca de la casa y cremas seleccionadas para realzar cada bocado.', price: 'S/ 32.00', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'POLLO EN SALSA DE CHAMPIÑONES FRESCOS', description: 'Pechuga de pollo al grill, glaseada con una cremosa salsa blanca con champiñones salteados, servida con arroz blanco y ensalada hawaiana.', price: 'S/ 32.00', image: 'https://images.unsplash.com/photo-1583953623787-ada99d338235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CHULETA DE CERDO', description: '350 gr. de carne de cerdo en salsa BBQ o chimichurri acompañado de papas nativas cocktail o papas fritas y ensalada orgánica con palta de nuestro fundo.', price: 'S/ 34.00', image: 'https://images.unsplash.com/photo-1583953623787-ada99d338235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'SETAS Y CHAMPIÑONES', description: '350 gr. de carne de cerdo en salsa BBQ o chimichurri acompañado de papas nativas cocktail o papas fritas y ensalada orgánica con palta de nuestro fundo.', price: 'S/ 36.00', image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'FILETE DE TRUCHA SALMONADA', description: '350 gr. de carne de cerdo en salsa BBQ o chimichurri acompañado de papas nativas cocktail o papas fritas y ensalada orgánica con palta de nuestro fundo.', price: 'S/ 38.00', image: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },
    {
    id: 'menu infantil',
    label: 'Menu infantil',
    dishes: [
      { name: 'NUGGETS DE CUY', description: 'Tiernos bocados de cuy, suavemente sazonados y empanizados al dorado perfecto, ofreciendo un sabor único en una presentación divertida.', price: 'S/ 40.00', image: 'https://images.unsplash.com/photo-1613626630502-182579c0432c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'MILANESA DE POLLO INFANTIL', description: '150 gramos de jugosa milanesa de pollo empanizada con panko, frita al punto dorado perfecto.', price: 'S/ 38.00', image: 'https://images.unsplash.com/photo-1559688665-040666a2f326?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },
  {
    id: 'calderia',
    label: 'Caldería',
    dishes: [
      { name: 'CALDO DE GALLINA', description: 'Clásico de nuestra cocina peruana, elaborado con gallina, fideos, papa y hierbas aromáticas que le dan un sabor casero, profundo y reconfortante.', price: 'S/ 26.00', image: 'https://images.unsplash.com/photo-1613626630502-182579c0432c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CALDO DE GALLINA ACEVICHADO', description: 'Clásico de nuestra cocina peruana, elaborado con gallina, fideos, papa y hierbas aromáticas que le dan un sabor casero, profundo y reconfortante.', price: 'S/ 32.00', image: 'https://images.unsplash.com/photo-1559688665-040666a2f326?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'ADOBO HUAMANGUINO', description: 'Plato tradicional de la cocina ayacuchana, preparado con carne de cerdo, ajíes y especias que le dan un sabor intenso y reconfortante, acompañado con pan chapla. (Consultar disponibilidad)', price: 'S/ 30.00', image: 'https://images.unsplash.com/photo-1613626630502-182579c0432c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'MONDONGO AYACUCHANO', description: 'Clásico de los andes peruanos, preparado con maíz pelado, mix de carnes y hierbas andinas en una cocción que concentra su sabor y carácter tradicional. Una sopa sustanciosa y reconfortante, muy ligada a nuestras costumbres. (Solo domingos y feriados)', price: 'S/ 24.00', image: 'https://images.unsplash.com/photo-1559688665-040666a2f326?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CALDO DE PATA', description: 'Caldo tradicional de sabor profundo, preparado a base de pata de res y especias, con una cocción lenta que concentra su carácter y textura. Reconocido por su aporte de colágeno. (Solo domingos)', price: 'S/ 22.00', image: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CALDO DE CABEZA', description: 'Clásico de la cocina andina, elaborado con presas de cabeza, hierbas y especias en una cocción lenta que realza su sabor y consistencia. Una sopa de carácter intenso, muy ligada a jornadas tempranas y a la tradición popular. (Solo domingos)', price: 'S/ 24.00', image: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'CALDO DE CABEZA ESPECIAL', description: 'Sopa tradicional de la cocina andina, elaborada con lengua, hierbas y especias en una cocción pausada que realza su textura y sabor. Muy valorada por quienes buscan una de las presas más sabrosas y nobles de nuestra cocina.   (Solo domingos)', price: 'S/ 30.00', image: 'https://images.unsplash.com/photo-1746716447103-e1618bbd0669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },
  {
    id: 'pastas',
    label: 'Selección de pastas',
    dishes: [
      { name: 'DÚO DE PASTAS', description: 'Dos clásicos en un solo plato: Fetuccini a la huancaína con pollo al grill y espagueti al pesto con filet mignon a la parrilla, en una combinación pensada para disfrutar lo mejor de ambas pastas.', price: 'S/ 42.00', image: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'ESPAGUETI AL PESTO', description: 'Espagueti Angesi bañado en una cremosa salsa al pesto, elaborado con albahaca seleccionada, pistachos y aceite de oliva, logrando una combinación aromática, fresca y elegante. ', price: 'S/ 28.00', image: 'https://images.unsplash.com/photo-1613626630502-182579c0432c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
      { name: 'FETUCCINI A LA HUANCAÍNA', description: 'Fetuccini Angesi cubierto con una cremosa salsa de huancaína, acompañado de lomo saltado al wok con cebolla y tomate, en una fusión intensa y generosa de sabores peruanos.', price: 'S/ 28.00', image: 'https://images.unsplash.com/photo-1571139318929-bb90d382dbd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
    ],
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    dishes: [
      { name: 'SUMAQ', description: 'Una mezcla que equilibra la acidez del tumbo, la dulzura aromática de la granadilla y la suavidad floral de la manzanilla.', price: 'S/ 22.00' },
      { name: 'NECTAR ANDINO', description: 'Níspero andino fusionado con maracuyá y anís estrella, logrando un balance entre dulzura, acidez y especias.', price: 'S/ 22.00' },
      { name: 'TUNA SUA', description: 'Tuna, acompañada de piña y leche condensada, en una mezcla fresca con notas dulces y herbales.', price: 'S/ 22.00' },
      { name: 'CHICHA DE 8 SEMILLAS', description: 'El sabor único de la chicha de 7 semillas, cuidadosamente fermentada, se combina con la cerveza negra para brindar una experiencia más exquisita.', price: 'S/ 22.00' },
      { name: 'JORA DEL INKA MODERNO', description: 'Bebida tradicional andina de maíz germinado, mezclada con zumo de maracuyá, que aporta un sabor refrescante.', price: 'S/ 20.00' },
      { name: 'CHICHA DE QUINUA', description: 'Bebida tradicional de la casa y favorita de muchos, elaborada a base de quinua blanca, 14 frutas y especias.', price: 'S/ 22.00' },
      { name: 'CARAMBOLA TROPICAL', description: 'Fusión de carambola, piña y limón, con un perfil refrescante y ligeramente ácido.', price: 'S/ 20.00' },
      { name: 'FRUTOS ROJOS', description: 'Refrescante combinación de frutos rojos ayacuchanos y durazno, con un perfil dulce y vibrante.', price: 'S/ 22.00' },
      { name: 'HIERBAS ANDINAS', description: 'Encuentro de hierbas andinas, pepino, manzana y limón  en una bebida ligera, refrescante y de carácter herbal.', price: 'S/ 20.00' },
      { name: 'MARACUMANGO', description: 'Deliciosa bebida en la que el maracuyá se combina con el mango, ofreciendo un sabor único e irresistible.', price: 'S/ 20.00' },
      { name: 'CHICHA MORADA ESPECIAL', description: 'Bebida tradicional peruana hecha a base de maíz morado, rica en antioxidantes, acompañada de piña y manzana picada.', price: 'S/ 20.00' },
    ],
  },
  {
    id: 'postres',
    label: 'Postres',
    dishes: [
      { name: 'CARROT CAKE', description: 'Tarta hecha con zanahorias, frutos secos y mantequilla artesanal, un postre suave y jugoso, dándole el color oscuro el azúcar de caña, perfecto para endulzar tus días.', price: 'S/ 20.00' },
      { name: 'CRÊPE SUZETTE', description: 'Delicadas crêpes francesas, bañadas en una sedosa salsa de naranja y mantequilla, con el toque elegante de brandy que despierta los sentidos.', price: 'S/ 26.00' },
      { name: 'TARTA VASCA', description: 'La clásica tarta vasca, acompañada de una fina selección de frutos de estación que realzan su textura y equilibrio. Un postre elegante que une la tradición europea con el encanto natural de nuestra sierra.', price: 'S/ 24.00' },
      { name: 'MAZAMORRA DE CALABAZA', description: 'Postre delicioso originario de los Andes del Perú, elaborado a base de calabaza madura, chancaca y secreto de autor.', price: 'S/ 15.00' },
      { name: 'PANACOTA CON FRUTOS ANDINOS', description: 'Es un postre italiano irresistible, con un interior cremoso y sedoso. Su versión Andina es una mezcla de todo lo bueno.', price: 'S/ 20.00' },
      { name: 'TORTINO DE CHOCOLATE ANDINO', description: 'Suave y fundente tortino de chocolate, servido sobre una delicada crema inglesa infusionada con hierba luisa. Cada bocado equilibra el dulzor intenso del cacao con sutiles notas aromáticas del Perú profundo.', price: 'S/ 22.00' },
    ],
  },
 
];

interface DishCardProps {
  dish: Dish;
  categoryId: string;
}

function DishCard({ dish, categoryId }: DishCardProps) {
  const { addItem } = useCart();
  const priceNum = parseFloat(dish.price.replace('S/ ', ''));

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-[#F4C430]">
      {dish.image ? (
        <div className="h-48 overflow-hidden relative m-2 rounded-t-xl rounded-b-3xl">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
          <img
            src={dish.image}
            alt={dish.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      ) : (
        <div className="h-48 m-2 rounded-t-xl rounded-b-3xl bg-black/5 flex items-center justify-center relative">
          <span className="font-serif italic text-black/30 text-xl px-4 text-center">{dish.name}</span>
        </div>
      )}
      <div className="px-5 pb-5 pt-3 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-lg font-serif font-bold leading-tight transition-colors" style={{ color: R.morado }}>
            {dish.name}
          </h3>
          <span className="font-bold text-sm flex-shrink-0 px-2 py-1 rounded-md" style={{ background: `${R.rojo}15`, color: R.rojo }}>{dish.price}</span>
        </div>
        <p className="text-black/60 text-xs flex-1 mb-5 leading-relaxed font-medium">{dish.description}</p>
        <button
          onClick={() => addItem({ id: `${categoryId}-${dish.name}`, name: dish.name, price: priceNum, image: dish.image })}
          className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg text-sm font-bold tracking-wide"
          style={{ background: R.amarillo, color: R.morado }}
        >
          <Plus size={16} strokeWidth={3} />
          Agregar
        </button>
      </div>
    </div>
  );
}

interface MenuModalProps {
  open: boolean;
  onClose: () => void;
}

export function MenuModal({ open, onClose }: MenuModalProps) {
  const [activeId, setActiveId] = useState('chef');
  const { totalItems, setIsOpen: setSidebarOpen } = useCart();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const active = categories.find((c) => c.id === activeId) || categories[0];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-cream overflow-hidden animate-in fade-in zoom-in-[0.98] duration-300">
      {/* Header */}
      <div className="relative text-white py-5 px-6 md:px-10 flex items-center justify-between sticky top-0 z-20 shadow-md" style={{ background: R.morado }}>
        <div className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{ background: `linear-gradient(90deg, ${R.verde} 0%, ${R.verde} 25%, ${R.amarillo} 25%, ${R.amarillo} 50%, ${R.rojo} 50%, ${R.rojo} 75%, ${R.morado} 75%)` }}
        />
        <div className="flex items-center gap-4 relative">
          <div className="hidden md:flex w-14 h-14 rounded-full border-2 overflow-hidden flex-shrink-0 bg-white p-1" style={{ borderColor: R.amarillo }}>
            <img loading="lazy" src="/images.png" alt="Las Flores" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-serif font-bold tracking-wide text-2xl md:text-3xl text-white">Nuestra Carta</h2>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: R.amarillo }}>Para Delivery & Recojo</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8 relative">
          <button
            onClick={() => {
              setSidebarOpen(true);
            }}
            className="relative transition-all flex items-center gap-2 text-sm font-bold px-5 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: R.amarillo, color: R.morado }}
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
            <span className="hidden md:inline">Ver Pedido</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md" style={{ background: R.rojo }}>
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2">
            <X size={26} />
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Vertical Categories Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-black/5 overflow-y-auto z-10" style={{ background: R.crema }}>
          <div className="flex flex-col py-2 md:py-6">
            {categories.map((cat) => {
              const isActive = activeId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveId(cat.id)}
                  className={`text-left px-6 md:px-8 py-4 text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] transition-all border-l-4 ${
                    isActive
                      ? 'bg-black/5'
                      : 'border-transparent text-black/50 hover:text-black/80 hover:bg-black/5'
                  }`}
                  style={{ borderColor: isActive ? R.amarillo : 'transparent', color: isActive ? R.morado : undefined }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10" style={{ background: `${R.crema}80` }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: R.morado }}>
              {active.label}
            </h2>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 rounded-full" style={{ background: `${R.morado}15`, color: R.morado }}>
              {active.dishes.length} platos
            </span>
          </div>

          <div key={activeId} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {active.dishes.map((dish, i) => (
              <DishCard key={i} dish={dish} categoryId={activeId} />
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
