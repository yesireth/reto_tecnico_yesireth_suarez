import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-workout-toast',
  standalone: true,
  templateUrl: './workout-toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutToastComponent {
  readonly message = input.required<string>();
}
