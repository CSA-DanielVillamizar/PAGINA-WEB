import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de Azure Blob Storage
 * Maneja la carga y gestión de archivos en Azure Blob Storage
 */
@Injectable()
export class BlobService implements OnModuleInit {
  private readonly logger = new Logger(BlobService.name);
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName = 'uploads';
  private enabled = false;

  /**
   * Constructor: prepara parámetros pero difiere creación de contenedor a onModuleInit.
   * Admite dos modos de configuración:
   * 1. AZURE_STORAGE_CONNECTION_STRING
   * 2. AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_KEY (se construye la connection string)
   * Si FEATURE_BLOB_REQUIRED=true y no hay credenciales válidas => lanza error.
   */
  constructor(private configService: ConfigService) {
    const featureRequired = this.configService.get<string>('FEATURE_BLOB_REQUIRED') === 'true';
    const conn = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    const account = this.configService.get<string>('AZURE_STORAGE_ACCOUNT');
    const key = this.configService.get<string>('AZURE_STORAGE_KEY');

    let connectionString: string | undefined = conn?.trim();
    if (!connectionString && account && key) {
      connectionString = `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${key};EndpointSuffix=core.windows.net`;
    }

    if (!connectionString) {
      const msg = 'BlobService deshabilitado: faltan credenciales (connection string o account/key).';
      if (featureRequired) {
        this.logger.error(msg);
        throw new Error('FEATURE_BLOB_REQUIRED habilitado y no hay credenciales válidas para Azure Storage');
      }
      this.logger.warn(msg);
      return;
    }

    // Validación básica
    const looksValid = /AccountName=.+;AccountKey=.+/i.test(connectionString) || /BlobEndpoint=/i.test(connectionString);
    if (!looksValid) {
      const msg = 'BlobService: cadena de conexión parece inválida (no contiene AccountName/AccountKey ni BlobEndpoint).';
      if (featureRequired) {
        this.logger.error(msg);
        throw new Error('Cadena de conexión Azure Storage inválida y feature requerido.');
      }
      this.logger.warn(msg);
      return;
    }

    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.enabled = true;
      this.logger.log('BlobService inicializado (cliente listo).');
    } catch (err: any) {
      const msg = `BlobService: error creando BlobServiceClient -> ${err.message}`;
      if (featureRequired) {
        this.logger.error(msg);
        throw new Error('Error crítico inicializando BlobService y requerido por FEATURE_BLOB_REQUIRED');
      }
      this.logger.error(msg);
      this.logger.warn('Operará en modo deshabilitado.');
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled || !this.blobServiceClient) return;
    await this.ensureContainer();
  }

  /**
   * Asegura que el contenedor exista
   */
  private async ensureContainer(): Promise<void> {
    try {
      const containerClient = this.blobServiceClient!.getContainerClient(this.containerName);
      // No solicitar acceso público: el Storage tiene allowBlobPublicAccess=false.
      // Crear el contenedor sólo si no existe, sin cambiar ACLs.
      await containerClient.createIfNotExists();
      this.logger.log(`Contenedor '${this.containerName}' verificado/creado.`);
    } catch (error: any) {
      this.logger.error(`BlobService: error asegurando contenedor -> ${error.message}`);
    }
  }

  /**
   * Indica si el servicio está habilitado y listo.
   */
  isEnabled(): boolean {
    return this.enabled && !!this.blobServiceClient;
  }

  /**
   * Sube un archivo a Blob Storage
   */
  async uploadFile(fileName: string, buffer: Buffer, contentType?: string): Promise<string> {
    if (!this.isEnabled()) {
      this.logger.error('BlobService no habilitado - upload abortado');
      throw new Error('Azure Blob Storage no disponible');
    }

    try {
      const containerClient = this.blobServiceClient!.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
      return blockBlobClient.url;
    } catch (error: any) {
      this.logger.error(`BlobService: error subiendo archivo '${fileName}' -> ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Blob Storage
   */
  async deleteFile(fileName: string): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.warn(`BlobService no habilitado - delete '${fileName}' omitido`);
      return;
    }
    try {
      const containerClient = this.blobServiceClient!.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.deleteIfExists();
    } catch (error: any) {
      this.logger.error(`BlobService: error eliminando '${fileName}' -> ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene URL de un archivo
   */
  getFileUrl(fileName: string): string {
    if (!this.isEnabled()) {
      this.logger.error('BlobService no habilitado - no se puede generar URL');
      throw new Error('Azure Blob Storage no disponible');
    }
    const containerClient = this.blobServiceClient!.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    return blockBlobClient.url;
  }
}
