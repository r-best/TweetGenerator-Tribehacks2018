import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { TwitterService } from './shared/services/twitter.service';
import { ToastService } from './shared/services/toast.service';
import { GeneratorComponent } from './generator/generator.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'generator', component: GeneratorComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
]

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GeneratorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  providers: [TwitterService, ToastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
