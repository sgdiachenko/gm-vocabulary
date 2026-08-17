import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { DeleteWordsDto } from './dto/delete-words.dto';
import { CopyWordsDto } from './dto/copy-words.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';

@Controller('words')
@UseGuards(JwtAuthGuard)
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  create(
    @Body() createWordDto: CreateWordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordsService.create(createWordDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.wordsService.findAll(user.id);
  }

  @Post('copy')
  copy(
    @Body() copyWordsDto: CopyWordsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordsService.copy(copyWordsDto.ids, user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateWordDto: UpdateWordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordsService.update(id, updateWordDto, user.id);
  }

  @Delete()
  remove(
    @Body() deleteWordsDto: DeleteWordsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.wordsService.remove(deleteWordsDto.ids, user.id);
  }
}
