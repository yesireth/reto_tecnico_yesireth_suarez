import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WorkoutPhase } from '../../../domain/models/exercise.model';

@Component({
  selector: 'app-workout-timer',
  standalone: true,
  templateUrl: './workout-timer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutTimerComponent {
  readonly exerciseName = input.required<string>();
  readonly exercisePosition = input.required<number>();
  readonly exerciseTotal = input.required<number>();
  readonly phase = input.required<WorkoutPhase>();
  readonly secondsRemaining = input.required<number>();
  readonly completedRepetitions = input.required<number>();
  readonly repetitionsNumber = input.required<number>();
  readonly isRunning = input(false);

  readonly start = output<void>();
  readonly pause = output<void>();
  readonly reset = output<void>();

  protected formatSeconds(seconds: number): string {
    const value = Math.max(0, seconds);
    return value < 10 ? `00:0${value}` : `00:${value}`;
  }

  protected phaseLabel(phase: WorkoutPhase): string {
    switch (phase) {
      case 'idle':
        return 'Ready';
      case 'rest':
        return 'Rest';
      case 'finished':
        return 'Finished';
      default:
        return 'Exercise';
    }
  }
}
