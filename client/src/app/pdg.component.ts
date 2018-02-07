import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  moduleId: module.id,
  selector: 'pdg-root',
  templateUrl: 'pdg.component.html',
  styleUrls: ['pdg.component.scss']
})
export class PdgComponent implements OnInit {
  title = 'Les publications de grâces';
  public constructor(private titleService: Title ) { }
  
  ngOnInit(): void {
   this.setTitle('Les publications de grâces')
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }
}
