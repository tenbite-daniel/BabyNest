import { IsString, IsOptional } from 'class-validator';

export class CreateJournalDto {
  @IsString()
  date: string;

  @IsString()
  trimester: string;

  @IsString()
  todos: string;

  @IsOptional()
  @IsString()
  completedTodos?: string;

  @IsString()
  notes: string;
}

export class UpdateJournalDto {
  @IsString()
  date: string;

  @IsString()
  trimester: string;

  @IsString()
  todos: string;

  @IsOptional()
  @IsString()
  completedTodos?: string;

  @IsString()
  notes: string;
}