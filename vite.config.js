import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'jsonblob-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/jsonblob')) {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const id = urlObj.searchParams.get('id');
            const targetUrl = id ? `https://jsonblob.com/api/jsonBlob/${id}` : 'https://jsonblob.com/api/jsonBlob';

            try {
              if (req.method === 'GET') {
                  const response = await fetch(targetUrl);
                  const data = await response.text();
                  res.setHeader('Content-Type', 'application/json');
                  res.end(data);
                  return;
              }

              if (req.method === 'POST' || req.method === 'PUT') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                  try {
                    const response = await fetch(targetUrl, {
                      method: req.method,
                      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                      body
                    });
                    
                    if (req.method === 'POST') {
                        const loc = response.headers.get('Location');
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ id: loc ? loc.split('/').pop() : null }));
                    } else {
                        res.statusCode = response.status;
                        res.end(JSON.stringify({ success: true }));
                    }
                  } catch(e) { 
                    res.statusCode = 500; 
                    res.end(JSON.stringify({ error: e.toString() })); 
                  }
                });
                return;
              }
            } catch (err) {
               res.statusCode = 500; res.end(JSON.stringify({error: err.toString()}));
               return;
            }
          }
          next();
        });
      }
    }
  ],
})
