import { Inject, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { joiValidationSchema } from './config/joi.validation';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true, load: [EnvConfig], 
    validationSchema: joiValidationSchema}), 
  ServeStaticModule.forRoot({
    rootPath: join(__dirname,"..","public"),exclude: ['/api*'],
  }), 
  //MongooseModule.forRoot('mongodb://localhost:27017/nest-database'),
  MongooseModule.forRootAsync({
      //imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb'),
      }),
    }),
  PokemonModule, 
  CommonModule, 
  SeedModule],
})
export class AppModule {}
