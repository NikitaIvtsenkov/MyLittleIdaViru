// import express from 'express';
// import { getEvents, parseFootballMatches } from '../controllers/eventController.js';

// const router = express.Router();
import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent, parseFootballMatches, getEventById } from '../controllers/eventController.js';
import { checkAuth } from '../validations/checkAuth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'public/assets/uploads/' });
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve a list of events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: place_id
 *         required: false
 *         description: The ID of the place to fetch events for (optional)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: offset
 *         description: The number of events to skip (for pagination)
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: limit
 *         description: The maximum number of events to return
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: A list of events with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 hasMore:
 *                   type: boolean
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
 
router.get('/', getEvents);



router.post('/', checkAuth, upload.single('photoFile'), createEvent);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               url:
 *                 type: string
 *               placeId:
 *                 type: integer
 *               cityId:
 *                 type: integer
 *               photoFile:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', checkAuth, upload.single('photoFile'), updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', checkAuth, deleteEvent);

router.get('/parse-football-matches', parseFootballMatches);
router.get('/:id', getEventById);

export default router;