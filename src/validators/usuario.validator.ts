import { z } from 'zod';

export const criarUsuarioSchema = z.object({
  chat_id: z.number().int().positive('chat_id deve ser um número positivo'),
  agent_id: z.number().int().positive('agent_id deve ser um número positivo'),
  nome: z.string().max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional().default('active'),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string().max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

export type CriarUsuarioDTO = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioDTO = z.infer<typeof atualizarUsuarioSchema>;
