import { Exercise } from '../../domain/models/exercise.model';
import { ExerciseDto } from '../dto/exercise.dto';

export function mapExerciseDtoToDomain(dto: ExerciseDto, index: number): Exercise {
  return {
    id: `exercise-${index + 1}`,
    name: dto.exercise_name,
    repetitionsNumber: dto.repetitions_number,
    repetitionTime: dto.repetition_time,
    restTime: dto.rest_time,
  };
}

export function mapExerciseDtoListToDomain(dtos: ExerciseDto[]): Exercise[] {
  return dtos.map(mapExerciseDtoToDomain);
}
