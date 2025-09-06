import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  resetOtp?: string;

  @Prop()
  resetOtpExpiry?: Date;

  @Prop({ default: false })
  isOtpVerified?: boolean;

  @Prop()
  fullName?: string;

  @Prop()
  weeksPregnant?: number;

  @Prop({ type: [String], default: [] })
  symptoms?: string[];

  @Prop({ default: false })
  onboardingCompleted?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
