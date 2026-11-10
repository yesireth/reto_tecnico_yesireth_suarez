import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Exercise, ExerciseStatus } from '../../../domain/models/exercise.model';

@Component({
  selector: 'li[app-exercise-item]',
  standalone: true,
  templateUrl: './exercise-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.active]': 'active()',
    '[class.status-pending]': 'status() === "pending"',
    '[class.status-in-progress]': 'status() === "in_progress"',
    '[class.status-completed]': 'status() === "completed"',
  },
})
export class ExerciseItemComponent {
  readonly exercise = input.required<Exercise>();
  readonly status = input.required<ExerciseStatus>();
  readonly active = input(false);

  protected statusLabel(status: ExerciseStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En curso';
      case 'completed':
        return 'Completado';
    }
  }
}
