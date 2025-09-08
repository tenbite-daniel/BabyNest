import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = (user as any).toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const { password, ...result } = (user as any).toObject();
    return this.login(result);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      return { message: 'If email exists, OTP has been sent' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 600000); // 10 minutes

    await this.usersService.updateResetOtp((user as any)._id.toString(), otp, otpExpiry);
    await this.mailService.sendPasswordResetOtp(user.email, otp);

    return { message: 'If email exists, OTP has been sent' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    return { message: 'OTP verified successfully. You can now reset your password.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    if (!user || !user.isOtpVerified) {
      throw new UnauthorizedException('OTP verification required');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.usersService.updatePassword(resetPasswordDto.email, hashedPassword);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }
}