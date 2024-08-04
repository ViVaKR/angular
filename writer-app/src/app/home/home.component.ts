import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { PlaygroundComponent } from '@app/playground/playground.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Highlight,
    HighlightLineNumbers,
    HighlightAuto,
    PlaygroundComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  code = ` \

<div class="relative h-96 overflow-hidden bg-cover bg-center bg-ship bg-no-repeat p-12 text-center lg:h-screen">
  <div class="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-teal-950/70 bg-fixed">
    <div class="flex h-full items-center justify-center">
      <div class="text-white">
        <main class="mb-4 text-9xl max-xl:text-7xl text-slate-300 cute-font-regular max-md:text-5xl font-extrabold">
          멀어지면 새로운 땅이 보인다.
        </main>
        <p class="mb-6 text-xs clear-both text-slate-400">...</p>
        <a class="border-slate-50 border-2 px-4  py-1 rounded-full text-slate-50 hover:border-sky-400 hover:text-sky-400"
           type="button"
           role="button"
           data-twe-ripple-init
           data-twe-ripple-color="light">Text {{ myPublicIp }}</a>
      </div>
    </div>
  </div>
</div>

`
  ngOnInit(): void {
    this.getMyPublicIp();
  }
  utilityService = inject(UtilityService);

  myPublicIp = '';

  getMyPublicIp = () => {
    this.utilityService.getMyPublicIp().subscribe({
      next: (ip) => {
        this.myPublicIp = ip;
      },
      error: (err) => {
        this.myPublicIp = err.error.message;
      }
    });
  }
}
