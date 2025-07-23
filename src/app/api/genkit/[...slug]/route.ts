'use server';

import {genkitNextHandler} from '@genkit-ai/next';
import '@/ai/flows/cash-advance-flow';

export const POST = genkitNextHandler();
