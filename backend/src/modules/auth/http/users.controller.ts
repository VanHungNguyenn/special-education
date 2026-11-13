import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.use-case.js';
import { ListUsersUseCase } from '../application/list-users.use-case.js';
import { ResetUserPasswordUseCase } from '../application/reset-user-password.use-case.js';
import { UpdateUserUseCase } from '../application/update-user.use-case.js';
import type { User } from '../domain/user.js';
import { UserResponse } from './auth.dto.js';
import { CurrentUser, Roles } from './decorators.js';
import { CreateUserRequest, ResetPasswordRequest, UpdateUserRequest } from './users.dto.js';

@Roles('MANAGER')
@Controller('users')
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly resetPassword: ResetUserPasswordUseCase,
  ) {}

  @Get()
  async list(): Promise<UserResponse[]> {
    return (await this.listUsers.execute()).map(UserResponse.from);
  }

  @Post()
  async create(@Body() body: CreateUserRequest): Promise<UserResponse> {
    return UserResponse.from(await this.createUser.execute({ ...body, phone: body.phone ?? '' }));
  }

  @Patch(':id')
  async update(@CurrentUser() actor: User, @Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserRequest): Promise<UserResponse> {
    return UserResponse.from(await this.updateUser.execute({ actor, id, changes: body }));
  }

  @Put(':id/password')
  @HttpCode(204)
  async reset(@Param('id', ParseUUIDPipe) id: string, @Body() body: ResetPasswordRequest): Promise<void> {
    await this.resetPassword.execute({ id, password: body.password });
  }
}
