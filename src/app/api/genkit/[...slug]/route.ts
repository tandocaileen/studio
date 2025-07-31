'use server';

import { createApiHandler } from '@genkit-ai/next';
import '@/ai/flows/cash-advance-flow';

export const POST = createApiHandler();
