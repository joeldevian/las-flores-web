const fs = require('fs');

const files = [
  'src/components/MenuModal.tsx',
  'src/components/CartSidebar.tsx',
  'src/components/SeatSelector.tsx',
  'src/routes/carta.tsx',
  'src/routes/index.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Tailwind class replacements
  content = content.replace(/bg-\[\#3b0944\]/g, 'bg-eucalipto');
  content = content.replace(/text-\[\#3b0944\]/g, 'text-eucalipto');
  content = content.replace(/border-\[\#3b0944\]/g, 'border-eucalipto');
  content = content.replace(/border-b-\[\#3b0944\]/g, 'border-b-eucalipto');
  
  content = content.replace(/text-\[\#F4C430\]/g, 'text-cream');
  content = content.replace(/bg-\[\#F4C430\]/g, 'bg-cream');
  content = content.replace(/border-\[\#F4C430\]/g, 'border-cream/50');
  content = content.replace(/border-b-\[\#F4C430\]/g, 'border-b-cream/50');

  // Inline style replacements
  content = content.replace(/background: \"\#3b0944\"/g, 'background: \"var(--color-eucalipto)\"');
  content = content.replace(/color: \"\#F4C430\"/g, 'color: \"var(--color-cream)\"');
  content = content.replace(/color: \"\#3b0944\"/g, 'color: \"var(--color-eucalipto)\"');
  content = content.replace(/background: \"\#F4C430\"/g, 'background: \"var(--color-cream)\"');
  content = content.replace(/borderColor: \"\#F4C430\"/g, 'borderColor: \"var(--color-cream)\"');

  // SVG fill replacements
  content = content.replace(/fill=\"\#3b0944\"/g, 'fill=\"var(--color-eucalipto)\"');
  content = content.replace(/fill=\"\#F4C430\"/g, 'fill=\"var(--color-cream)\"');
  content = content.replace(/stroke=\"\#3b0944\"/g, 'stroke=\"var(--color-eucalipto)\"');
  content = content.replace(/stroke=\"\#F4C430\"/g, 'stroke=\"var(--color-cream)\"');

  // SVG conditional fills in SeatSelector
  content = content.replace(/fill={selectedTable === t.id \? \"\#F4C430\" : t.available \? \"\#ffffff\" : \"\#f3f4f6\"}/g, 
    'fill={selectedTable === t.id ? "var(--color-eucalipto)" : t.available ? "#ffffff" : "#f3f4f6"}');
  content = content.replace(/stroke={selectedTable === t.id \? \"\#3b0944\" : \"\#d1d5db\"}/g, 
    'stroke={selectedTable === t.id ? "var(--color-eucalipto-dark)" : "#d1d5db"}');
    
  // Hover pseudo class replacements
  content = content.replace(/hover:border-\[\#F4C430\]/g, 'hover:border-eucalipto/30');
  content = content.replace(/hover:text-\[\#F4C430\]/g, 'hover:text-eucalipto');
  content = content.replace(/focus:border-b-\[\#F4C430\]/g, 'focus:border-b-eucalipto');

  fs.writeFileSync(file, content);
  console.log('Replaced in', file);
});
