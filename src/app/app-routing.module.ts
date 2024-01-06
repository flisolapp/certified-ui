import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchComponent} from './pages/search/search.component';
import {SearchResultComponent} from './pages/search/search-result/search-result.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
