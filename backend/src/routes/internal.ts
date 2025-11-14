

import { Router } from 'express';
import { ZodError } from 'zod';
import { firebaseAuthMiddleware } from '../middleware/auth';
import { churnPredictionSchema, ChurnPredictionRequest } from '../schemas/internal.schema';
import logger from '../config/logger';

export const internalRouter = Router();

// TODO: This endpoint should be protected by internal-only auth, not user-facing auth.
// For now, we use the standard user auth middleware as a placeholder.
internalRouter.post('/predict', firebaseAuthMiddleware, (req, res) => {
    try {
        const data: ChurnPredictionRequest = churnPredictionSchema.parse(req.body);
        
        let riskScore = 0.0;
        
        const reason = data.reason.toLowerCase();
        if (reason.includes('cost') || reason.includes('price') || reason.includes('expensive') || reason.includes('switch')) {
            riskScore += 0.3;
        }

        if (data.pauseLengthDays && data.pauseLengthDays > 30) {
            riskScore += 0.2;
        }

        if (data.failedPaymentsLast90d >= 1) {
            riskScore += 0.2;
        }
        
        if (data.tenureDays < 60) {
            riskScore += 0.1;
        }
        
        riskScore = Math.min(riskScore, 1.0);

        let label: 'low' | 'medium' | 'high';
        if (riskScore > 0.7) {
            label = 'high';
        } else if (riskScore > 0.4) {
            label = 'medium';
        } else {
            label = 'low';
        }

        const result = {
            riskScore: parseFloat(riskScore.toFixed(2)),
            label
        };

        logger.info({ message: 'Churn prediction calculated', input: data, result });
        res.status(200).send(result);
    } catch (error) {
        if (error instanceof ZodError) {
            // FIX: The property on a ZodError is 'issues', not 'errors'.
            logger.warn({ message: 'Invalid churn prediction request', details: error.issues });
            // FIX: The property on a ZodError is 'issues', not 'errors'.
            return res.status(400).send({ error: "Invalid input", details: error.issues });
        }
        logger.error({ message: 'Error during churn prediction', input: req.body, error });
        res.status(500).send({ error: 'Failed to calculate churn prediction.' });
    }
});