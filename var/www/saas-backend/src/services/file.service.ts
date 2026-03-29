import path from "node:path";

export type UploadedFile = { fieldname: string; originalname: string; mimetype: string; size: number; buffer: Buffer; };

type CreateFileParams = {
  uploadedFile?: UploadedFile;
  file?: UploadedFile;
  businessType?: string;
  businessId?: bigint;
  remark?: string;
  usage?: string;
  operatorId?: bigint;
  roleCode?: string;
};

type FileListParams = {
  page?: number;
  pageSize?: number;
  businessType?: string;
  businessId?: bigint;
};

const demoFile = { id: 1n, filename: "demo-file.txt", storage_key: "uploads/showcase/demo-file.txt", url: "/uploads/showcase/demo-file.txt", mime_type: "text/plain", size: 128, storage_disk: "local", business_type: "showcase", business_id: null, uploaded_by: 1n, remark: "demo-only showcase file", created_at: new Date(), updated_at: new Date(), uploader_name: "公开演示用户" };

export const fileService = {
  async createFile(params: CreateFileParams = {}, ..._args: any[]) {
    const file = params.uploadedFile ?? params.file;
    return { ...demoFile, filename: file?.originalname || demoFile.filename, mime_type: file?.mimetype || demoFile.mime_type, size: file?.size || demoFile.size, business_type: params.businessType ?? demoFile.business_type, business_id: params.businessId ?? demoFile.business_id, remark: params.remark ?? demoFile.remark, notice: "demo-only showcase response" };
  },
  async list(params: FileListParams = {}, ..._args: any[]) { return { list: [demoFile], total: 1, page: params.page ?? 1, pageSize: params.pageSize ?? 10, notice: "demo-only showcase response" }; },
  async detail(..._args: any[]) { return demoFile; },
  async getDownloadFile(..._args: any[]) { return { absolutePath: path.resolve(process.cwd(), "package.json"), filename: demoFile.filename, storageKey: demoFile.storage_key, mimeType: demoFile.mime_type, notice: "demo-only showcase response" }; },
  async remove(..._args: any[]) { return { success: true, notice: "demo-only showcase response" }; },
};
