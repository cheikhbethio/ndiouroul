import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { PdgComponent } from './pdg.component';
import { HomeComponent } from './home/home.component';
import { PdgRoutingModule }  from './pdg-routing/pdg-routing.module';


@NgModule({
  declarations: [
    PdgComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    PdgRoutingModule
  ],
  providers: [],
  bootstrap: [PdgComponent]
})
export class PdgModule { }
