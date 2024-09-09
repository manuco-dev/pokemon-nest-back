import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return {pokemon};
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException('Pokemon Existe en la Base de Datos')
      }
      console.log(error);
      throw new InternalServerErrorException('Cant create Pokekon, Check Server Logs')

    }
  }

  findAll() {
    return this.pokemonModel.find()
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;

    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // MongoID
    if ( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    // Name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }


    if ( !pokemon ) 
      throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found`);
    

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term )
    if(updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()

     pokemon.updateOne(updatePokemonDto)
     

      

    return {...pokemon.toJSON(), ...updatePokemonDto} ;
  }

  async remove(id: string) {
    
    const pokemon = await this.findOne(id);
    await pokemon.deleteOne()

    return `El pokemon con Referencia ${id},Nombre: ${pokemon.name} ha sido eliminado correctamente`;
  }
}
