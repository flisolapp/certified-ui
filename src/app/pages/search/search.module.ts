import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MaterialModule} from '../../third/material/material.module';
import {ComponentsModule} from '../../components/components.module';

import {SearchComponent} from './search.component';
import {SearchResultComponent} from './search-result/search-result.component';
import {TranslateModule} from '@ngx-translate/core';
import {
  SearchResultDownloadCertificateComponent
} from './search-result/search-result-download-certificate/search-result-download-certificate.component';

@NgModule({
  declarations: [
    SearchComponent,
    SearchResultComponent,
    SearchResultDownloadCertificateComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ComponentsModule,
    TranslateModule
  ],
  exports: [
    SearchComponent
  ]
})
export class SearchModule {
}
