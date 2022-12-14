import { IsJWT, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class NewPasswordDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	@MaxLength(20)
	newPassword: string;
	@IsJWT()
	recoveryCode: string;
}
