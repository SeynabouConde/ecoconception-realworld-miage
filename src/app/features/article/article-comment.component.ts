import * as angular from "@angular/core";
import * as userService from "../../core/services/user.service";
import * as user from "../../core/models/user.model";
import * as router from "@angular/router";
import * as rxjsOperators from "rxjs/operators";
import * as comment from "../../core/models/comment.model";
import * as common from "@angular/common";

@angular.Component({
  selector: "app-article-comment",
  templateUrl: "./article-comment.component.html",
  imports: [router.RouterLink, common.DatePipe, common.NgIf, common.AsyncPipe],
  standalone: true,
})
export class ArticleCommentComponent {
  @angular.Input() comment!: comment.Comment;
  @angular.Output() delete = new angular.EventEmitter<boolean>();

  canModify$ = angular.inject(userService.UserService).currentUser.pipe(
    rxjsOperators.map(
      (userData: user.User | null) =>
        userData?.username === this.comment.author.username
    )
  );
}
