import {Routes} from '@angular/router';
import {SearchComponent} from './pages/search/search.component';
import {SearchResultComponent} from './pages/search/search-result/search-result.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    children: [
      {
        path: ':term',
        component: SearchResultComponent
      }
    ]
  }
];
