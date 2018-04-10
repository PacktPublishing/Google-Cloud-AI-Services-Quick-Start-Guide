import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RoutingModule } from './routing.module';
import { SharedModule } from './shared/shared.module';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { ThreadService } from './services/thread.service';
import { MessageService } from './services/message.service';
import { VisionAPIService } from './services/vision.api.service';

import { AuthGuardLogin } from './services/auth-guard-login.service';
import { AuthGuardAdmin } from './services/auth-guard-admin.service';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AccountComponent } from './account/account.component';
import { AdminComponent } from './admin/admin.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';

import { TokenInterceptor } from './services/http.interceptor';
import { CreateThreadComponent } from './create-thread/create-thread.component';

import { NgxEditorModule } from 'ngx-editor';
import { TagsInputModule } from 'ngx-tags-input/dist';
import { ViewThreadComponent } from './view-thread/view-thread.component';
import { FilterThreadPipe } from './filter-thread.pipe';
import { EditThreadComponent } from './edit-thread/edit-thread.component';
import { UploadImageModal } from './view-thread/upload-image-modal/upload-image-modal';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    RegisterComponent,
    LoginComponent,
    LogoutComponent,
    AccountComponent,
    AdminComponent,
    NotFoundComponent,
    HomeComponent,
    CreateThreadComponent,
    ViewThreadComponent,
    FilterThreadPipe,
    EditThreadComponent,
    UploadImageModal
  ],
  entryComponents: [
    UploadImageModal
  ],
  imports: [
    BrowserModule,
    RoutingModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    NgxEditorModule,
    TagsInputModule.forRoot(),
    NgbModule.forRoot()
  ],
  providers: [
    AuthService,
    AuthGuardLogin,
    AuthGuardAdmin,
    UserService,
    ThreadService,
    MessageService,
    VisionAPIService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})

export class AppModule { }
