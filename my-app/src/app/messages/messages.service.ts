import {Message} from "./messages.model";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private posts: Message[] = [];

  getPosts() {
    return [...this.posts];
  }
}
