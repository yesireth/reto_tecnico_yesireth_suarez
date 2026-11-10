import { Exercise } from '../models/exercise.model';
import {
  createInitialSession,
  getCurrentExercise,
  pauseSession,
  resetSession,
  startSession,
  tickSession,
} from './workout-session.service';

function buildExercises(): Exercise[] {
  return [
    {
      id: 'exercise-1',
      name: 'Squats',
      repetitionsNumber: 2,
      repetitionTime: 2,
      restTime: 1,
    },
    {
      id: 'exercise-2',
      name: 'Push-ups',
      repetitionsNumber: 1,
      repetitionTime: 2,
      restTime: 1,
    },
  ];
}

describe('workout-session domain', () => {
  it('creates an idle session with all exercises pending', () => {
    const session = createInitialSession(buildExercises());

    expect(session.phase).toBe('idle');
    expect(session.isRunning).toBeFalse();
    expect(session.statuses).toEqual(['pending', 'pending']);
    expect(session.secondsRemaining).toBe(2);
    expect(session.toastMessage).toBe('');
  });

  it('handles empty exercise list as finished edge case', () => {
    const session = createInitialSession([]);

    expect(session.phase).toBe('finished');
    expect(session.isRunning).toBeFalse();
    expect(session.toastMessage).toBe('No exercises available');
    expect(getCurrentExercise(session)).toBeNull();
  });

  it('starts the first exercise with repetition_time', () => {
    const session = startSession(createInitialSession(buildExercises()));

    expect(session.isRunning).toBeTrue();
    expect(session.phase).toBe('exercise');
    expect(session.statuses[0]).toBe('in_progress');
    expect(session.secondsRemaining).toBe(2);
  });

  it('ignores start when already running or finished', () => {
    const running = startSession(createInitialSession(buildExercises()));
    expect(startSession(running)).toBe(running);

    const empty = createInitialSession([]);
    expect(startSession(empty)).toBe(empty);
  });

  it('transitions to rest when exercise timer reaches zero', () => {
    let session = startSession(createInitialSession(buildExercises()));
    session = tickSession(session);
    session = tickSession(session);

    expect(session.phase).toBe('rest');
    expect(session.secondsRemaining).toBe(1);
    expect(session.toastMessage).toBe('Rest time');
  });

  it('increments completed repetitions after rest ends', () => {
    let session = startSession(createInitialSession(buildExercises()));
    session = tickSession(session);
    session = tickSession(session);
    session = tickSession(session);

    expect(session.completedRepetitions).toBe(1);
    expect(session.phase).toBe('exercise');
    expect(session.toastMessage).toBe('Back to exercise');
  });

  it('completes current exercise and starts the next one', () => {
    let session = startSession(createInitialSession(buildExercises()));

    // Squats: 2 reps *(2 exercise + 1 rest)
    for (let i = 0; i < 6; i++) {
      session = tickSession(session);
    }

    expect(session.statuses[0]).toBe('completed');
    expect(session.statuses[1]).toBe('in_progress');
    expect(session.currentExerciseIndex).toBe(1);
    expect(session.completedRepetitions).toBe(0);
    expect(session.toastMessage).toBe('Next: Push-ups');
  });

  it('finishes the workout after the last exercise', () => {
    let session = startSession(createInitialSession(buildExercises()));

    // Squats (6 ticks) + Push-ups (2 exercise + 1 rest)
    for (let i = 0; i < 9; i++) {
      session = tickSession(session);
    }

    expect(session.phase).toBe('finished');
    expect(session.isRunning).toBeFalse();
    expect(session.statuses).toEqual(['completed', 'completed']);
    expect(session.toastMessage).toBe('Workout completed');
  });

  it('pause keeps progress and reset restores the initial state', () => {
    let session = startSession(createInitialSession(buildExercises()));
    session = tickSession(session);
    const pausedAt = session.secondsRemaining;

    session = pauseSession(session);
    expect(session.isRunning).toBeFalse();
    expect(session.secondsRemaining).toBe(pausedAt);

    session = startSession(session);
    expect(session.isRunning).toBeTrue();
    expect(session.secondsRemaining).toBe(pausedAt);

    session = resetSession(session);
    expect(session.phase).toBe('idle');
    expect(session.completedRepetitions).toBe(0);
    expect(session.statuses).toEqual(['pending', 'pending']);
  });

  it('skips rest immediately when restTime is zero', () => {
    const exercises: Exercise[] = [
      {
        id: 'exercise-1',
        name: 'Burpees',
        repetitionsNumber: 1,
        repetitionTime: 1,
        restTime: 0,
      },
    ];

    let session = startSession(createInitialSession(exercises));
    session = tickSession(session);

    expect(session.phase).toBe('finished');
    expect(session.statuses).toEqual(['completed']);
    expect(session.toastMessage).toBe('Workout completed');
  });

  it('does not tick while idle, paused or finished', () => {
    const idle = createInitialSession(buildExercises());
    expect(tickSession(idle)).toBe(idle);

    const paused = pauseSession(startSession(idle));
    expect(tickSession(paused)).toEqual(paused);
  });
});
