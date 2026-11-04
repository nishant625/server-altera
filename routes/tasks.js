import { Router } from 'express'

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  searchTasks,
  getTaskSummary
} from '../controllers/tasks.js'

const router = Router()

router.get('/search', searchTasks)
router.get('/summary', getTaskSummary)
router.get('/', getTasks)
router.get('/:id', getTaskById)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
