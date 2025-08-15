import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, UseGuards } from '@nestjs/common';
import { VendedorService } from './vendedor.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('vendedores')
export class VendedorController {
  constructor(private service: VendedorService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
