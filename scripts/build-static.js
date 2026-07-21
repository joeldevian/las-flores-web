import { exec } from 'child_process';
import http from 'http';
import fs from 'fs';

console.log('Starting preview server...');
const server = exec('npx vite preview --port 4173 --host 127.0.0.1');

function tryFetch(retries = 15, delay = 1000) {
  http.get('http://127.0.0.1:4173', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Got index.html. Saving...');
      
      // Flatten dist/client into dist
      fs.cpSync('dist/client', 'dist-temp', {recursive: true}); 
      fs.rmSync('dist', {recursive: true, force: true, maxRetries: 10, retryDelay: 200}); 
      fs.mkdirSync('dist'); 
      fs.cpSync('dist-temp', 'dist', {recursive: true}); 
      // Write index.html to dist
      fs.writeFileSync('dist/index.html', data);
      
      try {
        fs.rmSync('dist-temp', {recursive: true, force: true, maxRetries: 10, retryDelay: 200});
      } catch (e) {
        console.warn('Could not remove dist-temp, ignoring...', e.message);
      }
      
      console.log('Done! Killing server...');
      server.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    if (retries > 0) {
      console.log(`Preview server not ready yet, retrying... (${retries} attempts left)`);
      setTimeout(() => tryFetch(retries - 1, delay), delay);
    } else {
      console.error('Error fetching:', err);
      server.kill();
      process.exit(1);
    }
  });
}

setTimeout(() => tryFetch(), 2000);

