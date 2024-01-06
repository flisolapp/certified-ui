import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import {MaterialModule} from '../third/material/material.module';

import {ToolbarComponent} from './toolbar/toolbar.component';
import {PageStructureComponent} from './page-structure/page-structure.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    ToolbarComponent,
    PageStructureComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    NgOptimizedImage
  ],
  exports: [
    PageStructureComponent
  ]
})
export class ComponentsModule {
}
