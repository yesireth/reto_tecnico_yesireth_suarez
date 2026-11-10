import { Provider } from '@angular/core';
import { WorkoutSessionFacade } from './application/workout-session.facade';
import { WorkoutRepository } from './domain/ports/workout.repository';
import { MockWorkoutRepository } from './infrastructure/repositories/mock-workout.repository';

/** Composition root de la feature: cablea el puerto a infrastructure. */
export const WORKOUT_PROVIDERS: Provider[] = [
  { provide: WorkoutRepository, useClass: MockWorkoutRepository },
  WorkoutSessionFacade,
];
