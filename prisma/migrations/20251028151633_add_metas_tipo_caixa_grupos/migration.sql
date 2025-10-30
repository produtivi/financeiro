-- AlterTable
ALTER TABLE `transacoes` ADD COLUMN `arquivo_url` VARCHAR(500) NULL,
    ADD COLUMN `tipo_caixa` ENUM('pessoal', 'negocio') NOT NULL DEFAULT 'pessoal',
    ADD COLUMN `tipo_entrada` ENUM('texto', 'audio', 'foto', 'video', 'nota_fiscal') NOT NULL DEFAULT 'texto';

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `grupo_experimental` ENUM('controle', 'padrao', 'acolhedor') NOT NULL DEFAULT 'controle';

-- CreateTable
CREATE TABLE `metas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo_meta` ENUM('reserva_financeira', 'controle_inventario', 'meta_vendas', 'pagamento_contas', 'outro') NOT NULL,
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE NOT NULL,
    `cumprida` BOOLEAN NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondido_em` DATETIME(3) NULL,

    INDEX `metas_usuario_id_data_inicio_idx`(`usuario_id`, `data_inicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `transacoes_tipo_caixa_idx` ON `transacoes`(`tipo_caixa`);

-- AddForeignKey
ALTER TABLE `metas` ADD CONSTRAINT `metas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
