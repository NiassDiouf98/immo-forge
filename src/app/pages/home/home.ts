import { Component } from '@angular/core';
import { Navbar } from "../../shared/components/navbar/navbar";
import { Footer } from "../../shared/components/footer/footer";
import { HeroSection } from "../../shared/components/sections/hero-section/hero-section";
import { Featured } from "../../shared/components/sections/featured/featured";
import { ServiceSection } from "../../shared/components/sections/service-section/service-section";
import { CitiesSection } from "../../shared/components/sections/cities-section/cities-section";
import { Testimonials } from "../../shared/components/sections/testimonials/testimonials";

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, HeroSection, Featured, ServiceSection, CitiesSection, Testimonials],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
