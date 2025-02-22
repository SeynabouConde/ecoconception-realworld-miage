import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ArticleListComponent } from "../../shared/article-helpers/article-list.component";
import * as rxjs from "rxjs";
import * as rxjsOperators from "rxjs/operators";
import { ProfileService } from "../../core/services/profile.service";
import { Profile } from "../../core/models/profile.model";
import { ArticleListConfig } from "../../core/models/article-list-config.model";

@Component({
  selector: "app-profile-articles",
  templateUrl: "./profile-articles.component.html",
  imports: [ArticleListComponent],
  standalone: true,
})
export class ProfileArticlesComponent implements OnInit, OnDestroy {
  profile!: Profile;
  articlesConfig!: ArticleListConfig;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private readonly profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.profileService
      .get(this.route.snapshot.params["username"])
      .pipe(rxjsOperators.takeUntil(this.destroy$))
      .subscribe({
        next: (profile: Profile) => {
          this.profile = profile;
          this.articlesConfig = {
            type: "all",
            filters: {
              author: this.profile.username,
            },
          };
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
