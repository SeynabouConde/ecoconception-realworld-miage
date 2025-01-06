import * as rxjs from "rxjs";
import * as rxjsOperators from "rxjs/operators";
import * as angular from "@angular/core";
import * as router from "@angular/router";
import * as articleList from "../../shared/article-helpers/article-list.component";
import * as profileService from "../../core/services/profile.service";
import * as profile from "../../core/models/profile.model";
import * as articleConfig from "../../core/models/article-list-config.model";

@angular.Component({
  selector: "app-profile-favorites",
  templateUrl: "./profile-favorites.component.html",
  imports: [articleList.ArticleListComponent],
  standalone: true,
})
export class ProfileFavoritesComponent implements angular.OnInit, angular.OnDestroy {
  profile!: profile.Profile;
  favoritesConfig!: articleConfig.ArticleListConfig;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private route: router.ActivatedRoute,
    private readonly profileService: profileService.ProfileService
  ) {}

  ngOnInit() {
    this.profileService
      .get(this.route.parent?.snapshot.params["username"])
      .pipe(rxjsOperators.takeUntil(this.destroy$))
      .subscribe({
        next: (profile: profile.Profile) => {
          this.profile = profile;
          this.favoritesConfig = {
            type: "all",
            filters: {
              favorited: this.profile.username,
            },
          };
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
