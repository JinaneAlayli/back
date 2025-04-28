import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    MinLength,
    IsString,
    IsIn,
    ValidateNested,
  } from 'class-validator'
  import { Type } from 'class-transformer'
  
  export class RegisterOwnerDto {
    @IsNotEmpty()
    @IsString()
    name: string
  
    @IsNotEmpty()
    @IsEmail()
    email: string
  
    @IsNotEmpty()
    @MinLength(6)
    password: string
  
    @IsOptional()
    phone?: string
  
    @IsOptional()
    country?: string
  }
  
  export class RegisterCompanyDto {
    @IsNotEmpty()
    @IsString()
    company_name: string
  
    @IsNotEmpty()
    employee_nb: number
  
    @IsNotEmpty()
    subscription_plan_id: number
  
    @IsIn(['monthly', 'yearly'])
    billing_cycle: string
  
    @ValidateNested()
    @Type(() => RegisterOwnerDto)
    owner: RegisterOwnerDto
  }
  