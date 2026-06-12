import { Routes } from '@angular/router';

import { PageWrapperComponent } from './core/layouts/page-wrapper/page-wrapper.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    title: 'GM Vocabulary',
    loadComponent: () => import('./features/auth/containers/auth-page/auth-page.container').then(m => m.AuthPageContainer)
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
        loadComponent: () => import('./features/words/containers/words-page/words-page.container').then(m => m.WordsPageContainer),
        canActivate: [authGuard]
      },
      {
        path: 'collections',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            title: 'Library',
            loadComponent: () => import('./features/word-sets/containers/collections-page/collections-page.container').then(m => m.CollectionsPageContainer)
          },
          {
            path: ':collectionId',
            title: 'Collection',
            loadComponent: () => import('./features/word-sets/containers/single-collection-page/single-collection-page.container').then(m => m.SingleCollectionPageContainer)
          }
        ]
      }
    ]
  }
];
