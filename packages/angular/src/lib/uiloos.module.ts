import { NgModule } from '@angular/core';
import { ActiveListComponent } from './ActiveList/ActiveList.component';
import { ActiveListDirective } from './ActiveList/ActiveList.directive';
import { BrowserModule } from '@angular/platform-browser';

/**
 * An Angular module that includes all uiloos Angular bindings.
 * 
 * @since 1.0.0
 */
@NgModule({
  declarations: [ActiveListComponent, ActiveListDirective],
  imports: [BrowserModule],
  exports: [ActiveListComponent, ActiveListDirective]
})
export class UiloosModule {}
