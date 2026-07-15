import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { LessonsService } from '../services/lessons.service';
import { Lesson } from '../models/lesson.model';

export const courseLessonResolver: ResolveFn<Lesson[]> = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const courseId = route.paramMap.get('courseId');

  if (!courseId) {
    return [];
  }

  const lessonService = inject(LessonsService);

  return lessonService.loadLessons({ courseId });
};
