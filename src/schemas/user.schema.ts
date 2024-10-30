import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ type: String })
  first_name: string;

  @Prop({ type: String })
  last_name: string;

  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: Date })
  birth_date: Date;

  @Prop({ type: String })
  location: string;

  @Prop({ type: String })
  timezone: string;

  @Prop({ type: Number })
  year_celebrated: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ birth_date: 1 });
UserSchema.index({ year_celebrated: 1 });
