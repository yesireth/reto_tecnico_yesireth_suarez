import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Exercise, ExerciseStatus } from '../../../domain/models/exercise.model';
import { ExerciseItemComponent } from '../exercise-item/exercise-item';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [ExerciseItemComponent],
  templateUrl: './exercise-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseListComponent {
  readonly exercises = input.required<Exercise[]>();
  readonly statuses = input.required<ExerciseStatus[]>();
  readonly currentIndex = input(0);
}
