import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from 'modules/users/dto/create-user.dto';
import { UpdateUserDTO } from 'modules/users/dto/update-user.dto';
import { LoginUserDTO } from 'modules/users/dto/login-user.dto';

@Controller('users')
export class UsersController {
    constructor (private readonly usersService:UsersService){}

    @Post('register')
    registerUser(@Body() dataUser:CreateUserDTO){
        return this.usersService.registerUser(dataUser);
    }

    @Put('update/:id')
    updateUser(@Param('id', ParseIntPipe) id:number, @Body() dataUser:UpdateUserDTO){
        return this.usersService.updateUser(id, dataUser);
    }

    @Put('inactive/:id')
    inactiveUser(@Param('id', ParseIntPipe) id:number){
        return this.usersService.inactiveUser(id);
    }

    @Post('login')
    loginUser(@Body() dataUser:LoginUserDTO){
        return this.usersService.loginUser(dataUser)
    }
    
    @Get('profile')
    getProfile(@Request() req){
        return req.user;
    }
}
