import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Prompt } from "../entities/prompt.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PromptsRepository {
    constructor(@InjectRepository(Prompt) private promptRepository: Repository<Prompt>){}

    
    
}