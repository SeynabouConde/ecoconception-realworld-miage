import * as angular from "@angular/core";
import * as browser from "@angular/platform-browser";
import * as http from "@angular/common/http";
import * as rxjs from "rxjs";
import * as app from "./app.component";
import * as routing from "./app-routing.module";
import * as footer from "./core/layout/footer.component";
import * as header from "./core/layout/header.component";
import * as jwt from "./core/services/jwt.service";
import * as user from "./core/services/user.service";
import * as token from "./core/interceptors/token.interceptor";
import * as error from "./core/interceptors/error.interceptor";
import * as api from "./core/interceptors/api.interceptor";

export function initAuth(jwtService: jwt.JwtService, userService: user.UserService) {
  return () => (jwtService.getToken() ? userService.getCurrentUser() : rxjs.EMPTY);
}

@angular.NgModule({
  declarations: [app.AppComponent],
  imports: [
    browser.BrowserModule,
    footer.FooterComponent,
    header.HeaderComponent,
    routing.AppRoutingModule,
    http.HttpClientModule,
  ],
  providers: [
    {
      provide: angular.APP_INITIALIZER,
      useFactory: initAuth,
      deps: [jwt.JwtService, user.UserService],
      multi: true,
    },
    { provide: http.HTTP_INTERCEPTORS, useClass: api.ApiInterceptor, multi: true },
    { provide: http.HTTP_INTERCEPTORS, useClass: token.TokenInterceptor, multi: true },
    { provide: http.HTTP_INTERCEPTORS, useClass: error.ErrorInterceptor, multi: true },
  ],
  bootstrap: [app.AppComponent],
})
export class AppModule {}
