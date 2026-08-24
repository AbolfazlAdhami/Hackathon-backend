import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateHackathonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @IsDateString()
  @IsNotEmpty()
  endsAt: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;
}
