import { NgModule } from '@angular/core';
import { ActiveListComponent } from './ActiveList/ActiveList.component';
import { ActiveListDirective } from './ActiveList/ActiveList.directive';
import { BrowserModule } from '@angular/platform-browser';

/**
 * An Angular module that includes all uiloos Angular bindings.
 * 
 * You only need this module if you want to use the Angular components 
 * that "@uiloos/angular" exposes, for example the component called 
 * "<uiloos-active-list />".
 * 
 * If you do not use the prebuilt Angular components it is easier 
 * in Angular to just instantiate the classes from "@uiloos/core"
 * directly, as Angular already sees the changes in them, and 
 * re-renders automatically.
 * 
 * @since 1.0.0
 * 
 * @example
 * 
 * A. How to use the UiloosModule
 * 
 * Add "UiloosModule" to the "imports" array of your "AppModule".
 * 
 * ```js
 * import { BrowserModule } from "@angular/platform-browser";
 * import { NgModule } from "@angular/core";
 * import { UiloosModule } from "@uiloos/angular";
 * 
 * import { AppComponent } from "./app.component";
 * 
 * @NgModule({
 *   declarations: [AppComponent],
 *   imports: [BrowserModule, UiloosModule],
 *   providers: [],
 *   bootstrap: [AppComponent]
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  declarations: [ActiveListComponent, ActiveListDirective],
  imports: [BrowserModule],
  exports: [ActiveListComponent, ActiveListDirective]
})
export class UiloosModule {}
