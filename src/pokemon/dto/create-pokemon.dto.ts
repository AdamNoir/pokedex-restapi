import { IsNumber, IsPositive, IsString, MinLength, Min } from "class-validator";

export class CreatePokemonDto {
    @IsNumber()
    @IsPositive()
    @Min(1)
    readonly no!: number;
    @IsString()
    @MinLength(1)
    name!: string;
}
