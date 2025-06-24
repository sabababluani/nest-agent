import { IsEnum, IsString } from "class-validator";
import { Action } from "../enums/action.enum";

export class CreateFilesystemDto {
    @IsString()
    name: string;

    @IsString()
    path: string;

    @IsEnum(Action)
    action: Action;
}
