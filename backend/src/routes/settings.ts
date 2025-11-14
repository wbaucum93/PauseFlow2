

import { Router } from 'express';
import { db } from '../config/firebase';
import { firebaseAuthMiddleware } from '../middleware/auth';
import { ZodError } from 'zod';
import { updateSettingsSchema, UpdateSettingsDto } from '../schemas/settings.schema';
import logger from '../config/logger';

export const settingsRouter = Router();

const getSettingsRef = (uid: string) => db.collection('users').doc(uid).collection('settings').doc('config');

// Get user settings
settingsRouter.get('/', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;
    
    try {
        const docRef = getSettingsRef(uid);
        const doc = await docRef.get();

        if (!doc.exists) {
            // Return default settings if none exist
            logger.info({ message: `No settings found for user ${uid}, returning defaults.` });
            return res.status(200).send({
                pauseReasons: [
                    'On vacation',
                    'Too expensive',
                    'Not using the service enough',
                    'Temporary project pause',
                ],
                // Other default settings...
            });
        }

        res.status(200).send(doc.data());
    } catch (error) {
        logger.error({ message: `Error fetching settings for user ${uid}`, error });
        res.status(500).send({ error: "Failed to fetch settings." });
    }
});


// Update user settings
settingsRouter.put('/', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;

    try {
        // 1. Validate input using Zod schema
        const validatedSettings: UpdateSettingsDto = updateSettingsSchema.parse(req.body);
        
        // 2. Perform business logic with validated data
        const docRef = getSettingsRef(uid);
        await docRef.set(validatedSettings, { merge: true });

        logger.info({ message: `Settings updated successfully for user ${uid}`, settings: validatedSettings });
        res.status(200).send({ success: true, message: "Settings updated successfully." });
    } catch (error) {
        if (error instanceof ZodError) {
            // FIX: The property on a ZodError is 'issues', not 'errors'.
            logger.warn({ message: `Invalid settings update request for user ${uid}`, details: error.issues });
            // FIX: The property on a ZodError is 'issues', not 'errors'.
            return res.status(400).send({ error: "Invalid input", details: error.issues });
        }
        logger.error({ message: `Error updating settings for user ${uid}`, error });
        res.status(500).send({ error: "Failed to update settings." });
    }
});