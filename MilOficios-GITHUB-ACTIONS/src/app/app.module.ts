import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageTranslationModule } from './shared/modules/language-translation/language-translation.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './authorization/auth.service';
import {PasswordValidationModule} from './shared/modules/password-validation/password-validation.module';
@NgModule({
    imports: [
        CommonModule,
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LanguageTranslationModule,
        NgbModule,
        PasswordValidationModule
    ],
    declarations: [AppComponent],
    providers: [AuthService],
    bootstrap: [AppComponent]
})
export class AppModule {}
