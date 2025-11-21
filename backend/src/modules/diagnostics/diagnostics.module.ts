import { Module } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { BlobService } from '../../services/blob.service';
import { MailerService } from '../../services/mailer.service';

/**
 * Módulo de diagnóstico: expone endpoints para validar configuraciones externas.
 */
@Module({
  controllers: [DiagnosticsController],
  providers: [BlobService, MailerService],
  exports: [],
})
export class DiagnosticsModule {}
