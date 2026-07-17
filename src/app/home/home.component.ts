import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { CoursesService } from '../services/courses.service';
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';
import { catchError, from, throwError } from 'rxjs';
import {
  toObservable,
  toSignal,
  outputToObservable,
  outputFromObservable,
} from '@angular/core/rxjs-interop';
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { LoadingService } from '../loading/loading.service';

@Component({
  selector: 'home',
  imports: [MatTabGroup, MatTab, CoursesCardListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #courses = signal<Course[]>([]);

  coursesService = inject(CoursesService);
  messageService = inject(MessagesService);

  dialog = inject(MatDialog);


  beginnersList= viewChild('beginnersList',{
    read: ElementRef
  });



  beginnerCourse = computed(() => {
    const courses = this.#courses();
    return courses
      .filter((course) => course.category === 'BEGINNER')
      .sort(sortCoursesBySeqNo);
  });

  advancedCourse = computed(() => {
    const courses = this.#courses();
    return courses
      .filter((course) => course.category === 'ADVANCED')
      .sort(sortCoursesBySeqNo);
  });

  constructor() {
    effect(() =>
    {
      console.log('beginnerList: ', this.beginnersList())
    })


    effect(() => {
      console.log('Beginner courses:', this.beginnerCourse());
      console.log('Advanced courses:', this.advancedCourse());
    });

    this.loadCourses().then(() => {
      console.log('Courses loaded successfully...', this.#courses());
    });
  }

  async loadCourses() {
    try {
      const courses = await this.coursesService.loadAllCourses();
      this.#courses.set(courses.sort(sortCoursesBySeqNo));
    } catch (error) {
      this.messageService.showMessage('Failed to load courses. Please try again later.', 'error')
      console.error('Error loading courses:', error);
    } 
  }

  onCourseUpdated(updatedCourse: Course) {
    const courses = this.#courses();
    const newCourse = courses.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course,
    );

    this.#courses.set(newCourse);
  }

  async onCourseDeletetd(courseId: string) {
    try {
      await this.coursesService.deleteCourse(courseId);
      const courses = this.#courses();
      const newCourse = courses.filter((course) => course.id !== courseId);
      this.#courses.set(newCourse);
    } catch (err) {
      console.error(err);
      alert(`Error deleting course.`);
    }
  }

  async onAddCourse() {
    const newCourse = await openEditCourseDialog(this.dialog, {
      mode: 'create',
      title: 'Create New Course',
    });

    if(!newCourse)
      return;

    const newCourses = [...this.#courses(), newCourse];
    this.#courses.set(newCourses);
  }
}
