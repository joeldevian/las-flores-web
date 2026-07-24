const fs = require('fs');
let content = fs.readFileSync('src/components/ReservationModal.tsx', 'utf8');

// Replace hex codes with Tailwind classes
content = content.replace(/bg-\[\#3b0944\]/g, 'bg-eucalipto');
content = content.replace(/text-\[\#3b0944\]/g, 'text-eucalipto');
content = content.replace(/border-\[\#3b0944\]/g, 'border-eucalipto');

content = content.replace(/text-\[\#F4C430\]/g, 'text-cream');
content = content.replace(/bg-\[\#F4C430\]/g, 'bg-cream');
content = content.replace(/border-\[\#F4C430\]/g, 'border-cream/50');

// Replace the inline style
content = content.replace(
  /className=\"([^\"]+)\"([\s\n]+)style=\{\{ background: \"#3b0944\", color: \"#F4C430\" \}\}/g,
  'className=\"$1 bg-eucalipto text-cream\"'
);

fs.writeFileSync('src/components/ReservationModal.tsx', content);
console.log('Colors replaced successfully.');
