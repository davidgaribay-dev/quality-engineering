import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, normalize } from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  InquirySchema,
  PetQuerySchema,
  type InquiryResponse,
} from '@org/contracts';
import { getPetById, getPets } from './data/pets.js';

const here = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(here, '..', 'assets', 'images');

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export const app = new Hono();

// The web app calls the API same-origin via a Vite proxy in dev, but allow
// cross-origin too so the API is usable directly (curl, separate hosting).
app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

// GET /api/pets?species=dog|cat
app.get('/api/pets', (c) => {
  const parsed = PetQuerySchema.safeParse({
    species: c.req.query('species') ?? undefined,
  });
  if (!parsed.success) {
    return c.json({ error: 'Invalid species filter' }, 400);
  }
  return c.json(getPets(parsed.data.species));
});

// GET /api/pets/:id
app.get('/api/pets/:id', (c) => {
  const pet = getPetById(c.req.param('id'));
  if (!pet) return c.json({ error: 'Pet not found' }, 404);
  return c.json(pet);
});

// POST /api/pets/:id/inquiries  — adoption / request-more-info submissions
app.post('/api/pets/:id/inquiries', async (c) => {
  const pet = getPetById(c.req.param('id'));
  if (!pet) return c.json({ error: 'Pet not found' }, 404);

  const body = await c.req.json().catch(() => null);
  const parsed = InquirySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      400
    );
  }

  const response: InquiryResponse = {
    id: crypto.randomUUID(),
    petId: pet.id,
    petName: pet.name,
    requestType: parsed.data.requestType,
    status: 'received',
    submittedAt: new Date().toISOString(),
  };
  // A real app would persist + email here; we just acknowledge receipt.
  return c.json(response, 201);
});

// GET /images/<file> — serve the pet photos bundled with the API.
app.get('/images/:file', async (c) => {
  const file = c.req.param('file');
  // Guard against path traversal: only a bare filename is allowed.
  if (file.includes('/') || file.includes('\\') || normalize(file) !== file) {
    return c.json({ error: 'Invalid path' }, 400);
  }
  const ext = extname(file).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return c.json({ error: 'Unsupported file type' }, 400);

  try {
    const data = await readFile(join(imagesDir, file));
    return c.body(data, 200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    });
  } catch {
    return c.json({ error: 'Image not found' }, 404);
  }
});
