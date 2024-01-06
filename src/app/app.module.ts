import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

// // import {ButtonModule} from 'primeng/button';
// // import {RippleModule} from 'primeng/ripple';
// // import {InputTextModule} from 'primeng/inputtext';
// // import {AutoFocusModule} from 'primeng/autofocus';
// // import {TableModule} from 'primeng/table';
// import {FormsModule} from '@angular/forms';
// // import {ProgressSpinnerModule} from 'primeng/progressspinner';
// import {NgOptimizedImage, registerLocaleData} from '@angular/common';
import {registerLocaleData} from '@angular/common';
import {SearchModule} from './pages/search/search.module';

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
    // SearchComponent,
    // SearchResultComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    // // ButtonModule,
    // // RippleModule,
    // // InputTextModule,
    // // AutoFocusModule,
    // // TableModule,
    // FormsModule,
    // // ProgressSpinnerModule,
    // NgOptimizedImage,
    // // ConfirmDialogModule,
    // // MenuModule
    SearchModule,
  ],
  providers: [
    // ConfirmationService,
    // MessageService,
    LanguageProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
