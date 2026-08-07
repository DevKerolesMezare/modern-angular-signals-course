import { Component, effect, inject, resource, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Lesson } from '../models/lesson.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'resource-demo',
  templateUrl: './resource-demo.component.html',
  styleUrls: ['./resource-demo.component.scss'],
  imports: [MatProgressSpinner],
})
export class ResourceDemoComponent {
  env = environment;

  search = signal<string>('');
  // lessons = signal<Lesson[]>([])

  /// قديم
  // lessons = resource<Lesson[], { search: string }>({
  //   request: () => ({
  //     search: this.search(),
  //   }),
  //   loader: async ({ request }) => {
  //     const response = await fetch(
  //       `${this.env.apiRoot}/search-lessons?query=${encodeURIComponent(request.search)}&courseId=18`,
  //     );
  //     const json = await response.json();
  //     return json.lessons;
  //   },
  // });

  lessons = resource<Lesson[], { search: string }>({
    params: () => ({
      search: this.search(),
    }),

    loader: async ({ params }) => {
      const response = await fetch(
        `${this.env.apiRoot}/search-lessons?query=${encodeURIComponent(params.search)}&courseId=18`,
      );

      if (!response.ok) {
        throw new Error('Failed to load lessons');
      }

      const { lessons } = await response.json();
      return lessons;
    },
  });

  constructor() {
    effect(() => {
      console.log('searching lessons:', this.search());
    });
  }

  searchLessons(search: string) {
    this.search.set(search);
  }

  reset() {}

  reload() {}
}
