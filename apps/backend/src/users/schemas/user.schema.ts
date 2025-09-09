import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ unique: true, sparse: true })
  username?: string;

  @Prop({ unique: true, sparse: true })
  phoneNumber?: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

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

  @Prop({ type: Object, default: {} })
  symptoms?: Record<string, number>;

  @Prop({ default: false })
  onboardingCompleted?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
