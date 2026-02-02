import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UpdateFileDocument = UpdateFile & Document;

@Schema({ collection: 'update_packages' })
export class UpdateFile {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  uploadDate: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, unknown>;
}

export const UpdateFileSchema = SchemaFactory.createForClass(UpdateFile);

