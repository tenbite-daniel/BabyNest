import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

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

  async updateOnboarding(userId: string, onboardingData: {
    fullName: string;
    weeksPregnant: number;
    symptoms: Record<string, number>;
    onboardingCompleted: boolean;
  }): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      onboardingData,
      { new: true }
    ).exec();
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('Cannot change password for OAuth users');
    }
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { password: hashedNewPassword }).exec();

    return { message: 'Password changed successfully' };
  }

  async getAllUsersExcept(excludeUserId: string): Promise<User[]> {
    return this.userModel
      .find({ _id: { $ne: excludeUserId } })
      .select('_id fullName username email')
      .exec();
  }

  async findOrCreateGoogleUser(googleUser: { email: string; name: string; googleId: string }): Promise<UserDocument> {
    let user = await this.userModel.findOne({ email: googleUser.email }).exec();
    
    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        await user.save();
      }
      return user;
    }

    const baseUsername = googleUser.email.split('@')[0];
    const timestamp = Date.now();
    user = new this.userModel({
      email: googleUser.email,
      fullName: googleUser.name,
      googleId: googleUser.googleId,
      username: `${baseUsername}_${timestamp}`,
    });
    
    return user.save();
  }

  async createGoogleUser(googleData: { email: string; fullName: string; googleId: string }): Promise<UserDocument> {
    const baseUsername = googleData.email.split('@')[0];
    const timestamp = Date.now();
    const userData: any = {
      email: googleData.email,
      fullName: googleData.fullName,
      googleId: googleData.googleId,
      username: `${baseUsername}_${timestamp}`,
      onboardingCompleted: false,
    };
    
    // Explicitly exclude phoneNumber to avoid duplicate key error
    delete userData.phoneNumber;
    
    const user = new this.userModel(userData);
    return user.save();
  }

  async updateGoogleId(userId: string, googleId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { googleId }).exec();
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, updates, { new: true }).exec();
  }
}