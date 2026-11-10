import { mapExerciseDtoListToDomain, mapExerciseDtoToDomain } from './exercise.mapper';

describe('exercise.mapper', () => {
  it('maps snake_case DTO fields to domain camelCase', () => {
    const exercise = mapExerciseDtoToDomain(
      {
        exercise_name: 'Squats',
        repetitions_number: 3,
        repetition_time: 5,
        rest_time: 2,
      },
      0,
    );

    expect(exercise).toEqual({
      id: 'exercise-1',
      name: 'Squats',
      repetitionsNumber: 3,
      repetitionTime: 5,
      restTime: 2,
    });
  });

  it('maps a DTO list preserving order and stable ids', () => {
    const exercises = mapExerciseDtoListToDomain([
      {
        exercise_name: 'Squats',
        repetitions_number: 3,
        repetition_time: 5,
        rest_time: 2,
      },
      {
        exercise_name: 'Push-ups',
        repetitions_number: 2,
        repetition_time: 4,
        rest_time: 1,
      },
    ]);

    expect(exercises.map((item) => item.id)).toEqual(['exercise-1', 'exercise-2']);
    expect(exercises[1].name).toBe('Push-ups');
  });

  it('returns an empty list when the DTO list is empty', () => {
    expect(mapExerciseDtoListToDomain([])).toEqual([]);
  });
});
