import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import {HomeComponent} from '../home/home.component';

const pdgRoutes: Routes = [
  
  // {
  //   path: 'account',
  //   loadChildren: 'app/admin/admin.module#AdminModule',
  //   canLoad: [AuthentificationService]
  // },
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  // {
  //   path: '**',
  //   component: PageNotFoundComponent,
  // }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(pdgRoutes,{
      preloadingStrategy: PreloadAllModules
    })
  ],
  declarations: []
})
export class PdgRoutingModule { }


