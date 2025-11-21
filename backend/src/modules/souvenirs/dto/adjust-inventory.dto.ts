import { IsInt, IsString, IsOptional, IsIn } from 'class-validator'

/**
 * DTO para ajuste de inventario.
 */
export class AdjustInventoryDto {
  @IsInt()
  quantity: number

  @IsString()
  @IsIn(['sale', 'restock', 'adjustment', 'return'])
  type: 'sale' | 'restock' | 'adjustment' | 'return'

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  userId?: string
}
