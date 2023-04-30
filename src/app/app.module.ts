import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {InputTextModule} from 'primeng/inputtext';
import {AutoFocusModule} from 'primeng/autofocus';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {NgOptimizedImage, registerLocaleData} from '@angular/common';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {MenuModule} from 'primeng/menu';

import {SearchComponent} from './pages/search/search.component';

import localePt from '@angular/common/locales/pt';
import {LanguageProvider} from './providers/language/language.provider';

registerLocaleData(localePt);

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    AutoFocusModule,
    TableModule,
    FormsModule,
    ProgressSpinnerModule,
    NgOptimizedImage,
    ConfirmDialogModule,
    MenuModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    LanguageProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
