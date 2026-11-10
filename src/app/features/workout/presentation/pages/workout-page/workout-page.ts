import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { WorkoutSessionFacade } from '../../../application/workout-session.facade';
import { ExerciseStatus } from '../../../domain/models/exercise.model';

@Component({
  selector: 'app-workout-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-page.html',
})
export class WorkoutPageComponent implements OnInit {
  protected readonly facade = inject(WorkoutSessionFacade);

  ngOnInit(): void {
    void this.facade.load();
  }

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

  protected formatSeconds(seconds: number): string {
    const value = Math.max(0, seconds);
    return value < 10 ? `00:0${value}` : `00:${value}`;
  }
}
