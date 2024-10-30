import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @HttpCode(HttpStatus.OK)
  @Get('/birthday')
  birthday() {
    return this.userService.getBirthdayUsers();
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  register(@Body() payload: UserDto) {
    return this.userService.create(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Put()
  update(@Body() payload: UserDto) {
    return this.userService.update(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:email')
  delete(@Param('email') email: string) {
    return this.userService.delete(email);
  }
}
