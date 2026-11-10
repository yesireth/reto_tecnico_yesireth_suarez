export type ExerciseStatus = 'pending' | 'in_progress' | 'completed';

export type WorkoutPhase = 'idle' | 'exercise' | 'rest' | 'finished';

export interface Exercise {
  id: string;
  name: string;
  repetitionsNumber: number;
  repetitionTime: number;
  restTime: number;
}

export interface WorkoutSession {
  exercises: Exercise[];
  statuses: ExerciseStatus[];
  currentExerciseIndex: number;
  completedRepetitions: number;
  secondsRemaining: number;
  phase: WorkoutPhase;
  isRunning: boolean;
  toastMessage: string;
}
