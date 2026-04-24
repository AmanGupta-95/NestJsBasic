import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './guards/public.decorator';
import { SignInDto } from './dto/signin.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Request() req: any, @Body() _signInDto: SignInDto) {
    return this.authService.signIn(req.user);
  }
}
