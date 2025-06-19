import { IsString } from "class-validator";

export class CreateFilesystemDto {
    
    @IsString()
    name: string;

    @IsString()
    path: string;
}
