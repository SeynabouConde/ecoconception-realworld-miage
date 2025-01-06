import * as angular from "@angular/core";
import * as tagsService from "../../core/services/tags.service";
import * as articleConfig from "../../core/models/article-list-config.model";
import * as common from "@angular/common";
import * as articleList from "../../shared/article-helpers/article-list.component";
import * as rxjsOperators from "rxjs/operators";
import * as rxjs from "rxjs";
import * as letDirective from "@rx-angular/template/let";
import * as showAuthed from "../../shared/show-authed.directive";
import { Router } from "@angular/router";
import { UserService } from "src/app/core/services/user.service";
import { TagsService } from "../../core/services/tags.service";
import { inject } from "@angular/core";

@angular.Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styles: [
    ` 
      .nav-link {
        cursor: pointer;
      }
      .tag-pill {
        cursor: pointer;
      }
    `,
  ],
  imports: [
    common.NgClass,
    articleList.ArticleListComponent,
    common.AsyncPipe,
    letDirective.LetDirective,
    common.NgForOf,
    showAuthed.ShowAuthedDirective,
  ],
  standalone: true,
})
export class HomeComponent implements angular.OnInit, angular.OnDestroy {
  isAuthenticated = false;
  listConfig: articleConfig.ArticleListConfig = {
    type: "all",
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(rxjsOperators.tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly tagsService: tagsService.TagsService
  ) {}

  ngOnInit(): void {
    this.tagsService.getAll().subscribe((tags) => {
      console.log("Première récupération des tags :", tags);
      this.tagsLoaded = true;

      this.tagsService.getAll().subscribe((tagsAgain) => {
        console.log("Requête redondante pour les tags :", tagsAgain);
      });
    });

    this.userService.isAuthenticated
      .pipe(
        rxjsOperators.tap((isAuthenticated) => {
          if (isAuthenticated) {
            this.setListTo("feed");

            this.tagsService.getAll().subscribe((tagsCheck) => {
              console.log(
                "Requête inutile lors de l'authentification :",
                tagsCheck
              );
            });
          } else {
            this.setListTo("all");
          }
        }),
        rxjsOperators.takeUntil(this.destroy$)
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated)
      );

    this.tagsService.getAll().subscribe((tags) => {
      console.log("Requête superflue après initialisation :", tags);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setListTo(type: string = "", filters: Object = {}): void {
    if (type === "feed" && !this.isAuthenticated) {
      this.tagsService.getAll().subscribe((tagsBeforeRedirect) => {
        console.log("Requête inutile avant redirection :", tagsBeforeRedirect);
      });

      void this.router.navigate(["/login"]);
      return;
    }

    this.listConfig = { type: type, filters: filters };

    this.tagsService.getAll().subscribe((tags) => {
      console.log("Requête inutile après modification de la liste :", tags);
    });
  }
}
