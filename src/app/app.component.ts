import { Component } from '@angular/core';
import { WORKOUT_PROVIDERS } from './features/workout/workout.providers';
import { WorkoutPageComponent } from './features/workout/presentation/pages/workout-page/workout-page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorkoutPageComponent],
  providers: [...WORKOUT_PROVIDERS],
  template: `<app-workout-page />`,
})
export class AppComponent {}
