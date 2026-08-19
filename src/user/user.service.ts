import { Injectable } from '@nestjs/common';
import { UserLogger } from './user.logger';
import { CreateUserDto } from './dto/create-user.dto';

export interface User {
  id: number;
  name: string;
  email: string;
}
@Injectable()
export class UserService {
  constructor(private readonly logger: UserLogger) {}
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'test@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  findAll(name: string = ''): User[] {
    this.logger.log('Finding all users');
    return this.users.filter((user) =>
      user.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()),
    );
  }

  findOne(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(user: CreateUserDto): User {
    const newUser = {
      ...user,
      id: this.users.length + 1,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updatedUser: Partial<User>): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updatedUser };
      return this.users[userIndex];
    }
    return undefined;
  }
  delete(id: number): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      const deletedUser = this.users.splice(userIndex, 1)[0];
      return deletedUser;
    }
    return undefined;
  }
}
