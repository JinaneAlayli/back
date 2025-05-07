import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js"
import type { MultipartFile } from "@fastify/multipart"

@Injectable()
export class UploadService {
  private supabase
  private bucket = "profile-pictures"
  private readonly logger = new Logger(UploadService.name)

  constructor(private readonly config: ConfigService) {
    const supabaseUrl = this.config.get<string>("SUPABASE_URL")
    const supabaseKey = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error("Missing Supabase credentials")
      throw new Error("Supabase configuration is missing")
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.logger.log("Supabase client initialized")
  }

  async uploadProfileImage(file: MultipartFile, userId: number): Promise<string> {
    try {
      this.logger.log(`Starting upload for user ${userId}, file: ${file.filename}`)
 
      if (!file.mimetype.startsWith("image/")) {
        throw new InternalServerErrorException("Only image files are allowed")
      }

      const buffer = await file.toBuffer()
      const fileExt = file.filename.split(".").pop()
      const timestamp = Date.now()
      const filePath = `users/${userId}/profile-${timestamp}.${fileExt}`

      this.logger.log(`Uploading to path: ${filePath}`)

      const { data, error } = await this.supabase.storage.from(this.bucket).upload(filePath, buffer, {
        contentType: file.mimetype,
        upsert: true,
      })

      if (error) {
        this.logger.error(`Upload failed: ${error.message}`, error.stack)
        throw new InternalServerErrorException(`Failed to upload image: ${error.message}`)
      }

      this.logger.log(`Upload successful, getting public URL`)
      const { data: urlData } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath)

      this.logger.log(`Public URL generated: ${urlData.publicUrl}`)
      return urlData.publicUrl
    } catch (error) {
      this.logger.error(`Upload error: ${error.message}`, error.stack)
      throw new InternalServerErrorException(`Failed to process image upload: ${error.message}`)
    }
  }

  async deleteProfileImage(filePath: string): Promise<void> {
    try {
      this.logger.log(`Deleting file: ${filePath}`)
 
      const pathParts = filePath.split(`${this.bucket}/`)
      const path = pathParts.length > 1 ? pathParts[1] : filePath

      const { error } = await this.supabase.storage.from(this.bucket).remove([path])

      if (error) {
        this.logger.error(`Delete failed: ${error.message}`)
        throw new InternalServerErrorException(`Failed to delete image: ${error.message}`)
      }

      this.logger.log("File deleted successfully")
    } catch (error) {
      this.logger.error(`Delete error: ${error.message}`, error.stack)
      throw new InternalServerErrorException(`Failed to delete image: ${error.message}`)
    }
  }
}
