import {Component, Input, OnInit} from '@angular/core';
import {Message} from "./messages.model";
import {MessagesService} from "./messages.service";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  // posts = [
  //   {messageId: '1', clientId: '1', topic: 'temp/backroom', message: '20deg', datetime: '00:42'},
  //   {messageId: '2', clientId: '1', topic: 'temp/backroom', message: '19deg', datetime: '00:52'},
  //   {messageId: '3', clientId: '1', topic: 'temp/backroom', message: '21deg', datetime: '01:02'},
  //   {messageId: '4', clientId: '4', topic: 'temp/main', message: '17deg', datetime: '01:02'}
  // ];
  @Input() posts: Message[] = [];

  constructor(public messagesService: MessagesService) {
  }

  ngOnInit() {
    this.posts = this.messagesService.getPosts();
  }
}
