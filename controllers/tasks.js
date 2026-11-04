import Task from '../models/task.js'

const getWeekRange = (weekStr) => {
  const [year, month, day] = weekStr.split('T')[0].split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const dayOfWeek = d.getUTCDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const start = new Date(d)
  start.setUTCDate(d.getUTCDate() + diff)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)
  return { start, end }
}

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const sanitizeTaskInput = (body, isUpdate = false) => {
  const data = {}

  if (body.title !== undefined || !isUpdate) {
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      const err = new Error('Title is required')
      err.status = 400
      throw err
    }
    data.title = body.title.trim()
  }

  if (body.description !== undefined) {
    data.description = typeof body.description === 'string' ? body.description.trim() : ''
  }

  if (body.date !== undefined || !isUpdate) {
    if (!body.date) {
      const err = new Error('Date is required')
      err.status = 400
      throw err
    }
    const parsedDate = new Date(body.date)
    if (isNaN(parsedDate.getTime())) {
      const err = new Error('Invalid date format')
      err.status = 400
      throw err
    }
    data.date = parsedDate
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

  if (body.startTime !== undefined || !isUpdate) {
    if (!body.startTime || typeof body.startTime !== 'string' || !timeRegex.test(body.startTime.trim())) {
      const err = new Error('Valid start time (HH:mm) is required')
      err.status = 400
      throw err
    }
    data.startTime = body.startTime.trim()
  }

  if (body.endTime !== undefined || !isUpdate) {
    if (!body.endTime || typeof body.endTime !== 'string' || !timeRegex.test(body.endTime.trim())) {
      const err = new Error('Valid end time (HH:mm) is required')
      err.status = 400
      throw err
    }
    data.endTime = body.endTime.trim()
  }

  if (data.startTime && data.endTime) {
    if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
      const err = new Error('End time must be after start time')
      err.status = 400
      throw err
    }
  }

  if (body.priority !== undefined || !isUpdate) {
    const allowed = ['low', 'medium', 'high']
    data.priority = allowed.includes(body.priority) ? body.priority : 'medium'
  }

  if (body.status !== undefined) {
    const allowed = ['open', 'completed']
    data.status = allowed.includes(body.status) ? body.status : 'open'
  }

  return data
}

export const getTasks = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.week) {
      const { start, end } = getWeekRange(req.query.week)
      filter.date = { $gte: start, $lte: end }
    }
    const tasks = await Task.find(filter).sort({ date: 1, startTime: 1 })
    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    next(error)
  }
}

export const createTask = async (req, res, next) => {
  try {
    const sanitized = sanitizeTaskInput(req.body, false)
    const task = await Task.create(sanitized)
    res.status(201).json(task)
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message })
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const existing = await Task.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const payload = {
      startTime: req.body.startTime ?? existing.startTime,
      endTime: req.body.endTime ?? existing.endTime,
      ...req.body
    }

    const sanitized = sanitizeTaskInput(payload, true)
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      sanitized,
      { new: true, runValidators: true }
    )
    res.json(task)
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message })
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json({ message: 'Task deleted' })
  } catch (error) {
    next(error)
  }
}

export const searchTasks = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q) {
      return res.json([])
    }
    const tasks = await Task.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).sort({ date: 1, startTime: 1 })
    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

export const getTaskSummary = async (req, res, next) => {
  try {
    const { week } = req.query
    if (!week) {
      return res.status(400).json({ message: 'Week parameter is required' })
    }
    const { start, end } = getWeekRange(week)
    const open = await Task.countDocuments({
      date: { $gte: start, $lte: end },
      status: 'open'
    })
    const completed = await Task.countDocuments({
      date: { $gte: start, $lte: end },
      status: 'completed'
    })
    res.json({
      open,
      completed,
      total: open + completed
    })
  } catch (error) {
    next(error)
  }
}
