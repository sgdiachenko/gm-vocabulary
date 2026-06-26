import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WordCollectionsService } from './word-collections.service';
import { CreateWordCollectionDto } from './dto/create-word-collection.dto';
import { UpdateWordCollectionDto } from './dto/update-word-collection.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class WordCollectionsController {
  constructor(
    private readonly wordCollectionsService: WordCollectionsService,
  ) {}

  @Post()
  create(
    @Body() createWordCollectionDto: CreateWordCollectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordCollectionsService.create(createWordCollectionDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.wordCollectionsService.findAll(user.id);
  }

  @Get('shared')
  findShared(@CurrentUser() user: AuthenticatedUser) {
    return this.wordCollectionsService.findShared(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordCollectionsService.findOne(id, user.id);
  }

  @Post('bulk')
  createBulk(
    @Body(new ParseArrayPipe({ items: CreateWordCollectionDto }))
    groups: CreateWordCollectionDto[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordCollectionsService.createBulk(groups, user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateWordCollectionDto: UpdateWordCollectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordCollectionsService.update(
      id,
      updateWordCollectionDto,
      user.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordCollectionsService.remove(id, user.id);
  }
}
