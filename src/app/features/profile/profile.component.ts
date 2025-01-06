import * as angular from "@angular/core";
import * as router from "@angular/router";
import * as rxjsOperators from "rxjs/operators";
import * as rxjs from "rxjs";
import * as userService from "../../core/services/user.service";
import * as profile from "../../core/models/profile.model";
import * as profileService from "../../core/services/profile.service";
import * as followButton from "../../shared/buttons/follow-button.component";
import * as common from "@angular/common";

@angular.Component({
  selector: "app-profile-page",
  templateUrl: "./profile.component.html",
  imports: [
    followButton.FollowButtonComponent,
    common.NgIf,
    router.RouterLink,
    common.AsyncPipe,
    router.RouterLinkActive,
    router.RouterOutlet,
  ],
  standalone: true,
})
export class ProfileComponent implements angular.OnInit, angular.OnDestroy {
  profile!: profile.Profile;
  isUser: boolean = false;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private readonly route: router.ActivatedRoute,
    private readonly router: router.Router,
    private readonly userService: userService.UserService,
    private readonly profileService: profileService.ProfileService
  ) {}

  ngOnInit() {
    this.profileService
      .get(this.route.snapshot.params["username"])
      .pipe(
        rxjsOperators.catchError((error) => {
          void this.router.navigate(["/"]);
          return rxjs.throwError(() => error);
        }),
        rxjsOperators.switchMap((profile) => {
          return rxjs.combineLatest([rxjs.of(profile), this.userService.currentUser]);
        }),
        rxjsOperators.takeUntil(this.destroy$)
      )
      .subscribe(([profile, user]) => {
        this.profile = profile;
        this.isUser = profile.username === user?.username;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleFollowing(profile: profile.Profile) {
    this.profile = profile;
  }
}
