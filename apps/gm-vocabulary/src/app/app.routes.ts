import { Routes } from '@angular/router';
import { authGuard } from '@gm-vocabulary/auth/data-access';
import { PageWrapperComponent } from '@gm-vocabulary/feature-shell';

export const routes: Routes = [
  {
    path: 'auth',
    title: 'GM Vocabulary',
    loadComponent: () =>
      import('@gm-vocabulary/auth/feature-auth').then((m) => m.AuthPageContainer),
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
          import('@gm-vocabulary/vocabulary/feature-list').then((m) => m.WordsPageContainer),
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
              import('@gm-vocabulary/collections/feature-list').then(
                (m) => m.CollectionsPageContainer,
              ),
          },
          {
            path: ':collectionId',
            title: 'Collection',
            loadComponent: () =>
              import('@gm-vocabulary/collections/feature-details').then(
                (m) => m.SingleCollectionPageContainer,
              ),
          },
        ],
      },
    ],
  },
];
