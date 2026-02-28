import { Router, Response } from 'express'
import prisma from '../db/client'
import { verifyToken, AuthRequest } from '../auth/middleware'

const router = Router()

// All data routes require auth
router.use(verifyToken)

// GET /api/data — load saved tax state
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const record = await prisma.taxData.findUnique({
    where: { userId: req.userId }
  })
  if (!record) {
    res.json({ data: null })
    return
  }
  try {
    res.json({ data: JSON.parse(record.data) })
  } catch {
    res.json({ data: null })
  }
})

// PUT /api/data — save/overwrite tax state
router.put('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { data } = req.body
  if (!data || typeof data !== 'object') {
    res.status(400).json({ error: 'data field (object) is required' })
    return
  }
  const serialized = JSON.stringify(data)
  await prisma.taxData.upsert({
    where: { userId: req.userId },
    create: { userId: req.userId as string, data: serialized },
    update: { data: serialized }
  })
  res.json({ message: 'Saved' })
})

export default router
