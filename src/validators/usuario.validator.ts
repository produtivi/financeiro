import { z } from 'zod';

export const criarUsuarioSchema = z.object({
  chat_id: z.number().int().positive('chat_id deve ser um número positivo'),
  agent_id: z.number().int().positive('agent_id deve ser um número positivo'),
  nome: z.string().max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  grupo_id: z.number().int().positive('grupo_id deve ser um número positivo').optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional().default('active'),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string().max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').nullable().optional(),
  grupo_id: z.number().int().positive('grupo_id deve ser um número positivo').nullable().optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
});

export const importarUsuarioLinhaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  telefone: z.string().min(1, 'Telefone é obrigatório').max(20, 'Telefone deve ter no máximo 20 caracteres'),
  grupo_id: z.number().int().positive('grupo_id deve ser 1, 2 ou 3'),
  agent_id: z.number().int().positive('agent_id deve ser um número positivo'),
});

export type CriarUsuarioDTO = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioDTO = z.infer<typeof atualizarUsuarioSchema>;
export type ImportarUsuarioLinhaDTO = z.infer<typeof importarUsuarioLinhaSchema>;
