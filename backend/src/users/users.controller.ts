import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserDto } from './user.dto';
import { Role } from './role.enum';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin)
  findOne(@Param('id') id: number): Promise<UserDto> {
    return this.usersService.findOneById(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  update(
    @Param('id') id: number,
    @Body() user: Partial<UserDto>,
  ): Promise<UserDto> {
    return this.usersService.update(id, user);
  }

  @Post()
  async register(@Body() userDto: Record<string, any>) {
    return this.usersService.create(userDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(Role.Admin)
  delete(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
