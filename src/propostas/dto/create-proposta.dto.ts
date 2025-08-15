import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePropostaDto {
  @IsString()
  @Length(2, 120)
  nome: string;

  @IsEmail()
  @Length(5, 160)
  email: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  whatsapp?: string;

  @IsIn(['email', 'whatsapp', 'telefone'])
  formaContato: 'email' | 'whatsapp' | 'telefone';

  @IsString()
  @Length(5, 5000)
  proposta: string;
}
