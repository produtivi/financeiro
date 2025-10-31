import { z } from 'zod';

export const criarAdminAgenteSchema = z.object({
  admin_id: z.number().int().positive('admin_id deve ser um número positivo'),
  agent_id: z.number().int().positive('agent_id deve ser um número positivo'),
});

export type CriarAdminAgenteDTO = z.infer<typeof criarAdminAgenteSchema>;
