import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateResetOtp(userId: string, resetOtp: string, resetOtpExpiry: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      resetOtp,
      resetOtpExpiry,
      isOtpVerified: false,
    }).exec();
  }

  async verifyOtp(email: string, otp: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({
      email,
      resetOtp: otp,
      resetOtpExpiry: { $gt: new Date() },
    }).exec();
    
    if (user) {
      await this.userModel.findByIdAndUpdate(user._id, {
        isOtpVerified: true,
      }).exec();
    }
    
    return user;
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email, isOtpVerified: true },
      {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
        isOtpVerified: false,
      }
    ).exec();
  }
}