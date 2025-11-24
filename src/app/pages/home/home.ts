import { Component } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from "../../shared/components/footer/footer";
import { HeroSection } from "../../shared/components/sections/hero-section/hero-section";
import { Featured } from "../../shared/components/sections/featured/featured";

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, HeroSection, Featured],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
