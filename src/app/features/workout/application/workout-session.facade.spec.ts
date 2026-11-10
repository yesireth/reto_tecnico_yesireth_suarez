import { TestBed } from '@angular/core/testing';
import { Exercise } from '../domain/models/exercise.model';
import { WorkoutRepository } from '../domain/ports/workout.repository';
import { WorkoutSessionFacade } from './workout-session.facade';

class FakeWorkoutRepository extends WorkoutRepository {
  constructor(private readonly exercises: Exercise[]) {
    super();
  }

  override getExercises(): Promise<Exercise[]> {
    return Promise.resolve(this.exercises);
  }
}

class FailingWorkoutRepository extends WorkoutRepository {
  override getExercises(): Promise<Exercise[]> {
    return Promise.reject(new Error('network error'));
  }
}

const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: 'exercise-1',
    name: 'Squats',
    repetitionsNumber: 1,
    repetitionTime: 2,
    restTime: 1,
  },
  {
    id: 'exercise-2',
    name: 'Plank',
    repetitionsNumber: 1,
    repetitionTime: 1,
    restTime: 1,
  },
];

describe('WorkoutSessionFacade', () => {
  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jasmine.clock().uninstall();
  });

  async function setupFacade(
    repository: WorkoutRepository = new FakeWorkoutRepository(SAMPLE_EXERCISES),
  ): Promise<WorkoutSessionFacade> {
    TestBed.configureTestingModule({
      providers: [
        WorkoutSessionFacade,
        { provide: WorkoutRepository, useValue: repository },
      ],
    });

    const facade = TestBed.inject(WorkoutSessionFacade);
    await facade.load();
    return facade;
  }

  it('loads exercises without auto-starting the session', async () => {
    const facade = await setupFacade();

    expect(facade.exercises().length).toBe(2);
    expect(facade.phase()).toBe('idle');
    expect(facade.isRunning()).toBeFalse();
    expect(facade.statuses()).toEqual(['pending', 'pending']);
  });

  it('starts, ticks through rest and advances exercises via the timer', async () => {
    const facade = await setupFacade();

    facade.start();
    expect(facade.isRunning()).toBeTrue();
    expect(facade.phase()).toBe('exercise');
    expect(facade.statuses()[0]).toBe('in_progress');

    jasmine.clock().tick(2000);
    expect(facade.phase()).toBe('rest');
    expect(facade.toastMessage()).toBe('Rest time');

    jasmine.clock().tick(1000);
    expect(facade.statuses()[0]).toBe('completed');
    expect(facade.statuses()[1]).toBe('in_progress');
    expect(facade.currentExercise()?.name).toBe('Plank');
  });

  it('pause freezes progress and reset restores the initial state', async () => {
    const facade = await setupFacade();

    facade.start();
    jasmine.clock().tick(1000);
    const secondsBeforePause = facade.secondsRemaining();

    facade.pause();
    expect(facade.isRunning()).toBeFalse();
    expect(facade.secondsRemaining()).toBe(secondsBeforePause);

    jasmine.clock().tick(5000);
    expect(facade.secondsRemaining()).toBe(secondsBeforePause);

    facade.reset();
    expect(facade.phase()).toBe('idle');
    expect(facade.completedRepetitions()).toBe(0);
    expect(facade.statuses()).toEqual(['pending', 'pending']);
  });

  it('loads an empty list as a finished edge case', async () => {
    const facade = await setupFacade(new FakeWorkoutRepository([]));

    expect(facade.phase()).toBe('finished');
    expect(facade.currentExercise()).toBeNull();
    expect(facade.toastMessage()).toBe('No exercises available');

    facade.start();
    expect(facade.isRunning()).toBeFalse();
  });

  it('propagates repository failures to the caller', async () => {
    TestBed.configureTestingModule({
      providers: [
        WorkoutSessionFacade,
        { provide: WorkoutRepository, useClass: FailingWorkoutRepository },
      ],
    });

    const facade = TestBed.inject(WorkoutSessionFacade);
    await expectAsync(facade.load()).toBeRejectedWithError('network error');
  });
});
