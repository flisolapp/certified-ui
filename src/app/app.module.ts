import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {InputTextModule} from 'primeng/inputtext';
import {AutoFocusModule} from 'primeng/autofocus';
import { SearchComponent } from './pages/search/search.component';
import {SearchFormComponent} from './pages/search-form/search-form.component';
import {SearchResultComponent} from './pages/search-result/search-result.component';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    SearchFormComponent,
    SearchResultComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    AutoFocusModule,
    TableModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
