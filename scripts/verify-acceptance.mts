import {
  createInitialSession,
  pauseSession,
  resetSession,
  startSession,
  tickSession,
} from '../src/app/features/workout/domain/services/workout-session.service.ts';

const exercises = [
  { id: '1', name: 'Squats', repetitionsNumber: 2, repetitionTime: 2, restTime: 1 },
  { id: '2', name: 'Push-ups', repetitionsNumber: 1, repetitionTime: 2, restTime: 1 },
];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

let session = createInitialSession(exercises);
assert(session.statuses.every((status) => status === 'pending'), 'all pending on load');
assert(session.phase === 'idle' && !session.isRunning, 'does not auto-start');

session = startSession(session);
assert(session.statuses[0] === 'in_progress', 'start activates first');
assert(session.phase === 'exercise' && session.secondsRemaining === 2, 'uses repetition_time');

session = tickSession(session);
session = tickSession(session);
assert(session.phase === 'rest' && session.secondsRemaining === 1, 'starts rest with rest_time');
assert(session.toastMessage === 'Rest time', 'rest toast');

session = tickSession(session);
assert(session.completedRepetitions === 1, 'increments completed rep after rest');
assert(session.phase === 'exercise', 'back to exercise');

session = tickSession(session);
session = tickSession(session);
session = tickSession(session);
assert(session.statuses[0] === 'completed', 'exercise 1 completed');
assert(session.statuses[1] === 'in_progress', 'exercise 2 started');
assert(session.currentExerciseIndex === 1 && session.completedRepetitions === 0, 'moved to next exercise');

session = tickSession(session);
session = tickSession(session);
session = tickSession(session);
assert(session.phase === 'finished' && !session.isRunning, 'workout finished');
assert(session.statuses.every((status) => status === 'completed'), 'all completed');
assert(session.toastMessage === 'Workout completed', 'completed toast');

session = createInitialSession(exercises);
session = startSession(session);
session = tickSession(session);
const pausedAt = session.secondsRemaining;
session = pauseSession(session);
assert(!session.isRunning && session.secondsRemaining === pausedAt, 'pause preserves seconds');
session = startSession(session);
assert(session.isRunning && session.secondsRemaining === pausedAt, 'resume keeps progress');

session = resetSession(session);
assert(
  session.phase === 'idle' &&
    session.completedRepetitions === 0 &&
    session.statuses.every((status) => status === 'pending'),
  'reset to initial',
);

console.log('ALL ACCEPTANCE CHECKS PASSED');
