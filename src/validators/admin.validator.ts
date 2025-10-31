import { z } from 'zod';

export const criarAdminSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['master', 'admin', 'user']).default('user'),
});

export const atualizarAdminSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  role: z.enum(['master', 'admin', 'user']).optional(),
  ativo: z.boolean().optional(),
});

export type CriarAdminDTO = z.infer<typeof criarAdminSchema>;
export type AtualizarAdminDTO = z.infer<typeof atualizarAdminSchema>;
