import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth-guard';
import { PageWrapperComponent } from './shell/page-wrapper/page-wrapper.component';

export const routes: Routes = [
  {
    path: 'auth',
    title: 'GM Vocabulary',
    loadComponent: () =>
      import('./features/auth/auth-page/auth-page.container').then((m) => m.AuthPageContainer),
  },
  {
    path: '',
    component: PageWrapperComponent,
    children: [
      {
        path: '',
        redirectTo: '/words',
        pathMatch: 'full',
      },
      {
        path: 'words',
        title: 'My Words',
        loadComponent: () =>
          import('./features/vocabulary/words/words-page/words-page.container').then(
            (m) => m.WordsPageContainer,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'collections',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            title: 'Library',
            loadComponent: () =>
              import(
                './features/vocabulary/collections/collections-page/collections-page.container'
              ).then((m) => m.CollectionsPageContainer),
          },
          {
            path: ':collectionId',
            title: 'Collection',
            loadComponent: () =>
              import(
                './features/vocabulary/collections/single-collection-page/single-collection-page.container'
              ).then((m) => m.SingleCollectionPageContainer),
          },
        ],
      },
    ],
  },
];
