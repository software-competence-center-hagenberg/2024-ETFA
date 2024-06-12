import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JavaGeneratorService } from './shared/java-generator.service';
import WorkCellParkPosCycleJson from '../assets/Example.json';
import { Sequence } from './lib/helper/program';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'java-creator';

  constructor(private javaGenerator: JavaGeneratorService) {
    javaGenerator.generateJaveCodeOfSequence(WorkCellParkPosCycleJson as Sequence);
  }
}
