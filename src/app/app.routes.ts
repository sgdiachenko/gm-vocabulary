import { Routes } from '@angular/router';

import { PageWrapperComponent } from './shared/components/page-wrapper/page-wrapper.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    title: 'GM Vocabulary',
    loadComponent: () => import('./features/auth/components/auth-page/auth-page.component').then(m => m.AuthPageComponent)
  },
  {
    path: '',
    component: PageWrapperComponent,
    children: [
      {
        path: '',
        redirectTo: '/words',
        pathMatch: 'full'
      },
      {
        path: 'words',
        title: 'My Words',
        loadComponent: () => import('./features/words/components/words-page/words-page.component').then(m => m.WordsPageComponent),
        canActivate: [authGuard]
      },
      {
        path: 'collections',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            title: 'Library',
            loadComponent: () => import('./features/word-sets/components/collections-page/collections-page.component').then(m => m.CollectionsPageComponent)
          },
          {
            path: ':collectionId',
            title: 'Collection',
            loadComponent: () => import('./features/word-sets/components/single-collection-page/single-collection-page.component').then(m => m.SingleCollectionPageComponent)
          }
        ]
      }
    ]
  }
];
