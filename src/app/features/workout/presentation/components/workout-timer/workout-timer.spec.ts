import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutTimerComponent } from './workout-timer';

describe('WorkoutTimerComponent', () => {
  let fixture: ComponentFixture<WorkoutTimerComponent>;
  let component: WorkoutTimerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutTimerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutTimerComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('exerciseName', 'Squats');
    fixture.componentRef.setInput('exercisePosition', 1);
    fixture.componentRef.setInput('exerciseTotal', 3);
    fixture.componentRef.setInput('phase', 'idle');
    fixture.componentRef.setInput('secondsRemaining', 5);
    fixture.componentRef.setInput('completedRepetitions', 0);
    fixture.componentRef.setInput('repetitionsNumber', 3);
    fixture.componentRef.setInput('isRunning', false);
    fixture.detectChanges();
  });

  it('renders exercise info, timer and start control when idle', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Squats');
    expect(nativeElement.textContent).toContain('Exercise 1 / 3');
    expect(nativeElement.textContent).toContain('00:05');
    expect(nativeElement.textContent).toContain('Ready');
    expect(nativeElement.querySelector('button')?.textContent?.trim()).toBe('Start');
  });

  it('shows pause instead of start while running', () => {
    fixture.componentRef.setInput('isRunning', true);
    fixture.componentRef.setInput('phase', 'exercise');
    fixture.detectChanges();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).map((button) => button.textContent?.trim());

    expect(labels).toContain('Pause');
    expect(labels).not.toContain('Start');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Exercise');
  });

  it('emits start, pause and reset from the control buttons', () => {
    const startSpy = jasmine.createSpy('start');
    const pauseSpy = jasmine.createSpy('pause');
    const resetSpy = jasmine.createSpy('reset');

    component.start.subscribe(startSpy);
    component.pause.subscribe(pauseSpy);
    component.reset.subscribe(resetSpy);

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );

    buttons.find((button) => button.textContent?.trim() === 'Start')?.click();
    expect(startSpy).toHaveBeenCalled();

    fixture.componentRef.setInput('isRunning', true);
    fixture.detectChanges();

    const runningButtons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );
    runningButtons.find((button) => button.textContent?.trim() === 'Pause')?.click();
    runningButtons.find((button) => button.textContent?.trim() === 'Reset')?.click();

    expect(pauseSpy).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
  });

  it('formats single-digit seconds with a leading zero', () => {
    fixture.componentRef.setInput('secondsRemaining', 9);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('00:09');
  });

  it('hides start when the workout is finished', () => {
    fixture.componentRef.setInput('phase', 'finished');
    fixture.componentRef.setInput('isRunning', false);
    fixture.detectChanges();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).map((button) => button.textContent?.trim());

    expect(labels).not.toContain('Start');
    expect(labels).toContain('Reset');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Finished');
  });
});
