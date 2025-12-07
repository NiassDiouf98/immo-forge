import { Component, OnInit } from '@angular/core';
import { PropertyService, Property } from '../property.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-properties-lists',
  imports: [ CommonModule, RouterLink ],
  templateUrl: './properties-lists.html',
  styleUrl: './properties-lists.css',
})
export class PropertiesLists implements OnInit {
  properties: Property[] = [];
  loading = false;

  constructor(private svc: PropertyService, private router: Router) {}

  ngOnInit(){ this.load(); }

  load() {
    this.loading = true;
    this.svc.list().subscribe(data => { this.properties = data; this.loading = false; }, ()=> this.loading = false);
  }

  edit(p: Property) { this.router.navigate(['/dashboard/edit-property', p.id]); }
  remove(p: Property) {
    if(!confirm('Supprimer ce bien ?')) return;
    this.svc.delete(p.id!).subscribe(()=> this.load());
  }

}
