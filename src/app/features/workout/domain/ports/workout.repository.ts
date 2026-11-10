import { Exercise } from '../models/exercise.model';

/**
 * Puerto de acceso a ejercicios.
 * Abstracción en domain; implementación en infrastructure.
 * Sin dependencias de Angular ni RxJS.
 */
export abstract class WorkoutRepository {
  abstract getExercises(): Promise<Exercise[]>;
}
