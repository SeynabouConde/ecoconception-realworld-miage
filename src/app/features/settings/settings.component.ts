import * as angular from "@angular/core";
import * as forms from "@angular/forms";
import * as router from "@angular/router";
import * as user from "../../core/models/user.model";
import * as userService from "../../core/services/user.service";
import * as listErrors from "../../shared/list-errors.component";
import * as errors from "../../core/models/errors.model";
import * as rxjs from "rxjs";
import * as rxjsOperators from "rxjs/operators";

interface SettingsForm {
  image: forms.FormControl<string>;
  username: forms.FormControl<string>;
  bio: forms.FormControl<string>;
  email: forms.FormControl<string>;
  password: forms.FormControl<string>;
}

@angular.Component({
  selector: "app-settings-page",
  templateUrl: "./settings.component.html",
  imports: [listErrors.ListErrorsComponent, forms.ReactiveFormsModule],
  standalone: true,
})
export class SettingsComponent implements angular.OnInit, angular.OnDestroy {
  user!: user.User;
  settingsForm = new forms.FormGroup<SettingsForm>({
    image: new forms.FormControl("", { nonNullable: true }),
    username: new forms.FormControl("", { nonNullable: true }),
    bio: new forms.FormControl("", { nonNullable: true }),
    email: new forms.FormControl("", { nonNullable: true }),
    password: new forms.FormControl("", {
      validators: [forms.Validators.required],
      nonNullable: true,
    }),
  });
  errors: errors.Errors | null = null;
  isSubmitting = false;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private readonly router: router.Router,
    private readonly userService: userService.UserService
  ) {}

  ngOnInit(): void {
    this.settingsForm.patchValue(
      this.userService.getCurrentUser() as Partial<user.User>
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.userService.logout();
  }

  submitForm() {
    this.isSubmitting = true;

    this.userService
      .update(this.settingsForm.value)
      .pipe(rxjsOperators.takeUntil(this.destroy$))
      .subscribe({
        next: ({ user }) =>
          void this.router.navigate(["/profile/", user.username]),
        error: (err) => {
          this.errors = err;
          this.isSubmitting = false;
        },
      });
  }
}
