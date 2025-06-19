import { IsEnum, IsString } from "class-validator";
import { Action } from "../entities/filesystem.entity";

export class CreateFilesystemDto {
    
    @IsString()
    name: string;

    @IsString()
    path: string;

    @IsEnum(Action)
    action: Action;
}
