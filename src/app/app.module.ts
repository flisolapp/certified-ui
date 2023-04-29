import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {InputTextModule} from 'primeng/inputtext';
import {AutoFocusModule} from 'primeng/autofocus';
import {SearchComponent} from './pages/search/search.component';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    AutoFocusModule,
    TableModule,
    FormsModule,
    ProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
