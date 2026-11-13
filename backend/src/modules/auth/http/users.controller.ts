import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.use-case.js';
import { ListUsersUseCase } from '../application/list-users.use-case.js';
import { UserResponse } from './auth.dto.js';
import { Roles } from './decorators.js';
import { CreateUserRequest } from './users.dto.js';

@Roles('MANAGER')
@Controller('users')
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly createUser: CreateUserUseCase,
  ) {}

  @Get()
  async list(): Promise<UserResponse[]> {
    return (await this.listUsers.execute()).map(UserResponse.from);
  }

  @Post()
  async create(@Body() body: CreateUserRequest): Promise<UserResponse> {
    return UserResponse.from(await this.createUser.execute({ ...body, phone: body.phone ?? '' }));
  }
}
