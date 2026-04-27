import { Controller, Post, UseGuards, Request, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './guards/public.decorator';
import { signInSchema } from './dto/signin.dto';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @UsePipes(new JoiValidationPipe(signInSchema))
  @Post('signin')
  async signIn(@Request() req: { user: any }) {
    return this.authService.signIn(req.user);
  }
}
