import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar';
import { Footer } from './layout/footer';

// Composant racine : il contient la navbar, la page courante et le footer
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}