import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma.module';

import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BOARD_REPOSITORY } from './repositories/board-repository.interface';
import { PrismaBoardRepository } from './repositories/prisma-board.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BoardController],
  providers: [
    BoardService,
    { provide: BOARD_REPOSITORY, useClass: PrismaBoardRepository },
  ],
  exports: [BoardService],
})
export class BoardModule {}
