import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de Azure Blob Storage
 * Maneja la carga y gestión de archivos en Azure Blob Storage
 */
@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private blobServiceClient: BlobServiceClient;
  private containerName = 'uploads';

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    
    if (connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.ensureContainer();
    } else {
      this.logger.warn('Azure Storage connection string not configured');
    }
  }

  /**
   * Asegura que el contenedor exista
   */
  private async ensureContainer(): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      await containerClient.createIfNotExists({ access: 'blob' });
    } catch (error) {
      this.logger.error(`Error ensuring container: ${error.message}`);
    }
  }

  /**
   * Sube un archivo a Blob Storage
   */
  async uploadFile(fileName: string, buffer: Buffer, contentType?: string): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });

      return blockBlobClient.url;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Blob Storage
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene URL de un archivo
   */
  getFileUrl(fileName: string): string {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    return blockBlobClient.url;
  }
}
