import * as angular from "@angular/core";

@angular.Pipe({
  name: "markdown",
  standalone: true,
})
export class MarkdownPipe implements angular.PipeTransform {
  async transform(content: string): Promise<string> {
    const { marked } = await import("marked");
    return marked(content, { sanitize: true });
  }
}
