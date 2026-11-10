import { Injectable } from '@angular/core';
import { Exercise } from '../../domain/models/exercise.model';
import { WorkoutRepository } from '../../domain/ports/workout.repository';
import { ExerciseDto } from '../dto/exercise.dto';
import { mapExerciseDtoListToDomain } from '../mappers/exercise.mapper';

@Injectable()
export class MockWorkoutRepository extends WorkoutRepository {
  override getExercises(): Promise<Exercise[]> {
    const dtoList: ExerciseDto[] = [
      {
        exercise_name: 'Squats',
        repetitions_number: 3,
        repetition_time: 5,
        rest_time: 3,
      },
      {
        exercise_name: 'Push-ups',
        repetitions_number: 2,
        repetition_time: 4,
        rest_time: 2,
      },
      {
        exercise_name: 'Plank',
        repetitions_number: 2,
        repetition_time: 5,
        rest_time: 3,
      },
    ];

    return Promise.resolve(mapExerciseDtoListToDomain(dtoList));
  }
}
