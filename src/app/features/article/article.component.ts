import * as angular from "@angular/core";
import * as forms from "@angular/forms";
import * as router from "@angular/router";
import * as user from "../../core/models/user.model";
import * as article from "../../core/models/article.model";
import * as articlesService from "../../core/services/articles.service";
import * as commentsService from "../../core/services/comments.service";
import * as userService from "../../core/services/user.service";
import * as articleMeta from "../../shared/article-helpers/article-meta.component";
import * as common from "@angular/common";
import * as followButton from "../../shared/buttons/follow-button.component";
import * as favoriteButton from "../../shared/buttons/favorite-button.component";
import * as markdown from "./markdown.pipe";
import * as listErrors from "../../shared/list-errors.component";
import * as articleComment from "./article-comment.component";
import * as rxjsOperators from "rxjs/operators";
import * as rxjs from "rxjs";
import * as comment from "../../core/models/comment.model";
import * as showAuthed from "../../shared/show-authed.directive";
import * as errors from "../../core/models/errors.model";
import * as profile from "../../core/models/profile.model";

@angular.Component({
  selector: "app-article-page",
  templateUrl: "./article.component.html",
  imports: [
    articleMeta.ArticleMetaComponent,
    router.RouterLink,
    common.NgClass,
    followButton.FollowButtonComponent,
    favoriteButton.FavoriteButtonComponent,
    common.NgForOf,
    markdown.MarkdownPipe,
    common.AsyncPipe,
    listErrors.ListErrorsComponent,
    forms.FormsModule,
    articleComment.ArticleCommentComponent,
    forms.ReactiveFormsModule,
    showAuthed.ShowAuthedDirective,
    common.NgIf,
  ],
  standalone: true,
})
export class ArticleComponent implements angular.OnInit, angular.OnDestroy {
  article!: article.Article;
  currentUser!: user.User | null;
  comments: comment.Comment[] = [];
  canModify: boolean = false;

  commentControl = new forms.FormControl<string>("", { nonNullable: true });
  commentFormErrors: errors.Errors | null = null;

  isSubmitting = false;
  isDeleting = false;
  destroy$ = new rxjs.Subject<void>();

  constructor(
    private readonly route: router.ActivatedRoute,
    private readonly articleService: articlesService.ArticlesService,
    private readonly commentsService: commentsService.CommentsService,
    private readonly router: router.Router,
    private readonly userService: userService.UserService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.params["slug"];
    rxjs.combineLatest([
      this.articleService.get(slug),
      this.commentsService.getAll(slug),
      this.userService.currentUser,
    ])
      .pipe(
        rxjsOperators.catchError((err) => {
          void this.router.navigate(["/"]);
          return rxjs.throwError(() => err);
        })
      )
      .subscribe(([article, comments, currentUser]) => {
        this.article = article;
        this.comments = comments;
        this.currentUser = currentUser;
        this.canModify = currentUser?.username === article.author.username;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleFavorite(favorited: boolean): void {
    this.article.favorited = favorited;

    if (favorited) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }

  toggleFollowing(profile: profile.Profile): void {
    this.article.author.following = profile.following;
  }

  deleteArticle(): void {
    this.isDeleting = true;

    this.articleService
      .delete(this.article.slug)
      .pipe(rxjsOperators.takeUntil(this.destroy$))
      .subscribe(() => {
        void this.router.navigate(["/"]);
      });
  }

  addComment() {
    this.isSubmitting = true;
    this.commentFormErrors = null;

    this.commentsService
      .add(this.article.slug, this.commentControl.value)
      .pipe(rxjsOperators.takeUntil(this.destroy$))
      .subscribe({
        next: (comment) => {
          this.comments.unshift(comment);
          this.commentControl.reset("");
          this.isSubmitting = false;
        },
        error: (errors) => {
          this.isSubmitting = false;
          this.commentFormErrors = errors;
        },
      });
  }

  deleteComment(comment: comment.Comment): void {
    this.commentsService
      .delete(comment.id, this.article.slug)
      .pipe(rxjsOperators.takeUntil(this.destroy$))
      .subscribe(() => {
        this.comments = this.comments.filter((item) => item !== comment);
      });
  }

  trackById(index: number, item: comment.Comment): string {
    return item.id;
  }
}
