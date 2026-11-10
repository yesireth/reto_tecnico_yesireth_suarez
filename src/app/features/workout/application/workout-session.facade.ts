import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { WorkoutRepository } from '../domain/ports/workout.repository';
import { WorkoutSession } from '../domain/models/exercise.model';
import {
  createInitialSession,
  getCurrentExercise,
  pauseSession,
  resetSession,
  startSession,
  tickSession,
} from '../domain/services/workout-session.service';

/**
 * Capa application: orquesta el puerto, el dominio puro y el reloj.
 * El temporizador NO vive en los componentes de presentación.
 */
@Injectable()
export class WorkoutSessionFacade implements OnDestroy {
  private readonly repository = inject(WorkoutRepository);

  private readonly sessionState = signal<WorkoutSession>(createInitialSession([]));
  private timerId: ReturnType<typeof setInterval> | null = null;

  readonly session = this.sessionState.asReadonly();
  readonly currentExercise = computed(() => getCurrentExercise(this.sessionState()));
  readonly isRunning = computed(() => this.sessionState().isRunning);
  readonly toastMessage = computed(() => this.sessionState().toastMessage);
  readonly phase = computed(() => this.sessionState().phase);

  async load(): Promise<void> {
    this.clearTimer();
    const exercises = await this.repository.getExercises();
    this.sessionState.set(createInitialSession(exercises));
  }

  start(): void {
    const next = startSession(this.sessionState());
    this.sessionState.set(next);

    if (next.isRunning) {
      this.ensureTimer();
    }
  }

  pause(): void {
    this.clearTimer();
    this.sessionState.set(pauseSession(this.sessionState()));
  }

  reset(): void {
    this.clearTimer();
    this.sessionState.set(resetSession(this.sessionState()));
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private ensureTimer(): void {
    if (this.timerId !== null) {
      return;
    }

    this.timerId = setInterval(() => {
      const next = tickSession(this.sessionState());
      this.sessionState.set(next);

      if (!next.isRunning) {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
