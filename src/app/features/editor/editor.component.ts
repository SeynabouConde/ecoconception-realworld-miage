import * as angular from "@angular/core";
import * as forms from "@angular/forms";
import * as router from "@angular/router";
import * as rxjs from "rxjs";
import * as rxjsOperators from "rxjs/operators";
import * as common from "@angular/common";
import * as errors from "../../core/models/errors.model";
import * as articles from "../../core/services/articles.service";
import * as user from "../../core/services/user.service";
import * as listErrors from "../../shared/list-errors.component";

interface ArticleForm {
  title: forms.FormControl<string>;
  description: forms.FormControl<string>;
  body: forms.FormControl<string>;
}

@angular.Component({
  selector: "app-editor-page",
  templateUrl: "./editor.component.html",
  imports: [
    listErrors.ListErrorsComponent,
    forms.ReactiveFormsModule,
    common.NgForOf,
  ],
  standalone: true,
})
export class EditorComponent implements angular.OnInit, angular.OnDestroy {
  tagList: string[] = [];
  articleForm: forms.UntypedFormGroup = new forms.FormGroup<ArticleForm>({
    title: new forms.FormControl("", { nonNullable: true }),
    description: new forms.FormControl("", { nonNullable: true }),
    body: new forms.FormControl("", { nonNullable: true }),
  });
  tagField = new forms.FormControl<string>("", { nonNullable: true });

  errors: errors.Errors | null = null;
  isSubmitting = false;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private readonly articleService: articles.ArticlesService,
    private readonly route: router.ActivatedRoute,
    private readonly router: router.Router,
    private readonly userService: user.UserService
  ) {}

  ngOnInit() {
    if (this.route.snapshot.params["slug"]) {
      this.articleService
        .get(this.route.snapshot.params["slug"])
        .subscribe((article) => {
          console.log("Requête redondante  :", article);
          this.articleForm.patchValue(article);
          this.tagList = article.tagList;
        });

      rxjs
        .combineLatest([
          this.articleService.get(this.route.snapshot.params["slug"]),
          this.userService.getCurrentUser(),
        ])
        .pipe(rxjsOperators.takeUntil(this.destroy$))
        .subscribe(([article, { user }]) => {
          if (user.username === article.author.username) {
            this.articleForm.patchValue(article);
            this.tagList = article.tagList;

            this.userService.getCurrentUser().subscribe((userAgain) => {
              console.log("Requête inutile pour l'utilisateur :", userAgain);
            });
          } else {
            void this.router.navigate(["/"]);
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addTag() {
    const tag = this.tagField.value;
    if (tag != null && tag.trim() !== "" && this.tagList.indexOf(tag) < 0) {
      this.tagList.push(tag);
    }
    this.tagField.reset("");
  }

  removeTag(tagName: string): void {
    this.tagList = this.tagList.filter((tag) => tag !== tagName);
  }

  submitForm(): void {
    this.isSubmitting = true;

    this.addTag();

    this.articleService
      .create({
        ...this.articleForm.value,
        tagList: this.tagList,
      })
      .pipe(rxjsOperators.takeUntil(this.destroy$))
      .subscribe({
        next: (article) => this.router.navigate(["/article/", article.slug]),
        error: (err) => {
          this.errors = err;
          this.isSubmitting = false;
        },
      });
  }
}
