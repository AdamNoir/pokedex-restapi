import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ){
    this.defaultLimit = this.configService.get<number>("defaultLimit")!;
  }

  async create(createPokemonDto: CreatePokemonDto) {
    //createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch(error: any){
      if(error.code === 11000){
        throw new BadRequestException(`Pokemon already exists with ${JSON.stringify(error.keyValue)}`);
      }
      console.log(error);
      throw new InternalServerErrorException("Cant not update pokemon. Check Logs.")
    }
    
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = this.defaultLimit, offset = 0} = paginationDto;
    const pokemons = await this.pokemonModel.find().limit(limit).skip(offset).sort({no: 1}).select('-__v');
    return pokemons;
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: +term});
    }

    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term})
    }

    if(!pokemon) throw new NotFoundException(`Pokemon with ${term} not found.`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    try{
      
      //await pokemon.updateOne(updatePokemonDto, {new: true});
      await pokemon.updateOne(updatePokemonDto);
    } catch(error){
      this.handleExceptions(error);
    }
    return {...pokemon.toJSON(), ...updatePokemonDto};
  }

  async remove(id: string) {
    /*const pokemon = await this.findOne(term);
    await pokemon.deleteOne();
    return {"message": "Pokemon was deleted"};*/
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with the id ${id} not found`);
    }
    return;
  }


  private handleExceptions(error: any){
    if(error.code === 11000){
        throw new BadRequestException(`Pokemon exists ${JSON.stringify(error.keyValue)}`);
      }
      console.log(error);
      throw new InternalServerErrorException("Cant not create pokemon. Check Logs.")
  }
}
