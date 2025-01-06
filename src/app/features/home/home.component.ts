import * as angular from "@angular/core";
import * as router from "@angular/router";
import * as tagsService from "../../core/services/tags.service";
import * as articleConfig from "../../core/models/article-list-config.model";
import * as common from "@angular/common";
import * as articleList from "../../shared/article-helpers/article-list.component";
import * as rxjsOperators from "rxjs/operators";
import * as rxjs from "rxjs";
import * as userService from "../../core/services/user.service";
import * as letDirective from "@rx-angular/template/let";
import * as showAuthed from "../../shared/show-authed.directive";

@angular.Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
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
  tags$ = angular.inject(tagsService.TagsService)
    .getAll()
    .pipe(rxjsOperators.tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private readonly router: router.Router,
    private readonly userService: userService.UserService
  ) {}

  ngOnInit(): void {
    this.userService.isAuthenticated
      .pipe(
        rxjsOperators.tap((isAuthenticated) => {
          if (isAuthenticated) {
            this.setListTo("feed");
          } else {
            this.setListTo("all");
          }
        }),
        rxjsOperators.takeUntil(this.destroy$)
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setListTo(type: string = "", filters: Object = {}): void {
    if (type === "feed" && !this.isAuthenticated) {
      void this.router.navigate(["/login"]);
      return;
    }

    this.listConfig = { type: type, filters: filters };
  }
}
