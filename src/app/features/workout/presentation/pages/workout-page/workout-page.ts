import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { WorkoutSessionFacade } from '../../../application/workout-session.facade';
import { ExerciseListComponent } from '../../components/exercise-list/exercise-list';
import { WorkoutTimerComponent } from '../../components/workout-timer/workout-timer';
import { WorkoutToastComponent } from '../../components/workout-toast/workout-toast';

/**
 * Container: orquesta facade/estado y cablea presentacionales.
 * No contiene lógica de timer ni transiciones de dominio.
 */
@Component({
  selector: 'app-workout-page',
  standalone: true,
  imports: [WorkoutTimerComponent, ExerciseListComponent, WorkoutToastComponent],
  templateUrl: './workout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutPageComponent implements OnInit {
  protected readonly facade = inject(WorkoutSessionFacade);

  ngOnInit(): void {
    void this.facade.load();
  }
}
