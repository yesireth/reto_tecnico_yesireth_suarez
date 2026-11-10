import {
  Exercise,
  ExerciseStatus,
  WorkoutSession,
} from '../models/exercise.model';

function cloneStatuses(statuses: ExerciseStatus[]): ExerciseStatus[] {
  return [...statuses];
}

export function createInitialSession(exercises: Exercise[]): WorkoutSession {
  if (exercises.length === 0) {
    return {
      exercises: [],
      statuses: [],
      currentExerciseIndex: 0,
      completedRepetitions: 0,
      secondsRemaining: 0,
      phase: 'finished',
      isRunning: false,
      toastMessage: 'No exercises available',
    };
  }

  return {
    exercises,
    statuses: exercises.map(() => 'pending'),
    currentExerciseIndex: 0,
    completedRepetitions: 0,
    secondsRemaining: exercises[0].repetitionTime,
    phase: 'idle',
    isRunning: false,
    toastMessage: '',
  };
}

export function startSession(session: WorkoutSession): WorkoutSession {
  if (session.exercises.length === 0 || session.phase === 'finished') {
    return session;
  }

  if (session.isRunning) {
    return session;
  }

  const statuses = cloneStatuses(session.statuses);
  const index = session.currentExerciseIndex;
  statuses[index] = 'in_progress';

  const current = session.exercises[index];
  const resuming =
    session.phase === 'exercise' || session.phase === 'rest';

  return {
    ...session,
    statuses,
    isRunning: true,
    phase: resuming ? session.phase : 'exercise',
    secondsRemaining: resuming
      ? session.secondsRemaining
      : current.repetitionTime,
    toastMessage: resuming ? session.toastMessage : '',
  };
}

export function pauseSession(session: WorkoutSession): WorkoutSession {
  if (!session.isRunning) {
    return session;
  }

  return {
    ...session,
    isRunning: false,
  };
}

export function resetSession(session: WorkoutSession): WorkoutSession {
  return createInitialSession(session.exercises);
}

export function tickSession(session: WorkoutSession): WorkoutSession {
  if (!session.isRunning || session.phase === 'idle' || session.phase === 'finished') {
    return session;
  }

  const nextSeconds = session.secondsRemaining - 1;
  if (nextSeconds > 0) {
    return {
      ...session,
      secondsRemaining: nextSeconds,
    };
  }

  if (session.phase === 'exercise') {
    return beginRest(session);
  }

  return completeRest(session);
}

function beginRest(session: WorkoutSession): WorkoutSession {
  const current = session.exercises[session.currentExerciseIndex];

  // Si no hay descanso configurado, se completa la repetición de inmediato.
  if (current.restTime <= 0) {
    return completeRest({
      ...session,
      phase: 'rest',
      secondsRemaining: 0,
      toastMessage: 'Rest time',
    });
  }

  return {
    ...session,
    phase: 'rest',
    secondsRemaining: current.restTime,
    toastMessage: 'Rest time',
  };
}

function completeRest(session: WorkoutSession): WorkoutSession {
  const current = session.exercises[session.currentExerciseIndex];
  const completedRepetitions = session.completedRepetitions + 1;

  if (completedRepetitions >= current.repetitionsNumber) {
    return completeCurrentExercise({
      ...session,
      completedRepetitions,
    });
  }

  return {
    ...session,
    completedRepetitions,
    phase: 'exercise',
    secondsRemaining: current.repetitionTime,
    toastMessage: 'Back to exercise',
  };
}

function completeCurrentExercise(session: WorkoutSession): WorkoutSession {
  const statuses = cloneStatuses(session.statuses);
  statuses[session.currentExerciseIndex] = 'completed';

  const nextIndex = session.currentExerciseIndex + 1;

  if (nextIndex >= session.exercises.length) {
    return {
      ...session,
      statuses,
      isRunning: false,
      phase: 'finished',
      secondsRemaining: 0,
      toastMessage: 'Workout completed',
    };
  }

  const nextExercise = session.exercises[nextIndex];
  statuses[nextIndex] = 'in_progress';

  return {
    ...session,
    statuses,
    currentExerciseIndex: nextIndex,
    completedRepetitions: 0,
    phase: 'exercise',
    secondsRemaining: nextExercise.repetitionTime,
    toastMessage: `Next: ${nextExercise.name}`,
    isRunning: true,
  };
}

export function getCurrentExercise(session: WorkoutSession): Exercise | null {
  if (session.exercises.length === 0) {
    return null;
  }

  return session.exercises[session.currentExerciseIndex] ?? null;
}
