import { serve } from '@hono/node-server'
import { Hono, Context } from 'hono'
import { join } from 'node:path'
import { serveStatic } from '@hono/node-server/serve-static';
import { UserGithub, DonutLanguagesGithub, GeneralStatsGithub, HexagonStatsGithub} from "./github_requests.js";
import type { Http2ServerRequest } from 'node:http2';
import { readFile } from 'fs/promises';



const app = new Hono()

app.use('/*', serveStatic({ root: './public' }));

app.get('/', async (c) => {
  try {
    const filePath = join(process.cwd(), 'public', 'index.html')
    const html = await readFile(filePath, 'utf-8')

    return c.html(html)
  } catch (error) {
    return c.text('HTML not found', 404)
  }
})

const sendSvg = (c: Context, svgContent: string, status: ContentStatus = 200) => {
    c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    return c.body(svgContent, status, {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
    });

};

const getErrorSvg = (message: string): string => `
    <svg viewBox="0 0 400 50" width="400" height="50" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#161b22" rx="6" stroke="#f85149" stroke-width="1"/>
        <text x="50%" y="50%" fill="#f85149" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="12">
            ${message}
        </text>
    </svg>
`;
type ContentStatus = 200 | 400 | 500;

app.get('/api/infoAccount/:username', async (c) => {
    const rawUsername = c.req.param('username');

    if (!rawUsername) {
        return sendSvg(c, getErrorSvg('Username mancante'), 400);
    }

    const username = encodeURIComponent(rawUsername.trim());

    try {
        const svg = await UserGithub(username);
        return sendSvg(c, svg, 200);
    } catch (error) {
        console.error(`Error infoAccount for ${username}:`, error);
        return sendSvg(c, getErrorSvg('Errore nel recupero dati utente'), 500);
    }
});

app.get('/api/donutLanguages/:username', async (c) => {
    const rawUsername = c.req.param('username');

    if (!rawUsername) {
        return sendSvg(c, getErrorSvg('Username mancante'), 400);
    }

    const username = encodeURIComponent(rawUsername.trim());

    try {
        const data = await DonutLanguagesGithub(username);
        return sendSvg(c, data, 200);
    } catch (error) {
        console.error(`Error donutLanguages for ${username}:`, error);
        return sendSvg(c, getErrorSvg('Errore nel recupero linguaggi'), 500);
    }
});

app.get('/api/generalStats/:username/:color', async (c) => {
    const rawUsername = c.req.param('username');
    const color = c.req.param('color');

    if (!rawUsername) {
        return sendSvg(c, getErrorSvg('Username mancante'), 400);
    }

    const username = encodeURIComponent(rawUsername.trim());

    try {
        const data = await GeneralStatsGithub(username, color);
        return sendSvg(c, data, 200);
    } catch (error) {
        console.error(`Error generalStats for ${username}:`, error);
        return sendSvg(c, getErrorSvg('Errore nel recupero statistiche generali'), 500);
    }
});

app.get('/api/hexagonalStats/:username/:color', async (c) => {
    const rawUsername = c.req.param('username');
    const color = c.req.param('color');

    if (!rawUsername) {
        return sendSvg(c, getErrorSvg('Username mancante'), 400);
    }

    const username = encodeURIComponent(rawUsername.trim());

    try {
        const data = await HexagonStatsGithub(username, color);
        return sendSvg(c, data, 200);
    } catch (error) {
        console.error(`Error hexagonalStats for ${username}:`, error);
        return sendSvg(c, getErrorSvg('Errore nel recupero grafico esagonale'), 500);
    }
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
