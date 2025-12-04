import express from 'express';
import {
  createParticipant, getParticipants,
  updateParticipant, deleteParticipant
} from '../repositories/participantsRepository.js';
import { ObjectId } from '../db.js';

export const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, course } = req.body;
    if (!name || !email || !phone || !course)
      return res.status(400).json({ error: 'Missing fields' });

    try {
      const p = await createParticipant({ name, email, phone, course });
      return res.status(201).json({ _id: p._id, participant: p });
    } catch (e) {
      if (e.code === 11000)
        return res.status(409).json({ error: 'Email already registered' });
      throw e;
    }
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const result = await getParticipants({ page, limit });
    res.json({ ...result, page, limit });
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const updated = await updateParticipant(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Updated', participant: updated });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const r = await deleteParticipant(id);
    if (!r) return res.status(404).json({ error: 'Not found' });

    res.status(204).send();
  } catch (e) { next(e); }
});
