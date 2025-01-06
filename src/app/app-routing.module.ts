import * as angular from "@angular/core";
import * as router from "@angular/router";
import * as userService from "./core/services/user.service";
import * as rxjsOperators from "rxjs/operators";
import * as profile from "./features/profile/profile.component";

const routes: router.Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./core/auth/auth.component").then((m) => m.AuthComponent),
    canActivate: [
      () => angular.inject(userService.UserService).isAuthenticated.pipe(rxjsOperators.map((isAuth) => !isAuth)),
    ],
  },
  {
    path: "register",
    loadComponent: () =>
      import("./core/auth/auth.component").then((m) => m.AuthComponent),
    canActivate: [
      () => angular.inject(userService.UserService).isAuthenticated.pipe(rxjsOperators.map((isAuth) => !isAuth)),
    ],
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./features/settings/settings.component").then(
        (m) => m.SettingsComponent
      ),
    canActivate: [() => angular.inject(userService.UserService).isAuthenticated],
  },
  {
    path: "profile",
    children: [
      {
        path: ":username",
        component: profile.ProfileComponent,
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/profile/profile-articles.component").then(
                (m) => m.ProfileArticlesComponent
              ),
          },
          {
            path: "favorites",
            loadComponent: () =>
              import("./features/profile/profile-favorites.component").then(
                (m) => m.ProfileFavoritesComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: "editor",
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./features/editor/editor.component").then(
            (m) => m.EditorComponent
          ),
        canActivate: [() => angular.inject(userService.UserService).isAuthenticated],
      },
      {
        path: ":slug",
        loadComponent: () =>
          import("./features/editor/editor.component").then(
            (m) => m.EditorComponent
          ),
        canActivate: [() => angular.inject(userService.UserService).isAuthenticated],
      },
    ],
  },
  {
    path: "article/:slug",
    loadComponent: () =>
      import("./features/article/article.component").then(
        (m) => m.ArticleComponent
      ),
  },
];

@angular.NgModule({
  imports: [
    router.RouterModule.forRoot(routes, {
      preloadingStrategy: router.PreloadAllModules,
    }),
  ],
  exports: [router.RouterModule],
})
export class AppRoutingModule {}
