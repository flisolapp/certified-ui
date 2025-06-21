import {Routes} from '@angular/router';
import {Search} from './pages/search/search';
import {SearchResult} from './pages/search/search-result/search-result';

export const routes: Routes = [
  {
    path: '',
    component: Search,
    children: [
      {
        path: ':term',
        component: SearchResult
      }
    ]
  }
];
