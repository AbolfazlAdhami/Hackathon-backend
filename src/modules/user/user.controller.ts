import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/roles/roles.guard';

@Controller('users')
export class UserController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Get()
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return { users };
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { hackathons: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return { user: result };
  }
}
