import { Controller, Get, Post, Body, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service';
import { CreateHackathonDto } from './dto/haketon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';
import { RoleGuard } from '../../common/guards/roles/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('haketons')
export class HaketonController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllHaketons() {
    const haketons = await this.prisma.hackathon.findMany({
      include: {
        author: { select: { id: true, name: true, email: true } },
        participants: true,
      },
    });
    return { haketons };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'PARTICIPANT')
  async createHaketon(@Body() dto: CreateHackathonDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });

    if (!user) {
      throw new NotFoundException('Author user not found');
    }

    const haketon = await this.prisma.hackathon.create({
      data: {
        name: dto.name,
        description: dto.description,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        authorId: dto.authorId,
      },
    });

    return {
      message: 'Haketon created successfully',
      haketon,
    };
  }

  @Get(':id')
  async getHaketonById(@Param('id') id: string) {
    const haketon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (!haketon) {
      throw new NotFoundException('Haketon not found');
    }

    return { haketon };
  }
}
