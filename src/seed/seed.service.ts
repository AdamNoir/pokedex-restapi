import { Injectable } from '@nestjs/common';

import { PokemonResponse } from './interfaces/pokemon-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async executeSeed() {
    const {data} = await this.axios.get<PokemonResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    const pokemonToInsert: {name: string, no: number}[]  = [];
    
    data.results.forEach(({name, url}) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      //console.log({name, no})
      
      //await this.pokemonModel.create({name, no});
      pokemonToInsert.push({name, no});
      
    });
    await this.pokemonModel.insertMany(pokemonToInsert);
    

    return 'SEED executed';
  }


}
