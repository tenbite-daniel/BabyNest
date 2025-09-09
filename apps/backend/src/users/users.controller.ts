import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getCurrentUser(@CurrentUser() user) {
    return user;
  }

  @Post('onboarding')
  async updateOnboarding(
    @CurrentUser() user,
    @Body() onboardingData: {
      fullName: string;
      weeksPregnant: number;
      symptoms: Record<string, number>;
      onboardingCompleted: boolean;
    }
  ) {
    return this.usersService.updateOnboarding(user._id, onboardingData);
  }
}