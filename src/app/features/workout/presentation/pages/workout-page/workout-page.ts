import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WorkoutSessionFacade } from '../../../application/workout-session.facade';
import { ExerciseListComponent } from '../../components/exercise-list/exercise-list';
import { WorkoutTimerComponent } from '../../components/workout-timer/workout-timer';
import { WorkoutToastComponent } from '../../components/workout-toast/workout-toast';

/**
 * Container: orquesta facade/estado y cablea presentacionales.
 * Standalone + inject() + OnPush; sin lógica de timer.
 */
@Component({
  selector: 'app-workout-page',
  standalone: true,
  imports: [WorkoutTimerComponent, ExerciseListComponent, WorkoutToastComponent],
  templateUrl: './workout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutPageComponent {
  protected readonly facade = inject(WorkoutSessionFacade);

  constructor() {
    void this.facade.load();
  }
}
