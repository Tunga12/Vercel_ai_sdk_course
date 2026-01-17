import { Component, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

// TODO: Import the Chat class from @ai-sdk/angular
// import { Chat } from '@ai-sdk/angular';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  inputField = viewChild<ElementRef<HTMLInputElement>>('inputField');

  // TODO: Create an instance of the Chat class
  // chat = new Chat({});

  sendMessage() {
    const input = this.inputField()?.nativeElement;
    if (!input || !input.value.trim()) return;

    // TODO: Send the message using chat.sendMessage()
    // Don't forget to clear the input after sending!

    console.log('Message to send:', input.value);
    input.value = '';
  }
}
