import { Routes } from '@angular/router';

import { CollectionsPageComponent } from './features/word-sets/components/collections-page/collections-page.component';
import {
  SingleCollectionPageComponent
} from './features/word-sets/components/single-collection-page/single-collection-page.component';
import { WordsPageComponent } from './features/words/components/words-page/words-page.component';
import { PageWrapperComponent } from './shared/components/page-wrapper/page-wrapper.component';
import { AuthPageComponent } from './features/auth/components/auth-page/auth-page.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    title: 'GM Vocabulary',
    component: AuthPageComponent
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
        component: WordsPageComponent,
        canActivate: [authGuard]
      },
      {
        path: 'collections',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            title: 'Library',
            component: CollectionsPageComponent
          },
          {
            path: ':collectionId',
            title: 'Collection',
            component: SingleCollectionPageComponent
          }
        ]
      }
    ]
  }
];
