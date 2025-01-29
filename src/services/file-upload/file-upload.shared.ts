// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { ClientApplication } from '../../client';
import type { FileUploadService } from './file-upload.class';
import { FileUpload, FileUploadPatch, FileUploadQuery, FileUploadSchema } from './file-upload.schema';

export type { FileUpload, FileUploadSchema, FileUploadPatch, FileUploadQuery }

export type FileUploadClientService = Pick<
  FileUploadService<FileUploadQuery>,
  (typeof fileUploadMethods)[number]
>


export const fileUploadPath = 'file-upload'

export const fileUploadMethods: Array<keyof FileUploadService> = ['create', 'update', 'remove']

export const fileUploadClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(fileUploadPath, connection.service(fileUploadPath), {
    methods: fileUploadMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [fileUploadPath]: FileUploadClientService
  }
}
